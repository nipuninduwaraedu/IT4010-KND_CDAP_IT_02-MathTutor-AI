# Rule-based scaffolded hints (three levels); no LLM.


from __future__ import annotations

import logging
from typing import Optional

from app.repositories.knowledge_provider import FeedbackGuidance, TheoremRecord
from app.schemas.feedback import HintItem, RemedialGuidance
from app.utils.text_utils import fill_template

logger = logging.getLogger(__name__)

# Hint level titles — defined here so they can be changed in one place


_HINT_TITLES = {
    1: "Think about the relationship",
    2: "Recall the theorem",
    3: "Apply the rule",
}


def generate_hints(
    guidance: FeedbackGuidance,
    theorem: Optional[TheoremRecord],
) -> list[HintItem]:
    """Return exactly three scaffolded hints (levels 1–3)."""
    if theorem is not None:
        substitutions = dict(
            theorem_name=theorem.name,
            theorem_statement=theorem.statement,
            theorem_conditions=theorem.conditions,
            topic=theorem.topic,
        )
        h1 = fill_template(guidance.hint_1_template, **substitutions)
        h2 = fill_template(guidance.hint_2_template, **substitutions)
        h3 = fill_template(guidance.hint_3_template, **substitutions)
        logger.debug("Hints generated using theorem '%s'.", theorem.theorem_id)
    else:
        # Use the fallback templates (no theorem-specific placeholders).
        # FeedbackGuidance guarantees these slots exist; they default to the
        # primary template when not set in the JSON source.
        h1 = guidance.hint_1_template_fallback
        h2 = guidance.hint_2_template_fallback
        h3 = guidance.hint_3_template_fallback
        logger.debug("Hints generated using fallback templates (no theorem record).")

    return [
        HintItem(level=1, title=_HINT_TITLES[1], message=h1),
        HintItem(level=2, title=_HINT_TITLES[2], message=h2),
        HintItem(level=3, title=_HINT_TITLES[3], message=h3),
    ]


def generate_feedback_summary(
    guidance: FeedbackGuidance,
    theorem: Optional[TheoremRecord],
) -> str:
    """
    Produce the one-sentence feedback summary.

    Uses the standard template when a theorem is available, the fallback
    template otherwise.
    """
    if theorem is not None:
        substitutions = dict(
            theorem_name=theorem.name,
            theorem_statement=theorem.statement,
            theorem_conditions=theorem.conditions,
            topic=theorem.topic,
        )
        return fill_template(guidance.feedback_summary_template, **substitutions)

    # FeedbackGuidance guarantees feedback_summary_template_fallback exists.
    return guidance.feedback_summary_template_fallback


def generate_remedial_guidance(
    guidance: FeedbackGuidance,
    theorem: Optional[TheoremRecord],
) -> RemedialGuidance:
    """
    Produce the optional remedial study recommendation.
    """
    topic = guidance.remedial_topic
    note_template = guidance.remedial_note_template
    if theorem is not None:
        note = fill_template(note_template, topic=theorem.topic, theorem_name=theorem.name)
    else:
        note = fill_template(note_template, topic=topic, theorem_name="")
    return RemedialGuidance(topic=topic, recommendation_note=note)
