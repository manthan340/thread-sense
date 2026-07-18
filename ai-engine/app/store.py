from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.http.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

from app.config import Settings
from app.schemas import (
    Category,
    ClothingItem,
    Color,
    FindMatch,
    Formality,
    MatchQueryPlan,
    SavedWardrobeItem,
    Slot,
    StyleTag,
)

_FILTER_INDEX_FIELDS = ("user_id", "slot", "formality")


class WardrobeStore:
    def __init__(self, settings: Settings, client: QdrantClient | None = None) -> None:
        self._settings = settings
        self._client = client or QdrantClient(
            url=settings.qdrant_api_endpoint,
            api_key=settings.qdrant_api_key,
        )
        self._vector_size: int | None = None
        self._indexes_ready = False

    def ensure_collection(self, vector_size: int) -> None:
        name = self._settings.qdrant_collection
        if not self._client.collection_exists(name):
            self._client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )
        self._vector_size = vector_size
        self.ensure_payload_indexes()

    def ensure_payload_indexes(self) -> None:
        """Qdrant Cloud requires keyword indexes for filtered payload fields."""
        if self._indexes_ready:
            return

        name = self._settings.qdrant_collection
        if not self._client.collection_exists(name):
            return

        for field in _FILTER_INDEX_FIELDS:
            try:
                self._client.create_payload_index(
                    collection_name=name,
                    field_name=field,
                    field_schema=PayloadSchemaType.KEYWORD,
                )
            except UnexpectedResponse as exc:
                # Index already exists — safe to ignore
                message = str(exc).lower()
                if "already exists" not in message and "duplicate" not in message:
                    raise

        self._indexes_ready = True

    def save_items(
        self,
        *,
        user_id: str,
        image_url: str,
        items: list[ClothingItem],
        vectors: list[list[float]],
    ) -> list[SavedWardrobeItem]:
        if len(items) != len(vectors):
            raise ValueError("items and vectors must be the same length")

        if items:
            self.ensure_collection(len(vectors[0]))

        saved: list[SavedWardrobeItem] = []
        points: list[PointStruct] = []

        for item, vector in zip(items, vectors, strict=True):
            item_id = str(uuid4())
            payload = {
                "user_id": user_id,
                "image_url": image_url,
                "slot": item.slot.value,
                "category": item.category.value,
                "primary_colors": [c.value for c in item.primary_colors],
                "secondary_colors": [c.value for c in item.secondary_colors],
                "pattern": item.pattern.value,
                "formality": item.formality.value,
                "season": [s.value for s in item.season],
                "style_tags": [t.value for t in item.style_tags],
                "description": item.description,
                "match_text": item.match_text,
                "confidence": item.confidence,
            }
            points.append(PointStruct(id=item_id, vector=vector, payload=payload))
            saved.append(
                SavedWardrobeItem(
                    id=item_id,
                    user_id=user_id,
                    image_url=image_url,
                    item=item,
                )
            )

        if points:
            try:
                self._client.upsert(
                    collection_name=self._settings.qdrant_collection,
                    points=points,
                )
            except UnexpectedResponse as exc:
                raise RuntimeError(f"Failed to save wardrobe items: {exc}") from exc

        return saved

    def search(
        self,
        *,
        user_id: str,
        vector: list[float],
        plan: MatchQueryPlan,
        limit: int = 8,
    ) -> list[FindMatch]:
        name = self._settings.qdrant_collection
        if not self._client.collection_exists(name):
            return []

        self.ensure_payload_indexes()

        must: list[FieldCondition] = [
            FieldCondition(key="user_id", match=MatchValue(value=user_id)),
        ]

        target_slots = [s.value for s in plan.target_slots]
        exclude_slots = {s.value for s in plan.exclude_slots}
        # Prefer complementary slots; fall back to all non-excluded if target empty
        slot_filter = [s for s in target_slots if s not in exclude_slots]
        if not slot_filter and exclude_slots:
            slot_filter = [s.value for s in Slot if s.value not in exclude_slots]
        if slot_filter:
            must.append(FieldCondition(key="slot", match=MatchAny(any=slot_filter)))

        formality_values = [f.value for f in plan.formality]
        if formality_values:
            must.append(
                FieldCondition(key="formality", match=MatchAny(any=formality_values))
            )

        try:
            results = self._client.query_points(
                collection_name=name,
                query=vector,
                query_filter=Filter(must=must),
                limit=limit,
                with_payload=True,
            )
        except UnexpectedResponse as exc:
            raise RuntimeError(f"Failed to search wardrobe items: {exc}") from exc

        matches: list[FindMatch] = []
        for point in results.points:
            payload = point.payload or {}
            try:
                matches.append(
                    FindMatch(
                        id=str(point.id),
                        image_url=str(payload.get("image_url", "")),
                        score=float(point.score or 0.0),
                        slot=Slot(payload["slot"]),
                        category=Category(payload["category"]),
                        formality=Formality(payload["formality"]),
                        primary_colors=[
                            Color(c) for c in payload.get("primary_colors", [])
                        ],
                        style_tags=[StyleTag(t) for t in payload.get("style_tags", [])],
                        match_text=str(payload.get("match_text", "")),
                        description=str(payload.get("description", "")),
                    )
                )
            except (KeyError, ValueError):
                continue

        return matches
