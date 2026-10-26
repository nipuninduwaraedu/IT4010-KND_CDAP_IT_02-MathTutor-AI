# Unit tests for hint generation.


from __future__ import annotations

import pytest

from app.repositories.knowledge_provider import FeedbackGuidance, TheoremRecord
from app.services.hint_generator import (
    generate_feedback_summary,
    generate_hints,
    generate_remedial_guidance,
)


@pytest.fixture()
def guidance() -> FeedbackGuidance:
    """SYNTHETIC FeedbackGuidance fixture."""
    return FeedbackGuidance(
        label="Incorrect Angle Relationships",
        description="Wrong angle relationship used.",
        feedback_summary_template="Review {theorem_name} for this configuration.",
        feedback_summary_template_fallback="Review the angle relationship.",
        hint_1_template="Are these angles equal or supplementary?",
        hint_1_template_fallback="Are these angles equal or supplementary?",
        hint_2_template="The theorem: '{theorem_statement}'.",
        hint_2_template_fallback="Check the relevant property.",
        hint_3_template="Apply the rule to find the unknown angle.",
        hint_3_template_fallback="Apply the correct rule.",
        remedial_topic="Angle Relationships",
        remedial_note_template="Study {topic} examples.",
        teacher_review_message="Teacher review recommended.",
    )


@pytest.fixture()
def theorem() -> TheoremRecord:
    """SYNTHETIC TheoremRecord fixture."""
    return TheoremRecord(
        theorem_id="cyclic_opposite_angles",
        name="Opposite Angles Theorem",
        statement="Opposite angles sum to 180 degrees.",
        conditions="Quadrilateral inscribed in a circle.",
        grade_level="Grade 10",
        topic="Cyclic Quadrilaterals",
    )


class TestGenerateHints:
    """Unit tests for generate_hints()."""

    def test_returns_exactly_three_hints(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        hints = generate_hints(guidance, theorem)
        assert len(hints) == 3

    def test_hint_levels_are_1_2_3(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        hints = generate_hints(guidance, theorem)
        assert [h.level for h in hints] == [1, 2, 3]

    def test_theorem_name_substituted(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        """Template variable {theorem_statement} must be filled in."""
        hints = generate_hints(guidance, theorem)
        # Level 2 uses hint_2_template which contains '{theorem_statement}'
        assert "Opposite angles sum to 180 degrees." in hints[1].message

    def test_fallback_used_when_no_theorem(self, guidance: FeedbackGuidance) -> None:
        """Fallback templates must be used when theorem is None."""
        hints = generate_hints(guidance, theorem=None)
        assert len(hints) == 3
        for hint in hints:
            assert hint.message.strip() != ""

    def test_all_hint_messages_non_empty(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        hints = generate_hints(guidance, theorem)
        for hint in hints:
            assert hint.message.strip() != ""

    def test_all_hint_titles_non_empty(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        hints = generate_hints(guidance, theorem)
        for hint in hints:
            assert hint.title.strip() != ""


class TestGenerateFeedbackSummary:
    """Unit tests for generate_feedback_summary()."""

    def test_summary_with_theorem_fills_template(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        summary = generate_feedback_summary(guidance, theorem)
        assert "Opposite Angles Theorem" in summary

    def test_summary_without_theorem_uses_fallback(
        self, guidance: FeedbackGuidance
    ) -> None:
        summary = generate_feedback_summary(guidance, theorem=None)
        assert summary.strip() != ""
        # Should use fallback, not the template with {theorem_name} placeholder
        assert "{theorem_name}" not in summary


class TestGenerateRemedialGuidance:
    """Unit tests for generate_remedial_guidance()."""

    def test_remedial_topic_preserved(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        remedial = generate_remedial_guidance(guidance, theorem)
        assert remedial.topic == "Angle Relationships"

    def test_remedial_note_non_empty(
        self, guidance: FeedbackGuidance, theorem: TheoremRecord
    ) -> None:
        remedial = generate_remedial_guidance(guidance, theorem)
        assert remedial.recommendation_note.strip() != ""

    def test_remedial_no_theorem(self, guidance: FeedbackGuidance) -> None:
        remedial = generate_remedial_guidance(guidance, theorem=None)
        assert remedial.topic == "Angle Relationships"
        assert remedial.recommendation_note.strip() != ""
