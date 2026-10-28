from typing import List, Optional

from recommendation.models import LearningResource
from recommendation.services.resource_loader import load_resources

CONFIDENCE_THRESHOLD = 0.5


def is_low_confidence(confidence: float) -> bool:
    return confidence < CONFIDENCE_THRESHOLD


def topic_fallback(
    concept: Optional[str],
    language: str = "en",
    limit: int = 3,
) -> List[LearningResource]:
    """Simple topic-based recommendation when the misconception is unreliable."""
    resources = [r for r in load_resources() if r.language == language]
    if concept:
        resources = [r for r in resources if r.concept == concept]
    resources.sort(key=lambda r: r.difficulty.value)
    return resources[:limit]