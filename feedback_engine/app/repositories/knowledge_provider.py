"""
Abstract knowledge-provider interface for the Feedback Engine.

This module defines the Protocol that all knowledge providers must satisfy.
The local JSON provider is used during development and testing.
Member 1's PostgreSQL/FastAPI-backed provider will be an adapter implementing
this same Protocol — no changes to FeedbackService will be needed at that time.

Design note: Python's typing.Protocol is used rather than ABC so that
provider implementations do not need to explicitly inherit from a base class.
This makes it easier for Member 1 to wrap their own data layer without
coupling their codebase to Member 3's class hierarchy.
"""

from __future__ import annotations

from typing import Optional, Protocol, runtime_checkable


# ---------------------------------------------------------------------------
# Data transfer objects returned by the knowledge provider
# ---------------------------------------------------------------------------

class TheoremRecord:
    """
    Represents a single geometry theorem retrieved from the knowledge base.

    All fields are typed str so that the provider can be backed by any
    storage medium (JSON, PostgreSQL, REST) without conversion overhead.

    IMPORTANT: These theorem statements are illustrative samples used during
    development.  They must be verified against authoritative curriculum
    sources (e.g., the NIE Grade 10/11 Mathematics syllabus) before
    production use.  Do not claim mathematical correctness beyond what is
    established in the curriculum.
    """

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
    """
    Feedback template data for a specific misconception label.
    Retrieved from the knowledge base and passed to HintGenerator.

    Fallback template fields (``*_fallback``) are used by HintGenerator when
    no TheoremRecord is available.  They are stored as proper slots rather than
    dynamic attributes so the class works correctly with ``__slots__``.
    """

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


# ---------------------------------------------------------------------------
# Protocol interface
# ---------------------------------------------------------------------------

@runtime_checkable
class KnowledgeProvider(Protocol):
    """
    Interface that all knowledge providers must satisfy.

    Callers depend only on this Protocol — never on a concrete class.
    This allows LocalKnowledgeProvider to be hot-swapped with
    Member1KnowledgeProvider (future REST/DB adapter) without touching
    FeedbackService.

    Integration note for Member 1:
        Implement this Protocol in a new file, e.g.
        `repositories/member1_knowledge_provider.py`, and update the
        provider factory in `core/config.py` to instantiate it.
        No other files need to change.
    """

    def get_theorem(self, theorem_id: str) -> Optional[TheoremRecord]:
        """
        Retrieve a theorem record by its unique identifier.

        Returns None if the theorem_id is not found — callers must handle
        the None case gracefully (fallback feedback, no invented theorem).
        """
        ...

    def get_feedback_guidance(self, label: str) -> Optional[FeedbackGuidance]:
        """
        Retrieve the feedback template data for a given misconception label.

        Returns None if the label has no associated guidance — callers
        must handle this case without crashing.
        """
        ...

    @property
    def provider_name(self) -> str:
        """Human-readable name of the backing provider (used in /health)."""
        ...
