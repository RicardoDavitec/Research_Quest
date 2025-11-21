import { Module } from '@nestjs/common';
import { SimilarityService } from './similarity.service';
import { SimilarityController } from './similarity.controller';

@Module({
  controllers: [SimilarityController],
  providers: [SimilarityService],
  exports: [SimilarityService],
})
export class SimilarityModule {}
