import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from '../questions/entities/question.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto): Promise<Questionnaire> {
    const { questionIds, ...questionnaireData } = createQuestionnaireDto;

    const questionnaire = this.questionnairesRepository.create(questionnaireData);

    if (questionIds && questionIds.length > 0) {
      questionnaire.questions = await this.questionsRepository.find({
        where: { id: In(questionIds) },
      });
    }

    return await this.questionnairesRepository.save(questionnaire);
  }

  async findAll(): Promise<Questionnaire[]> {
    return await this.questionnairesRepository.find({
      relations: ['creator', 'subgroup', 'questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Questionnaire> {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id },
      relations: ['creator', 'subgroup', 'questions', 'surveys'],
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionário com ID ${id} não encontrado`);
    }

    return questionnaire;
  }

  async update(
    id: string,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = await this.findOne(id);
    const { questionIds, ...questionnaireData } = updateQuestionnaireDto;

    Object.assign(questionnaire, questionnaireData);

    if (questionIds) {
      questionnaire.questions = await this.questionsRepository.find({
        where: { id: In(questionIds) },
      });
    }

    return await this.questionnairesRepository.save(questionnaire);
  }

  async addQuestions(id: string, addQuestionsDto: AddQuestionsDto): Promise<Questionnaire> {
    const questionnaire = await this.findOne(id);

    const newQuestions = await this.questionsRepository.find({
      where: { id: In(addQuestionsDto.questionIds) },
    });

    // Adicionar questões que ainda não estão no questionário
    const existingIds = new Set(questionnaire.questions.map((q) => q.id));
    const questionsToAdd = newQuestions.filter((q) => !existingIds.has(q.id));

    questionnaire.questions = [...questionnaire.questions, ...questionsToAdd];

    return await this.questionnairesRepository.save(questionnaire);
  }

  async removeQuestion(id: string, questionId: string): Promise<Questionnaire> {
    const questionnaire = await this.findOne(id);

    questionnaire.questions = questionnaire.questions.filter((q) => q.id !== questionId);

    return await this.questionnairesRepository.save(questionnaire);
  }

  async remove(id: string): Promise<void> {
    const questionnaire = await this.findOne(id);
    await this.questionnairesRepository.remove(questionnaire);
  }
}
