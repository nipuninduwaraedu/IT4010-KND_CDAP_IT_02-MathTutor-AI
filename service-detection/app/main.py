from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional, Union

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.embeddings import FeatureExtractor
from app.normalizer import normalize_math_text

logger = logging.getLogger(__name__)

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


extractor = FeatureExtractor(allow_fallback=False)
model_artifact: Optional[dict[str, Any]] = None


def load_model_artifact() -> Optional[dict[str, Any]]:
    global model_artifact
    if model_artifact is None and MODEL_ARTIFACT_PATH.exists():
        model_artifact = joblib.load(MODEL_ARTIFACT_PATH)
    return model_artifact


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_artifact()
    yield


app = FastAPI(
    title="Geometry Misconception Detection Service (Component 2)",
    description=(
        "Member 2 (Induwara T.G.N - IT23414778) — Math Token Normalization, "
        "MiniLM Dense Embeddings & Misconception Classifier"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    artifact = load_model_artifact()
    return {
        "status": "ok",
        "service": "service-detection",
        "embedding_backend": extractor.model_type,
        "classifier_loaded": artifact is not None,
        "classifier_model": artifact.get("model_name") if artifact is not None else None,
        "reported_macro_f1": artifact.get("cv_macro_f1") if artifact is not None else None,
    }


@app.post("/api/v1/predict-misconception", response_model=PredictMisconceptionResponse)
def predict_misconception(payload: PredictMisconceptionRequest):
    if not payload.extracted_steps:
        raise HTTPException(status_code=422, detail="extracted_steps must not be empty.")

    artifact = load_model_artifact()
    if artifact is None:
        raise HTTPException(
            status_code=503,
            detail="Trained model artifact (models/misconception_classifier.pkl) not found. Run train.py first.",
        )

    expected_backend = artifact.get("embedding_backend")
    if expected_backend and expected_backend != extractor.model_type:
        msg = (
            f"Train/serve embedding backend mismatch: artifact expects '{expected_backend}', "
            f"but runtime extractor is '{extractor.model_type}'."
        )
        logger.warning(msg)
        raise HTTPException(status_code=503, detail=msg)

    raw_steps_text = _format_steps_to_text(payload.extracted_steps)
    normalized_text = normalize_math_text(raw_steps_text)
    features = extractor.encode([normalized_text])

    clf = artifact.get("model") or artifact.get("classifier")
    if clf is None:
        raise HTTPException(status_code=503, detail="Classifier estimator missing from artifact bundle.")

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
