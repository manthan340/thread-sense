from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app import logger, setup_logging
from app.config import get_settings
from app.extractor import ClothingExtractor
from app.matcher import OutfitMatcher
from app.routes import router
from app.store import WardrobeStore


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging("DEBUG" if settings.environment.lower().startswith("dev") else "INFO")
    logger.info("Starting Thread Sense AI Engine (%s)", settings.environment)

    app = FastAPI(title="Thread Sense AI Engine", version="0.1.0")

    app.state.settings = settings
    app.state.extractor = ClothingExtractor(settings)
    app.state.matcher = OutfitMatcher(settings)
    app.state.store = WardrobeStore(settings)
    logger.info("OpenAI + Qdrant clients initialized")

    @app.exception_handler(RequestValidationError)
    async def invalid_body_handler(
        _request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={"detail": "Invalid Body", "errors": exc.errors()},
        )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(router)
    return app


app = create_app()
