# Error handling, edge cases, and safety rules (tests 8–14).


from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.schemas.feedback import FeedbackRequest, FeedbackStatus, MisconceptionLabel
from app.services.feedback_service import FeedbackService


# Test 8: Invalid misconception labels (via API)


class TestInvalidLabel:
    """Test 8: Invalid misconception labels."""

    def test_invalid_label_returns_422(self, client: TestClient) -> None:
        """An unrecognised label must return HTTP 422, not 500."""
        payload = {
            "reasoning_steps": ["Angle ABC = 70 degrees"],
            "predicted_label": "This Is Not A Valid Label",
            "confidence": 0.85,
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 422

    def test_invalid_label_error_detail_present(self, client: TestClient) -> None:
        """The 422 response must include a detail field."""
        payload = {
            "reasoning_steps": ["Step 1"],
            "predicted_label": "Completely Wrong Label XYZ",
        }
        response = client.post("/feedback", json=payload)
        data = response.json()
        assert "detail" in data


# Test 9: Empty or malformed reasoning steps (via API)


class TestMalformedReasoningSteps:
    """Test 9: Empty or malformed reasoning steps."""

    def test_empty_list_returns_422(self, client: TestClient) -> None:
        """An empty reasoning_steps list must return HTTP 422."""
        payload = {
            "reasoning_steps": [],
            "predicted_label": "Incorrect Angle Relationships",
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 422

    def test_all_blank_steps_returns_422(self, client: TestClient) -> None:
        """A list of only whitespace strings must return HTTP 422."""
        payload = {
            "reasoning_steps": ["   ", "\t", ""],
            "predicted_label": "Incorrect Angle Relationships",
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 422

    def test_missing_reasoning_steps_field_returns_422(
        self, client: TestClient
    ) -> None:
        """Omitting reasoning_steps entirely must return HTTP 422."""
        payload = {"predicted_label": "Correct Reasoning"}
        response = client.post("/feedback", json=payload)
        assert response.status_code == 422

    def test_too_many_steps_returns_422(self, client: TestClient) -> None:
        """More than 20 steps must return HTTP 422."""
        payload = {
            "reasoning_steps": [f"Step {i}" for i in range(21)],
            "predicted_label": "Correct Reasoning",
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 422


# Test 10: Missing knowledge-provider data


class TestMissingProviderData:
    """Test 10: Service behaviour when guidance data is unavailable."""

    def test_missing_guidance_returns_fallback(
        self, service_with_mock: FeedbackService, mock_provider: MagicMock
    ) -> None:
        """If get_feedback_guidance returns None, a fallback response is returned."""
        mock_provider.get_feedback_guidance.return_value = None
        mock_provider.get_theorem.return_value = None

        req = FeedbackRequest(
            reasoning_steps=["Step A", "Step B"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.85,
        )
        result = service_with_mock.generate_feedback(req)

        assert result.status == FeedbackStatus.FALLBACK_FEEDBACK
        assert result.requires_teacher_review is True
        assert len(result.hints) == 3

    def test_missing_theorem_does_not_crash(
        self, service_with_mock: FeedbackService, mock_provider: MagicMock,
        sample_guidance_incorrect_angle,
    ) -> None:
        """If get_theorem returns None, the service uses fallback templates."""
        mock_provider.get_feedback_guidance.return_value = sample_guidance_incorrect_angle
        mock_provider.get_theorem.return_value = None

        req = FeedbackRequest(
            reasoning_steps=["Step A"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.85,
            theorem_id="any_id",
        )
        result = service_with_mock.generate_feedback(req)
        assert len(result.hints) == 3
        assert result.theorem_reference is None


# Test 11: Low-confidence predictions


class TestLowConfidencePredictions:
    """Test 11: Low-confidence predictions trigger cautious feedback."""

    def test_low_confidence_returns_cautious_status(
        self, real_service: FeedbackService
    ) -> None:
        """Confidence below 0.60 must return cautious_feedback status."""
        req = FeedbackRequest(
            reasoning_steps=["Angle ABC = 70 degrees"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.45,  # Below default threshold of 0.60
        )
        result = real_service.generate_feedback(req)
        assert result.status == FeedbackStatus.CAUTIOUS_FEEDBACK

    def test_low_confidence_flags_teacher_review(
        self, real_service: FeedbackService
    ) -> None:
        req = FeedbackRequest(
            reasoning_steps=["Angle ABC = 70 degrees"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.30,
        )
        result = real_service.generate_feedback(req)
        assert result.requires_teacher_review is True

    def test_low_confidence_still_returns_hints(
        self, real_service: FeedbackService
    ) -> None:
        """Even cautious feedback must include 3 valid hints."""
        req = FeedbackRequest(
            reasoning_steps=["Angle ABC = 70 degrees"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.55,
        )
        result = real_service.generate_feedback(req)
        assert len(result.hints) == 3

    def test_confidence_at_threshold_not_flagged(
        self, real_service: FeedbackService
    ) -> None:
        """Confidence exactly at 0.60 must NOT trigger cautious path."""
        req = FeedbackRequest(
            reasoning_steps=["Angle ABC = 70 degrees"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=0.60,
        )
        result = real_service.generate_feedback(req)
        assert result.status != FeedbackStatus.CAUTIOUS_FEEDBACK


# Test 12: Missing confidence values


class TestMissingConfidence:
    """Test 12: Missing confidence values must not trigger cautious feedback."""

    def test_none_confidence_not_treated_as_low(
        self, real_service: FeedbackService
    ) -> None:
        """Absent confidence must NOT default to a fabricated value or trigger cautious path."""
        req = FeedbackRequest(
            reasoning_steps=["Angle ABC = 70 degrees"],
            predicted_label=MisconceptionLabel.INCORRECT_ANGLE_RELATIONSHIPS,
            confidence=None,
        )
        result = real_service.generate_feedback(req)
        # Must not be cautious — confidence is unknown, not low
        assert result.status != FeedbackStatus.CAUTIOUS_FEEDBACK
        # Must not echo a fabricated confidence value
        assert result.confidence_acknowledged is None

    def test_none_confidence_returns_valid_feedback(
        self, real_service: FeedbackService
    ) -> None:
        req = FeedbackRequest(
            reasoning_steps=["Step A", "Step B"],
            predicted_label=MisconceptionLabel.MISSING_PROOF_STEP,
            confidence=None,
        )
        result = real_service.generate_feedback(req)
        assert len(result.hints) == 3


# Test 13: Service exceptions return 503


class TestServiceExceptions:
    """Test 13: Unexpected service exceptions return HTTP 503."""

    def test_service_exception_returns_503(self, client: TestClient) -> None:
        """Unexpected service errors must return 503, not an unhandled 500."""
        # Inject a broken service into the app state
        broken_service = MagicMock()
        broken_service.generate_feedback.side_effect = RuntimeError(
            "Simulated unexpected internal failure"
        )

        original_service = client.app.state.feedback_service
        client.app.state.feedback_service = broken_service

        try:
            payload = {
                "reasoning_steps": ["Step 1"],
                "predicted_label": "Correct Reasoning",
                "confidence": 0.90,
            }
            response = client.post("/feedback", json=payload)
            assert response.status_code == 503
        finally:
            # Restore original service to avoid polluting other tests
            client.app.state.feedback_service = original_service

    def test_503_response_has_detail(self, client: TestClient) -> None:
        broken_service = MagicMock()
        broken_service.generate_feedback.side_effect = Exception("boom")
        original = client.app.state.feedback_service
        client.app.state.feedback_service = broken_service
        try:
            payload = {
                "reasoning_steps": ["Step 1"],
                "predicted_label": "Correct Reasoning",
            }
            response = client.post("/feedback", json=payload)
            assert "detail" in response.json()
        finally:
            client.app.state.feedback_service = original


# Test 14: Feedback response schema validation (via API)


class TestFeedbackResponseSchema:
    """Test 14: Full POST /feedback response must conform to the schema."""

    def test_full_response_schema_correct_reasoning(
        self, client: TestClient
    ) -> None:
        """SYNTHETIC: A valid Correct Reasoning request must return a complete response."""
        payload = {
            "reasoning_steps": [
                "Angles in the same segment are equal.",
                "Therefore angle APB = angle AQB.",
            ],
            "predicted_label": "Correct Reasoning",
            "confidence": 0.91,
            "theorem_id": "angles_same_segment",
            "question_id": "synthetic_schema_test_01",
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Required top-level fields
        assert "status" in data
        assert "misconception_label" in data
        assert "feedback_summary" in data
        assert "hints" in data
        assert "reveal_final_answer" in data
        assert "requires_teacher_review" in data

        # Hints shape
        assert len(data["hints"]) == 3
        for hint in data["hints"]:
            assert "level" in hint
            assert "title" in hint
            assert "message" in hint

        # Safety invariants
        assert data["reveal_final_answer"] is False

    def test_full_response_schema_incorrect_angle(
        self, client: TestClient
    ) -> None:
        """SYNTHETIC: Incorrect Angle Relationships end-to-end schema test."""
        payload = {
            "reasoning_steps": [
                "Angle ABC is 70 degrees.",
                "Angle ADC is 70 degrees because they are opposite angles.",
            ],
            "predicted_label": "Incorrect Angle Relationships",
            "confidence": 0.94,
            "theorem_id": "cyclic_opposite_angles",
            "question_id": "synthetic_schema_test_02",
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["misconception_label"] == "Incorrect Angle Relationships"
        assert data["theorem_reference"] == "cyclic_opposite_angles"
        assert len(data["hints"]) == 3

    def test_confidence_echoed_in_response(self, client: TestClient) -> None:
        """confidence_acknowledged must match the submitted confidence."""
        payload = {
            "reasoning_steps": ["Step 1"],
            "predicted_label": "Missing Proof Step",
            "confidence": 0.77,
        }
        response = client.post("/feedback", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert abs(data["confidence_acknowledged"] - 0.77) < 0.001
