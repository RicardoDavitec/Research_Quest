import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsUUID } from 'class-validator';

export class CreateQuestionnaireDto {
  @ApiProperty({
    description: 'Título do questionário',
    example: 'Pesquisa de Satisfação do Atendimento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Descrição do questionário',
    example: 'Questionário para avaliar a satisfação dos usuários com o atendimento',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'ID do criador do questionário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  creatorId: string;

  @ApiProperty({
    description: 'ID do subgrupo ao qual o questionário pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  subgroupId: string;

  @ApiProperty({
    description: 'Lista de IDs das questões do questionário',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  questionIds?: string[];
}
