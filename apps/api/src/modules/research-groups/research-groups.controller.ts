import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ResearchGroupsService } from './research-groups.service';
import { CreateResearchGroupDto } from './dto/create-research-group.dto';
import { UpdateResearchGroupDto } from './dto/update-research-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Research Groups')
@Controller('research-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResearchGroupsController {
  constructor(private readonly researchGroupsService: ResearchGroupsService) {}

  @Post()
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Criar novo grupo de pesquisa' })
  @ApiResponse({ status: 201, description: 'Grupo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou grupo duplicado' })
  @ApiResponse({ status: 404, description: 'Projeto ou coordenador não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createResearchGroupDto: CreateResearchGroupDto,
  ) {
    return this.researchGroupsService.create(createResearchGroupDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os grupos de pesquisa' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filtrar por projeto' })
  @ApiQuery({ name: 'coordinatorId', required: false, description: 'Filtrar por coordenador' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome ou descrição' })
  @ApiResponse({ status: 200, description: 'Lista de grupos retornada com sucesso' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('coordinatorId') coordinatorId?: string,
    @Query('search') search?: string,
  ) {
    return this.researchGroupsService.findAll({ projectId, coordinatorId, search });
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar grupos de pesquisa de um projeto' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Lista de grupos do projeto' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.researchGroupsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar grupo de pesquisa por ID' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.researchGroupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Atualizar grupo de pesquisa' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Grupo atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nome duplicado' })
  @ApiResponse({ status: 404, description: 'Grupo ou coordenador não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateResearchGroupDto: UpdateResearchGroupDto,
  ) {
    return this.researchGroupsService.update(id, updateResearchGroupDto, userId);
  }

  @Delete(':id')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar grupo de pesquisa' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Grupo deletado com sucesso' })
  @ApiResponse({ status: 400, description: 'Grupo possui dependências' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.researchGroupsService.remove(id, userId);
  }

  // ===== GERENCIAMENTO DE MEMBROS =====

  @Post(':id/members')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar membro ao grupo' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 201, description: 'Membro adicionado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pesquisador já é membro' })
  @ApiResponse({ status: 404, description: 'Grupo ou pesquisador não encontrado' })
  async addMember(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() addMemberDto: AddGroupMemberDto,
  ) {
    return this.researchGroupsService.addMember(id, addMemberDto, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do grupo' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Lista de membros retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  async getMembers(@Param('id') id: string) {
    return this.researchGroupsService.getMembers(id);
  }

  @Delete(':id/members/:researcherId')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover membro do grupo' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiParam({ name: 'researcherId', description: 'ID do pesquisador' })
  @ApiResponse({ status: 200, description: 'Membro removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  async removeMember(
    @Param('id') id: string,
    @Param('researcherId') researcherId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.researchGroupsService.removeMember(id, researcherId, userId);
  }

  // ===== ESTATÍSTICAS =====

  @Get(':id/statistics')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Obter estatísticas do grupo' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  async getStatistics(@Param('id') id: string) {
    return this.researchGroupsService.getStatistics(id);
  }
}
