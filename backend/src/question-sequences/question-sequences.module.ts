import { Module } from '@nestjs/common';

import { QuestionSequencesService } from './question-sequences.service';
import { QuestionSequencesController } from './question-sequences.controller';


@Module({
  controllers: [QuestionSequencesController],
  providers: [QuestionSequencesService],
  exports: [QuestionSequencesService],
})
export class QuestionSequencesModule {}
