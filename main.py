from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import fitz
import anthropic
import os
from dotenv import load_dotenv
import random
import json
import re


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)


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
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
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
    num_q: int = Form(...)
):
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
        "mixed": "mix of all levels"
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
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    raw = response.content[0].text

    # ✅ Clean JSON extraction
    try:
        json_str = re.search(r"\[.*\]", raw, re.DOTALL).group()
        data = json.loads(json_str)
        return {"questions": data}
    except:
        return {
            "error": "Invalid JSON from AI",
            "raw": raw
        }

@app.post("/chat")
async def chat(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    content = await file.read()
    text = extract_text(content)

    selected_content = get_random_chunks(text)

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": f"""
Answer using ONLY this content:

{selected_content}

Question:
{question}
"""
        }]
    )

    return {"answer": response.content[0].text}