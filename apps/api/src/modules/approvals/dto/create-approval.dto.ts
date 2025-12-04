import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

/**
 * DTO para criação de uma solicitação de aprovação
 * 
 * Tipos de solicitação:
 * - USER_REGISTRATION: registro de novo usuário
 * - QUESTION_EDIT: edição de questão existente
 * - GROUP_CREATION: criação de grupo de pesquisa
 * - SURVEY_CREATION: criação de pesquisa de campo
 * - PROJECT_CREATION: criação de projeto
 * - INSTITUTION_CREATION: criação de instituição
 */
export class CreateApprovalDto {
  @ApiProperty({
    description: 'Tipo da solicitação de aprovação',
    example: 'USER_REGISTRATION',
    enum: [
      'USER_REGISTRATION',
      'QUESTION_EDIT',
      'GROUP_CREATION',
      'SURVEY_CREATION',
      'PROJECT_CREATION',
      'INSTITUTION_CREATION',
    ],
  })
  @IsString()
  @IsNotEmpty({ message: 'Tipo da solicitação é obrigatório' })
  @IsEnum(
    [
      'USER_REGISTRATION',
      'QUESTION_EDIT',
      'GROUP_CREATION',
      'SURVEY_CREATION',
      'PROJECT_CREATION',
      'INSTITUTION_CREATION',
    ],
    { message: 'Tipo de solicitação inválido' },
  )
  type: string;

  @ApiProperty({
    description: 'ID do pesquisador que está solicitando a aprovação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do solicitante deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do solicitante é obrigatório' })
  requesterId: string;

  @ApiPropertyOptional({
    description: 'ID da questão relacionada (para QUESTION_EDIT)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID da questão deve ser um UUID válido' })
  @IsOptional()
  questionId?: string;

  @ApiPropertyOptional({
    description: 'Dados da solicitação em formato JSON',
    example: {
      oldValue: 'Qual é o seu nome?',
      newValue: 'Qual é o seu nome completo?',
      reason: 'Necessidade de informação mais detalhada',
    },
  })
  @IsObject({ message: 'Dados da solicitação devem ser um objeto JSON válido' })
  @IsOptional()
  requestData?: any;

  @ApiPropertyOptional({
    description: 'Comentários adicionais sobre a solicitação',
    example: 'Esta alteração é necessária para melhorar a qualidade dos dados coletados',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Comentários devem ter no máximo 1000 caracteres' })
  comments?: string;
}
