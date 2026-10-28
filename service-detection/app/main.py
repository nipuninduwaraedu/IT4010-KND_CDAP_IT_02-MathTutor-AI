from __future__ import annotations

from pathlib import Path
from typing import Any, Optional, Union

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.embeddings import FeatureExtractor
from app.normalizer import normalize_math_text

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_ARTIFACT_PATH = BASE_DIR / "models" / "misconception_classifier.pkl"


class StepInput(BaseModel):
    step_number: Optional[int] = None
    statement: str
    justification: Optional[str] = "Implicit"


class PredictMisconceptionRequest(BaseModel):
    submission_id: str = Field(default="SUB_001")
    question_id: str = Field(default="GEO_Q01")
    extracted_steps: list[Union[str, StepInput, dict[str, Any]]]


class PredictMisconceptionResponse(BaseModel):
    submission_id: str
    question_id: str
    normalized_proof_text: str
    predicted_misconception: str
    confidence_score: float
    class_probabilities: dict[str, float]


app = FastAPI(
    title="Geometry Misconception Detection Service (Component 2)",
    description="Member 2 (Induwara T.G.N - IT23414778) — Math Token Normalization, MiniLM Embeddings & Calibrated SVM Classifier",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = FeatureExtractor()
model_bundle: Optional[dict[str, Any]] = None


def load_model_bundle() -> Optional[dict[str, Any]]:
    global model_bundle
    if model_bundle is None and MODEL_ARTIFACT_PATH.exists():
        model_bundle = joblib.load(MODEL_ARTIFACT_PATH)
    return model_bundle


@app.on_event("startup")
def on_startup() -> None:
    load_model_bundle()


def _format_steps_to_text(steps: list[Union[str, StepInput, dict[str, Any]]]) -> str:
    formatted: list[str] = []
    for idx, item in enumerate(steps, start=1):
        if isinstance(item, str):
            formatted.append(f"Step {idx}: {item}")
        elif isinstance(item, StepInput):
            just = item.justification or "Implicit"
            formatted.append(f"Step {item.step_number or idx}: {item.statement} [{just}]")
        elif isinstance(item, dict):
            stmt = item.get("statement", "")
            just = item.get("justification", "Implicit")
            snum = item.get("step_number", idx)
            formatted.append(f"Step {snum}: {stmt} [{just}]")
    return " | ".join(formatted)


@app.get("/health")
def health_check():
    bundle = load_model_bundle()
    return {
        "status": "ok",
        "service": "service-detection",
        "component": "Member 2 - Misconception Detection Engine",
        "embedding_model": extractor.backend_name,
        "classifier_loaded": bundle is not None,
        "model_path": str(MODEL_ARTIFACT_PATH),
    }


@app.post("/api/v1/predict-misconception", response_model=PredictMisconceptionResponse)
def predict_misconception(payload: PredictMisconceptionRequest):
    if not payload.extracted_steps:
        raise HTTPException(status_code=422, detail="extracted_steps must not be empty.")

    bundle = load_model_bundle()
    if bundle is None:
        raise HTTPException(
            status_code=503,
            detail="Trained model artifact (models/misconception_classifier.pkl) not found. Run train.py first.",
        )

    raw_steps_text = _format_steps_to_text(payload.extracted_steps)
    normalized_text = normalize_math_text(raw_steps_text)
    features = extractor.encode([normalized_text])

    clf = bundle["classifier"]
    classes: list[str] = list(clf.classes_)
    probs = clf.predict_proba(features)[0]

    prob_map = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, probs)}
    best_idx = int(probs.argmax())
    predicted_label = classes[best_idx]
    confidence = round(float(probs[best_idx]), 4)

    return PredictMisconceptionResponse(
        submission_id=payload.submission_id,
        question_id=payload.question_id,
        normalized_proof_text=normalized_text,
        predicted_misconception=predicted_label,
        confidence_score=confidence,
        class_probabilities=prob_map,
    )
