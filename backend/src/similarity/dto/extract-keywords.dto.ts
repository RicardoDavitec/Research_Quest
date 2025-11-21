import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator';

export class ExtractKeywordsDto {
  @ApiProperty({
    description: 'Texto para extração de palavras-chave',
    example: 'Qual é o seu nível de satisfação com o atendimento recebido no posto de saúde?',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'Número de palavras-chave a extrair',
    example: 5,
    required: false,
    minimum: 1,
    maximum: 20,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  topN?: number;
}
