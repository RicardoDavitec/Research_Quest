import { PartialType } from '@nestjs/swagger';
import { CreateQuestionnaireDto } from './create-questionnaire.dto';

/**
 * DTO para atualização de um questionário
 * 
 * Todos os campos são opcionais (herda de PartialType)
 * O fieldSurveyId pode ser alterado ou removido
 */
export class UpdateQuestionnaireDto extends PartialType(CreateQuestionnaireDto) {}
