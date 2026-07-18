import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { TaxonomiesModule } from './taxonomies/taxonomies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    StorageModule,
    ImagesModule,
    TaxonomiesModule,
  ],
})
export class AppModule {}
