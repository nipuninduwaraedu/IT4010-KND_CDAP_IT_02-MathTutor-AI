# Unit tests for FeedbackService.


from __future__ import annotations

import pytest

from app.schemas.feedback import FeedbackResponse, FeedbackStatus, MisconceptionLabel
from app.services.feedback_service import FeedbackService


# Helpers


def _make_request(
    label: str,
    confidence: float | None = 0.90,
    theorem_id: str | None = None,
    steps: list[str] | None = None,
):
    """Build a minimal FeedbackRequest for testing. SYNTHETIC data."""
    from app.schemas.feedback import FeedbackRequest

    return FeedbackRequest(
        reasoning_steps=steps or ["Angle ABC = 70 degrees", "Angle ADC = 70 degrees"],
        predicted_label=MisconceptionLabel(label),
        confidence=confidence,
        theorem_id=theorem_id,
        question_id="synthetic_test_q01",
    )


def _assert_valid_response(response: FeedbackResponse) -> None:
    """Assert structural validity of any FeedbackResponse."""
    assert response.misconception_label is not None
    assert response.feedback_summary.strip() != ""
    assert len(response.hints) == 3
    assert response.hints[0].level == 1
    assert response.hints[1].level == 2
    assert response.hints[2].level == 3
    for hint in response.hints:
        assert hint.message.strip() != ""
    assert response.reveal_final_answer is False


# Test 3: Correct Reasoning


class TestCorrectReasoning:
    """Test 3: Correct Reasoning feedback."""

    def test_correct_reasoning_status(self, real_service: FeedbackService) -> None:
        req = _make_request("Correct Reasoning", confidence=0.95)
        result = real_service.generate_feedback(req)
        assert result.status == FeedbackStatus.CORRECT_REASONING

    def test_correct_reasoning_no_teacher_review(self, real_service: FeedbackService) -> None:
        """High-confidence Correct Reasoning must not flag teacher review."""
        req = _make_request("Correct Reasoning", confidence=0.95)
        result = real_service.generate_feedback(req)
        assert result.requires_teacher_review is False

    def test_correct_reasoning_valid_structure(self, real_service: FeedbackService) -> None:
        req = _make_request("Correct Reasoning", confidence=0.95)
        result = real_service.generate_feedback(req)
        _assert_valid_response(result)

    def test_correct_reasoning_label_echoed(self, real_service: FeedbackService) -> None:
        req = _make_request("Correct Reasoning", confidence=0.95)
        result = real_service.generate_feedback(req)
        assert result.misconception_label == "Correct Reasoning"


# Test 4: Incorrect Theorem Application


class TestIncorrectTheoremApplication:
    """Test 4: Incorrect Theorem Application feedback."""

    def test_incorrect_theorem_status(self, real_service: FeedbackService) -> None:
        req = _make_request(
            "Incorrect Theorem Application",
            confidence=0.88,
            theorem_id="cyclic_opposite_angles",
        )
        result = real_service.generate_feedback(req)
        assert result.status in (
            FeedbackStatus.FEEDBACK_GENERATED,
            FeedbackStatus.FALLBACK_FEEDBACK,
        )

    def test_incorrect_theorem_valid_structure(self, real_service: FeedbackService) -> None:
        req = _make_request("Incorrect Theorem Application", confidence=0.88)
        result = real_service.generate_feedback(req)
        _assert_valid_response(result)

    def test_known_theorem_id_sets_reference(self, real_service: FeedbackService) -> None:
        """When a valid theorem_id is provided, theorem_reference must be set."""
        req = _make_request(
            "Incorrect Theorem Application",
            confidence=0.88,
            theorem_id="cyclic_opposite_angles",
        )
        result = real_service.generate_feedback(req)
        assert result.theorem_reference == "cyclic_opposite_angles"

    def test_unknown_theorem_id_sets_fallback_status(
        self, real_service: FeedbackService
    ) -> None:
        """Test 7: Unknown theorem ID must return fallback feedback, not crash."""
        req = _make_request(
            "Incorrect Theorem Application",
            confidence=0.88,
            theorem_id="theorem_that_does_not_exist_xyz",
        )
        result = real_service.generate_feedback(req)
        assert result.status == FeedbackStatus.FALLBACK_FEEDBACK
        assert result.theorem_reference is None
        _assert_valid_response(result)


# Test 5: Incorrect Angle Relationships


class TestIncorrectAngleRelationships:
    """Test 5: Incorrect Angle Relationships feedback."""

    def test_incorrect_angle_status(self, real_service: FeedbackService) -> None:
        req = _make_request(
            "Incorrect Angle Relationships",
            confidence=0.94,
            theorem_id="cyclic_opposite_angles",
        )
        result = real_service.generate_feedback(req)
        assert result.status in (
            FeedbackStatus.FEEDBACK_GENERATED,
            FeedbackStatus.FALLBACK_FEEDBACK,
        )

    def test_incorrect_angle_valid_structure(self, real_service: FeedbackService) -> None:
        req = _make_request("Incorrect Angle Relationships", confidence=0.94)
        result = real_service.generate_feedback(req)
        _assert_valid_response(result)

    def test_incorrect_angle_does_not_reveal_answer(
        self, real_service: FeedbackService
    ) -> None:
        """Engine must never set reveal_final_answer to True."""
        req = _make_request("Incorrect Angle Relationships", confidence=0.94)
        result = real_service.generate_feedback(req)
        assert result.reveal_final_answer is False

    def test_incorrect_angle_confidence_echoed(
        self, real_service: FeedbackService
    ) -> None:
        req = _make_request("Incorrect Angle Relationships", confidence=0.94)
        result = real_service.generate_feedback(req)
        assert result.confidence_acknowledged == pytest.approx(0.94)


# Test 6: Missing Proof Step


class TestMissingProofStep:
    """Test 6: Missing Proof Step feedback."""

    def test_missing_step_status(self, real_service: FeedbackService) -> None:
        req = _make_request("Missing Proof Step", confidence=0.79)
        result = real_service.generate_feedback(req)
        assert result.status in (
            FeedbackStatus.FEEDBACK_GENERATED,
            FeedbackStatus.FALLBACK_FEEDBACK,
        )

    def test_missing_step_valid_structure(self, real_service: FeedbackService) -> None:
        req = _make_request("Missing Proof Step", confidence=0.79)
        result = real_service.generate_feedback(req)
        _assert_valid_response(result)

    def test_missing_step_remedial_guidance_present(
        self, real_service: FeedbackService
    ) -> None:
        """Remedial guidance should be present for Missing Proof Step."""
        req = _make_request("Missing Proof Step", confidence=0.79)
        result = real_service.generate_feedback(req)
        assert result.remedial_guidance is not None
        assert result.remedial_guidance.topic.strip() != ""
