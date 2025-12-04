import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { QuestionType, QuestionCategory, QuestionScope } from '@prisma/client';

interface ParsedQuestion {
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  scope: QuestionScope;
  isRequired?: boolean;
  minValue?: number;
  maxValue?: number;
  validationRegex?: string;
  helpText?: string;
  options?: any;
  likertMin?: number;
  likertMax?: number;
  likertLabels?: any;
  objective?: string;
  targetAudience?: string;
  origin?: string;
  researchGroupId?: string;
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  /**
   * Parseia arquivo Excel (.xlsx, .xls)
   * Suporta múltiplas planilhas - usa a primeira
   * Ignora linhas vazias
   */
  async parseExcel(buffer: Buffer): Promise<ParsedQuestion[]> {
    this.logger.log('Parseando arquivo Excel');

    try {
      // Validar se buffer não está vazio
      if (!buffer || buffer.length === 0) {
        throw new BadRequestException('Arquivo Excel vazio ou inválido');
      }

      // Ler workbook
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: true, // Converte datas automaticamente
        cellNF: false,   // Não preserva formato numérico original
        cellText: false  // Usa valor calculado, não texto
      });

      // Verificar se há planilhas
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException('Arquivo Excel não contém planilhas');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Verificar se planilha tem dados
      if (!worksheet || !worksheet['!ref']) {
        throw new BadRequestException('Planilha está vazia');
      }

      // Converter para JSON com opções
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', // Valor padrão para células vazias
        blankrows: false, // Ignorar linhas completamente vazias
      });

      if (rawData.length === 0) {
        throw new BadRequestException('Nenhum dado encontrado no arquivo Excel');
      }

      this.logger.log(`${rawData.length} linhas encontradas no Excel (planilha: ${sheetName})`);

      // Mapear para formato de questão com coleta de erros
      const questions: ParsedQuestion[] = [];
      const errors: string[] = [];

      for (let index = 0; index < rawData.length; index++) {
        const row = rawData[index];
        const lineNumber = index + 2; // +2 porque linha 1 é cabeçalho

        // Ignorar linhas vazias (todas as células vazias)
        if (this.isEmptyRow(row)) {
          this.logger.debug(`Linha ${lineNumber} vazia, ignorando`);
          continue;
        }

        try {
          const question = this.mapRowToQuestion(row, lineNumber);
          questions.push(question);
        } catch (error) {
          const errorMsg = `Linha ${lineNumber}: ${error.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Se houver erros, retornar informações detalhadas
      if (errors.length > 0) {
        throw new BadRequestException({
          message: `${errors.length} erro(s) encontrado(s) ao processar Excel`,
          errors,
          successCount: questions.length,
          totalRows: rawData.length,
        });
      }

      if (questions.length === 0) {
        throw new BadRequestException('Nenhuma questão válida encontrada no arquivo');
      }

      this.logger.log(`${questions.length} questões parseadas com sucesso do Excel`);
      return questions;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erro ao parsear Excel: ${error.message}`);
      throw new BadRequestException(`Erro ao processar arquivo Excel: ${error.message}`);
    }
  }

  /**
   * Parseia arquivo CSV
   * Suporta diferentes delimitadores (vírgula, ponto-e-vírgula)
   * Detecta automaticamente encoding (UTF-8, Latin1)
   */
  async parseCsv(buffer: Buffer): Promise<ParsedQuestion[]> {
    this.logger.log('Parseando arquivo CSV');

    // Validar se buffer não está vazio
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Arquivo CSV vazio ou inválido');
    }

    return new Promise((resolve, reject) => {
      const questions: ParsedQuestion[] = [];
      const errors: string[] = [];
      let lineNumber = 1; // Linha 1 é o cabeçalho
      let totalRows = 0;

      try {
        // Tentar detectar encoding (UTF-8 primeiro, depois Latin1)
        let csvContent: string;
        try {
          csvContent = buffer.toString('utf-8');
          // Verificar se há caracteres inválidos UTF-8
          if (csvContent.includes('�')) {
            csvContent = buffer.toString('latin1');
            this.logger.log('Detectado encoding Latin1');
          } else {
            this.logger.log('Usando encoding UTF-8');
          }
        } catch {
          csvContent = buffer.toString('latin1');
          this.logger.log('Fallback para encoding Latin1');
        }

        // Detectar delimitador (vírgula ou ponto-e-vírgula)
        const delimiter = this.detectCsvDelimiter(csvContent);
        this.logger.log(`Delimitador detectado: "${delimiter}"`);

        const stream = Readable.from(csvContent);

        stream
          .pipe(csvParser({
            separator: delimiter,
            mapHeaders: ({ header }) => header.trim(), // Remove espaços dos nomes de colunas
            mapValues: ({ value }) => value.trim(), // Remove espaços dos valores
            skipEmptyLines: true, // Ignora linhas vazias
          }))
          .on('data', (row) => {
            lineNumber++;
            totalRows++;

            // Ignorar linhas vazias
            if (this.isEmptyRow(row)) {
              this.logger.debug(`Linha ${lineNumber} vazia, ignorando`);
              return;
            }

            try {
              const question = this.mapRowToQuestion(row, lineNumber);
              if (question) {
                questions.push(question);
              }
            } catch (error) {
              errors.push(`Linha ${lineNumber}: ${error.message}`);
            }
          })
          .on('end', () => {
            this.logger.log(`${questions.length} questões parseadas de ${totalRows} linhas do CSV`);
            
            if (errors.length > 0) {
              this.logger.warn(`${errors.length} erro(s) encontrado(s)`);
              reject(new BadRequestException({
                message: `${errors.length} erro(s) ao processar CSV`,
                errors,
                successCount: questions.length,
                totalRows,
              }));
            } else if (questions.length === 0) {
              reject(new BadRequestException('Nenhuma questão válida encontrada no arquivo CSV'));
            } else {
              resolve(questions);
            }
          })
          .on('error', (error) => {
            this.logger.error(`Erro ao parsear CSV: ${error.message}`);
            reject(new BadRequestException(`Erro ao processar arquivo CSV: ${error.message}`));
          });
      } catch (error) {
        this.logger.error(`Erro ao inicializar parser CSV: ${error.message}`);
        reject(new BadRequestException(`Erro ao processar arquivo CSV: ${error.message}`));
      }
    });
  }

  /**
   * Detecta o delimitador usado no CSV (vírgula ou ponto-e-vírgula)
   */
  private detectCsvDelimiter(csvContent: string): string {
    const firstLine = csvContent.split('\n')[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    // Se tem mais ponto-e-vírgula que vírgula, usar ponto-e-vírgula
    return semicolonCount > commaCount ? ';' : ',';
  }

  /**
   * Verifica se uma linha está vazia (todos os campos vazios)
   */
  private isEmptyRow(row: any): boolean {
    if (!row || typeof row !== 'object') {
      return true;
    }

    return Object.values(row).every(value => {
      if (value === null || value === undefined) {
        return true;
      }
      return String(value).trim() === '';
    });
  }

  /**
   * Mapeia uma linha do arquivo para o formato de questão
   * Formato esperado das colunas:
   * - text (obrigatório)
   * - type (obrigatório)
   * - category (obrigatório)
   * - scope (obrigatório)
   * - isRequired (opcional, true/false/sim/não/1/0)
   * - minValue (opcional, numérico)
   * - maxValue (opcional, numérico)
   * - helpText (opcional)
   * - options (opcional, JSON string ou array separado por pipe |)
   * - likertMin (opcional, numérico)
   * - likertMax (opcional, numérico)
   * - likertLabels (opcional, JSON string)
   * - objective (opcional)
   * - targetAudience (opcional)
   * - origin (opcional)
   * - validationRegex (opcional)
   */
  private mapRowToQuestion(row: any, lineNumber: number): ParsedQuestion {
    // Validações básicas de campos obrigatórios
    const missingFields: string[] = [];

    if (!row.text || String(row.text).trim() === '') {
      missingFields.push('text');
    }

    if (!row.type || String(row.type).trim() === '') {
      missingFields.push('type');
    }

    if (!row.category || String(row.category).trim() === '') {
      missingFields.push('category');
    }

    if (!row.scope || String(row.scope).trim() === '') {
      missingFields.push('scope');
    }

    if (missingFields.length > 0) {
      throw new Error(`Campo(s) obrigatório(s) ausente(s): ${missingFields.join(', ')}`);
    }

    // Validar comprimento do texto da questão
    const text = String(row.text).trim();
    if (text.length < 10) {
      throw new Error('Texto da questão deve ter no mínimo 10 caracteres');
    }
    if (text.length > 1000) {
      throw new Error('Texto da questão deve ter no máximo 1000 caracteres');
    }

    // Validar enum values com mensagens mais claras
    let type: QuestionType;
    let category: QuestionCategory;
    let scope: QuestionScope;

    try {
      type = this.validateQuestionType(String(row.type).trim());
    } catch (error) {
      throw new Error(`Tipo inválido: ${error.message}`);
    }

    try {
      category = this.validateQuestionCategory(String(row.category).trim());
    } catch (error) {
      throw new Error(`Categoria inválida: ${error.message}`);
    }

    try {
      scope = this.validateQuestionScope(String(row.scope).trim());
    } catch (error) {
      throw new Error(`Escopo inválido: ${error.message}`);
    }

    const question: ParsedQuestion = {
      text,
      type,
      category,
      scope,
    };

    // Campos opcionais com validações aprimoradas
    if (row.isRequired !== undefined && String(row.isRequired).trim() !== '') {
      try {
        question.isRequired = this.parseBoolean(row.isRequired);
      } catch (error) {
        throw new Error(`isRequired inválido: ${error.message}`);
      }
    }

    if (row.minValue !== undefined && String(row.minValue).trim() !== '') {
      const minValue = parseFloat(String(row.minValue));
      if (isNaN(minValue)) {
        throw new Error(`minValue deve ser numérico, recebido: "${row.minValue}"`);
      }
      question.minValue = minValue;
    }

    if (row.maxValue !== undefined && String(row.maxValue).trim() !== '') {
      const maxValue = parseFloat(String(row.maxValue));
      if (isNaN(maxValue)) {
        throw new Error(`maxValue deve ser numérico, recebido: "${row.maxValue}"`);
      }
      question.maxValue = maxValue;
    }

    if (row.helpText && String(row.helpText).trim() !== '') {
      const helpText = String(row.helpText).trim();
      if (helpText.length > 500) {
        throw new Error('helpText deve ter no máximo 500 caracteres');
      }
      question.helpText = helpText;
    }

    if (row.objective && String(row.objective).trim() !== '') {
      const objective = String(row.objective).trim();
      if (objective.length > 500) {
        throw new Error('objective deve ter no máximo 500 caracteres');
      }
      question.objective = objective;
    }

    if (row.targetAudience && String(row.targetAudience).trim() !== '') {
      const targetAudience = String(row.targetAudience).trim();
      if (targetAudience.length > 200) {
        throw new Error('targetAudience deve ter no máximo 200 caracteres');
      }
      question.targetAudience = targetAudience;
    }

    if (row.origin && String(row.origin).trim() !== '') {
      question.origin = String(row.origin).trim();
    }

    if (row.validationRegex && String(row.validationRegex).trim() !== '') {
      const regex = String(row.validationRegex).trim();
      // Validar se é uma regex válida
      try {
        new RegExp(regex);
        question.validationRegex = regex;
      } catch (error) {
        throw new Error(`validationRegex inválida: ${error.message}`);
      }
    }

    // Parse JSON fields com suporte a formatos alternativos
    if (row.options && String(row.options).trim() !== '') {
      try {
        question.options = this.parseOptionsField(String(row.options));
      } catch (error) {
        throw new Error(`Campo "options" inválido: ${error.message}`);
      }
    }

    if (row.likertMin !== undefined && String(row.likertMin).trim() !== '') {
      const likertMin = parseInt(String(row.likertMin), 10);
      if (isNaN(likertMin)) {
        throw new Error(`likertMin deve ser numérico inteiro, recebido: "${row.likertMin}"`);
      }
      question.likertMin = likertMin;
    }

    if (row.likertMax !== undefined && String(row.likertMax).trim() !== '') {
      const likertMax = parseInt(String(row.likertMax), 10);
      if (isNaN(likertMax)) {
        throw new Error(`likertMax deve ser numérico inteiro, recebido: "${row.likertMax}"`);
      }
      question.likertMax = likertMax;
    }

    if (row.likertLabels && String(row.likertLabels).trim() !== '') {
      try {
        const likertLabels = String(row.likertLabels).trim();
        question.likertLabels = typeof likertLabels === 'string'
          ? JSON.parse(likertLabels)
          : likertLabels;
      } catch (error) {
        throw new Error(`Campo "likertLabels" deve ser JSON válido: ${error.message}`);
      }
    }

    // Validações específicas por tipo
    try {
      this.validateQuestionFields(question);
    } catch (error) {
      throw new Error(`Validação de campos: ${error.message}`);
    }

    return question;
  }

  /**
   * Parse campo options com suporte a múltiplos formatos:
   * 1. JSON string: '{"choices":["A","B","C"]}'
   * 2. Array separado por pipe: 'A|B|C'
   * 3. Array JSON: '["A","B","C"]'
   */
  private parseOptionsField(optionsStr: string): any {
    const trimmed = optionsStr.trim();

    // Formato 1: JSON object completo
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed.choices || !Array.isArray(parsed.choices)) {
          throw new Error('JSON deve conter propriedade "choices" como array');
        }
        return parsed;
      } catch (error) {
        throw new Error(`JSON inválido: ${error.message}`);
      }
    }

    // Formato 2: Array JSON direto
    if (trimmed.startsWith('[')) {
      try {
        const choices = JSON.parse(trimmed);
        if (!Array.isArray(choices)) {
          throw new Error('Deve ser um array JSON');
        }
        return { choices };
      } catch (error) {
        throw new Error(`Array JSON inválido: ${error.message}`);
      }
    }

    // Formato 3: String separada por pipe
    if (trimmed.includes('|')) {
      const choices = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
      if (choices.length === 0) {
        throw new Error('Nenhuma opção válida encontrada');
      }
      return { choices };
    }

    // Se não é nenhum formato conhecido, tentar como JSON
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return { choices: parsed };
      }
      return parsed;
    } catch {
      throw new Error('Formato não reconhecido. Use JSON {"choices":["A","B"]} ou A|B|C');
    }
  }

  /**
   * Valida tipo de questão
   */
  private validateQuestionType(type: string): QuestionType {
    const validTypes = Object.values(QuestionType);
    const upperType = type.toUpperCase().replace(/ /g, '_');
    
    if (!validTypes.includes(upperType as QuestionType)) {
      throw new Error(
        `Tipo de questão inválido: "${type}". Valores válidos: ${validTypes.join(', ')}`
      );
    }

    return upperType as QuestionType;
  }

  /**
   * Valida categoria de questão
   */
  private validateQuestionCategory(category: string): QuestionCategory {
    const validCategories = Object.values(QuestionCategory);
    const upperCategory = category.toUpperCase().replace(/ /g, '_');
    
    if (!validCategories.includes(upperCategory as QuestionCategory)) {
      throw new Error(
        `Categoria inválida: "${category}". Valores válidos: ${validCategories.join(', ')}`
      );
    }

    return upperCategory as QuestionCategory;
  }

  /**
   * Valida escopo de questão
   */
  private validateQuestionScope(scope: string): QuestionScope {
    const validScopes = Object.values(QuestionScope);
    const upperScope = scope.toUpperCase().replace(/ /g, '_');
    
    if (!validScopes.includes(upperScope as QuestionScope)) {
      throw new Error(
        `Escopo inválido: "${scope}". Valores válidos: ${validScopes.join(', ')}`
      );
    }

    return upperScope as QuestionScope;
  }

  /**
   * Valida campos específicos por tipo de questão
   */
  private validateQuestionFields(question: ParsedQuestion): void {
    switch (question.type) {
      case QuestionType.NUMERICA:
        // Validar range de valores
        if (question.minValue !== undefined && question.maxValue !== undefined) {
          if (question.minValue > question.maxValue) {
            throw new Error(
              `minValue (${question.minValue}) não pode ser maior que maxValue (${question.maxValue})`
            );
          }
        }

        // Validar se minValue/maxValue fazem sentido
        if (question.minValue !== undefined && !isFinite(question.minValue)) {
          throw new Error('minValue deve ser um número finito');
        }
        if (question.maxValue !== undefined && !isFinite(question.maxValue)) {
          throw new Error('maxValue deve ser um número finito');
        }
        break;

      case QuestionType.MULTIPLA_ESCOLHA:
        if (!question.options || !question.options.choices) {
          throw new Error(
            'Questões de múltipla escolha requerem campo "options" com array "choices"'
          );
        }

        if (!Array.isArray(question.options.choices)) {
          throw new Error('Campo "options.choices" deve ser um array');
        }

        if (question.options.choices.length === 0) {
          throw new Error('Múltipla escolha deve ter pelo menos uma opção');
        }

        if (question.options.choices.length < 2) {
          throw new Error('Múltipla escolha deve ter pelo menos 2 opções');
        }

        if (question.options.choices.length > 20) {
          throw new Error('Múltipla escolha pode ter no máximo 20 opções');
        }

        // Validar que não há opções duplicadas
        const uniqueChoices = new Set(question.options.choices.map((c: any) => String(c).toLowerCase().trim()));
        if (uniqueChoices.size !== question.options.choices.length) {
          throw new Error('Opções duplicadas detectadas em "options.choices"');
        }

        // Validar que opções não são vazias
        const hasEmptyChoice = question.options.choices.some((c: any) => !c || String(c).trim() === '');
        if (hasEmptyChoice) {
          throw new Error('Todas as opções devem ter texto não vazio');
        }
        break;

      case QuestionType.ESCALA_LIKERT:
        if (question.likertMin === undefined || question.likertMax === undefined) {
          throw new Error('Questões Likert requerem likertMin e likertMax');
        }

        if (question.likertMin >= question.likertMax) {
          throw new Error(
            `likertMin (${question.likertMin}) deve ser menor que likertMax (${question.likertMax})`
          );
        }

        // Validar range razoável para escala Likert
        const range = question.likertMax - question.likertMin;
        if (range < 1) {
          throw new Error('Escala Likert deve ter pelo menos 2 pontos (range >= 1)');
        }
        if (range > 10) {
          throw new Error('Escala Likert pode ter no máximo 11 pontos (range <= 10)');
        }

        // Validar likertLabels se fornecido
        if (question.likertLabels) {
          if (typeof question.likertLabels !== 'object') {
            throw new Error('likertLabels deve ser um objeto JSON');
          }

          // Verificar se tem labels para os pontos extremos
          const hasMinLabel = String(question.likertMin) in question.likertLabels;
          const hasMaxLabel = String(question.likertMax) in question.likertLabels;

          if (!hasMinLabel || !hasMaxLabel) {
            throw new Error(
              `likertLabels deve conter labels para os valores mínimo (${question.likertMin}) e máximo (${question.likertMax})`
            );
          }
        }
        break;

      case QuestionType.SIM_NAO:
        // Validar que não tem campos incompatíveis
        if (question.options) {
          throw new Error('Questões Sim/Não não devem ter campo "options"');
        }
        if (question.likertMin !== undefined || question.likertMax !== undefined) {
          throw new Error('Questões Sim/Não não devem ter campos Likert');
        }
        break;

      case QuestionType.TEXTO_ABERTO:
        // Validar validationRegex se fornecido
        if (question.validationRegex) {
          try {
            new RegExp(question.validationRegex);
          } catch (error) {
            throw new Error(`validationRegex inválida: ${error.message}`);
          }
        }
        break;

      case QuestionType.DATA:
        // Validar range de datas se fornecido
        if (question.minValue !== undefined || question.maxValue !== undefined) {
          // Para datas, minValue/maxValue podem ser timestamps ou strings de data
          // Validar formato se necessário
        }
        break;

      case QuestionType.HORA:
        // Validações específicas para hora se necessário
        break;
    }
  }

  /**
   * Converte string para boolean
   * Suporta múltiplos formatos: true/false, 1/0, sim/não, yes/no, s/n, y/n
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    const strValue = String(value).toLowerCase().trim();
    
    // Valores verdadeiros
    const trueValues = ['true', '1', 'sim', 'yes', 's', 'y', 'verdadeiro'];
    if (trueValues.includes(strValue)) {
      return true;
    }

    // Valores falsos
    const falseValues = ['false', '0', 'não', 'nao', 'no', 'n', 'falso'];
    if (falseValues.includes(strValue)) {
      return false;
    }

    // Se não é nenhum valor conhecido, lançar erro
    throw new Error(
      `Valor booleano inválido: "${value}". Use: true/false, 1/0, sim/não, yes/no`
    );
  }

  /**
   * Gera template Excel para download com exemplos de todos os tipos
   */
  generateExcelTemplate(): Buffer {
    const templateData = [
      {
        text: 'Qual é a sua idade?',
        type: 'NUMERICA',
        category: 'DEMOGRAFICA',
        scope: 'LOCAL',
        isRequired: 'true',
        minValue: 0,
        maxValue: 120,
        helpText: 'Informe sua idade em anos completos',
        validationRegex: '',
        options: '',
        likertMin: '',
        likertMax: '',
        likertLabels: '',
        objective: 'Coletar dados demográficos básicos',
        targetAudience: 'Todos os participantes da pesquisa',
        origin: 'IMPORTED',
      },
      {
        text: 'Qual o seu nível de escolaridade?',
        type: 'MULTIPLA_ESCOLHA',
        category: 'DEMOGRAFICA',
        scope: 'NACIONAL',
        isRequired: 'true',
        minValue: '',
        maxValue: '',
        helpText: 'Selecione o nível mais alto completo',
        validationRegex: '',
        options: '{"choices":["Fundamental","Médio","Superior","Pós-graduação","Mestrado","Doutorado"]}',
        likertMin: '',
        likertMax: '',
        likertLabels: '',
        objective: 'Identificar perfil educacional dos participantes',
        targetAudience: 'Adultos',
        origin: 'IMPORTED',
      },
      {
        text: 'Como você avalia o atendimento recebido?',
        type: 'ESCALA_LIKERT',
        category: 'COMPORTAMENTAL',
        scope: 'LOCAL',
        isRequired: 'true',
        minValue: '',
        maxValue: '',
        helpText: 'Avalie de 1 a 5',
        validationRegex: '',
        options: '',
        likertMin: 1,
        likertMax: 5,
        likertLabels: '{"1":"Muito insatisfeito","2":"Insatisfeito","3":"Neutro","4":"Satisfeito","5":"Muito satisfeito"}',
        objective: 'Medir satisfação com o atendimento',
        targetAudience: 'Usuários do serviço',
        origin: 'IMPORTED',
      },
      {
        text: 'Você recomendaria nossos serviços?',
        type: 'SIM_NAO',
        category: 'COMPORTAMENTAL',
        scope: 'LOCAL',
        isRequired: 'true',
        minValue: '',
        maxValue: '',
        helpText: '',
        validationRegex: '',
        options: '',
        likertMin: '',
        likertMax: '',
        likertLabels: '',
        objective: 'Avaliar intenção de recomendação',
        targetAudience: 'Clientes',
        origin: 'IMPORTED',
      },
      {
        text: 'Deixe seus comentários e sugestões',
        type: 'TEXTO_ABERTO',
        category: 'QUALITATIVA',
        scope: 'LOCAL',
        isRequired: 'false',
        minValue: '',
        maxValue: '',
        helpText: 'Escreva livremente suas impressões',
        validationRegex: '',
        options: '',
        likertMin: '',
        likertMax: '',
        likertLabels: '',
        objective: 'Coletar feedback qualitativo',
        targetAudience: 'Todos',
        origin: 'IMPORTED',
      },
      {
        text: 'Qual é a sua data de nascimento?',
        type: 'DATA',
        category: 'DEMOGRAFICA',
        scope: 'NACIONAL',
        isRequired: 'true',
        minValue: '',
        maxValue: '',
        helpText: 'Formato: DD/MM/AAAA',
        validationRegex: '',
        options: '',
        likertMin: '',
        likertMax: '',
        likertLabels: '',
        objective: 'Calcular idade exata',
        targetAudience: 'Todos',
        origin: 'IMPORTED',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Ajustar largura das colunas para melhor visualização
    const columnWidths = [
      { wch: 50 },  // text
      { wch: 20 },  // type
      { wch: 15 },  // category
      { wch: 15 },  // scope
      { wch: 12 },  // isRequired
      { wch: 10 },  // minValue
      { wch: 10 },  // maxValue
      { wch: 40 },  // helpText
      { wch: 15 },  // validationRegex
      { wch: 60 },  // options
      { wch: 10 },  // likertMin
      { wch: 10 },  // likertMax
      { wch: 80 },  // likertLabels
      { wch: 40 },  // objective
      { wch: 30 },  // targetAudience
      { wch: 15 },  // origin
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questões');

    // Adicionar planilha de instruções
    const instructionsData = [
      ['INSTRUÇÕES PARA PREENCHIMENTO'],
      [''],
      ['CAMPOS OBRIGATÓRIOS:'],
      ['text', 'Texto da questão (10-1000 caracteres)'],
      ['type', 'NUMERICA, MULTIPLA_ESCOLHA, ESCALA_LIKERT, SIM_NAO, TEXTO_ABERTO, DATA, HORA'],
      ['category', 'DEMOGRAFICA, COMPORTAMENTAL, ATITUDINAL, CONHECIMENTO, SATISFACAO, QUALITATIVA'],
      ['scope', 'LOCAL, INSTITUCIONAL, REGIONAL, NACIONAL, INTERNACIONAL, TEMATICO, OUTRO'],
      [''],
      ['CAMPOS OPCIONAIS:'],
      ['isRequired', 'true/false, 1/0, sim/não'],
      ['minValue', 'Número mínimo (para NUMERICA)'],
      ['maxValue', 'Número máximo (para NUMERICA)'],
      ['helpText', 'Texto de ajuda (máx 500 caracteres)'],
      ['options', 'JSON ou formato: Opção1|Opção2|Opção3 (para MULTIPLA_ESCOLHA)'],
      ['likertMin', 'Valor mínimo da escala (para ESCALA_LIKERT)'],
      ['likertMax', 'Valor máximo da escala (para ESCALA_LIKERT)'],
      ['likertLabels', 'JSON com labels: {"1":"Label1","5":"Label5"}'],
      ['objective', 'Objetivo da questão (máx 500 caracteres)'],
      ['targetAudience', 'Público-alvo (máx 200 caracteres)'],
      ['origin', 'Origem: CREATED, IMPORTED, TEMPLATE'],
      ['validationRegex', 'Regex para validação (para TEXTO_ABERTO)'],
      [''],
      ['FORMATOS ACEITOS PARA OPTIONS:'],
      ['1. JSON completo', '{"choices":["Opção A","Opção B","Opção C"]}'],
      ['2. Array JSON', '["Opção A","Opção B","Opção C"]'],
      ['3. Pipe separado', 'Opção A|Opção B|Opção C'],
      [''],
      ['DICAS:'],
      ['- Remova linhas vazias antes de importar'],
      ['- Use aspas duplas em JSON'],
      ['- Múltipla escolha: mínimo 2, máximo 20 opções'],
      ['- Escala Likert: range entre 1 e 10 pontos'],
      ['- Validação automática detecta erros e informa a linha'],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 30 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Gera template CSV para download com exemplos de todos os tipos
   */
  generateCsvTemplate(): string {
    const headers = [
      'text',
      'type',
      'category',
      'scope',
      'isRequired',
      'minValue',
      'maxValue',
      'helpText',
      'validationRegex',
      'options',
      'likertMin',
      'likertMax',
      'likertLabels',
      'objective',
      'targetAudience',
      'origin',
    ];

    const examples = [
      [
        'Qual é a sua idade?',
        'NUMERICA',
        'DEMOGRAFICA',
        'LOCAL',
        'true',
        '0',
        '120',
        'Informe sua idade em anos completos',
        '',
        '',
        '',
        '',
        '',
        'Coletar dados demográficos básicos',
        'Todos os participantes da pesquisa',
        'IMPORTED',
      ],
      [
        'Qual o seu nível de escolaridade?',
        'MULTIPLA_ESCOLHA',
        'DEMOGRAFICA',
        'NACIONAL',
        'true',
        '',
        '',
        'Selecione o nível mais alto completo',
        '',
        'Fundamental|Médio|Superior|Pós-graduação',
        '',
        '',
        '',
        'Identificar perfil educacional dos participantes',
        'Adultos',
        'IMPORTED',
      ],
      [
        'Como você avalia o atendimento recebido?',
        'ESCALA_LIKERT',
        'COMPORTAMENTAL',
        'LOCAL',
        'true',
        '',
        '',
        'Avalie de 1 a 5',
        '',
        '',
        '1',
        '5',
        '{"1":"Muito insatisfeito","3":"Neutro","5":"Muito satisfeito"}',
        'Medir satisfação com o atendimento',
        'Usuários do serviço',
        'IMPORTED',
      ],
      [
        'Você recomendaria nossos serviços?',
        'SIM_NAO',
        'COMPORTAMENTAL',
        'LOCAL',
        'true',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Avaliar intenção de recomendação',
        'Clientes',
        'IMPORTED',
      ],
      [
        'Deixe seus comentários e sugestões',
        'TEXTO_ABERTO',
        'QUALITATIVA',
        'LOCAL',
        'false',
        '',
        '',
        'Escreva livremente suas impressões',
        '',
        '',
        '',
        '',
        '',
        'Coletar feedback qualitativo',
        'Todos',
        'IMPORTED',
      ],
    ];

    // Escapar células que contêm vírgulas ou aspas
    const escapeCsvCell = (cell: string): string => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };

    const csv = [
      headers.join(','),
      ...examples.map(row => row.map(escapeCsvCell).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Valida formato e tamanho de arquivo antes do upload
   */
  validateFileUpload(
    file: Express.Multer.File,
    allowedExtensions: string[],
    maxSizeInMB: number = 10
  ): void {
    // Validar se arquivo foi enviado
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validar tamanho
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB, recebido: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    if (file.size === 0) {
      throw new BadRequestException('Arquivo está vazio');
    }

    // Validar extensão
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Extensão de arquivo inválida. Permitidas: ${allowedExtensions.join(', ')}`
      );
    }

    // Validar mimetype (verificação adicional)
    const validMimeTypes: { [key: string]: string[] } = {
      xlsx: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      xls: ['application/vnd.ms-excel'],
      csv: ['text/csv', 'text/plain', 'application/csv'],
    };

    const expectedMimeTypes = validMimeTypes[fileExtension] || [];
    if (expectedMimeTypes.length > 0 && !expectedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(
        `Mimetype inesperado: ${file.mimetype} para extensão ${fileExtension}`
      );
      // Não bloquear, apenas alertar, pois diferentes sistemas podem reportar mimetypes diferentes
    }

    this.logger.log(
      `Arquivo validado: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB, ${file.mimetype})`
    );
  }
}
