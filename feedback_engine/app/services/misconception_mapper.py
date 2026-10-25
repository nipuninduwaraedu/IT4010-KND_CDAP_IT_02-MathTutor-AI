"""
Misconception label mapping and normalisation.

Converts the raw predicted_label string (received from Member 2) into the
MisconceptionLabel enum.  Although FastAPI/Pydantic will already validate
the label in the request schema, this module can also be used independently
(e.g., from the service layer when reprocessing stored data).

Centralised here so that any future aliasing or label-versioning logic has
a single home.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.schemas.feedback import MisconceptionLabel

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional aliases — allows minor label variations from Member 2 to resolve
# without breaking the engine.  Only add entries that the team explicitly
# agrees on; do not silently absorb arbitrary strings.
# ---------------------------------------------------------------------------
_LABEL_ALIASES: dict[str, MisconceptionLabel] = {
    # Canonical forms (redundant but explicit)
    "Correct Reasoning": MisconceptionLabel.CORRECT_REASONING,
    "Incorrect Theorem Application": MisconceptionLabel.INCORRECT_THEOREM_APPLICATION,
    "Incorrect Angle Relationships": MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
    "Missing Proof Step": MisconceptionLabel.MISSING_PROOF_STEP,
}


def resolve_label(raw_label: str) -> Optional[MisconceptionLabel]:
    """
    Return the MisconceptionLabel enum value for the given raw string.

    Returns None if the label is not recognised.  The caller decides whether
    to raise an error or return a safe fallback response.

    This function performs a case-insensitive prefix match as a fallback
    so that minor formatting differences from Member 2 do not cause hard
    failures — but the canonical form is always preferred.
    """
    # Exact alias match (preferred path)
    if raw_label in _LABEL_ALIASES:
        return _LABEL_ALIASES[raw_label]

    # Try enum value directly (handles already-normalised inputs)
    try:
        return MisconceptionLabel(raw_label)
    except ValueError:
        pass

    # Case-insensitive fallback
    raw_lower = raw_label.strip().lower()
    for alias, label in _LABEL_ALIASES.items():
        if alias.lower() == raw_lower:
            logger.info(
                "Label '%s' resolved via case-insensitive match to '%s'.",
                raw_label,
                label.value,
            )
            return label

    logger.warning("Unrecognised misconception label: '%s'", raw_label)
    return None


def get_all_labels() -> list[MisconceptionLabel]:
    """Return all supported misconception labels in a stable order."""
    return list(MisconceptionLabel)
