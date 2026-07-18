import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Taxonomies (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/taxonomies (GET)', () => {
    return request(app.getHttpServer())
      .get('/taxonomies')
      .expect(200)
      .expect((res) => {
        expect(res.body.color).toContain('navy');
        expect(res.body.category).toContain('tops');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
