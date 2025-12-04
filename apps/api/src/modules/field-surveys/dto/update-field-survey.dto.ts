import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFieldSurveyDto } from './create-field-survey.dto';

/**
 * DTO para atualização de uma pesquisa de campo
 * 
 * Todos os campos são opcionais (herda de PartialType)
 * O researchGroupId não pode ser alterado (omitido via OmitType)
 */
export class UpdateFieldSurveyDto extends PartialType(
  OmitType(CreateFieldSurveyDto, ['researchGroupId'] as const),
) {}
