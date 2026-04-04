from fastapi import FastAPI, UploadFile, File, Form
import fitz
import anthropic
import os
from dotenv import load_dotenv
import random
import json
import re


load_dotenv()

app = FastAPI()

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
print("API KEY:", CLAUDE_API_KEY)



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


system_prompt = """
You are a strict JSON generator.

TASK:
Generate {num_q} {difficulty} level {q_type} questions from the content.

IMPORTANT RULES:
- Output ONLY valid JSON
- DO NOT include markdown
- DO NOT include headings
- DO NOT include explanation outside JSON
- DO NOT include backticks

FORMAT EXACTLY LIKE THIS:

[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "string"
  }}
]

CONTENT:
{selected_content}
"""



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
    text = extract_text(content)

    selected_content = get_random_chunks(text)

    difficulty_map = {
        "easy": "basic recall",
        "medium": "understanding and application",
        "hard": "deep reasoning",
        "mixed": "mix of all levels"
    }

    type_map = {
        "mcq": "multiple choice with 4 options + answer + explanation",
        "short": "short answer (1-3 lines)",
        "long": "detailed answers",
        "conceptual": "why/how understanding",
        "mixed": "mix of all types"
    }

    prompt = f"""
You are a strict JSON generator.

Generate {num_q} questions.

Difficulty: {difficulty_map[difficulty]}
Type: {type_map[q_type]}

RULES:
- Return ONLY valid JSON
- No markdown
- No headings
- No extra text

FORMAT:

[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "string"
  }}
]

CONTENT:
{selected_content}
"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1200,
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