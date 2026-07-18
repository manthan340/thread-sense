import { Module } from '@nestjs/common';
import { AiEngineModule } from '../ai-engine/ai-engine.module';
import { StorageModule } from '../storage/storage.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [StorageModule, AiEngineModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
