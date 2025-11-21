import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSubgroupDto {
  @ApiProperty({
    description: 'Nome do subgrupo de pesquisa',
    example: 'Grupo de Pesquisa em Saúde Pública',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Descrição do subgrupo',
    example: 'Grupo focado em pesquisas relacionadas à saúde pública e epidemiologia',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
