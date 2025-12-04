import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para criação de uma notificação
 * 
 * Tipos de notificação:
 * - APPROVAL_REQUEST: solicitação de aprovação
 * - APPROVAL_APPROVED: aprovação aprovada
 * - APPROVAL_REJECTED: aprovação rejeitada
 * - QUESTION_SIMILARITY: questão similar encontrada
 * - USER_REGISTERED: novo usuário registrado
 * - PROJECT_CREATED: novo projeto criado
 * - GROUP_CREATED: novo grupo criado
 * - SURVEY_CREATED: nova pesquisa de campo criada
 * - MEMBER_ADDED: membro adicionado
 * - MEMBER_REMOVED: membro removido
 * - SYSTEM_ALERT: alerta do sistema
 */
export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tipo da notificação',
    example: 'APPROVAL_REQUEST',
    enum: [
      'APPROVAL_REQUEST',
      'APPROVAL_APPROVED',
      'APPROVAL_REJECTED',
      'QUESTION_SIMILARITY',
      'USER_REGISTERED',
      'PROJECT_CREATED',
      'GROUP_CREATED',
      'SURVEY_CREATED',
      'MEMBER_ADDED',
      'MEMBER_REMOVED',
      'SYSTEM_ALERT',
    ],
  })
  @IsString()
  @IsNotEmpty({ message: 'Tipo da notificação é obrigatório' })
  @IsEnum(
    [
      'APPROVAL_REQUEST',
      'APPROVAL_APPROVED',
      'APPROVAL_REJECTED',
      'QUESTION_SIMILARITY',
      'USER_REGISTERED',
      'PROJECT_CREATED',
      'GROUP_CREATED',
      'SURVEY_CREATED',
      'MEMBER_ADDED',
      'MEMBER_REMOVED',
      'SYSTEM_ALERT',
    ],
    { message: 'Tipo de notificação inválido' },
  )
  type: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova solicitação de aprovação',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(3, { message: 'Título deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'O pesquisador João Silva solicitou aprovação para editar uma questão.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mensagem é obrigatória' })
  @MinLength(10, { message: 'Mensagem deve ter no mínimo 10 caracteres' })
  @MaxLength(1000, { message: 'Mensagem deve ter no máximo 1000 caracteres' })
  message: string;

  @ApiPropertyOptional({
    description: 'ID do remetente (pesquisador que gerou a notificação)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do remetente deve ser um UUID válido' })
  @IsOptional()
  senderId?: string;

  @ApiProperty({
    description: 'ID do destinatário (pesquisador que receberá a notificação)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do destinatário deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do destinatário é obrigatório' })
  receiverId: string;

  @ApiPropertyOptional({
    description: 'ID da entidade relacionada à notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID da entidade relacionada deve ser um UUID válido' })
  @IsOptional()
  relatedId?: string;

  @ApiPropertyOptional({
    description: 'Tipo da entidade relacionada',
    example: 'ApprovalRequest',
    enum: [
      'ApprovalRequest',
      'Question',
      'Project',
      'ResearchGroup',
      'FieldSurvey',
      'Questionnaire',
      'User',
      'Institution',
    ],
  })
  @IsString()
  @IsOptional()
  relatedType?: string;
}
