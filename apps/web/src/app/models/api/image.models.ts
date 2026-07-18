import { Category, Color, Season, Occasion, Style, Material, Pattern, Formality } from './taxonomy.models';

export interface UpdateTagsDto {
  category?: Category;
  color?: Color;
  season?: Season;
  occasion?: Occasion;
  style?: Style;
  material?: Material;
  pattern?: Pattern;
  formality?: Formality;
}

export interface ImageResponseDto {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  category: Category | null;
  color: Color | null;
  season: Season | null;
  occasion: Occasion | null;
  style: Style | null;
  material: Material | null;
  pattern: Pattern | null;
  formality: Formality | null;
  createdAt: string;
  updatedAt: string;
}
