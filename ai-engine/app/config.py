import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    openai_model: str
    openai_embedding_model: str
    qdrant_api_key: str
    qdrant_api_endpoint: str
    qdrant_collection: str
    port: int
    environment: str


@lru_cache
def get_settings() -> Settings:
    openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
    qdrant_api_key = os.getenv("QDRANT_API_KEY", "").strip()
    qdrant_api_endpoint = os.getenv("QDRANT_API_ENDPOINT", "").strip()

    if not openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required")
    if not qdrant_api_key:
        raise RuntimeError("QDRANT_API_KEY is required")
    if not qdrant_api_endpoint:
        raise RuntimeError("QDRANT_API_ENDPOINT is required")

    return Settings(
        openai_api_key=openai_api_key,
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip(),
        openai_embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small").strip(),
        qdrant_api_key=qdrant_api_key,
        qdrant_api_endpoint=qdrant_api_endpoint,
        qdrant_collection=os.getenv("QDRANT_COLLECTION", "wardrobe_items").strip(),
        port=int(os.getenv("PORT", "8080")),
        environment=os.getenv("ENVIRONMENT", "development").strip(),
    )
