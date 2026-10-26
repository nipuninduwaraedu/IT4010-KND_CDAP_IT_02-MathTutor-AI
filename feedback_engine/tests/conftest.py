# Pytest fixtures; all test data is synthetic.


from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.repositories.knowledge_provider import FeedbackGuidance, TheoremRecord
from app.repositories.local_knowledge_provider import LocalKnowledgeProvider
from app.services.feedback_service import FeedbackService


# Paths to the real data files (used by integration-style tests)


_APP_DIR = Path(__file__).resolve().parent.parent / "app"
GEOMETRY_RULES_PATH = _APP_DIR / "data" / "sample_geometry_rules.json"
FEEDBACK_TEMPLATES_PATH = _APP_DIR / "templates" / "feedback_templates.json"


# Real local provider + service (uses actual JSON files)


@pytest.fixture(scope="session")
def real_provider() -> LocalKnowledgeProvider:
    """A LocalKnowledgeProvider loaded from the actual data files."""
    return LocalKnowledgeProvider(
        geometry_rules_path=GEOMETRY_RULES_PATH,
        feedback_templates_path=FEEDBACK_TEMPLATES_PATH,
    )


@pytest.fixture(scope="session")
def real_service(real_provider: LocalKnowledgeProvider) -> FeedbackService:
    """A FeedbackService backed by the real local provider."""
    return FeedbackService(knowledge_provider=real_provider)


# Mock provider — for isolated unit tests that control provider responses


@pytest.fixture()
def mock_provider() -> MagicMock:
    """A mock KnowledgeProvider that can be configured per-test."""
    mock = MagicMock()
    mock.provider_name = "mock_provider"
    return mock


@pytest.fixture()
def service_with_mock(mock_provider: MagicMock) -> FeedbackService:
    """A FeedbackService backed by the mock provider."""
    return FeedbackService(knowledge_provider=mock_provider)


# FastAPI test client (full app lifecycle, real data files)


@pytest.fixture(scope="session")
def client() -> TestClient:
    """A TestClient for the full FastAPI application."""
    app = create_app()
    with TestClient(app) as c:
        yield c


# Synthetic theorem record (reused across multiple tests)


@pytest.fixture()
def cyclic_theorem() -> TheoremRecord:
    """
    SYNTHETIC theorem record for 'cyclic_opposite_angles'.
    Used for unit tests that need a controlled TheoremRecord.
    """
    return TheoremRecord(
        theorem_id="cyclic_opposite_angles",
        name="Opposite Angles of a Cyclic Quadrilateral",
        statement="The opposite angles of a cyclic quadrilateral sum to 180 degrees.",
        conditions="All four vertices of the quadrilateral must lie on the circle.",
        grade_level="Grade 10",
        topic="Cyclic Quadrilaterals",
    )


@pytest.fixture()
def sample_guidance_incorrect_angle() -> FeedbackGuidance:
    """
    SYNTHETIC FeedbackGuidance for 'Incorrect Angle Relationships'.
    """
    return FeedbackGuidance(
        label="Incorrect Angle Relationships",
        description="Student used wrong angle relationship.",
        feedback_summary_template="Review the angle relationship for {theorem_name}.",
        feedback_summary_template_fallback="Review the angle relationship here.",
        hint_1_template="Are these angles equal or supplementary?",
        hint_1_template_fallback="Are these angles equal or supplementary?",
        hint_2_template="The theorem states: '{theorem_statement}'.",
        hint_2_template_fallback="Check the relevant angle relationship.",
        hint_3_template="Apply the correct rule to find the unknown angle.",
        hint_3_template_fallback="Apply the correct rule.",
        remedial_topic="Angle Relationships in Circles",
        remedial_note_template="Study {topic} examples.",
        teacher_review_message="Teacher review recommended.",
    )
