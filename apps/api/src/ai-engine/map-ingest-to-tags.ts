import type { UpdateTagsDto } from '../images/dto/update-tags.dto';
import type { AiClothingItem, AiIngestResponse } from './ai-engine.types';

/** Map ai-engine slot → Nest closet category vocabulary. */
const SLOT_TO_CATEGORY: Record<string, string> = {
  top: 'tops',
  bottom: 'bottoms',
  one_piece: 'dresses',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessory: 'accessories',
};

/** Align ai-engine pattern enums with Nest taxonomy suggestions. */
const PATTERN_MAP: Record<string, string> = {
  stripe: 'striped',
  check: 'checked',
};

/** Derive occasion from formality when ai-engine does not provide one. */
const FORMALITY_TO_OCCASION: Record<string, string> = {
  casual: 'casual',
  smart_casual: 'work',
  business: 'work',
  formal: 'formal',
  athletic: 'sport',
};

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function mapPattern(pattern: string): string {
  return PATTERN_MAP[pattern] ?? pattern;
}

function tagsFromItem(item: AiClothingItem): Required<UpdateTagsDto> {
  const slotCategory = SLOT_TO_CATEGORY[item.slot];
  const category = uniq([
    ...(slotCategory ? [slotCategory] : []),
    item.category,
  ]);

  const color = uniq([
    ...item.primary_colors,
    ...item.secondary_colors,
  ]);

  const occasion = FORMALITY_TO_OCCASION[item.formality]
    ? [FORMALITY_TO_OCCASION[item.formality]]
    : [];

  return {
    category,
    color,
    season: uniq(item.season),
    occasion,
    style: uniq(item.style_tags),
    material: [],
    pattern: [mapPattern(item.pattern)],
    formality: [item.formality],
  };
}

/**
 * Collapse 0..N extracted garments into one Image tag payload.
 * Merges values from all items (outfit photos can yield multiple garments).
 */
export function mapIngestToTags(response: AiIngestResponse): UpdateTagsDto {
  if (!response.items.length) {
    return {
      category: [],
      color: [],
      season: [],
      occasion: [],
      style: [],
      material: [],
      pattern: [],
      formality: [],
    };
  }

  const merged: Required<UpdateTagsDto> = {
    category: [],
    color: [],
    season: [],
    occasion: [],
    style: [],
    material: [],
    pattern: [],
    formality: [],
  };

  // Prefer higher-confidence items first so their values stay earlier in arrays.
  const sorted = [...response.items].sort(
    (a, b) => b.item.confidence - a.item.confidence,
  );

  for (const saved of sorted) {
    const tags = tagsFromItem(saved.item);
    for (const key of Object.keys(merged) as (keyof Required<UpdateTagsDto>)[]) {
      merged[key] = uniq([...merged[key], ...tags[key]]);
    }
  }

  return merged;
}
