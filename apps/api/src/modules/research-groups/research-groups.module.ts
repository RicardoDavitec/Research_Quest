import { Module } from '@nestjs/common';
import { ResearchGroupsService } from './research-groups.service';
import { ResearchGroupsController } from './research-groups.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResearchGroupsController],
  providers: [ResearchGroupsService],
  exports: [ResearchGroupsService],
})
export class ResearchGroupsModule {}
