from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import fitz
import anthropic
import os
from dotenv import load_dotenv
import random
import json
import re
import logging

import psycopg2
from psycopg2 import OperationalError, DatabaseError
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

# Default matches remote Postgres; override with DATABASE_URL (postgresql:// or postgresql+asyncpg://)
_DEFAULT_DATABASE_URL = "postgresql+asyncpg://postgres:xambuddypwd@139.59.93.35:5432/xambuddydb"


def _normalize_psycopg2_dsn(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return "postgresql://" + url[len("postgresql+asyncpg://") :]
    return url


def get_db_connection():
    """Return a new psycopg2 connection. Caller must close() or use try/finally."""
    raw = os.getenv("DATABASE_URL", _DEFAULT_DATABASE_URL)
    dsn = _normalize_psycopg2_dsn(raw.strip())
    return psycopg2.connect(dsn)


def _difficulty_for_db(difficulty: str) -> str:
    """DB allows only easy|medium|hard; API also has mixed."""
    if difficulty == "mixed":
        return "medium"
    return difficulty


def _question_type_for_db(q_type: str, item: dict) -> str:
    """DB allows mcq|short|long. Map API types into that set."""
    if q_type == "mixed":
        return item.get("question_type") or "short"
    if q_type == "conceptual":
        return "long"
    return q_type


def _exact_question_fingerprint(text: str) -> str:
    """
    Fingerprint for duplicate checks only: same wording after trim, lowercasing, and
    collapsing whitespace. Reworded or indirect variants (competitive-exam “twists”)
    produce different fingerprints and are always stored as separate rows. There is
    no semantic or fuzzy matching.
    """
    s = (text or "").strip().lower()
    return re.sub(r"\s+", " ", s)


def _question_row_exists(cur, exam, subject, chapter, diff_db, row_type, norm_text: str) -> bool:
    """True if an identical (fingerprint) question already exists in this bucket."""
    if not norm_text:
        return True
    cur.execute(
        """
        SELECT EXISTS (
            SELECT 1 FROM questions
            WHERE exam = %s
              AND subject = %s
              AND chapter IS NOT DISTINCT FROM %s
              AND difficulty = %s
              AND question_type = %s
              AND lower(
                    trim(
                        both ' ' FROM regexp_replace(question_text, '[[:space:]]+', ' ', 'g')
                    )
                  ) = %s
        )
        """,
        (exam, subject, chapter or None, diff_db, row_type, norm_text),
    )
    return cur.fetchone()[0]


def save_questions(questions, q_type, difficulty, subject, exam, chapter: str = ""):
    """
    Persist generated questions into the matching columns (exam, subject, chapter,
    question_text from AI "question", question_type, difficulty, options JSON,
    correct_answer from "answer", explanation). Skips only when the question is
    the same text as an existing row (after trim / case-fold / whitespace collapse);
    paraphrases and indirect wordings are not treated as duplicates.
    """
    diff_db = _difficulty_for_db(difficulty)
    chapter_db = chapter.strip() or None
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            for q in questions:
                qtext_raw = q.get("question") or ""
                row_type = _question_type_for_db(q_type, q)
                norm = _exact_question_fingerprint(qtext_raw)
                if not norm:
                    continue
                if _question_row_exists(cur, exam, subject, chapter_db, diff_db, row_type, norm):
                    continue
                if row_type == "mcq" and q.get("options") is not None:
                    opts = json.dumps(q["options"])
                else:
                    opts = None
                ans = q.get("answer")
                if ans is not None:
                    ans = str(ans)
                expl = q.get("explanation")
                if expl is not None:
                    expl = str(expl)
                else:
                    expl = ""
                cur.execute(
                    """
                    INSERT INTO questions (
                        exam, subject, chapter, question_text, question_type,
                        difficulty, options, correct_answer, explanation
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s)
                    """,
                    (
                        exam,
                        subject,
                        chapter_db,
                        qtext_raw.strip(),
                        row_type,
                        diff_db,
                        opts,
                        ans,
                        expl,
                    ),
                )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _row_to_api_item(row, for_mixed_pool: bool):
    """Map DB row to the shape returned in `questions` arrays."""
    (
        _id,
        _exam,
        _subj,
        _chapter,
        question_text,
        qtype,
        _diff,
        options,
        correct_answer,
        explanation,
        _ts,
    ) = row
    item = {
        "question": question_text or "",
        "answer": correct_answer if correct_answer is not None else "",
        "explanation": explanation if explanation is not None else "",
    }
    if qtype == "mcq" and options is not None:
        if isinstance(options, str):
            item["options"] = json.loads(options)
        else:
            item["options"] = options
    if for_mixed_pool:
        item["question_type"] = qtype
    return item


def _db_question_type_filter(q_type: str):
    """Return SQL fragment params for question_type filter."""
    if q_type == "mixed":
        return "question_type IN ('mcq', 'short')", []
    if q_type == "conceptual":
        return "question_type = %s", ["long"]
    return "question_type = %s", [q_type]


def get_questions(q_type, difficulty, subject, exam, chapter: str, limit):
    """
    Fetch up to `limit` questions matching filters. Returns list of dicts in API shape.
    For q_type 'mixed', matches rows with question_type mcq or short.
    """
    if limit <= 0:
        return []

    diff_db = _difficulty_for_db(difficulty)
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            type_sql, type_params = _db_question_type_filter(q_type)
            chapter_clause = "chapter IS NOT DISTINCT FROM %s"
            params = [exam, subject, chapter.strip() or None, diff_db] + type_params + [limit]
            cur.execute(
                f"""
                SELECT
                    id, exam, subject, chapter, question_text, question_type, difficulty,
                    options, correct_answer, explanation, created_at
                FROM questions
                WHERE exam = %s AND subject = %s AND {chapter_clause}
                  AND difficulty = %s AND ({type_sql})
                ORDER BY created_at DESC
                LIMIT %s
                """,
                params,
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    for_mixed = q_type == "mixed"
    return [_row_to_api_item(r, for_mixed) for r in rows]


@app.get("/")
async def serve_index():
    return FileResponse(BASE_DIR / "index.html")


# ---------- UTILS ----------


def extract_text(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def get_random_chunks(text, chunk_size=800, num_chunks=3):
    chunks = [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]
    return " ".join(random.sample(chunks, min(num_chunks, len(chunks))))


# JSON shape examples (plain strings; injected into the prompt — not f-string literals, so braces stay literal).
FORMAT_EXAMPLES = {
    "mcq": """[
  {
    "question": "string",
    "options": {
      "A": "option text",
      "B": "option text",
      "C": "option text",
      "D": "option text"
    },
    "answer": "A",
    "explanation": "string"
  }
]""",
    "short": """[
  {
    "question": "string",
    "answer": "string",
    "explanation": "string"
  }
]""",
    "long": """[
  {
    "question": "string",
    "answer": "string",
    "explanation": "string"
  }
]""",
    "conceptual": """[
  {
    "question": "string",
    "answer": "string",
    "explanation": "string"
  }
]""",
    "mixed": """[
  {
    "question_type": "mcq",
    "question": "string",
    "options": {
      "A": "option text",
      "B": "option text",
      "C": "option text",
      "D": "option text"
    },
    "answer": "A",
    "explanation": "string"
  },
  {
    "question_type": "short",
    "question": "string",
    "answer": "string",
    "explanation": "string"
  }
]""",
}


TYPE_RULES = {
    "mcq": "Multiple choice ONLY. Each item MUST have options A–D and answer MUST be a single letter A/B/C/D. Do NOT output short-answer-only objects.",
    "short": "Short answer ONLY. Each item MUST have question, answer (1–3 sentences), explanation. Do NOT include options, A/B/C/D, or MCQ fields.",
    "long": "Long answer ONLY. Each item MUST have question, answer (detailed paragraph(s)), explanation. Do NOT include options or MCQ fields.",
    "conceptual": "Conceptual (why/how) ONLY. Same JSON shape as short: question, answer (2–5 sentences), explanation. No MCQ options.",
    "mixed": "Include a MIX of mcq and short items. Each object MUST have question_type (\"mcq\" or \"short\"). MCQ items: options + letter answer. Short items: no options, only answer text.",
}


MAX_TOKENS_FOR_TYPE = {
    "mcq": 4096,
    "short": 4096,
    "long": 8192,
    "conceptual": 4096,
    "mixed": 8192,
}


# ---------- 1. GENERATE MCQs ----------

from typing import Literal


@app.post("/generate")
async def generate(
    file: UploadFile = File(...),
    difficulty: Literal["easy", "medium", "hard", "mixed"] = Form(...),
    q_type: Literal["mcq", "short", "long", "conceptual", "mixed"] = Form(...),
    num_q: int = Form(...),
    subject: str = Form("general"),
    exam: str = Form("general"),
    chapter: str = Form(...),
):
    if num_q < 1:
        raise HTTPException(status_code=400, detail="num_q must be at least 1.")
    if not chapter or not chapter.strip():
        raise HTTPException(status_code=400, detail="chapter is required.")

    try:
        cached = get_questions(q_type, difficulty, subject, exam, chapter, num_q)
    except (OperationalError, DatabaseError) as e:
        logger.exception("Database error while reading questions cache")
        raise HTTPException(
            status_code=503,
            detail="Could not reach the database. Try again later.",
        ) from e

    if len(cached) >= num_q:
        return {"questions": cached[:num_q]}

    content = await file.read()
    try:
        text = extract_text(content)
    except fitz.FileDataError:
        raise HTTPException(
            status_code=400,
            detail="Could not read that file as a PDF. Upload a real PDF (not a Word/image file renamed to .pdf).",
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text found in the PDF. Try a different file or one with selectable text (not a scanned image without OCR).",
        )

    selected_content = get_random_chunks(text)

    difficulty_map = {
        "easy": "basic recall",
        "medium": "understanding and application",
        "hard": "deep reasoning",
        "mixed": "mix of all levels",
    }

    type_map = {
        "mcq": "multiple choice with 4 options (A–D), letter answer, explanation",
        "short": "short answer (1–3 sentences per answer), no choices",
        "long": "long-form paragraph answers, no choices",
        "conceptual": "why/how conceptual answers (paragraph), no choices",
        "mixed": "mix of MCQ and short-answer style items as in FORMAT",
    }

    format_example = FORMAT_EXAMPLES[q_type]
    type_rule = TYPE_RULES[q_type]
    max_out = MAX_TOKENS_FOR_TYPE[q_type]

    prompt = f"""
You are a strict JSON generator.

Generate exactly {num_q} questions based ONLY on the CONTENT below.

User-selected question type: {q_type}
Difficulty focus: {difficulty_map[difficulty]}
Style: {type_map[q_type]}

CRITICAL — follow this type exactly:
{type_rule}
If the type is not "mcq", you MUST NOT output "options" or A/B/C/D choices.

RULES:
- Return ONLY valid JSON (one array)
- No markdown, no headings, no text outside the JSON array

FORMAT (match this structure exactly for type "{q_type}"):

{format_example}

CONTENT:
{selected_content}
"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=max_out,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text

    try:
        json_str = re.search(r"\[.*\]", raw, re.DOTALL).group()
        data = json.loads(json_str)
    except Exception:
        return {"error": "Invalid JSON from AI", "raw": raw}

    if not isinstance(data, list):
        return {"error": "AI response was not a JSON array", "raw": raw}

    try:
        save_questions(data, q_type, difficulty, subject, exam, chapter)
    except (OperationalError, DatabaseError) as e:
        logger.exception("Database error while saving questions")
        raise HTTPException(
            status_code=503,
            detail="Generated questions but could not save them. Try again later.",
        ) from e

    return {"questions": data}


@app.post("/chat")
async def chat(
    file: UploadFile = File(...),
    question: str = Form(...),
):
    content = await file.read()
    text = extract_text(content)

    selected_content = get_random_chunks(text)

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=800,
        messages=[
            {
                "role": "user",
                "content": f"""
Answer using ONLY this content:

{selected_content}

Question:
{question}
""",
            }
        ],
    )

    return {"answer": response.content[0].text}
