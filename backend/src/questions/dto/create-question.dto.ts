import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsArray,
} from 'class-validator';
import {
  QuestionType,
  QuestionVisibility,
  Gender,
  EducationLevel,
} from '../entities/question.entity';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Texto da questão',
    example: 'Qual é o seu nível de satisfação com o atendimento?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @ApiProperty({
    description: 'Tipo da questão',
    enum: QuestionType,
    example: QuestionType.SCALE,
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @ApiProperty({
    description: 'Visibilidade da questão',
    enum: QuestionVisibility,
    example: QuestionVisibility.SUBGROUP,
    required: false,
  })
  @IsEnum(QuestionVisibility)
  @IsOptional()
  visibility?: QuestionVisibility;

  @ApiProperty({
    description: 'Objetivo da questão',
    example: 'Avaliar o nível de satisfação dos usuários',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  objective?: string;

  @ApiProperty({
    description: 'Descrição do público-alvo',
    example: 'Usuários do sistema de saúde pública',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  targetAudience?: string;

  @ApiProperty({
    description: 'Gênero do público-alvo',
    enum: Gender,
    example: Gender.ALL,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  targetGender?: Gender;

  @ApiProperty({
    description: 'Nível de escolaridade do público-alvo',
    enum: EducationLevel,
    example: EducationLevel.ALL,
    required: false,
  })
  @IsEnum(EducationLevel)
  @IsOptional()
  targetEducationLevel?: EducationLevel;

  @ApiProperty({
    description: 'Idade mínima do público-alvo',
    example: 18,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(120)
  minAge?: number;

  @ApiProperty({
    description: 'Idade máxima do público-alvo',
    example: 65,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(120)
  maxAge?: number;

  @ApiProperty({
    description: 'Localização geográfica do público-alvo',
    example: 'Região Norte do Brasil',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetLocation?: string;

  @ApiProperty({
    description: 'Restrições ou observações sobre a questão',
    example: 'Aplicar apenas em dias úteis',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  restrictions?: string;

  @ApiProperty({
    description: 'Nome da pesquisa à qual a questão pertence',
    example: 'Pesquisa de Satisfação 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  researchName?: string;

  @ApiProperty({
    description: 'Opções de resposta (para questões de múltipla escolha)',
    example: ['Muito satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito', 'Muito insatisfeito'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({
    description: 'ID do autor da questão',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({
    description: 'ID do subgrupo ao qual a questão pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  subgroupId: string;
}
