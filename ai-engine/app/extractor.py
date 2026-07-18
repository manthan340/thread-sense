from openai import OpenAI

from app.config import Settings
from app.images import resolve_image_for_openai
from app.schemas import WardrobeExtraction

SYSTEM_PROMPT = """You are a fashion cataloger for a personal digital wardrobe.

Your job: look at a clothing photo and extract structured garment metadata for outfit matching.

Rules:
1. Identify every distinct wearable garment or accessory visible and worth saving as a wardrobe item.
2. Prefer one item when the photo clearly shows a single garment (flat lay, hanger, product shot).
3. For outfit / mirror / on-body photos, return separate items for each distinct slot (e.g. top, bottom, shoes).
4. Use ONLY the allowed enum values from the schema. Never invent new labels.
5. If uncertain between two values, pick the closest match. Use "other_*" / "other" only when nothing fits.
6. Colors: put the dominant color(s) in primary_colors (1-2). Put accents, logos, or trim in secondary_colors.
7. pattern: use "solid" if no clear repeating print.
8. formality: judge how the garment is typically worn, not the photo setting.
9. season: include all plausible seasons; use ["all_season"] for basics like plain jeans, white tees, black sneakers when broadly usable.
10. style_tags: pick 1-3 that best describe the garment. Prefer fewer, higher-confidence tags.
11. description: one concise sentence for search/embeddings. Include category, colors, pattern, material guess if obvious, and notable details. No marketing fluff.
12. match_text: a short comma-separated phrase optimized for matching, e.g. "navy solid smart_casual chinos, classic minimal, spring summer fall".
13. confidence: 0-1 for how sure you are about this item overall.
14. If the image has no clothing, return an empty items list and set notes accordingly.
15. Ignore people, faces, rooms, and brands unless brand is clearly printed and useful in description.
"""


class ClothingExtractor:
    def __init__(self, settings: Settings, client: OpenAI | None = None) -> None:
        self._settings = settings
        self._client = client or OpenAI(api_key=settings.openai_api_key)

    def extract(self, image_url: str) -> WardrobeExtraction:
        openai_image = resolve_image_for_openai(image_url)

        response = self._client.responses.parse(
            model=self._settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Extract wardrobe metadata from this image. "
                                "Return every distinct garment/accessory as a separate item."
                            ),
                        },
                        {
                            "type": "input_image",
                            "image_url": openai_image,
                        },
                    ],
                },
            ],
            text_format=WardrobeExtraction,
        )

        if response.output_parsed is None:
            raise RuntimeError("OpenAI returned no parsed wardrobe extraction")

        return response.output_parsed

    def embed(self, text: str) -> list[float]:
        result = self._client.embeddings.create(
            model=self._settings.openai_embedding_model,
            input=text,
        )
        return result.data[0].embedding
