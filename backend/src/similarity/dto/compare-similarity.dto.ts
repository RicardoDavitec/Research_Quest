import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DocumentDto {
  @ApiProperty({
    description: 'ID do documento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Texto do documento',
    example: 'Qual é o seu nível de satisfação com o atendimento?',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CompareSimilarityDto {
  @ApiProperty({
    description: 'Texto de consulta para comparação',
    example: 'Como você avalia o atendimento recebido?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: 'Lista de documentos para comparar',
    type: [DocumentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
