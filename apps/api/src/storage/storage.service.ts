import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>(
      'MINIO_ENDPOINT',
      'http://localhost:9000',
    );
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'thread-sense');
    this.client = new S3Client({
      region: this.config.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.config.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      this.logger.log(`Creating bucket ${this.bucket}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  buildObjectKey(userId: string, originalName: string) {
    const ext = extname(originalName).toLowerCase() || '.bin';
    return `closet/${userId}/${randomUUID()}${ext}`;
  }

  async uploadObject(params: {
    key: string;
    body: Buffer;
    mimeType: string;
  }) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.mimeType,
      }),
    );
  }

  async getPresignedUrl(key: string, expiresInSeconds = 3600) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
