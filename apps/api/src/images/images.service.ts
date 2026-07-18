import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateTagsDto } from './dto/update-tags.dto';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File | undefined,
    tags: UpdateTagsDto,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only jpeg, png, and webp images are allowed',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File must be 5MB or smaller');
    }

    const key = this.storage.buildObjectKey(userId, file.originalname);
    await this.storage.uploadObject({
      key,
      body: file.buffer,
      mimeType: file.mimetype,
    });

    const image = await this.prisma.image.create({
      data: {
        key,
        mimeType: file.mimetype,
        size: file.size,
        userId,
        category: this.parseEnum(Category, tags.category),
        color: this.parseEnum(Color, tags.color),
        season: this.parseEnum(Season, tags.season),
        occasion: this.parseEnum(Occasion, tags.occasion),
        style: this.parseEnum(Style, tags.style),
        material: this.parseEnum(Material, tags.material),
        pattern: this.parseEnum(Pattern, tags.pattern),
        formality: this.parseEnum(Formality, tags.formality),
      },
    });

    return this.toResponse(image);
  }

  async list(userId: string) {
    const images = await this.prisma.image.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(images.map((image) => this.toResponse(image)));
  }

  async updateTags(userId: string, id: string, dto: UpdateTagsDto) {
    const existing = await this.prisma.image.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Image not found');
    }

    const image = await this.prisma.image.update({
      where: { id },
      data: {
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.season !== undefined ? { season: dto.season } : {}),
        ...(dto.occasion !== undefined ? { occasion: dto.occasion } : {}),
        ...(dto.style !== undefined ? { style: dto.style } : {}),
        ...(dto.material !== undefined ? { material: dto.material } : {}),
        ...(dto.pattern !== undefined ? { pattern: dto.pattern } : {}),
        ...(dto.formality !== undefined ? { formality: dto.formality } : {}),
      },
    });

    return this.toResponse(image);
  }

  private parseEnum<T extends Record<string, string>>(
    enumObj: T,
    value: string | undefined,
  ): T[keyof T] | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }
    const values = Object.values(enumObj);
    if (!values.includes(value)) {
      throw new BadRequestException(`Invalid taxonomy value: ${value}`);
    }
    return value as T[keyof T];
  }

  private async toResponse(image: {
    id: string;
    key: string;
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
    createdAt: Date;
    updatedAt: Date;
  }) {
    const url = await this.storage.getPresignedUrl(image.key);
    return {
      id: image.id,
      key: image.key,
      url,
      mimeType: image.mimeType,
      size: image.size,
      category: image.category,
      color: image.color,
      season: image.season,
      occasion: image.occasion,
      style: image.style,
      material: image.material,
      pattern: image.pattern,
      formality: image.formality,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
