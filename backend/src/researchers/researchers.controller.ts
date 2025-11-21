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
import { ResearchersService } from './researchers.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';

@ApiTags('researchers')
@Controller('researchers')
export class ResearchersController {
  constructor(private readonly researchersService: ResearchersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo pesquisador' })
  @ApiResponse({ status: 201, description: 'Pesquisador criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  create(@Body() createResearcherDto: CreateResearcherDto) {
    return this.researchersService.create(createResearcherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pesquisadores' })
  @ApiResponse({ status: 200, description: 'Lista de pesquisadores retornada com sucesso' })
  findAll() {
    return this.researchersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pesquisador por ID' })
  @ApiResponse({ status: 200, description: 'Pesquisador encontrado' })
  @ApiResponse({ status: 404, description: 'Pesquisador não encontrado' })
  findOne(@Param('id') id: string) {
    return this.researchersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pesquisador' })
  @ApiResponse({ status: 200, description: 'Pesquisador atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisador não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  update(
    @Param('id') id: string,
    @Body() updateResearcherDto: UpdateResearcherDto,
  ) {
    return this.researchersService.update(id, updateResearcherDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pesquisador' })
  @ApiResponse({ status: 200, description: 'Pesquisador removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisador não encontrado' })
  remove(@Param('id') id: string) {
    return this.researchersService.remove(id);
  }
}
