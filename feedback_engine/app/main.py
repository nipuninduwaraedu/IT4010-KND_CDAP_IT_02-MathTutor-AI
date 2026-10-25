"""
FastAPI application factory for the Feedback and Explanation Engine.

Startup sequence:
    1. Configure structured logging.
    2. Instantiate the knowledge provider based on the KNOWLEDGE_PROVIDER env var.
    3. Instantiate FeedbackService with the provider (dependency injection).
    4. Store both on app.state so routes can access them via Request.
    5. Register API routers.

This module is the only place that knows which concrete KnowledgeProvider
is used at runtime.  All other modules depend only on the Protocol.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.routes import feedback, health
from app.core import config
from app.core.logging_config import configure_logging
from app.repositories.local_knowledge_provider import LocalKnowledgeProvider
from app.services.feedback_service import FeedbackService

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    Runs startup logic before yielding, then teardown on shutdown.
    """
    configure_logging()
    logger.info("Starting Feedback Engine v%s ...", config.APP_VERSION)

    # ── Knowledge provider factory ────────────────────────────────────────
    provider_name = config.KNOWLEDGE_PROVIDER
    if provider_name == "local_json":
        provider = LocalKnowledgeProvider(
            geometry_rules_path=config.GEOMETRY_RULES_PATH,
            feedback_templates_path=config.FEEDBACK_TEMPLATES_PATH,
        )
    else:
        # Future: instantiate Member1KnowledgeProvider here.
        # For now, fall back to local provider with a warning.
        logger.warning(
            "KNOWLEDGE_PROVIDER='%s' is not implemented. Falling back to 'local_json'.",
            provider_name,
        )
        provider = LocalKnowledgeProvider(
            geometry_rules_path=config.GEOMETRY_RULES_PATH,
            feedback_templates_path=config.FEEDBACK_TEMPLATES_PATH,
        )
        provider_name = "local_json (fallback)"

    # Store on app state for access in route handlers
    app.state.knowledge_provider = provider
    app.state.knowledge_provider_name = provider_name
    app.state.feedback_service = FeedbackService(knowledge_provider=provider)

    logger.info("Knowledge provider: %s", provider_name)
    logger.info("Feedback Engine ready.  Listening on port %d.", config.PORT)

    yield

    # Teardown (currently nothing to clean up)
    logger.info("Feedback Engine shutting down.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=config.APP_TITLE,
        description=config.APP_DESCRIPTION,
        version=config.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ─────────────────────────────────────────────────────────────
    # Allow the Next.js frontend (Member 4) to call this service directly
    # during development.  Tighten these origins for production deployment.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    # ── Custom validation-error handler ──────────────────────────────────
    @app.exception_handler(ValidationError)
    async def pydantic_validation_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        """Return a clean 422 for Pydantic validation errors raised outside FastAPI."""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    # ── Routers ──────────────────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(feedback.router)

    return app


# ---------------------------------------------------------------------------
# Application instance (used by uvicorn)
# ---------------------------------------------------------------------------

app = create_app()
