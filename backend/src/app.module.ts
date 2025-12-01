import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubgroupsModule } from './subgroups/subgroups.module';
import { ResearchersModule } from './researchers/researchers.module';
import { QuestionsModule } from './questions/questions.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { SurveysModule } from './surveys/surveys.module';
import { SimilarityModule } from './similarity/similarity.module';
import { RolesModule } from './roles/roles.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { ResearchProjectsModule } from './research-projects/research-projects.module';
import { FieldResearchesModule } from './field-researches/field-researches.module';
import { QuestionSequencesModule } from './question-sequences/question-sequences.module';
import { RolesService } from './roles/roles.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    InstitutionsModule,
    ResearchProjectsModule,
    SubgroupsModule,
    FieldResearchesModule,
    ResearchersModule,
    QuestionsModule,
    QuestionnairesModule,
    QuestionSequencesModule,
    SurveysModule,
    SimilarityModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    // Seed initial roles
    await this.rolesService.seedRoles();
  }
}
