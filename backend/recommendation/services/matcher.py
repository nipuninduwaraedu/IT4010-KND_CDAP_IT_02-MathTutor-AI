from typing import List, Optional

from recommendation.models import LearningResource
from recommendation.services.concept_mapper import get_related_concepts


def match_resources(
    resources: List[LearningResource],
    misconception: str,
    concept: Optional[str] = None,
    language: str = "en",
) -> List[LearningResource]:
    concepts = get_related_concepts(misconception, concept)
    return [
        r for r in resources
        if r.concept in concepts
        and misconception in r.misconceptions
        and r.language == language
    ]