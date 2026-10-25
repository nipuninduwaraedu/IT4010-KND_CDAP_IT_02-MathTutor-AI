"""
Application configuration loaded from environment variables.

Environment variables are read once at import time.  In production (or when
testing with non-default settings) create a `.env` file and load it with
python-dotenv, or set the variables directly in the shell before starting
uvicorn.

All paths are derived relative to this file's location to avoid hard-coded
absolute paths — the project can be checked out in any directory.
"""

from __future__ import annotations

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Project root paths
# ---------------------------------------------------------------------------

# feedback_engine/app/core/config.py  →  3 parents up  →  feedback_engine/
_APP_DIR: Path = Path(__file__).resolve().parent.parent
_PROJECT_DIR: Path = _APP_DIR.parent

DATA_DIR: Path = _APP_DIR / "data"
TEMPLATES_DIR: Path = _APP_DIR / "templates"

# ---------------------------------------------------------------------------
# Application identity
# ---------------------------------------------------------------------------

APP_TITLE: str = os.getenv("APP_TITLE", "Feedback and Explanation Engine")
APP_DESCRIPTION: str = (
    "Member 3 component of the SLIIT IT4010 Research Project. "
    "Generates personalised, scaffolded feedback for O/L Mathematics geometry proofs."
)
APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

# ---------------------------------------------------------------------------
# Server settings
# ---------------------------------------------------------------------------

HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8001"))

# ---------------------------------------------------------------------------
# Safety thresholds
# ---------------------------------------------------------------------------

# Predictions below this confidence are treated as low-confidence and will
# trigger cautious feedback and the teacher-review flag.
# Configurable so the research team can adjust without code changes.
LOW_CONFIDENCE_THRESHOLD: float = float(
    os.getenv("LOW_CONFIDENCE_THRESHOLD", "0.60")
)

# ---------------------------------------------------------------------------
# Knowledge provider
# ---------------------------------------------------------------------------

# "local_json"  → LocalKnowledgeProvider (default, no network needed)
# "member1_api" → Member1KnowledgeProvider (future, requires Member 1's service)
KNOWLEDGE_PROVIDER: str = os.getenv("KNOWLEDGE_PROVIDER", "local_json")

# Used when KNOWLEDGE_PROVIDER == "member1_api" (placeholder — do not assume
# Member 1's actual base URL until that integration is confirmed).
MEMBER1_API_BASE_URL: str = os.getenv("MEMBER1_API_BASE_URL", "http://localhost:8000")

# ---------------------------------------------------------------------------
# Data file paths (used by LocalKnowledgeProvider)
# ---------------------------------------------------------------------------

GEOMETRY_RULES_PATH: Path = DATA_DIR / "sample_geometry_rules.json"
FEEDBACK_TEMPLATES_PATH: Path = TEMPLATES_DIR / "feedback_templates.json"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
