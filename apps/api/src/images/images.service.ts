import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
        category: this.optionalString(tags.category),
        color: this.optionalString(tags.color),
        season: this.optionalString(tags.season),
        occasion: this.optionalString(tags.occasion),
        style: this.optionalString(tags.style),
        material: this.optionalString(tags.material),
        pattern: this.optionalString(tags.pattern),
        formality: this.optionalString(tags.formality),
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

  private optionalString(value: string | undefined): string | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }
    return value;
  }

  private async toResponse(image: {
    id: string;
    key: string;
    mimeType: string;
    size: number;
    category: string | null;
    color: string | null;
    season: string | null;
    occasion: string | null;
    style: string | null;
    material: string | null;
    pattern: string | null;
    formality: string | null;
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
