import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QuestionnaireType } from '@prisma/client';

/**
 * Controller para gerenciamento de questionários
 * 
 * Endpoints:
 * - POST /questionnaires - Criar questionário
 * - GET /questionnaires - Listar questionários
 * - GET /questionnaires/field-survey/:fieldSurveyId - Listar questionários de uma pesquisa
 * - GET /questionnaires/:id - Buscar questionário por ID
 * - PATCH /questionnaires/:id - Atualizar questionário
 * - DELETE /questionnaires/:id - Deletar questionário
 * - POST /questionnaires/:id/participants - Adicionar participante
 * - GET /questionnaires/:id/participants - Listar participantes
 * - DELETE /questionnaires/:id/participants/:researcherId - Remover participante
 * - GET /questionnaires/:id/statistics - Obter estatísticas
 */
@ApiTags('Questionnaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Criar novo questionário' })
  @ApiResponse({ status: 201, description: 'Questionário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  @ApiResponse({ status: 409, description: 'Título duplicado' })
  create(@Body() createQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(createQuestionnaireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os questionários com filtros opcionais' })
  @ApiQuery({ name: 'type', required: false, enum: QuestionnaireType })
  @ApiQuery({ name: 'fieldSurveyId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de questionários' })
  findAll(
    @Query('type') type?: QuestionnaireType,
    @Query('fieldSurveyId') fieldSurveyId?: string,
    @Query('search') search?: string,
  ) {
    return this.questionnairesService.findAll({ type, fieldSurveyId, search });
  }

  @Get('field-survey/:fieldSurveyId')
  @ApiOperation({ summary: 'Listar questionários de uma pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Lista de questionários da pesquisa' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  findByFieldSurvey(@Param('fieldSurveyId', ParseUUIDPipe) fieldSurveyId: string) {
    return this.questionnairesService.findByFieldSurvey(fieldSurveyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar questionário por ID' })
  @ApiResponse({ status: 200, description: 'Questionário encontrado' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionnairesService.findOne(id);
  }

  @Patch(':id')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Atualizar questionário' })
  @ApiResponse({ status: 200, description: 'Questionário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  @ApiResponse({ status: 409, description: 'Título duplicado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnairesService.update(id, updateQuestionnaireDto);
  }

  @Delete(':id')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE')
  @ApiOperation({ summary: 'Deletar questionário' })
  @ApiResponse({ status: 200, description: 'Questionário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionnairesService.remove(id);
  }

  @Post(':id/participants')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Adicionar participante ao questionário' })
  @ApiResponse({ status: 201, description: 'Participante adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Questionário ou pesquisador não encontrado' })
  @ApiResponse({ status: 409, description: 'Pesquisador já é participante' })
  addParticipant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    return this.questionnairesService.addParticipant(id, addParticipantDto);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Listar participantes do questionário' })
  @ApiResponse({ status: 200, description: 'Lista de participantes' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  getParticipants(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionnairesService.getParticipants(id);
  }

  @Delete(':id/participants/:researcherId')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Remover participante do questionário' })
  @ApiResponse({ status: 200, description: 'Participante removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Participante não encontrado' })
  removeParticipant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('researcherId', ParseUUIDPipe) researcherId: string,
  ) {
    return this.questionnairesService.removeParticipant(id, researcherId);
  }

  @Get(':id/statistics')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Obter estatísticas do questionário' })
  @ApiResponse({ status: 200, description: 'Estatísticas do questionário' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado' })
  getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionnairesService.getStatistics(id);
  }
}
