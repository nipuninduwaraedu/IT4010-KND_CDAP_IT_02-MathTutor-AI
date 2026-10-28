from typing import List, Optional

from recommendation.models import LearningResource
from recommendation.services.matcher import match_resources
from recommendation.services.ranker import rank_resources
from recommendation.services.resource_loader import load_resources

TOP_N = 3


def get_top_resources(
    misconception: str,
    concept: Optional[str] = None,
    language: str = "en",
    limit: int = TOP_N,
) -> List[LearningResource]:
    resources = load_resources()
    matched = match_resources(resources, misconception, concept, language)
    ranked = rank_resources(matched, misconception, concept)
    return ranked[:limit]