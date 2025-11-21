import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subgroup } from './entities/subgroup.entity';
import { CreateSubgroupDto } from './dto/create-subgroup.dto';
import { UpdateSubgroupDto } from './dto/update-subgroup.dto';

@Injectable()
export class SubgroupsService {
  constructor(
    @InjectRepository(Subgroup)
    private subgroupsRepository: Repository<Subgroup>,
  ) {}

  async create(createSubgroupDto: CreateSubgroupDto): Promise<Subgroup> {
    const subgroup = this.subgroupsRepository.create(createSubgroupDto);
    return await this.subgroupsRepository.save(subgroup);
  }

  async findAll(): Promise<Subgroup[]> {
    return await this.subgroupsRepository.find({
      relations: ['researchers', 'questions'],
    });
  }

  async findOne(id: string): Promise<Subgroup> {
    const subgroup = await this.subgroupsRepository.findOne({
      where: { id },
      relations: ['researchers', 'questions'],
    });

    if (!subgroup) {
      throw new NotFoundException(`Subgrupo com ID ${id} não encontrado`);
    }

    return subgroup;
  }

  async update(id: string, updateSubgroupDto: UpdateSubgroupDto): Promise<Subgroup> {
    const subgroup = await this.findOne(id);
    Object.assign(subgroup, updateSubgroupDto);
    return await this.subgroupsRepository.save(subgroup);
  }

  async remove(id: string): Promise<void> {
    const subgroup = await this.findOne(id);
    await this.subgroupsRepository.remove(subgroup);
  }
}
