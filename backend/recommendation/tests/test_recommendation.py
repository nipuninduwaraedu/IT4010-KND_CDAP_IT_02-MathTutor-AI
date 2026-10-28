from recommendation.services.resource_loader import load_resources
from recommendation.services.matcher import match_resources
from recommendation.services.ranker import rank_resources
from recommendation.services.recommender import get_top_resources
from recommendation.services.fallback import is_low_confidence, topic_fallback
from recommendation.services.reason_generator import generate_reason


def test_loader_returns_resources():
    assert len(load_resources()) == 8


def test_matcher_filters_by_misconception():
    res = match_resources(load_resources(), "missing_proof_step", "triangles")
    assert res
    assert all("missing_proof_step" in r.misconceptions for r in res)


def test_ranker_puts_requested_concept_first():
    matched = match_resources(load_resources(), "incorrect_theorem_application", "circle_theorems")
    ranked = rank_resources(matched, "incorrect_theorem_application", "circle_theorems")
    assert ranked[0].concept == "circle_theorems"


def test_top_resources_limit():
    res = get_top_resources("incorrect_theorem_application", "circle_theorems")
    assert len(res) <= 3


def test_low_confidence_detection():
    assert is_low_confidence(0.3)
    assert not is_low_confidence(0.9)


def test_fallback_returns_topic_resources():
    res = topic_fallback("angles")
    assert res and all(r.concept == "angles" for r in res)


def test_reason_is_not_empty():
    r = get_top_resources("missing_proof_step", "triangles")[0]
    assert "Recommended because" in generate_reason(r, "missing_proof_step")