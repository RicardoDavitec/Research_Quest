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
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ReviewApprovalDto } from './dto/review-approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApprovalStatus } from '@prisma/client';

/**
 * Controller para gerenciamento de aprovações
 * 
 * Endpoints:
 * - POST /approvals - Criar solicitação de aprovação
 * - GET /approvals - Listar solicitações de aprovação
 * - GET /approvals/pending - Listar solicitações pendentes
 * - GET /approvals/requester/:requesterId - Listar solicitações de um solicitante
 * - GET /approvals/approver/:approverId - Listar solicitações de um aprovador
 * - GET /approvals/statistics - Obter estatísticas
 * - GET /approvals/:id - Buscar solicitação por ID
 * - PATCH /approvals/:id/review - Revisar solicitação (aprovar/rejeitar)
 * - DELETE /approvals/:id - Cancelar solicitação
 */
@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova solicitação de aprovação' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitante ou recurso não encontrado' })
  create(@Body() createApprovalDto: CreateApprovalDto) {
    return this.approvalsService.create(createApprovalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as solicitações de aprovação com filtros opcionais' })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'requesterId', required: false, type: String })
  @ApiQuery({ name: 'approverId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de solicitações de aprovação' })
  findAll(
    @Query('status') status?: ApprovalStatus,
    @Query('type') type?: string,
    @Query('requesterId') requesterId?: string,
    @Query('approverId') approverId?: string,
  ) {
    return this.approvalsService.findAll({ status, type, requesterId, approverId });
  }

  @Get('pending')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE')
  @ApiOperation({ summary: 'Listar solicitações pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações pendentes' })
  findPending() {
    return this.approvalsService.findPending();
  }

  @Get('requester/:requesterId')
  @ApiOperation({ summary: 'Listar solicitações de um solicitante' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações do solicitante' })
  @ApiResponse({ status: 404, description: 'Solicitante não encontrado' })
  findByRequester(@Param('requesterId', ParseUUIDPipe) requesterId: string) {
    return this.approvalsService.findByRequester(requesterId);
  }

  @Get('approver/:approverId')
  @ApiOperation({ summary: 'Listar solicitações revisadas por um aprovador' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações do aprovador' })
  @ApiResponse({ status: 404, description: 'Aprovador não encontrado' })
  findByApprover(@Param('approverId', ParseUUIDPipe) approverId: string) {
    return this.approvalsService.findByApprover(approverId);
  }

  @Get('statistics')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE')
  @ApiOperation({ summary: 'Obter estatísticas de aprovações' })
  @ApiResponse({ status: 200, description: 'Estatísticas de aprovações' })
  getStatistics() {
    return this.approvalsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar solicitação de aprovação por ID' })
  @ApiResponse({ status: 200, description: 'Solicitação de aprovação encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitação de aprovação não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id/review')
  @Roles('COORDENADOR_PROJETO', 'COORDENADOR_GRUPO', 'DOCENTE')
  @ApiOperation({ summary: 'Revisar solicitação de aprovação (aprovar/rejeitar)' })
  @ApiResponse({ status: 200, description: 'Solicitação revisada com sucesso' })
  @ApiResponse({ status: 400, description: 'Solicitação já foi revisada ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitação de aprovação não encontrada' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewApprovalDto: ReviewApprovalDto,
    @Query('approverId', ParseUUIDPipe) approverId: string,
  ) {
    return this.approvalsService.review(id, approverId, reviewApprovalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar solicitação de aprovação' })
  @ApiResponse({ status: 200, description: 'Solicitação cancelada com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas solicitações pendentes podem ser canceladas' })
  @ApiResponse({ status: 403, description: 'Apenas o solicitante pode cancelar' })
  @ApiResponse({ status: 404, description: 'Solicitação de aprovação não encontrada' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('requesterId', ParseUUIDPipe) requesterId: string,
  ) {
    return this.approvalsService.cancel(id, requesterId);
  }
}
