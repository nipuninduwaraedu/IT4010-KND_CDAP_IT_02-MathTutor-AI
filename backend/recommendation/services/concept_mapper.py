from typing import List, Optional

MISCONCEPTION_TO_CONCEPTS = {
    "incorrect_theorem_application": ["circle_theorems", "pythagoras"],
    "missing_proof_step": ["triangles"],
    "incorrect_angle_relationship": ["angles"],
    "invalid_assumption": ["circle_theorems", "triangles"],
}


def get_related_concepts(misconception: str, concept: Optional[str] = None) -> List[str]:
    """If the detector gave a concept, use it first, then the default mapping."""
    mapped = MISCONCEPTION_TO_CONCEPTS.get(misconception, [])
    if concept:
        return [concept] + [c for c in mapped if c != concept]
    return mapped