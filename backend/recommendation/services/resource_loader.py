import json
import logging
import warnings
from pathlib import Path
from typing import List

from pydantic import ValidationError

from recommendation.models import LearningResource

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_resources() -> List[LearningResource]:
    """Load all resources_*.json files from the data directory.

    Strictly matches only files whose names start with ``resources_`` so that
    auxiliary files such as ``usage_log.json`` are never parsed as resources.
    Each individual record is validated defensively — a malformed entry emits a
    warning and is skipped rather than crashing the entire loader.
    """
    resources: List[LearningResource] = []
    for file in sorted(DATA_DIR.glob("resources_*.json")):
        try:
            with open(file, encoding="utf-8") as f:
                raw_list = json.load(f)
        except (OSError, json.JSONDecodeError) as exc:
            warnings.warn(f"[resource_loader] Could not read {file.name}: {exc}")
            logger.warning("Could not read %s: %s", file.name, exc)
            continue

        for idx, item in enumerate(raw_list):
            try:
                resources.append(LearningResource(**item))
            except (ValidationError, TypeError) as exc:
                warnings.warn(
                    f"[resource_loader] Skipping record #{idx} in {file.name}: {exc}"
                )
                logger.warning("Skipping record #%d in %s: %s", idx, file.name, exc)

    return resources