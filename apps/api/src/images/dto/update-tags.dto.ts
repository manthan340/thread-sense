import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
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

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class UpdateTagsDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Color)
  color?: Color;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Season)
  season?: Season;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Occasion)
  occasion?: Occasion;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Style)
  style?: Style;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Material)
  material?: Material;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Pattern)
  pattern?: Pattern;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(Formality)
  formality?: Formality;
}
