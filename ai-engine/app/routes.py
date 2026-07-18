from fastapi import APIRouter, HTTPException, Request
from openai import APIStatusError

from app import logger
from app.extractor import ClothingExtractor
from app.matcher import OutfitMatcher
from app.schemas import (
    FindImageRequest,
    FindResponse,
    FindTextRequest,
    IngestRequest,
    IngestResponse,
)
from app.store import WardrobeStore

router = APIRouter()


def _openai_http_error(model: str, exc: APIStatusError) -> HTTPException:
    return HTTPException(
        status_code=500,
        detail=f"Server Error: OpenAI {exc.status_code} for model '{model}': {exc.message}",
    )


@router.post(
    "/ingest",
    response_model=IngestResponse,
    responses={
        400: {"description": "Invalid Body"},
        500: {"description": "Server Error"},
    },
)
def ingest(body: IngestRequest, request: Request) -> IngestResponse:
    extractor: ClothingExtractor = request.app.state.extractor
    store: WardrobeStore = request.app.state.store

    image_url = str(body.image_url)
    model = request.app.state.settings.openai_model
    logger.info("Ingest started user_id=%s model=%s", body.user_id, model)

    try:
        extraction = extractor.extract(image_url)
    except ValueError as exc:
        logger.warning("Invalid image URL user_id=%s error=%s", body.user_id, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except APIStatusError as exc:
        logger.exception(
            "OpenAI extraction failed model=%s status=%s body=%s",
            model,
            exc.status_code,
            exc.body,
        )
        raise _openai_http_error(model, exc) from exc
    except Exception as exc:
        logger.exception("Extraction failed model=%s", model)
        raise HTTPException(status_code=500, detail=f"Server Error: extraction failed ({exc})") from exc

    vectors: list[list[float]] = []
    try:
        for item in extraction.items:
            vectors.append(extractor.embed(item.match_text or item.description))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Server Error: embedding failed ({exc})") from exc

    try:
        saved = store.save_items(
            user_id=body.user_id,
            image_url=image_url,
            items=extraction.items,
            vectors=vectors,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Server Error: save failed ({exc})") from exc

    return IngestResponse(
        user_id=body.user_id,
        image_url=image_url,
        notes=extraction.notes,
        items=saved,
    )


@router.post(
    "/find/image",
    response_model=FindResponse,
    responses={
        400: {"description": "Invalid Body"},
        500: {"description": "Server Error"},
    },
)
def find_image(body: FindImageRequest, request: Request) -> FindResponse:
    matcher: OutfitMatcher = request.app.state.matcher
    store: WardrobeStore = request.app.state.store
    model = request.app.state.settings.openai_model
    image_url = str(body.image_url)
    logger.info("Find/image started user_id=%s model=%s", body.user_id, model)

    try:
        plan = matcher.plan_from_image(image_url)
    except ValueError as exc:
        logger.warning("Invalid image URL user_id=%s error=%s", body.user_id, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except APIStatusError as exc:
        logger.exception(
            "OpenAI match plan failed model=%s status=%s body=%s",
            model,
            exc.status_code,
            exc.body,
        )
        raise _openai_http_error(model, exc) from exc
    except Exception as exc:
        logger.exception("Find/image planning failed")
        raise HTTPException(status_code=500, detail=f"Server Error: planning failed ({exc})") from exc

    try:
        vector = matcher.embed(plan.match_text or plan.reasoning)
        matches = store.search(user_id=body.user_id, vector=vector, plan=plan)
    except Exception as exc:
        logger.exception("Find/image search failed")
        raise HTTPException(status_code=500, detail=f"Server Error: search failed ({exc})") from exc

    return FindResponse(user_id=body.user_id, reasoning=plan.reasoning, matches=matches)


@router.post(
    "/find/text",
    response_model=FindResponse,
    responses={
        400: {"description": "Invalid Body"},
        500: {"description": "Server Error"},
    },
)
def find_text(body: FindTextRequest, request: Request) -> FindResponse:
    matcher: OutfitMatcher = request.app.state.matcher
    store: WardrobeStore = request.app.state.store
    model = request.app.state.settings.openai_model
    logger.info("Find/text started user_id=%s model=%s", body.user_id, model)

    try:
        plan = matcher.plan_from_text(body.text)
    except APIStatusError as exc:
        logger.exception(
            "OpenAI match plan failed model=%s status=%s body=%s",
            model,
            exc.status_code,
            exc.body,
        )
        raise _openai_http_error(model, exc) from exc
    except Exception as exc:
        logger.exception("Find/text planning failed")
        raise HTTPException(status_code=500, detail=f"Server Error: planning failed ({exc})") from exc

    try:
        vector = matcher.embed(plan.match_text or plan.reasoning)
        matches = store.search(user_id=body.user_id, vector=vector, plan=plan)
    except Exception as exc:
        logger.exception("Find/text search failed")
        raise HTTPException(status_code=500, detail=f"Server Error: search failed ({exc})") from exc

    return FindResponse(user_id=body.user_id, reasoning=plan.reasoning, matches=matches)
