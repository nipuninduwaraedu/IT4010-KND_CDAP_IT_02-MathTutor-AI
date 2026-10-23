from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Misconception(str, Enum):
    INCORRECT_THEOREM_APPLICATION = "incorrect_theorem_application"
    MISSING_PROOF_STEP = "missing_proof_step"
    INCORRECT_ANGLE_RELATIONSHIP = "incorrect_angle_relationship"
    INVALID_ASSUMPTION = "invalid_assumption"


class Concept(str, Enum):
    ANGLES = "angles"
    TRIANGLES = "triangles"
    CIRCLE_THEOREMS = "circle_theorems"
    PYTHAGORAS = "pythagoras"


class RecommendationRequest(BaseModel):
    student_id: str
    misconception: Misconception
    concept: Optional[Concept] = None
    confidence: float = Field(ge=0.0, le=1.0)
    language: str = "en"


class RecommendedResource(BaseModel):
    resource_id: str
    title: str
    type: str
    difficulty: str
    reason: str


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendedResource]


class UsageEvent(BaseModel):
    student_id: str
    resource_id: str
    action: str
    timestamp: str