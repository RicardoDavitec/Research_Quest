import { Module } from '@nestjs/common';
import { FieldSurveysService } from './field-surveys.service';
import { FieldSurveysController } from './field-surveys.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FieldSurveysController],
  providers: [FieldSurveysService],
  exports: [FieldSurveysService],
})
export class FieldSurveysModule {}
