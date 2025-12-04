import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('researcher')
  @ApiOperation({ summary: 'Criar perfil de pesquisador' })
  @ApiResponse({ status: 201, description: 'Perfil de pesquisador criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Perfil já existe para este usuário' })
  createResearcher(@CurrentUser('userId') userId: string, @Body() createResearcherDto: CreateResearcherDto) {
    return this.usersService.createResearcher(userId, createResearcherDto);
  }

  @Get('researchers')
  @Roles(UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Listar todos os pesquisadores (requer role de coordenador ou docente)' })
  @ApiResponse({ status: 200, description: 'Lista de pesquisadores retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('researcher/:id')
  @ApiOperation({ summary: 'Buscar pesquisador por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('researcher/:id')
  @ApiOperation({ summary: 'Atualizar perfil de pesquisador (apenas o próprio usuário ou coordenador)' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisador não encontrado' })
  update(
    @Param('id') id: string, 
    @Body() updateResearcherDto: UpdateResearcherDto,
    @CurrentUser() user: any
  ) {
    // TODO: Adicionar validação para permitir apenas próprio usuário ou coordenador
    return this.usersService.update(id, updateResearcherDto);
  }

  @Delete('researcher/:id')
  @Roles(UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO)
  @ApiOperation({ summary: 'Remover pesquisador (apenas coordenadores)' })
  @ApiResponse({ status: 200, description: 'Pesquisador removido com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas coordenadores' })
  @ApiResponse({ status: 404, description: 'Pesquisador não encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('my-researcher-profile')
  @ApiOperation({ summary: 'Buscar meu perfil de pesquisador' })
  getMyProfile(@Request() req) {
    return this.usersService.findByUserId(req.user.userId);
  }
}
