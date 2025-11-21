import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';

@ApiTags('questionnaires')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo questionário' })
  @ApiResponse({ status: 201, description: 'Questionário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(createQuestionnaireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os questionários' })
  @ApiResponse({ status: 200, description: 'Lista de questionários retornada com sucesso' })
  findAll() {
    return this.questionnairesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar questionário por ID' })
  @ApiResponse({ status: 200, description: 'Questionário encontrado' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.questionnairesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar questionário' })
  @ApiResponse({ status: 200, description: 'Questionário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnairesService.update(id, updateQuestionnaireDto);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Adicionar questões ao questionário' })
  @ApiResponse({ status: 200, description: 'Questões adicionadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  addQuestions(@Param('id') id: string, @Body() addQuestionsDto: AddQuestionsDto) {
    return this.questionnairesService.addQuestions(id, addQuestionsDto);
  }

  @Delete(':id/questions/:questionId')
  @ApiOperation({ summary: 'Remover questão do questionário' })
  @ApiResponse({ status: 200, description: 'Questão removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  removeQuestion(@Param('id') id: string, @Param('questionId') questionId: string) {
    return this.questionnairesService.removeQuestion(id, questionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover questionário' })
  @ApiResponse({ status: 200, description: 'Questionário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  remove(@Param('id') id: string) {
    return this.questionnairesService.remove(id);
  }
}
