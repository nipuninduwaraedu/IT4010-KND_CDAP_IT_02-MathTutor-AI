# Health check endpoint for monitoring and integration.


from __future__ import annotations

import logging

from fastapi import APIRouter, Request

from app.core import config
from app.schemas.feedback import HealthResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description=(
        "Returns the operational status of the Feedback Engine and the name "
        "of the active knowledge provider.  Used by integration partners and "
        "monitoring tools to verify the service is running."
    ),
)
async def health_check(request: Request) -> HealthResponse:
    """Return service health status."""
    # Retrieve the provider name from app state (set at startup in main.py)
    provider_name: str = getattr(
        request.app.state, "knowledge_provider_name", "unknown"
    )
    return HealthResponse(
        status="ok",
        component="feedback_engine",
        version=config.APP_VERSION,
        knowledge_provider=provider_name,
    )
