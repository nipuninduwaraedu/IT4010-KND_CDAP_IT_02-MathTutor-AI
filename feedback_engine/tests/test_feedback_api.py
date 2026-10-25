"""
Tests: Health endpoint and supported labels endpoint.

Test IDs 1–2 from the testing requirements.
All test cases are SYNTHETIC.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test 1: Health endpoint."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """GET /health must return HTTP 200."""
        response = client.get("/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_health_response_shape(self, client: TestClient) -> None:
        """Response must contain status, component, version, knowledge_provider."""
        data = client.get("/health").json()
        assert data["status"] == "ok"
        assert data["component"] == "feedback_engine"
        assert "version" in data
        assert "knowledge_provider" in data

    def test_health_knowledge_provider_field(self, client: TestClient) -> None:
        """knowledge_provider must be a non-empty string."""
        data = client.get("/health").json()
        assert isinstance(data["knowledge_provider"], str)
        assert len(data["knowledge_provider"]) > 0


class TestLabelsEndpoint:
    """Test 2: Supported misconception labels."""

    def test_labels_returns_200(self, client: TestClient) -> None:
        """GET /feedback/labels must return HTTP 200."""
        response = client.get("/feedback/labels")
        assert response.status_code == 200

    def test_exactly_four_labels(self, client: TestClient) -> None:
        """Exactly four misconception labels must be returned."""
        data = client.get("/feedback/labels").json()
        assert len(data["labels"]) == 4

    def test_all_required_labels_present(self, client: TestClient) -> None:
        """All four canonical label strings must be present."""
        data = client.get("/feedback/labels").json()
        returned = {item["label"] for item in data["labels"]}
        expected = {
            "Correct Reasoning",
            "Incorrect Theorem Application",
            "Incorrect Angle Relationships",
            "Missing Proof Step",
        }
        assert returned == expected

    def test_each_label_has_description(self, client: TestClient) -> None:
        """Every label entry must have a non-empty description string."""
        data = client.get("/feedback/labels").json()
        for item in data["labels"]:
            assert "description" in item
            assert isinstance(item["description"], str)
            assert len(item["description"].strip()) > 0
