import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionsDto } from './dto/filter-questions.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova questão' })
  @ApiResponse({ status: 201, description: 'Questão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar questões com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  findAll(@Query() filters: FilterQuestionsDto) {
    return this.questionsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar questão por ID' })
  @ApiResponse({ status: 200, description: 'Questão encontrada' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Buscar questões similares' })
  @ApiResponse({ status: 200, description: 'Lista de questões similares' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  findSimilar(
    @Param('id') id: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.questionsService.findSimilar(id, threshold);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar questão' })
  @ApiResponse({ status: 200, description: 'Questão atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover questão' })
  @ApiResponse({ status: 200, description: 'Questão removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
