import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApplicationMethod, SurveyStatus } from '../entities/survey.entity';

export class CreateSurveyDto {
  @ApiProperty({
    description: 'Título da pesquisa operacional',
    example: 'Pesquisa de Campo - Zona Rural 2024',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Descrição da pesquisa',
    example: 'Pesquisa sobre condições de vida na zona rural',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Objetivos da pesquisa',
    example: 'Avaliar as condições socioeconômicas da população rural',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  objectives?: string;

  @ApiProperty({
    description: 'Público-alvo da pesquisa',
    example: 'Agricultores familiares da região norte',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  targetAudience?: string;

  @ApiProperty({
    description: 'Localizações onde a pesquisa será aplicada',
    example: ['Manaus', 'Belém', 'Rio Branco'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  locations?: string[];

  @ApiProperty({
    description: 'Data de início da pesquisa',
    example: '2024-01-15T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Data de término da pesquisa',
    example: '2024-06-30T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Método de aplicação da pesquisa',
    enum: ApplicationMethod,
    example: ApplicationMethod.INTERVIEW,
  })
  @IsEnum(ApplicationMethod)
  @IsNotEmpty()
  applicationMethod: ApplicationMethod;

  @ApiProperty({
    description: 'Status da pesquisa',
    enum: SurveyStatus,
    example: SurveyStatus.PLANNING,
    required: false,
  })
  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @ApiProperty({
    description: 'ID do questionário utilizado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  questionnaireId: string;

  @ApiProperty({
    description: 'ID do pesquisador responsável',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  responsibleId: string;

  @ApiProperty({
    description: 'Metadados adicionais (JSON)',
    example: { budget: 10000, team_size: 5 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
