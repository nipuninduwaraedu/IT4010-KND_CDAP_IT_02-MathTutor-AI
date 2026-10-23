from fastapi import APIRouter

from recommendation.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendedResource,
)
from recommendation.services.fallback import is_low_confidence, topic_fallback
from recommendation.services.reason_generator import generate_reason
from recommendation.services.recommender import get_top_resources

router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
def recommend(req: RecommendationRequest):
    concept = req.concept.value if req.concept else None
    misconception = req.misconception.value

    if is_low_confidence(req.confidence):
        resources = topic_fallback(concept, req.language)
        reason = "Recommended as general practice on this topic."
        items = [
            RecommendedResource(
                resource_id=r.resource_id,
                title=r.title,
                type=r.type.value,
                difficulty=r.difficulty.value,
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
                reason=generate_reason(r, misconception),
            )
            for r in resources
        ]

    return RecommendationResponse(recommendations=items)