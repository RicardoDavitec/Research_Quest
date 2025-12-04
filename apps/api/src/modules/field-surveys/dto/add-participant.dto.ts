import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * DTO para adicionar um participante à pesquisa de campo
 */
export class AddParticipantDto {
  @ApiProperty({
    description: 'ID do pesquisador participante',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do pesquisador deve ser um UUID válido' })
  researcherId: string;

  @ApiPropertyOptional({
    description: 'Role do participante na pesquisa de campo',
    enum: UserRole,
    example: UserRole.PESQUISADOR,
    default: UserRole.PESQUISADOR,
  })
  @IsEnum(UserRole, { message: 'Role inválida' })
  @IsOptional()
  role?: UserRole;
}
