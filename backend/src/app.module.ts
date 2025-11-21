import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SubgroupsModule } from './subgroups/subgroups.module';
import { ResearchersModule } from './researchers/researchers.module';
import { QuestionsModule } from './questions/questions.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { SurveysModule } from './surveys/surveys.module';
import { SimilarityModule } from './similarity/similarity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    SubgroupsModule,
    ResearchersModule,
    QuestionsModule,
    QuestionnairesModule,
    SurveysModule,
    SimilarityModule,
  ],
})
export class AppModule {}
