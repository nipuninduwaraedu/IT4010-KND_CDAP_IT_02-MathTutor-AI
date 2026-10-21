from typing import List, Optional

from recommendation.models import LearningResource
from recommendation.services.concept_mapper import get_related_concepts

DIFFICULTY_ORDER = {"basic": 0, "medium": 1, "advanced": 2}
TYPE_ORDER = {"video": 0, "notes": 1, "worked_example": 2, "practice": 3}


def rank_resources(
    resources: List[LearningResource],
    misconception: str,
    concept: Optional[str] = None,
) -> List[LearningResource]:
    concepts = get_related_concepts(misconception, concept)

    def score(r: LearningResource):
        concept_rank = concepts.index(r.concept) if r.concept in concepts else 99
        return (
            concept_rank,
            DIFFICULTY_ORDER.get(r.difficulty.value, 9),
            TYPE_ORDER.get(r.type.value, 9),
        )

    return sorted(resources, key=score)