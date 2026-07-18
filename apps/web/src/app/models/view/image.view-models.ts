import { Category, Color, Season, Occasion, Style, Material, Pattern, Formality } from '../api/taxonomy.models';

export interface ImageItem {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  tags: ImageTags;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageTags {
  category?: Category;
  color?: Color;
  season?: Season;
  occasion?: Occasion;
  style?: Style;
  material?: Material;
  pattern?: Pattern;
  formality?: Formality;
}

export interface CaptureState {
  status: 'idle' | 'requesting-permission' | 'streaming' | 'captured' | 'uploading' | 'success' | 'failed';
  stream?: MediaStream;
  capturedImage?: Blob;
  previewUrl?: string;
  error?: string;
  progress?: number;
}
