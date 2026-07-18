"""Thread Sense AI engine."""

import logging
import sys

logger = logging.getLogger("ai-engine")


def setup_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    log_level = getattr(logging, level.upper(), logging.INFO)

    if not root.handlers:
        logging.basicConfig(
            level=log_level,
            format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            stream=sys.stdout,
        )
    else:
        root.setLevel(log_level)
        for handler in root.handlers:
            handler.setLevel(log_level)

    logger.setLevel(log_level)
