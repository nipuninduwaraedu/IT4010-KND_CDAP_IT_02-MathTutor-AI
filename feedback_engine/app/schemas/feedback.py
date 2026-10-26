# Pydantic request/response models for the feedback API.


from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# Supported misconception labels


class MisconceptionLabel(str, Enum):
    """Misconception categories from Member 2's classifier."""
    CORRECT_REASONING = "Correct Reasoning"
    INCORRECT_THEOREM_APPLICATION = "Incorrect Theorem Application"
    INCORRECT_ANGLE_RELATIONSHIPS = "Incorrect Angle Relationships"
    MISSING_PROOF_STEP = "Missing Proof Step"


# Request schema


class FeedbackRequest(BaseModel):
    """Input for personalised feedback on a geometry proof submission."""

    reasoning_steps: list[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        description=(
            "Ordered list of reasoning statements extracted from the student's "
            "handwritten proof.  Provided by Member 2's OCR / extraction pipeline."
        ),
        examples=[
            [
                "Angle ABC is 70 degrees",
                "Angle ADC is 70 degrees because they are opposite angles",
            ]
        ],
    )

    predicted_label: MisconceptionLabel = Field(
        ...,
        description="Misconception category predicted by Member 2's classifier.",
    )

    confidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description=(
            "Classifier confidence score in [0.0, 1.0].  "
            "Absent when the classifier did not produce a score.  "
            "Member 3 must NOT fabricate a default if this is missing."
        ),
    )

    theorem_id: Optional[str] = Field(
        default=None,
        max_length=128,
        description=(
            "Identifier for the geometry theorem relevant to this question.  "
            "Used to look up Member 1's knowledge base.  May be absent."
        ),
        examples=["cyclic_opposite_angles"],
    )

    question_id: Optional[str] = Field(
        default=None,
        max_length=128,
        description="Opaque question identifier for tracing only.  Not logged.",
        examples=["geometry_sample_01"],
    )

    language: Optional[str] = Field(
        default="en",
        max_length=10,
        description="Preferred feedback language (BCP-47 tag).  Only 'en' is supported in v1.",
    )

    @field_validator("reasoning_steps")
    @classmethod
    def steps_must_not_be_blank(cls, steps: list[str]) -> list[str]:
        """Reject lists that contain only whitespace strings."""
        non_blank = [s for s in steps if s.strip()]
        if not non_blank:
            raise ValueError(
                "reasoning_steps must contain at least one non-blank statement."
            )
        return steps

    model_config = {
        "json_schema_extra": {
            "example": {
                "reasoning_steps": [
                    "Angle ABC is 70 degrees",
                    "Angle ADC is 70 degrees because they are opposite angles",
                ],
                "predicted_label": "Incorrect Angle Relationships",
                "confidence": 0.94,
                "theorem_id": "cyclic_opposite_angles",
                "question_id": "geometry_sample_01",
                "language": "en",
            }
        }
    }


# Response sub-models


class HintItem(BaseModel):
    """A single scaffolded hint at a specific disclosure level."""

    level: int = Field(..., ge=1, le=3, description="Hint level: 1 (conceptual) → 3 (guided step).")
    title: str = Field(..., description="Short title for the hint card.")
    message: str = Field(..., description="The hint text shown to the student.")


class RemedialGuidance(BaseModel):
    """Optional follow-up study recommendation."""

    topic: str = Field(..., description="Geometry topic to review.")
    recommendation_note: str = Field(..., description="Brief study recommendation.")


class FeedbackStatus(str, Enum):
    """Machine-readable outcome of the feedback generation attempt."""

    FEEDBACK_GENERATED = "feedback_generated"
    CORRECT_REASONING = "correct_reasoning"
    CAUTIOUS_FEEDBACK = "cautious_feedback"    # low confidence path
    FALLBACK_FEEDBACK = "fallback_feedback"    # theorem not found path
    ERROR = "error"


class FeedbackResponse(BaseModel):
    """Structured feedback with summary, three hints, and optional remedial guidance."""

    status: FeedbackStatus = Field(..., description="Outcome of the feedback generation attempt.")
    misconception_label: str = Field(..., description="The predicted misconception label, echoed back.")
    theorem_reference: Optional[str] = Field(
        default=None,
        description="Theorem identifier used, if one was found in the knowledge base.",
    )
    feedback_summary: str = Field(..., description="One-sentence summary of the feedback.")
    hints: list[HintItem] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Exactly three scaffolded hints, ordered level 1 → 3.",
    )
    reveal_final_answer: bool = Field(
        default=False,
        description="Always false in v1.  The engine never reveals the complete solution.",
    )
    requires_teacher_review: bool = Field(
        default=False,
        description="True when confidence is below threshold or reasoning is ambiguous.",
    )
    remedial_guidance: Optional[RemedialGuidance] = Field(
        default=None,
        description="Optional follow-up study recommendation.",
    )
    confidence_acknowledged: Optional[float] = Field(
        default=None,
        description="The confidence value received, echoed back for traceability.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "feedback_generated",
                "misconception_label": "Incorrect Angle Relationships",
                "theorem_reference": "cyclic_opposite_angles",
                "feedback_summary": (
                    "Review the relationship between opposite angles "
                    "in a cyclic quadrilateral."
                ),
                "hints": [
                    {
                        "level": 1,
                        "title": "Think about the relationship",
                        "message": (
                            "Are opposite angles of a cyclic quadrilateral equal, "
                            "or do they add up to a particular total?"
                        ),
                    },
                    {
                        "level": 2,
                        "title": "Recall the theorem",
                        "message": (
                            "Opposite angles of a cyclic quadrilateral sum to 180 degrees."
                        ),
                    },
                    {
                        "level": 3,
                        "title": "Apply the rule",
                        "message": (
                            "Use the sum of 180 degrees and the known angle "
                            "to determine the other angle."
                        ),
                    },
                ],
                "reveal_final_answer": False,
                "requires_teacher_review": False,
                "remedial_guidance": {
                    "topic": "Cyclic Quadrilaterals",
                    "recommendation_note": (
                        "Review the circle theorem for opposite angles in a cyclic quadrilateral."
                    ),
                },
                "confidence_acknowledged": 0.94,
            }
        }
    }


# Labels endpoint response


class LabelInfo(BaseModel):
    """Description of a single misconception label."""
    label: str
    description: str


class LabelsResponse(BaseModel):
    """Response for GET /feedback/labels."""
    labels: list[LabelInfo]


# Health endpoint response


class HealthResponse(BaseModel):
    """Response for GET /health."""
    status: str
    component: str
    version: str
    knowledge_provider: str
