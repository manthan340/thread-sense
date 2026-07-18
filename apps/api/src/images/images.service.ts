import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { mapIngestToTags } from '../ai-engine/map-ingest-to-tags';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateTagsDto } from './dto/update-tags.dto';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_BYTES = 5 * 1024 * 1024;

const TAG_FIELDS = [
  'category',
  'color',
  'season',
  'occasion',
  'style',
  'material',
  'pattern',
  'formality',
] as const;

type TagField = (typeof TAG_FIELDS)[number];

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly aiEngine: AiEngineService,
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
        ...this.tagData(tags),
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
      data: this.tagData(dto),
    });

    return this.toResponse(image);
  }

  async smartTag(userId: string, id: string) {
    const existing = await this.prisma.image.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Image not found');
    }

    const imageUrl = await this.storage.getPresignedUrl(existing.key);
    const ingest = await this.aiEngine.ingest(userId, imageUrl);
    const tags = mapIngestToTags(ingest);

    if (!ingest.items.length) {
      this.logger.warn(
        `smartTag: no clothing items for image ${id}` +
          (ingest.notes ? ` (${ingest.notes})` : ''),
      );
    }

    const image = await this.prisma.image.update({
      where: { id },
      data: this.tagData(tags),
    });

    return this.toResponse(image);
  }

  private tagData(tags: UpdateTagsDto): Partial<Record<TagField, string[]>> {
    const data: Partial<Record<TagField, string[]>> = {};
    for (const field of TAG_FIELDS) {
      if (tags[field] !== undefined) {
        data[field] = tags[field];
      }
    }
    return data;
  }

  private async toResponse(image: {
    id: string;
    key: string;
    mimeType: string;
    size: number;
    category: string[];
    color: string[];
    season: string[];
    occasion: string[];
    style: string[];
    material: string[];
    pattern: string[];
    formality: string[];
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
