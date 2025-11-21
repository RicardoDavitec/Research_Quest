import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Researcher } from './entities/researcher.entity';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';

@Injectable()
export class ResearchersService {
  constructor(
    @InjectRepository(Researcher)
    private researchersRepository: Repository<Researcher>,
  ) {}

  async create(createResearcherDto: CreateResearcherDto): Promise<Researcher> {
    // Verificar se o email já existe
    const existingResearcher = await this.researchersRepository.findOne({
      where: { email: createResearcherDto.email },
    });

    if (existingResearcher) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createResearcherDto.password, 10);

    const researcher = this.researchersRepository.create({
      ...createResearcherDto,
      password: hashedPassword,
    });

    return await this.researchersRepository.save(researcher);
  }

  async findAll(): Promise<Researcher[]> {
    return await this.researchersRepository.find({
      relations: ['subgroup', 'questions'],
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<Researcher> {
    const researcher = await this.researchersRepository.findOne({
      where: { id },
      relations: ['subgroup', 'questions'],
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    if (!researcher) {
      throw new NotFoundException(`Pesquisador com ID ${id} não encontrado`);
    }

    return researcher;
  }

  async findByEmail(email: string): Promise<Researcher | null> {
    return await this.researchersRepository.findOne({
      where: { email },
      relations: ['subgroup'],
    });
  }

  async update(id: string, updateResearcherDto: UpdateResearcherDto): Promise<Researcher> {
    const researcher = await this.findOne(id);
    
    // Se o email estiver sendo atualizado, verificar se já existe
    if (updateResearcherDto.email && updateResearcherDto.email !== researcher.email) {
      const existingResearcher = await this.researchersRepository.findOne({
        where: { email: updateResearcherDto.email },
      });

      if (existingResearcher) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    Object.assign(researcher, updateResearcherDto);
    return await this.researchersRepository.save(researcher);
  }

  async remove(id: string): Promise<void> {
    const researcher = await this.findOne(id);
    await this.researchersRepository.remove(researcher);
  }
}
