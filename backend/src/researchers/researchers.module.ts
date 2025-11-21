import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Researcher } from './entities/researcher.entity';
import { ResearchersController } from './researchers.controller';
import { ResearchersService } from './researchers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Researcher])],
  controllers: [ResearchersController],
  providers: [ResearchersService],
  exports: [ResearchersService],
})
export class ResearchersModule {}
