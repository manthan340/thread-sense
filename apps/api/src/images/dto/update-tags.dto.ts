import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class UpdateTagsDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  color?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  season?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  occasion?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  style?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  material?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  pattern?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  formality?: string;
}
