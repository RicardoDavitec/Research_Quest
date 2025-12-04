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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { QuestionsService } from './questions.service';
import { FileParserService } from './file-parser.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Questions')
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly fileParserService: FileParserService,
  ) {}

  @Post()
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Criar nova questão' })
  @ApiResponse({ status: 201, description: 'Questão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    // Buscar o researcher ID do usuário
    return this.questionsService.create(userId, createQuestionDto);
  }

  @Post('import')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Importar múltiplas questões de uma vez' })
  @ApiResponse({ status: 201, description: 'Importação concluída (pode conter falhas parciais)' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async importQuestions(
    @CurrentUser('userId') userId: string,
    @Body() importDto: ImportQuestionsDto,
  ) {
    return this.questionsService.importQuestions(userId, importDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as questões com filtros opcionais' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'scope', required: false, description: 'Filtrar por escopo' })
  @ApiQuery({ name: 'origin', required: false, description: 'Filtrar por origem' })
  @ApiQuery({ name: 'creatorId', required: false, description: 'Filtrar por criador' })
  @ApiQuery({ name: 'researchGroupId', required: false, description: 'Filtrar por grupo de pesquisa' })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('scope') scope?: string,
    @Query('origin') origin?: string,
    @Query('creatorId') creatorId?: string,
    @Query('researchGroupId') researchGroupId?: string,
  ) {
    return this.questionsService.findAll({
      type,
      category,
      scope,
      origin,
      creatorId,
      researchGroupId,
    });
  }

  @Get('statistics')
  @Roles(UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Obter estatísticas de questões (apenas coordenadores e docentes)' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getStatistics() {
    return this.questionsService.getStatistics();
  }

  @Get('similar')
  @ApiOperation({ summary: 'Buscar questões similares por texto' })
  @ApiQuery({ name: 'text', required: true, description: 'Texto para busca de similaridade' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados', type: Number })
  @ApiResponse({ status: 200, description: 'Questões similares encontradas' })
  async findSimilar(
    @Query('text') text: string,
    @Query('limit') limit?: number,
  ) {
    return this.questionsService.findSimilar(text, limit ? parseInt(limit.toString()) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar questão por ID' })
  @ApiResponse({ status: 200, description: 'Questão encontrada' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Atualizar questão (cria nova versão)' })
  @ApiResponse({ status: 200, description: 'Nova versão da questão criada' })
  @ApiResponse({ status: 400, description: 'Apenas o criador pode atualizar' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, userId, updateQuestionDto);
  }

  @Delete(':id')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover questão (apenas se não estiver em uso)' })
  @ApiResponse({ status: 200, description: 'Questão removida com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas o criador pode remover' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  @ApiResponse({ status: 409, description: 'Questão está em uso e não pode ser removida' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.remove(id, userId);
  }

  // ===== ENDPOINTS DE UPLOAD =====

  @Post('upload/excel')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE, UserRole.ORIENTADOR)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload de arquivo Excel com questões',
    description: 'Faz upload de arquivo .xlsx ou .xls e importa as questões automaticamente' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        defaultOrigin: {
          type: 'string',
          description: 'Origem padrão para todas as questões (opcional)',
        },
        researchGroupId: {
          type: 'string',
          format: 'uuid',
          description: 'ID do grupo de pesquisa (opcional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Questões importadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou erro no formato' })
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
    @Body('defaultOrigin') defaultOrigin?: string,
    @Body('researchGroupId') researchGroupId?: string,
  ) {
    // Validar arquivo antes de processar
    this.fileParserService.validateFileUpload(file, ['xlsx', 'xls'], 10);

    try {
      // Parsear Excel
      const questions = await this.fileParserService.parseExcel(file.buffer);

      // Importar questões
      const result = await this.questionsService.importQuestions(userId, {
        questions,
        defaultOrigin: defaultOrigin || 'EXCEL_IMPORT',
        researchGroupId,
      });

      return {
        message: 'Importação concluída com sucesso',
        fileName: file.originalname,
        fileSize: `${(file.size / 1024).toFixed(2)}KB`,
        processedAt: new Date().toISOString(),
        ...result,
      };
    } catch (error) {
      // Se erro contém informações estruturadas, retornar
      if (error.response && typeof error.response === 'object') {
        throw new BadRequestException(error.response);
      }
      throw error;
    }
  }

  @Post('upload/csv')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE, UserRole.ORIENTADOR)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload de arquivo CSV com questões',
    description: 'Faz upload de arquivo .csv e importa as questões automaticamente' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        defaultOrigin: {
          type: 'string',
          description: 'Origem padrão para todas as questões (opcional)',
        },
        researchGroupId: {
          type: 'string',
          format: 'uuid',
          description: 'ID do grupo de pesquisa (opcional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Questões importadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou erro no formato' })
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
    @Body('defaultOrigin') defaultOrigin?: string,
    @Body('researchGroupId') researchGroupId?: string,
  ) {
    // Validar arquivo antes de processar
    this.fileParserService.validateFileUpload(file, ['csv'], 10);

    try {
      // Parsear CSV
      const questions = await this.fileParserService.parseCsv(file.buffer);

      // Importar questões
      const result = await this.questionsService.importQuestions(userId, {
        questions,
        defaultOrigin: defaultOrigin || 'CSV_IMPORT',
        researchGroupId,
      });

      return {
        message: 'Importação concluída com sucesso',
        fileName: file.originalname,
        fileSize: `${(file.size / 1024).toFixed(2)}KB`,
        processedAt: new Date().toISOString(),
        ...result,
      };
    } catch (error) {
      // Se erro contém informações estruturadas, retornar
      if (error.response && typeof error.response === 'object') {
        throw new BadRequestException(error.response);
      }
      throw error;
    }
  }

  // ===== ENDPOINTS DE TEMPLATES =====

  @Get('templates/excel')
  @ApiOperation({ 
    summary: 'Download de template Excel',
    description: 'Baixa um arquivo Excel de exemplo com o formato correto para importação' 
  })
  @ApiResponse({ status: 200, description: 'Template Excel gerado' })
  downloadExcelTemplate(@Res() res: Response) {
    const buffer = this.fileParserService.generateExcelTemplate();
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_questoes.xlsx"',
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('templates/csv')
  @ApiOperation({ 
    summary: 'Download de template CSV',
    description: 'Baixa um arquivo CSV de exemplo com o formato correto para importação' 
  })
  @ApiResponse({ status: 200, description: 'Template CSV gerado' })
  downloadCsvTemplate(@Res() res: Response) {
    const csv = this.fileParserService.generateCsvTemplate();
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="template_questoes.csv"',
      'Content-Length': csv.length,
    });
    
    res.send(csv);
  }
}
