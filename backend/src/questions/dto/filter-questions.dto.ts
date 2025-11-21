import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuestionType, QuestionVisibility } from '../entities/question.entity';

export class FilterQuestionsDto {
  @ApiProperty({
    description: 'Filtrar por tipo de questão',
    enum: QuestionType,
    required: false,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiProperty({
    description: 'Filtrar por visibilidade',
    enum: QuestionVisibility,
    required: false,
  })
  @IsEnum(QuestionVisibility)
  @IsOptional()
  visibility?: QuestionVisibility;

  @ApiProperty({
    description: 'Filtrar por ID do autor',
    required: false,
  })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiProperty({
    description: 'Filtrar por ID do subgrupo',
    required: false,
  })
  @IsString()
  @IsOptional()
  subgroupId?: string;

  @ApiProperty({
    description: 'Buscar no texto da questão',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchText?: string;
}
