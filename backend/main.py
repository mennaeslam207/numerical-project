
from __future__ import annotations

import csv
import json
import os
import re
import shutil
import tempfile
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
import pymupdf
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pptx import Presentation

try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None

from ml.numerical_methods import predict_time


# =========================
# Project paths and settings
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "processed"
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
SESSIONS_FILE = DATA_DIR / "study_sessions.csv"

MAX_UPLOAD_BYTES = 30 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".pptx"}

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


SESSION_COLUMNS = [
    "student_id",
    "material_name",
    "pages_count",
    "word_count",
    "difficulty_level",
    "knowledge_level",
    "expected_minutes",
    "actual_minutes",
    "session_date",
]


if not SESSIONS_FILE.exists():
    with SESSIONS_FILE.open("w", newline="", encoding="utf-8-sig") as handle:
        csv.DictWriter(handle, fieldnames=SESSION_COLUMNS).writeheader()


# =========================
# FastAPI application
# =========================

app = FastAPI(title="StudyFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Request models
# =========================

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=50000)
    history: list[dict] = Field(default_factory=list)


# =========================
# Text cleaning
# =========================

def clean_text(value: str) -> str:
    value = value.replace("\x00", "")
    value = re.sub(r"[\u200e\u200f\u202a-\u202e]", "", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


# =========================
# PDF extraction
# =========================

def extract_pdf(path: Path) -> tuple[str, int, int]:
    pages: list[str] = []
    ocr_pages = 0

    if pytesseract is not None and Image is not None:
        configured = os.getenv("TESSERACT_CMD")
        common_windows_path = Path(
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        )

        if configured:
            pytesseract.pytesseract.tesseract_cmd = configured
        elif common_windows_path.exists():
            pytesseract.pytesseract.tesseract_cmd = str(
                common_windows_path
            )
        elif shutil.which("tesseract"):
            pytesseract.pytesseract.tesseract_cmd = shutil.which(
                "tesseract"
            )

    with pymupdf.open(path) as document:
        for page in document:
            page_text = clean_text(page.get_text("text"))

            if (
                len(page_text) < 80
                and pytesseract is not None
                and Image is not None
            ):
                try:
                    pixmap = page.get_pixmap(
                        matrix=pymupdf.Matrix(2, 2),
                        alpha=False,
                    )

                    image = Image.open(
                        __import__("io").BytesIO(
                            pixmap.tobytes("png")
                        )
                    )

                    language = os.getenv("TESSERACT_LANG", "ara+eng")

                    ocr_text = clean_text(
                        pytesseract.image_to_string(
                            image,
                            lang=language,
                            timeout=45,
                        )
                    )

                    if len(ocr_text) > len(page_text):
                        page_text = ocr_text
                        ocr_pages += 1

                except Exception:
                    # Keep regular PDF text if OCR fails.
                    pass

            pages.append(page_text)

    text = "\n\n".join(part for part in pages if part)

    return text, len(pages), ocr_pages


# =========================
# PowerPoint extraction
# =========================

def extract_pptx(path: Path) -> tuple[str, int, int]:
    presentation = Presentation(str(path))
    slides: list[str] = []

    for slide in presentation.slides:
        slide_parts: list[str] = []

        for shape in slide.shapes:
            if getattr(shape, "has_text_frame", False):
                content = "\n".join(
                    paragraph.text
                    for paragraph in shape.text_frame.paragraphs
                )

                if content.strip():
                    slide_parts.append(content)

            if getattr(shape, "has_table", False):
                for row in shape.table.rows:
                    slide_parts.append(
                        " | ".join(cell.text for cell in row.cells)
                    )

        slides.append(clean_text("\n".join(slide_parts)))

    text = "\n\n".join(part for part in slides if part)

    return text, len(slides), 0


# =========================
# Study sessions
# =========================

def read_sessions() -> pd.DataFrame:
    try:
        frame = pd.read_csv(SESSIONS_FILE)

    except (FileNotFoundError, pd.errors.EmptyDataError):
        frame = pd.DataFrame(columns=SESSION_COLUMNS)

    for column in SESSION_COLUMNS:
        if column not in frame.columns:
            frame[column] = None

    return frame[SESSION_COLUMNS]


def estimate_prediction(
    student_id: str,
    pages: int,
    words: int,
    average: float,
    knowledge: str,
):
    sessions = read_sessions()

    sessions = sessions[
        sessions["student_id"].astype(str) == str(student_id)
    ].copy()

    for column in ("pages_count", "actual_minutes"):
        sessions[column] = pd.to_numeric(
            sessions[column],
            errors="coerce",
        )

    sessions = sessions.dropna(
        subset=["pages_count", "actual_minutes"]
    )

    sessions = sessions[
        (sessions["pages_count"] > 0)
        & (sessions["actual_minutes"] > 0)
    ]

    prediction = predict_time(
        sessions=sessions,
        target_pages=max(pages, 1),
        total_words=words,
        average_words_per_page=average,
        knowledge_level=knowledge,
    )

    return prediction


# =========================
# Basic endpoints
# =========================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "StudyFlow API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "ok",
    }


# =========================
# Get study sessions
# =========================

@app.get("/api/study-sessions")
def get_study_sessions(student_id: str = "Student1"):
    frame = read_sessions()

    frame = frame[
        frame["student_id"].astype(str) == str(student_id)
    ]

    frame = frame.fillna("")

    sessions = []

    for row in frame.to_dict(orient="records"):
        sessions.append({
            "student_id": str(row["student_id"]),
            "material_name": str(row["material_name"]),
            "pages_count": int(float(row["pages_count"] or 0)),
            "word_count": int(float(row["word_count"] or 0)),
            "difficulty_level": str(row["difficulty_level"]),
            "knowledge_level": str(row["knowledge_level"]),
            "expected_minutes": float(
                row["expected_minutes"] or 0
            ),
            "actual_minutes": float(
                row["actual_minutes"] or 0
            ),
            "session_date": str(row["session_date"]),
        })

    sessions.sort(
        key=lambda item: item["session_date"],
        reverse=True,
    )

    return {
        "success": True,
        "sessions": sessions,
        "total_sessions": len(sessions),
    }


# =========================
# Record study session
# =========================

@app.post("/api/record-session")
def record_session(
    student_id: str = Form(...),
    material_name: str = Form(...),
    pages_count: int = Form(...),
    word_count: int = Form(...),
    difficulty_level: str = Form("Unknown"),
    knowledge_level: str = Form("Moderate"),
    expected_minutes: float = Form(...),
    actual_minutes: float = Form(...),
):
    if (
        pages_count < 1
        or word_count < 0
        or expected_minutes < 0
        or actual_minutes <= 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid study session values.",
        )

    row = {
        "student_id": student_id.strip() or "Student1",
        "material_name": Path(material_name).name[:240],
        "pages_count": pages_count,
        "word_count": word_count,
        "difficulty_level": difficulty_level,
        "knowledge_level": knowledge_level,
        "expected_minutes": round(expected_minutes, 2),
        "actual_minutes": round(actual_minutes, 2),
        "session_date": datetime.now().astimezone().date().isoformat(),
    }

    frame = read_sessions()

    frame = pd.concat(
        [frame, pd.DataFrame([row])],
        ignore_index=True,
    )

    temp_path = SESSIONS_FILE.with_suffix(".tmp")

    frame.to_csv(
        temp_path,
        index=False,
        encoding="utf-8-sig",
    )

    os.replace(temp_path, SESSIONS_FILE)

    total = len(
        frame[
            frame["student_id"].astype(str)
            == row["student_id"]
        ]
    )

    return {
        "success": True,
        "message": "Study session saved",
        "total_sessions": total,
    }


# =========================
# Analyze uploaded material
# =========================

@app.post("/api/analyze-material")
async def analyze_material(
    file: UploadFile = File(...),
    student_id: str = Form("Student1"),
    knowledge_level: str = Form("Moderate"),
):
    filename = Path(file.filename or "lecture").name
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and PPTX files are supported.",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 30 MB.",
        )

    safe_name = (
        re.sub(r"[^\w.\- ]+", "_", filename).strip()
        or f"lecture{suffix}"
    )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
        dir=UPLOAD_DIR,
    ) as temp:
        temp.write(content)
        temp_path = Path(temp.name)

    try:
        if suffix == ".pdf":
            full_text, page_count, ocr_pages = extract_pdf(
                temp_path
            )
            file_type = "PDF"

        else:
            full_text, page_count, ocr_pages = extract_pptx(
                temp_path
            )
            file_type = "PPTX"

    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail=f"Could not read the uploaded file: {error}",
        ) from error

    finally:
        temp_path.unlink(missing_ok=True)

    words = len(full_text.split())

    average = (
        round(words / page_count, 2)
        if page_count
        else 0
    )

    topics = [
        line.strip()
        for line in full_text.splitlines()
        if line.strip() and len(line.strip()) < 120
    ]

    prediction = estimate_prediction(
        student_id,
        max(page_count, 1),
        words,
        average,
        knowledge_level,
    )

    material = {
        "file_name": safe_name,
        "file_type": file_type,
        "pages_count": page_count,
        "word_count": words,
        "topics_count": len(topics),
        "average_words_per_page": average,
        "ocr_pages": ocr_pages,
    }

    return {
        "success": True,
        "student_id": student_id,
        "material": material,
        "prediction": prediction,
        "text_preview": full_text[:5000],
        "full_text": full_text,
    }


# =========================
# AI Assistant Chat
# =========================

@app.post("/api/assistant-chat")
def assistant_chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    messages = [
        {
            "role": "system",
            "content": (
                "You are an academic study assistant. "
                "Use uploaded lecture text as the primary source. "
                "Do not invent lecture facts. "
                "If the answer is absent from the lecture, say so. "
                "Answer in the same language as the student "
                "and keep it clear and concise."
            ),
        }
    ]

    for item in request.history[-10:]:
        if (
            isinstance(item, dict)
            and item.get("role") in {"user", "assistant"}
            and isinstance(item.get("content"), str)
        ):
            messages.append({
                "role": item["role"],
                "content": item["content"][:12000],
            })

    messages.append({
        "role": "user",
        "content": request.message,
    })

    payload = json.dumps({
        "model": "qwen2.5:1.5b",
        "messages": messages,
        "stream": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        "http://127.0.0.1:11434/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            req,
            timeout=180,
        ) as response:
            result = json.loads(
                response.read().decode("utf-8")
            )

        answer = result.get(
            "message", {}
        ).get("content", "").strip()

        if not answer:
            raise HTTPException(
                status_code=502,
                detail="The local AI returned an empty response.",
            )

        return {
            "success": True,
            "reply": answer,
            "model": "qwen2.5:1.5b",
        }

    except urllib.error.URLError as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Ollama is not running. "
                "Start Ollama and load qwen2.5:1.5b."
            ),
        ) from error
