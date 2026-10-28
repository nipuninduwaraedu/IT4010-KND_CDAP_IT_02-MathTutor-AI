import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SEED_THEOREMS_PATH = DATA_DIR / "seed_theorems.json"


class TheoremRepository:
    """
    Repository for querying Grade 10-11 Sri Lankan O/L Geometry theorems
    and their associated misconception bug taxonomy.
    """

    def __init__(self, data_path: Optional[Path] = None) -> None:
        self.data_path = data_path or SEED_THEOREMS_PATH
        self._theorems: dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        if not self.data_path.exists():
            return
        with open(self.data_path, "r", encoding="utf-8") as f:
            records = json.load(f)
            for item in records:
                tid = item.get("theorem_id")
                if tid:
                    self._theorems[tid] = item

    def get_all_theorems(self) -> list[dict]:
        return list(self._theorems.values())

    def get_theorem_by_id(self, theorem_id: str) -> Optional[dict]:
        return self._theorems.get(theorem_id)

    def get_bugs_by_category(self, category: str) -> list[dict]:
        matched_bugs: list[dict] = []
        target = category.strip().lower()
        for theorem in self._theorems.values():
            for bug in theorem.get("bugs", []):
                if bug.get("category", "").strip().lower() == target:
                    matched_bugs.append(
                        {
                            "theorem_id": theorem["theorem_id"],
                            "theorem_name": theorem["name_en"],
                            **bug,
                        }
                    )
        return matched_bugs
