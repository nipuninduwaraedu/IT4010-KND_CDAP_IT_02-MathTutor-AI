# Feedback routes: GET /feedback/labels and POST /feedback.


from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.schemas.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    LabelInfo,
    LabelsResponse,
    MisconceptionLabel,
)
from app.services.feedback_service import FeedbackService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/feedback", tags=["Feedback"])

# Label descriptions — shown to API consumers in GET /feedback/labels


_LABEL_DESCRIPTIONS: dict[MisconceptionLabel, str] = {
    MisconceptionLabel.CORRECT_REASONING: (
        "The student's reasoning steps follow valid geometric logic. "
        "Affirming feedback is provided with gentle prompts to verify completeness."
    ),
    MisconceptionLabel.INCORRECT_THEOREM_APPLICATION: (
        "The student applied a theorem whose conditions are not satisfied by the "
        "given geometric configuration, or selected the wrong theorem entirely."
    ),
    MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS: (
        "The student stated an incorrect relationship between angles — for example, "
        "treating supplementary angles as equal, or vice versa."
    ),
    MisconceptionLabel.MISSING_PROOF_STEP: (
        "The student's proof contains a reasoning gap: a conclusion is stated without "
        "a justification connecting it to the previous step.  Note: some gaps may "
        "result from OCR failure rather than a conceptual error."
    ),
}


# GET /feedback/labels


@router.get(
    "/labels",
    response_model=LabelsResponse,
    summary="List supported misconception labels",
    description=(
        "Returns the four misconception categories that the Feedback Engine "
        "can process, together with plain-English descriptions.  "
        "Intended for Member 2 and Member 4 to inspect the API contract."
    ),
)
async def get_labels() -> LabelsResponse:
    """Return all supported misconception labels and their descriptions."""
    return LabelsResponse(
        labels=[
            LabelInfo(label=label.value, description=desc)
            for label, desc in _LABEL_DESCRIPTIONS.items()
        ]
    )


# POST /feedback


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate personalised feedback",
    description=(
        "Accepts a predicted misconception label and the student's extracted "
        "reasoning steps, then returns three levels of scaffolded hints together "
        "with a feedback summary and an optional remedial study recommendation.\n\n"
        "**Safety notes:**\n"
        "- Predictions below the configured confidence threshold return cautious "
        "feedback with a teacher-review flag.\n"
        "- If the requested theorem is not found in the knowledge base, safe "
        "fallback hints are returned — no theorem is invented.\n"
        "- This engine never reveals the final answer to the student."
    ),
    responses={
        422: {"description": "Validation error — invalid label, blank steps, or malformed input."},
        503: {"description": "Service temporarily unavailable — knowledge provider error."},
    },
)
async def generate_feedback(
    payload: FeedbackRequest,
    request: Request,
) -> FeedbackResponse:
    # Generate scaffolded feedback via FeedbackService on app.state.
    service: FeedbackService = request.app.state.feedback_service

    try:
        response = service.generate_feedback(payload)
    except Exception as exc:
        # Catch unexpected service-layer failures and return a safe 503.
        # The full exception is logged server-side; the client receives only
        # a generic message (no stack trace or internal detail).
        logger.exception(
            "Unexpected error in FeedbackService for label='%s', question_id='%s': %s",
            payload.predicted_label.value,
            payload.question_id or "not provided",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The feedback service encountered an unexpected error. "
                "Please try again or contact the system administrator."
            ),
        ) from exc

    return response
