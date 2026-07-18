from openai import OpenAI

from app.config import Settings
from app.images import resolve_image_for_openai
from app.schemas import MatchQueryPlan

IMAGE_MATCH_PROMPT = """You are a personal stylist for a digital wardrobe app.

Given a clothing photo, plan a search for complementary wardrobe items that would go WITH what is shown — not visually identical items.

Rules:
1. Identify which slots are already present in the image (exclude_slots).
2. Propose target_slots for pieces that complete the look (e.g. top photo → bottom, shoes, outerwear).
3. Prefer compatible formality, colors, season, and style_tags.
4. match_text: a short comma-separated search phrase describing the ideal complementary pieces (for embedding search).
5. reasoning: 2–4 sentences explaining what you see and what would pair well, written for the user.
6. Use ONLY schema enum values. Never invent labels.
7. If the image has no clothing, set empty target_slots, empty exclude_slots, and explain in reasoning.
"""

TEXT_MATCH_PROMPT = """You are a personal stylist for a digital wardrobe app.

Given a text request about an occasion, event, or outfit need, plan a search over the user's wardrobe.

Rules:
1. Infer formality, season, style_tags, and preferred_colors from the request.
2. target_slots: which garment slots to pull for a complete outfit suggestion (typically top, bottom, shoes; include outerwear/accessory when relevant).
3. exclude_slots: always empty for text queries.
4. match_text: a short comma-separated search phrase describing ideal wardrobe pieces for this request (for embedding search).
5. reasoning: 2–4 sentences explaining the occasion read and what kind of clothes fit, written for the user.
6. Use ONLY schema enum values. Never invent labels.
7. If the text is unrelated to clothing/outfits, set empty target_slots and explain in reasoning.
"""


class OutfitMatcher:
    def __init__(self, settings: Settings, client: OpenAI | None = None) -> None:
        self._settings = settings
        self._client = client or OpenAI(api_key=settings.openai_api_key)

    def plan_from_image(self, image_url: str) -> MatchQueryPlan:
        openai_image = resolve_image_for_openai(image_url)
        response = self._client.responses.parse(
            model=self._settings.openai_model,
            input=[
                {"role": "system", "content": IMAGE_MATCH_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Plan complementary wardrobe matches for this image. "
                                "Return target slots and match criteria."
                            ),
                        },
                        {"type": "input_image", "image_url": openai_image},
                    ],
                },
            ],
            text_format=MatchQueryPlan,
        )
        if response.output_parsed is None:
            raise RuntimeError("OpenAI returned no parsed match plan for image")
        return response.output_parsed

    def plan_from_text(self, text: str) -> MatchQueryPlan:
        response = self._client.responses.parse(
            model=self._settings.openai_model,
            input=[
                {"role": "system", "content": TEXT_MATCH_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Plan wardrobe matches for this request:\n"
                        f"{text}\n\n"
                        "Return target slots and match criteria."
                    ),
                },
            ],
            text_format=MatchQueryPlan,
        )
        if response.output_parsed is None:
            raise RuntimeError("OpenAI returned no parsed match plan for text")
        return response.output_parsed

    def embed(self, text: str) -> list[float]:
        result = self._client.embeddings.create(
            model=self._settings.openai_embedding_model,
            input=text,
        )
        return result.data[0].embedding
