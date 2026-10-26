"""
FeedbackService — the central orchestrator for Member 3's component.

Responsibility:
    Given a validated FeedbackRequest, produce a FeedbackResponse by:
    1. Resolving the misconception label.
    2. Retrieving the matching feedback guidance from the knowledge provider.
    3. Optionally retrieving a theorem record if theorem_id is present.
    4. Applying confidence-threshold safety rules.
    5. Delegating hint and summary generation to HintGenerator.
    6. Assembling and returning the structured FeedbackResponse.

This class depends only on the KnowledgeProvider Protocol, not on any
concrete provider implementation.  Dependency injection (via the FastAPI
app state) allows the provider to be swapped at startup.

Safety rules enforced here:
    - Predictions below LOW_CONFIDENCE_THRESHOLD trigger cautious feedback.
    - Missing theorem records trigger safe fallback feedback.
    - No student reasoning steps are logged.
    - No invented theorems or confidence scores.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.core import config
from app.repositories.knowledge_provider import (
    FeedbackGuidance,
    KnowledgeProvider,
    TheoremRecord,
)
from app.schemas.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    FeedbackStatus,
    HintItem,
    MisconceptionLabel,
)
from app.services import hint_generator
from app.services.misconception_mapper import resolve_label

logger = logging.getLogger(__name__)


class FeedbackService:
    """
    Orchestrates feedback generation for a single student proof submission.

    Injected with a KnowledgeProvider at construction; all public methods
    are stateless with respect to student data.
    """

    def __init__(self, knowledge_provider: KnowledgeProvider) -> None:
        self._kp = knowledge_provider

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_feedback(self, request: FeedbackRequest) -> FeedbackResponse:
        """
        Main entry point.  Produces a FeedbackResponse from the request.

        Never raises an unhandled exception — all error paths return a
        structured FeedbackResponse with an appropriate status.
        """
        label = request.predicted_label
        confidence = request.confidence
        theorem_id = request.theorem_id

        logger.info(
            "Generating feedback | label='%s' | confidence=%s | theorem_id=%s | question_id=%s",
            label.value,
            confidence if confidence is not None else "not provided",
            theorem_id or "not provided",
            request.question_id or "not provided",
            # NOTE: reasoning_steps are intentionally NOT logged (privacy rule)
        )

        # ── Step 1: Retrieve feedback guidance ──────────────────────────
        guidance = self._kp.get_feedback_guidance(label.value)
        if guidance is None:
            logger.error(
                "No feedback guidance found for label '%s'. Returning fallback response.",
                label.value,
            )
            return self._generic_fallback_response(label, confidence)

        # ── Step 2: Retrieve theorem record (optional) ───────────────────
        theorem: Optional[TheoremRecord] = None
        theorem_used: Optional[str] = None
        if theorem_id:
            theorem = self._kp.get_theorem(theorem_id)
            if theorem is not None:
                theorem_used = theorem.theorem_id
            else:
                logger.info(
                    "theorem_id '%s' not found in knowledge base; using fallback templates.",
                    theorem_id,
                )

        # ── Step 3: Confidence safety check ─────────────────────────────
        is_low_confidence = self._is_low_confidence(confidence)
        requires_review = is_low_confidence

        if is_low_confidence:
            logger.info(
                "Low-confidence prediction (%.2f < %.2f threshold). "
                "Returning cautious feedback with teacher-review flag.",
                confidence,
                config.LOW_CONFIDENCE_THRESHOLD,
            )
            return self._cautious_feedback_response(
                label=label,
                guidance=guidance,
                theorem=theorem,
                theorem_used=theorem_used,
                confidence=confidence,
            )

        # ── Step 4: Correct Reasoning path ──────────────────────────────
        if label == MisconceptionLabel.CORRECT_REASONING:
            return self._correct_reasoning_response(
                guidance=guidance,
                theorem=theorem,
                theorem_used=theorem_used,
                confidence=confidence,
            )

        # ── Step 5: Standard misconception path ─────────────────────────
        return self._standard_feedback_response(
            label=label,
            guidance=guidance,
            theorem=theorem,
            theorem_used=theorem_used,
            confidence=confidence,
            requires_review=requires_review,
            theorem_id_was_requested=theorem_id is not None,
        )

    # ------------------------------------------------------------------
    # Private response builders
    # ------------------------------------------------------------------

    def _correct_reasoning_response(
        self,
        guidance: FeedbackGuidance,
        theorem: Optional[TheoremRecord],
        theorem_used: Optional[str],
        confidence: Optional[float],
    ) -> FeedbackResponse:
        """Affirming response for Correct Reasoning.  No misconception invented."""
        hints = hint_generator.generate_hints(guidance, theorem)
        summary = hint_generator.generate_feedback_summary(guidance, theorem)
        remedial = hint_generator.generate_remedial_guidance(guidance, theorem)
        return FeedbackResponse(
            status=FeedbackStatus.CORRECT_REASONING,
            misconception_label=MisconceptionLabel.CORRECT_REASONING.value,
            theorem_reference=theorem_used,
            feedback_summary=summary,
            hints=hints,
            reveal_final_answer=False,
            requires_teacher_review=False,
            remedial_guidance=remedial,
            confidence_acknowledged=confidence,
        )

    def _standard_feedback_response(
        self,
        label: MisconceptionLabel,
        guidance: FeedbackGuidance,
        theorem: Optional[TheoremRecord],
        theorem_used: Optional[str],
        confidence: Optional[float],
        requires_review: bool,
        theorem_id_was_requested: bool = False,
    ) -> FeedbackResponse:
        """Standard feedback for the three misconception labels."""
        # Only use FALLBACK_FEEDBACK when a theorem_id was explicitly requested
        # but could not be found in the knowledge base.  If no theorem_id was
        # provided at all, the primary templates are used and the status is
        # FEEDBACK_GENERATED (not a fallback — the caller simply did not
        # request theorem enrichment).
        status = (
            FeedbackStatus.FALLBACK_FEEDBACK
            if theorem_id_was_requested and theorem is None
            else FeedbackStatus.FEEDBACK_GENERATED
        )
        hints = hint_generator.generate_hints(guidance, theorem)
        summary = hint_generator.generate_feedback_summary(guidance, theorem)
        remedial = hint_generator.generate_remedial_guidance(guidance, theorem)
        return FeedbackResponse(
            status=status,
            misconception_label=label.value,
            theorem_reference=theorem_used,
            feedback_summary=summary,
            hints=hints,
            reveal_final_answer=False,
            requires_teacher_review=requires_review,
            remedial_guidance=remedial,
            confidence_acknowledged=confidence,
        )

    def _cautious_feedback_response(
        self,
        label: MisconceptionLabel,
        guidance: FeedbackGuidance,
        theorem: Optional[TheoremRecord],
        theorem_used: Optional[str],
        confidence: Optional[float],
    ) -> FeedbackResponse:
        """
        Low-confidence path.  Returns hints and summary but marks the response
        as cautious and flags it for teacher review.
        """
        hints = hint_generator.generate_hints(guidance, theorem)
        summary = hint_generator.generate_feedback_summary(guidance, theorem)
        remedial = hint_generator.generate_remedial_guidance(guidance, theorem)
        return FeedbackResponse(
            status=FeedbackStatus.CAUTIOUS_FEEDBACK,
            misconception_label=label.value,
            theorem_reference=theorem_used,
            feedback_summary=(
                f"[Low confidence prediction] {summary}"
            ),
            hints=hints,
            reveal_final_answer=False,
            requires_teacher_review=True,
            remedial_guidance=remedial,
            confidence_acknowledged=confidence,
        )

    def _generic_fallback_response(
        self,
        label: MisconceptionLabel,
        confidence: Optional[float],
    ) -> FeedbackResponse:
        """
        Last-resort response when guidance data is completely unavailable.
        Returns a safe prompt to review the relevant geometry section.
        """
        return FeedbackResponse(
            status=FeedbackStatus.FALLBACK_FEEDBACK,
            misconception_label=label.value,
            theorem_reference=None,
            feedback_summary=(
                "Please review the relevant geometry theorems for this type of problem."
            ),
            hints=[
                HintItem(
                    level=1,
                    title="Review your reasoning",
                    message="Read through your proof steps carefully. Is each conclusion supported by a named theorem?",
                ),
                HintItem(
                    level=2,
                    title="Check the theorem",
                    message="Identify which geometry theorem applies to this configuration and verify its conditions.",
                ),
                HintItem(
                    level=3,
                    title="Reconnect the steps",
                    message="Write the missing or incorrect step explicitly, naming the theorem or property that justifies it.",
                ),
            ],
            reveal_final_answer=False,
            requires_teacher_review=True,
            remedial_guidance=None,
            confidence_acknowledged=confidence,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _is_low_confidence(confidence: Optional[float]) -> bool:
        """
        Return True only when confidence is provided AND below the threshold.
        If confidence is None (not provided), we cannot determine it is low
        — we do NOT fabricate a default.
        """
        if confidence is None:
            return False
        return confidence < config.LOW_CONFIDENCE_THRESHOLD
