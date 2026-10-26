# KnowledgeProvider protocol and DTOs for theorems and feedback templates.


from __future__ import annotations

from typing import Optional, Protocol, runtime_checkable


# Data transfer objects returned by the knowledge provider


class TheoremRecord:
    """Geometry theorem record from the knowledge base (sample data in dev)."""

    __slots__ = (
        "theorem_id",
        "name",
        "statement",
        "conditions",
        "grade_level",
        "topic",
    )

    def __init__(
        self,
        *,
        theorem_id: str,
        name: str,
        statement: str,
        conditions: str,
        grade_level: str,
        topic: str,
    ) -> None:
        self.theorem_id: str = theorem_id
        self.name: str = name
        self.statement: str = statement
        self.conditions: str = conditions
        self.grade_level: str = grade_level
        self.topic: str = topic

    def __repr__(self) -> str:  # pragma: no cover
        return f"TheoremRecord(theorem_id={self.theorem_id!r}, name={self.name!r})"


class FeedbackGuidance:
    """Feedback templates for a misconception label, including fallbacks when no theorem is found."""

    __slots__ = (
        "label",
        "description",
        "feedback_summary_template",
        "feedback_summary_template_fallback",
        "hint_1_template",
        "hint_1_template_fallback",
        "hint_2_template",
        "hint_2_template_fallback",
        "hint_3_template",
        "hint_3_template_fallback",
        "remedial_topic",
        "remedial_note_template",
        "teacher_review_message",
    )

    def __init__(
        self,
        *,
        label: str,
        description: str,
        feedback_summary_template: str,
        hint_1_template: str,
        hint_2_template: str,
        hint_3_template: str,
        remedial_topic: str,
        remedial_note_template: str,
        teacher_review_message: str,
        # Fallback templates used when no theorem record is available.
        # Default to the primary template so callers that do not provide them
        # continue to work without crashing.
        feedback_summary_template_fallback: str = "",
        hint_1_template_fallback: str = "",
        hint_2_template_fallback: str = "",
        hint_3_template_fallback: str = "",
    ) -> None:
        self.label: str = label
        self.description: str = description
        self.feedback_summary_template: str = feedback_summary_template
        self.feedback_summary_template_fallback: str = (
            feedback_summary_template_fallback or feedback_summary_template
        )
        self.hint_1_template: str = hint_1_template
        self.hint_1_template_fallback: str = hint_1_template_fallback or hint_1_template
        self.hint_2_template: str = hint_2_template
        self.hint_2_template_fallback: str = hint_2_template_fallback or hint_2_template
        self.hint_3_template: str = hint_3_template
        self.hint_3_template_fallback: str = hint_3_template_fallback or hint_3_template
        self.remedial_topic: str = remedial_topic
        self.remedial_note_template: str = remedial_note_template
        self.teacher_review_message: str = teacher_review_message

    def __repr__(self) -> str:  # pragma: no cover
        return f"FeedbackGuidance(label={self.label!r})"


# Protocol interface


@runtime_checkable
class KnowledgeProvider(Protocol):
    """Protocol for theorem and feedback-template lookups (swappable providers)."""

    def get_theorem(self, theorem_id: str) -> Optional[TheoremRecord]:
        """Return theorem by id, or None if not found."""
        ...

    def get_feedback_guidance(self, label: str) -> Optional[FeedbackGuidance]:
        """Return feedback templates for a label, or None."""
        ...

    @property
    def provider_name(self) -> str:
        """Human-readable name of the backing provider (used in /health)."""
        ...
