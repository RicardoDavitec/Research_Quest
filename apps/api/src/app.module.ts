import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ResearchGroupsModule } from './modules/research-groups/research-groups.module';
import { FieldSurveysModule } from './modules/field-surveys/field-surveys.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InstitutionsModule,
    ProjectsModule,
    ResearchGroupsModule,
    FieldSurveysModule,
    QuestionnairesModule,
    QuestionsModule,
    NotificationsModule,
    ApprovalsModule,
  ],
})
export class AppModule {}
