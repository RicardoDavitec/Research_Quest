import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from '../questions/entities/question.entity';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnairesService } from './questionnaires.service';

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Question])],
  controllers: [QuestionnairesController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}
