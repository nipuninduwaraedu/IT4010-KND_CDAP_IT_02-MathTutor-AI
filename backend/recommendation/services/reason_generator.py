from recommendation.models import LearningResource

MISCONCEPTION_TEXT = {
    "incorrect_theorem_application": "applied a theorem incorrectly",
    "missing_proof_step": "missed a step in your proof",
    "incorrect_angle_relationship": "mixed up an angle relationship",
    "invalid_assumption": "made an assumption that is not given",
}

TYPE_TEXT = {
    "video": "a short video",
    "notes": "quick notes",
    "worked_example": "a worked example",
    "practice": "practice questions",
}


def generate_reason(resource: LearningResource, misconception: str) -> str:
    problem = MISCONCEPTION_TEXT.get(misconception, "made a reasoning mistake")
    kind = TYPE_TEXT.get(resource.type.value, "this resource")
    concept = resource.concept.replace("_", " ")
    return f"Recommended because you {problem}. This is {kind} on {concept} to help you fix it."