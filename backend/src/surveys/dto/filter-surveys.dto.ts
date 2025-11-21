import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationMethod, SurveyStatus } from '../entities/survey.entity';

export class FilterSurveysDto {
  @ApiProperty({
    description: 'Filtrar por status',
    enum: SurveyStatus,
    required: false,
  })
  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @ApiProperty({
    description: 'Filtrar por método de aplicação',
    enum: ApplicationMethod,
    required: false,
  })
  @IsEnum(ApplicationMethod)
  @IsOptional()
  applicationMethod?: ApplicationMethod;

  @ApiProperty({
    description: 'Filtrar por ID do responsável',
    required: false,
  })
  @IsString()
  @IsOptional()
  responsibleId?: string;

  @ApiProperty({
    description: 'Filtrar por ID do questionário',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionnaireId?: string;
}
