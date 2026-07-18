import {
  Category,
  Color,
  Formality,
  Material,
  Occasion,
  Pattern,
  Season,
  Style,
} from '@prisma/client';

export const TAXONOMIES = {
  category: Object.values(Category),
  color: Object.values(Color),
  season: Object.values(Season),
  occasion: Object.values(Occasion),
  style: Object.values(Style),
  material: Object.values(Material),
  pattern: Object.values(Pattern),
  formality: Object.values(Formality),
} as const;

export type TaxonomyName = keyof typeof TAXONOMIES;
