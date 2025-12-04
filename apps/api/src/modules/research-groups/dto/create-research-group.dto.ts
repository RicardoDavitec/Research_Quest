import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResearchGroupDto {
  @ApiProperty({
    description: 'Nome do grupo de pesquisa',
    example: 'Grupo de Estudo sobre Qualidade de Vida',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(5, { message: 'Nome deve ter no mínimo 5 caracteres' })
  @MaxLength(200, { message: 'Nome deve ter no máximo 200 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição do grupo de pesquisa',
    example: 'Este grupo foca em pesquisas relacionadas à qualidade de vida em comunidades urbanas e rurais.',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'ID do projeto ao qual o grupo pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do projeto deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do projeto é obrigatório' })
  projectId: string;

  @ApiProperty({
    description: 'ID do coordenador do grupo (deve ser um pesquisador)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do coordenador deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do coordenador é obrigatório' })
  coordinatorId: string;
}
