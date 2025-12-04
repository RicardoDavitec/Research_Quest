import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { QuestionnaireType } from '@prisma/client';

/**
 * DTO para criação de um questionário
 * 
 * Um questionário pode ser:
 * - Independente (sem fieldSurveyId)
 * - Associado a uma pesquisa de campo (com fieldSurveyId)
 * 
 * Tipos de questionário:
 * - IMPRESSO: questionário em papel
 * - ENTREVISTA_GRAVADA: entrevista com gravação de áudio
 * - ENTREVISTA_FILMADA: entrevista com gravação de vídeo
 * - DIGITAL: questionário digital offline
 * - ONLINE: questionário online (padrão)
 */
export class CreateQuestionnaireDto {
  @ApiProperty({
    description: 'Título do questionário',
    example: 'Questionário de Satisfação com Atendimento',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(5, { message: 'Título deve ter no mínimo 5 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do questionário',
    example: 'Este questionário avalia a satisfação dos pacientes com o atendimento recebido',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Tipo do questionário',
    enum: QuestionnaireType,
    default: QuestionnaireType.ONLINE,
    example: QuestionnaireType.ONLINE,
  })
  @IsEnum(QuestionnaireType, { message: 'Tipo de questionário inválido' })
  @IsOptional()
  type?: QuestionnaireType;

  @ApiPropertyOptional({
    description: 'Local onde o questionário será aplicado',
    example: 'Ambulatório de Cardiologia - Hospital Central',
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'Local de aplicação deve ter no máximo 300 caracteres' })
  applicationLocation?: string;

  @ApiPropertyOptional({
    description: 'Data prevista para aplicação do questionário',
    example: '2024-12-15T14:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Data de aplicação deve ser uma data válida' })
  @IsOptional()
  applicationDate?: string;

  @ApiPropertyOptional({
    description: 'Duração estimada em minutos para responder o questionário',
    example: 30,
    minimum: 1,
    maximum: 480,
  })
  @IsInt({ message: 'Duração estimada deve ser um número inteiro' })
  @Min(1, { message: 'Duração estimada deve ser no mínimo 1 minuto' })
  @Max(480, { message: 'Duração estimada deve ser no máximo 480 minutos (8 horas)' })
  @IsOptional()
  estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'ID da pesquisa de campo associada (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID da pesquisa de campo deve ser um UUID válido' })
  @IsOptional()
  fieldSurveyId?: string;
}
