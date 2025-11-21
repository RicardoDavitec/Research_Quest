import { Controller, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SimilarityService, SimilarityResult } from './similarity.service';
import { CompareSimilarityDto } from './dto/compare-similarity.dto';
import { ExtractKeywordsDto } from './dto/extract-keywords.dto';

@ApiTags('similarity')
@Controller('similarity')
export class SimilarityController {
  constructor(private readonly similarityService: SimilarityService) {}

  @Post('compare')
  @ApiOperation({ summary: 'Comparar similaridade entre textos' })
  @ApiResponse({ status: 200, description: 'Similaridade calculada com sucesso' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  compareSimilarity(
    @Body() dto: CompareSimilarityDto,
    @Query('threshold') threshold?: number,
    @Query('limit') limit?: number,
  ): SimilarityResult[] {
    return this.similarityService.findSimilar(
      dto.query,
      dto.documents,
      threshold,
      limit,
    );
  }

  @Post('keywords')
  @ApiOperation({ summary: 'Extrair palavras-chave de um texto' })
  @ApiResponse({ status: 200, description: 'Palavras-chave extraídas com sucesso' })
  extractKeywords(@Body() dto: ExtractKeywordsDto): { keywords: string[] } {
    const keywords = this.similarityService.extractKeywords(dto.text, dto.topN);
    return { keywords };
  }
}
