import { Module } from '@nestjs/common';

import { FieldResearchesService } from './field-researches.service';
import { FieldResearchesController } from './field-researches.controller';


@Module({
  controllers: [FieldResearchesController],
  providers: [FieldResearchesService],
  exports: [FieldResearchesService],
})
export class FieldResearchesModule {}
