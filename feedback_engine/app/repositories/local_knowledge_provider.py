"""
Local JSON-backed knowledge provider for development and testing.

Reads theorem records from `data/sample_geometry_rules.json` and feedback
guidance templates from `templates/feedback_templates.json`.  Both files
are loaded once at construction time; the provider is then stateless.

This class satisfies the KnowledgeProvider Protocol without inheritance.
When Member 1's knowledge base is ready, a new provider class that also
satisfies the Protocol can replace this one — no other code needs to change.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

from app.repositories.knowledge_provider import FeedbackGuidance, TheoremRecord

logger = logging.getLogger(__name__)


class LocalKnowledgeProvider:
    """
    KnowledgeProvider backed by local JSON files.

    Satisfies the KnowledgeProvider Protocol (see knowledge_provider.py).
    Intended for development and automated testing only.
    """

    provider_name: str = "local_json"

    def __init__(
        self,
        geometry_rules_path: Path,
        feedback_templates_path: Path,
    ) -> None:
        self._theorems: dict[str, TheoremRecord] = {}
        self._guidance: dict[str, FeedbackGuidance] = {}
        self._load_theorems(geometry_rules_path)
        self._load_guidance(feedback_templates_path)
        logger.info(
            "LocalKnowledgeProvider loaded %d theorem(s) and %d guidance record(s).",
            len(self._theorems),
            len(self._guidance),
        )

    # ------------------------------------------------------------------
    # Protocol methods
    # ------------------------------------------------------------------

    def get_theorem(self, theorem_id: str) -> Optional[TheoremRecord]:
        """
        Return the TheoremRecord for the given ID, or None if not found.
        Callers must handle None without inventing a theorem.
        """
        record = self._theorems.get(theorem_id)
        if record is None:
            logger.debug("Theorem ID '%s' not found in local knowledge base.", theorem_id)
        return record

    def get_feedback_guidance(self, label: str) -> Optional[FeedbackGuidance]:
        """
        Return the FeedbackGuidance for the given misconception label, or None.
        """
        guidance = self._guidance.get(label)
        if guidance is None:
            logger.warning("No feedback guidance found for label '%s'.", label)
        return guidance

    # ------------------------------------------------------------------
    # Private loading helpers
    # ------------------------------------------------------------------

    def _load_theorems(self, path: Path) -> None:
        """Load theorem records from the geometry rules JSON file."""
        if not path.exists():
            logger.error("Geometry rules file not found: %s", path)
            return
        try:
            with path.open(encoding="utf-8") as fh:
                raw = json.load(fh)
            for entry in raw.get("theorems", []):
                tid = entry.get("theorem_id")
                if not tid:
                    logger.warning("Skipping theorem entry with missing theorem_id.")
                    continue
                self._theorems[tid] = TheoremRecord(
                    theorem_id=tid,
                    name=entry.get("name", ""),
                    statement=entry.get("statement", ""),
                    conditions=entry.get("conditions", ""),
                    grade_level=entry.get("grade_level", ""),
                    topic=entry.get("topic", ""),
                )
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            logger.error("Failed to load geometry rules from %s: %s", path, exc)

    def _load_guidance(self, path: Path) -> None:
        """Load feedback template data from the templates JSON file."""
        if not path.exists():
            logger.error("Feedback templates file not found: %s", path)
            return
        try:
            with path.open(encoding="utf-8") as fh:
                raw = json.load(fh)
            for entry in raw.get("labels", []):
                label = entry.get("label")
                if not label:
                    logger.warning("Skipping guidance entry with missing label.")
                    continue
                self._guidance[label] = FeedbackGuidance(
                    label=label,
                    description=entry.get("description", ""),
                    feedback_summary_template=entry.get("feedback_summary_template", ""),
                    feedback_summary_template_fallback=entry.get(
                        "feedback_summary_template_fallback", ""
                    ),
                    hint_1_template=entry.get("hint_1_template", ""),
                    hint_1_template_fallback=entry.get("hint_1_template_fallback", ""),
                    hint_2_template=entry.get("hint_2_template", ""),
                    hint_2_template_fallback=entry.get("hint_2_template_fallback", ""),
                    hint_3_template=entry.get("hint_3_template", ""),
                    hint_3_template_fallback=entry.get("hint_3_template_fallback", ""),
                    remedial_topic=entry.get("remedial_topic", ""),
                    remedial_note_template=entry.get("remedial_note_template", ""),
                    teacher_review_message=entry.get("teacher_review_message", ""),
                )
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            logger.error("Failed to load feedback templates from %s: %s", path, exc)
