import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionsDto } from './dto/filter-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { options, ...questionData } = createQuestionDto;

    const question = this.questionsRepository.create({
      ...questionData,
      options: options ? JSON.stringify(options) : null,
    });

    return await this.questionsRepository.save(question);
  }

  async findAll(filters?: FilterQuestionsDto): Promise<Question[]> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.visibility) where.visibility = filters.visibility;
      if (filters.authorId) where.authorId = filters.authorId;
      if (filters.subgroupId) where.subgroupId = filters.subgroupId;
      if (filters.searchText) where.text = Like(`%${filters.searchText}%`);
    }

    return await this.questionsRepository.find({
      where,
      relations: ['author', 'subgroup'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['author', 'subgroup', 'questionnaires'],
    });

    if (!question) {
      throw new NotFoundException(`Questão com ID ${id} não encontrada`);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);
    const { options, ...questionData } = updateQuestionDto;

    Object.assign(question, questionData);

    if (options) {
      question.options = JSON.stringify(options);
    }

    return await this.questionsRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.questionsRepository.remove(question);
  }

  async findSimilar(questionId: string, threshold: number = 0.5): Promise<Question[]> {
    // Este método será implementado com o serviço de similaridade
    const question = await this.findOne(questionId);
    
    // Por enquanto, retorna questões do mesmo subgrupo
    return await this.questionsRepository.find({
      where: {
        subgroupId: question.subgroupId,
        isActive: true,
      },
      relations: ['author', 'subgroup'],
      take: 10,
    });
  }
}
