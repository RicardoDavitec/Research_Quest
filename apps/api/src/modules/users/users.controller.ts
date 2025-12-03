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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('researcher')
  @ApiOperation({ summary: 'Criar perfil de pesquisador' })
  createResearcher(@Request() req, @Body() createResearcherDto: CreateResearcherDto) {
    return this.usersService.createResearcher(req.user.userId, createResearcherDto);
  }

  @Get('researchers')
  @ApiOperation({ summary: 'Listar todos os pesquisadores' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('researcher/:id')
  @ApiOperation({ summary: 'Buscar pesquisador por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('researcher/:id')
  @ApiOperation({ summary: 'Atualizar perfil de pesquisador' })
  update(@Param('id') id: string, @Body() updateResearcherDto: UpdateResearcherDto) {
    return this.usersService.update(id, updateResearcherDto);
  }

  @Delete('researcher/:id')
  @ApiOperation({ summary: 'Remover pesquisador' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('my-researcher-profile')
  @ApiOperation({ summary: 'Buscar meu perfil de pesquisador' })
  getMyProfile(@Request() req) {
    return this.usersService.findByUserId(req.user.userId);
  }
}
