import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsDateString,
  ValidateIf,
} from 'class-validator';

/**
 * DTO para criação de uma pesquisa de campo
 * 
 * Uma pesquisa de campo é uma atividade de coleta de dados
 * realizada por um grupo de pesquisa, que pode ter:
 * - Título e descrição
 * - Local onde será realizada
 * - Período (data inicial e final)
 * - Participantes (pesquisadores)
 * - Questionários associados
 */
export class CreateFieldSurveyDto {
  @ApiProperty({
    description: 'Título da pesquisa de campo',
    example: 'Pesquisa de Satisfação - Ambulatório de Cardiologia',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(5, { message: 'Título deve ter no mínimo 5 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da pesquisa de campo',
    example: 'Pesquisa para avaliar a satisfação dos pacientes com o atendimento no ambulatório de cardiologia',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Local onde a pesquisa será realizada',
    example: 'Hospital Central - Ambulatório de Cardiologia - 3º andar',
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'Local deve ter no máximo 300 caracteres' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Data de início da pesquisa de campo',
    example: '2024-12-15T08:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data de término da pesquisa de campo (deve ser posterior à data de início)',
    example: '2024-12-20T18:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @ValidateIf((o) => o.startDate !== undefined)
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'ID do grupo de pesquisa responsável pela pesquisa de campo',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do grupo de pesquisa deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do grupo de pesquisa é obrigatório' })
  researchGroupId: string;
}
