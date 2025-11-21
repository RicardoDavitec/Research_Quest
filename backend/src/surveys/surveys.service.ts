import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { FilterSurveysDto } from './dto/filter-surveys.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
  ) {}

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const { locations, metadata, ...surveyData } = createSurveyDto;

    const survey = this.surveysRepository.create({
      ...surveyData,
      locations: locations ? JSON.stringify(locations) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    return await this.surveysRepository.save(survey);
  }

  async findAll(filters?: FilterSurveysDto): Promise<Survey[]> {
    const where: any = {};

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.applicationMethod) where.applicationMethod = filters.applicationMethod;
      if (filters.responsibleId) where.responsibleId = filters.responsibleId;
      if (filters.questionnaireId) where.questionnaireId = filters.questionnaireId;
    }

    return await this.surveysRepository.find({
      where,
      relations: ['questionnaire', 'responsible'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveysRepository.findOne({
      where: { id },
      relations: ['questionnaire', 'questionnaire.questions', 'responsible'],
    });

    if (!survey) {
      throw new NotFoundException(`Pesquisa com ID ${id} não encontrada`);
    }

    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    const { locations, metadata, ...surveyData } = updateSurveyDto;

    Object.assign(survey, surveyData);

    if (locations) {
      survey.locations = JSON.stringify(locations);
    }

    if (metadata) {
      survey.metadata = JSON.stringify(metadata);
    }

    return await this.surveysRepository.save(survey);
  }

  async incrementResponseCount(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.responseCount += 1;
    return await this.surveysRepository.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveysRepository.remove(survey);
  }
}
