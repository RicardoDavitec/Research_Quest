import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

/**
 * DTO para revisão de uma solicitação de aprovação
 * 
 * O revisor pode:
 * - Aprovar (status: APROVADO)
 * - Rejeitar (status: REJEITADO)
 * - Adicionar comentários explicando a decisão
 */
export class ReviewApprovalDto {
  @ApiProperty({
    description: 'Status da revisão',
    example: 'APROVADO',
    enum: ApprovalStatus,
  })
  @IsEnum(ApprovalStatus, { message: 'Status de aprovação inválido' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status: ApprovalStatus;

  @ApiPropertyOptional({
    description: 'Comentários do revisor sobre a decisão',
    example: 'Solicitação aprovada. A alteração está de acordo com as diretrizes do projeto.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Comentários devem ter no máximo 1000 caracteres' })
  comments?: string;
}
