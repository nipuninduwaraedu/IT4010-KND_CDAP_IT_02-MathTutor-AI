import json
from pathlib import Path
from typing import List

from recommendation.models import LearningResource

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_resources() -> List[LearningResource]:
    resources: List[LearningResource] = []
    for file in sorted(DATA_DIR.glob("*.json")):
        with open(file, encoding="utf-8") as f:
            for item in json.load(f):
                resources.append(LearningResource(**item))
    return resources