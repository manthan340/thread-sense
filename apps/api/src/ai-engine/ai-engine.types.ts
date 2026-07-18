/** Subset of ai-engine POST /ingest response used by the API. */

export type AiClothingItem = {
  slot: string;
  category: string;
  primary_colors: string[];
  secondary_colors: string[];
  pattern: string;
  formality: string;
  season: string[];
  style_tags: string[];
  description: string;
  match_text: string;
  confidence: number;
};

export type AiSavedWardrobeItem = {
  id: string;
  user_id: string;
  image_url: string;
  item: AiClothingItem;
};

export type AiIngestResponse = {
  user_id: string;
  image_url: string;
  notes: string;
  items: AiSavedWardrobeItem[];
};
