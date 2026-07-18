import { Controller, Get } from '@nestjs/common';
import { TAXONOMIES } from './taxonomy.constants';

@Controller('taxonomies')
export class TaxonomiesController {
  @Get()
  list() {
    return TAXONOMIES;
  }
}
