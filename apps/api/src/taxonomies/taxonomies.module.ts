import { Module } from '@nestjs/common';
import { TaxonomiesController } from './taxonomies.controller';

@Module({
  controllers: [TaxonomiesController],
})
export class TaxonomiesModule {}
