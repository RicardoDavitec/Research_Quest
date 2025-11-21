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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { FilterSurveysDto } from './dto/filter-surveys.dto';

@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova pesquisa operacional' })
  @ApiResponse({ status: 201, description: 'Pesquisa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(createSurveyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pesquisas com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de pesquisas retornada com sucesso' })
  findAll(@Query() filters: FilterSurveysDto) {
    return this.surveysService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pesquisa por ID' })
  @ApiResponse({ status: 200, description: 'Pesquisa encontrada' })
  @ApiResponse({ status: 404, description: 'Pesquisa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pesquisa' })
  @ApiResponse({ status: 200, description: 'Pesquisa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa não encontrada' })
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveysService.update(id, updateSurveyDto);
  }

  @Post(':id/response')
  @ApiOperation({ summary: 'Incrementar contador de respostas' })
  @ApiResponse({ status: 200, description: 'Contador incrementado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa não encontrada' })
  incrementResponse(@Param('id') id: string) {
    return this.surveysService.incrementResponseCount(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pesquisa' })
  @ApiResponse({ status: 200, description: 'Pesquisa removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Pesquisa não encontrada' })
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }
}
