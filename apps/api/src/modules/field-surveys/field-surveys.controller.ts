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
import { FieldSurveysService } from './field-surveys.service';
import { CreateFieldSurveyDto } from './dto/create-field-survey.dto';
import { UpdateFieldSurveyDto } from './dto/update-field-survey.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller para gerenciamento de pesquisas de campo
 * 
 * Endpoints:
 * - POST /field-surveys - Criar pesquisa de campo
 * - GET /field-surveys - Listar pesquisas de campo
 * - GET /field-surveys/research-group/:researchGroupId - Listar pesquisas de um grupo
 * - GET /field-surveys/:id - Buscar pesquisa de campo por ID
 * - PATCH /field-surveys/:id - Atualizar pesquisa de campo
 * - DELETE /field-surveys/:id - Deletar pesquisa de campo
 * - POST /field-surveys/:id/participants - Adicionar participante
 * - GET /field-surveys/:id/participants - Listar participantes
 * - DELETE /field-surveys/:id/participants/:researcherId - Remover participante
 * - GET /field-surveys/:id/statistics - Obter estatísticas
 */
@ApiTags('Field Surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('field-surveys')
export class FieldSurveysController {
  constructor(private readonly fieldSurveysService: FieldSurveysService) {}

  @Post()
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Criar nova pesquisa de campo' })
  @ApiResponse({ status: 201, description: 'Pesquisa de campo criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Grupo de pesquisa não encontrado' })
  @ApiResponse({ status: 409, description: 'Título duplicado no grupo' })
  create(@Body() createFieldSurveyDto: CreateFieldSurveyDto) {
    return this.fieldSurveysService.create(createFieldSurveyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as pesquisas de campo com filtros opcionais' })
  @ApiQuery({ name: 'researchGroupId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de pesquisas de campo' })
  findAll(
    @Query('researchGroupId') researchGroupId?: string,
    @Query('search') search?: string,
  ) {
    return this.fieldSurveysService.findAll({ researchGroupId, search });
  }

  @Get('research-group/:researchGroupId')
  @ApiOperation({ summary: 'Listar pesquisas de campo de um grupo de pesquisa' })
  @ApiResponse({ status: 200, description: 'Lista de pesquisas de campo do grupo' })
  @ApiResponse({ status: 404, description: 'Grupo de pesquisa não encontrado' })
  findByResearchGroup(@Param('researchGroupId', ParseUUIDPipe) researchGroupId: string) {
    return this.fieldSurveysService.findByResearchGroup(researchGroupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pesquisa de campo por ID' })
  @ApiResponse({ status: 200, description: 'Pesquisa de campo encontrada' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fieldSurveysService.findOne(id);
  }

  @Patch(':id')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Atualizar pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Pesquisa de campo atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  @ApiResponse({ status: 409, description: 'Título duplicado no grupo' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFieldSurveyDto: UpdateFieldSurveyDto,
  ) {
    return this.fieldSurveysService.update(id, updateFieldSurveyDto);
  }

  @Delete(':id')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE')
  @ApiOperation({ summary: 'Deletar pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Pesquisa de campo deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fieldSurveysService.remove(id);
  }

  @Post(':id/participants')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Adicionar participante à pesquisa de campo' })
  @ApiResponse({ status: 201, description: 'Participante adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo ou pesquisador não encontrado' })
  @ApiResponse({ status: 409, description: 'Pesquisador já é participante' })
  addParticipant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    return this.fieldSurveysService.addParticipant(id, addParticipantDto);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Listar participantes da pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Lista de participantes' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  getParticipants(@Param('id', ParseUUIDPipe) id: string) {
    return this.fieldSurveysService.getParticipants(id);
  }

  @Delete(':id/participants/:researcherId')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Remover participante da pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Participante removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Participante não encontrado' })
  removeParticipant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('researcherId', ParseUUIDPipe) researcherId: string,
  ) {
    return this.fieldSurveysService.removeParticipant(id, researcherId);
  }

  @Get(':id/statistics')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE', 'ORIENTADOR')
  @ApiOperation({ summary: 'Obter estatísticas da pesquisa de campo' })
  @ApiResponse({ status: 200, description: 'Estatísticas da pesquisa de campo' })
  @ApiResponse({ status: 404, description: 'Pesquisa de campo não encontrada' })
  getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.fieldSurveysService.getStatistics(id);
  }
}
