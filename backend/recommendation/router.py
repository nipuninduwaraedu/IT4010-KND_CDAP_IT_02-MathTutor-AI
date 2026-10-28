from fastapi import APIRouter, HTTPException

from recommendation.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendedResource,
    UsageEvent,
    UsageLogRequest,
)
from recommendation.services.fallback import is_low_confidence, topic_fallback
from recommendation.services.reason_generator import generate_reason
from recommendation.services.recommender import get_top_resources
from recommendation.services.tracker import log_usage

router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):
    # Normalise to lowercase so callers can send "Angles" or "ANGLES" etc.
    concept = req.concept.value.lower() if req.concept else None
    misconception = req.misconception.value.lower()

    if is_low_confidence(req.confidence):
        resources = topic_fallback(concept, req.language)
        reason = "Recommended as general practice on this topic."
        items = [
            RecommendedResource(
                resource_id=r.resource_id,
                title=r.title,
                type=r.type.value,
                difficulty=r.difficulty.value,
                url=r.url,
                reason=reason,
            )
            for r in resources
        ]
    else:
        resources = get_top_resources(misconception, concept, req.language)
        items = [
            RecommendedResource(
                resource_id=r.resource_id,
                title=r.title,
                type=r.type.value,
                difficulty=r.difficulty.value,
                url=r.url,
                reason=generate_reason(r, misconception),
            )
            for r in resources
        ]

    # Log a usage event for each recommended resource
    usage_events: list[UsageEvent] = []
    for item in items:
        raw = log_usage(req.student_id, item.resource_id)
        usage_events.append(UsageEvent(**raw))

    return RecommendationResponse(recommendations=items)


@router.post("/usage", response_model=UsageEvent, status_code=201)
def track_usage(req: UsageLogRequest):
    """Record that a student opened/interacted with a resource."""
    raw = log_usage(req.student_id, req.resource_id, req.action)
    return UsageEvent(**raw)