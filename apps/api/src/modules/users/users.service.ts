import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createResearcher(userId: string, createResearcherDto: CreateResearcherDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { researcher: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.researcher) {
      throw new ConflictException('Perfil de pesquisador já existe para este usuário');
    }

    // Check if primary institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: createResearcherDto.primaryInstitutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição principal não encontrada');
    }

    // Create researcher profile
    return this.prisma.researcher.create({
      data: {
        userId,
        ...createResearcherDto,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            cpf: true,
          },
        },
        primaryInstitution: true,
        secondaryInstitution: true,
      },
    });
  }

  async findAll() {
    return this.prisma.researcher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            cpf: true,
          },
        },
        primaryInstitution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
        primaryInstitution: true,
        secondaryInstitution: true,
        coordinatedInstitutions: true,
        projectCoordinations: {
          include: {
            project: true,
          },
        },
        groupCoordinations: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    return researcher;
  }

  async update(id: string, updateResearcherDto: UpdateResearcherDto) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    return this.prisma.researcher.update({
      where: { id },
      data: updateResearcherDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            cpf: true,
          },
        },
        primaryInstitution: true,
        secondaryInstitution: true,
      },
    });
  }

  async remove(id: string) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    return this.prisma.researcher.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.researcher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            cpf: true,
          },
        },
        primaryInstitution: true,
        secondaryInstitution: true,
      },
    });
  }
}
