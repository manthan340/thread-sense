import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiIngestResponse } from './ai-engine.types';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config
      .get<string>('AI_ENGINE_URL', 'http://127.0.0.1:8080')
      .replace(/\/$/, '');
    this.timeoutMs = Number(
      this.config.get<string>('AI_ENGINE_TIMEOUT_MS', '120000'),
    );
  }

  async ingest(userId: string, imageUrl: string): Promise<AiIngestResponse> {
    const url = `${this.baseUrl}/ingest`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          image_url: imageUrl,
        }),
        signal: controller.signal,
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const detail =
          typeof body?.detail === 'string'
            ? body.detail
            : `AI engine returned ${res.status}`;
        this.logger.warn(`ingest failed: ${detail}`);
        throw new BadGatewayException(detail);
      }

      return body as AiIngestResponse;
    } catch (err) {
      if (err instanceof BadGatewayException) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ServiceUnavailableException(
          'AI engine timed out while tagging the image',
        );
      }
      this.logger.error(
        `ingest request failed: ${err instanceof Error ? err.message : err}`,
      );
      throw new ServiceUnavailableException(
        'Could not reach the AI tagging service',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
