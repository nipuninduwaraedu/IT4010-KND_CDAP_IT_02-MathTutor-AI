import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.enhancer import clean_proof_image
from app.ocr_client import extract_math_text
from app.repository import TheoremRepository
from app.segmenter import parse_reasoning_steps

app = FastAPI(
    title="Input Processing and Localized Geometry Knowledge Base (Component 1)",
    description="Member 1 Service — OpenCV Proof Enhancement, Mathpix OCR Pipeline, and O/L Geometry Knowledge Base",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = TheoremRepository()
ENHANCED_DIR = Path(__file__).resolve().parent.parent / "data" / "enhanced_images"


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "service-input-kb",
        "component": "Member 1 - Input Processing & Geometry Knowledge Base",
        "theorems_loaded": len(repo.get_all_theorems()),
    }


@app.get("/api/v1/theorems/{theorem_id}")
def get_theorem(theorem_id: str):
    theorem = repo.get_theorem_by_id(theorem_id)
    if not theorem:
        raise HTTPException(status_code=404, detail=f"Theorem '{theorem_id}' not found")
    return theorem


@app.post("/api/v1/process-proof-image")
async def process_proof_image(
    image: UploadFile = File(...),
    question_id: Optional[str] = Form(default="GEO_Q01"),
):
    suffix = Path(image.filename or "proof.png").suffix or ".png"
    stem = Path(image.filename or "proof").stem

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await image.read()
        tmp.write(content)
        tmp_input_path = tmp.name

    try:
        os.makedirs(ENHANCED_DIR, exist_ok=True)
        enhanced_path = str(ENHANCED_DIR / f"{stem}_enhanced.png")
        clean_proof_image(tmp_input_path, enhanced_path)

        raw_ocr_text = extract_math_text(tmp_input_path, question_id=question_id or "GEO_Q01")
        extracted_steps = parse_reasoning_steps(raw_ocr_text)

        return {
            "filename": image.filename,
            "question_id": question_id,
            "enhanced_image_path": enhanced_path,
            "raw_ocr_text": raw_ocr_text,
            "extracted_steps": extracted_steps,
        }
    finally:
        if os.path.exists(tmp_input_path):
            os.remove(tmp_input_path)
