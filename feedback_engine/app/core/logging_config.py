# Logging setup; never log student reasoning content at INFO+.


from __future__ import annotations

import logging
import sys
from app.core import config


def configure_logging() -> None:
    """
    Configure the root logger for the application.
    Call this once at application startup (inside `app/main.py`).
    """
    log_level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
        force=True,
    )

    # Quieten noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

    logging.getLogger(__name__).info(
        "Logging configured at level %s", config.LOG_LEVEL.upper()
    )
