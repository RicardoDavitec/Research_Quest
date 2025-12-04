import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResearchGroupDto } from './dto/create-research-group.dto';
import { UpdateResearchGroupDto } from './dto/update-research-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResearchGroupsService {
  private readonly logger = new Logger(ResearchGroupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar novo grupo de pesquisa
   */
  async create(createResearchGroupDto: CreateResearchGroupDto, userId: string) {
    this.logger.log(`Criando grupo de pesquisa: ${createResearchGroupDto.name}`);

    // Validar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: createResearchGroupDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Validar se coordenador existe
    const coordinator = await this.prisma.researcher.findUnique({
      where: { id: createResearchGroupDto.coordinatorId },
    });

    if (!coordinator) {
      throw new NotFoundException('Coordenador não encontrado');
    }

    // Verificar se já existe grupo com mesmo nome no projeto
    const existingGroup = await this.prisma.researchGroup.findFirst({
      where: {
        projectId: createResearchGroupDto.projectId,
        name: {
          equals: createResearchGroupDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingGroup) {
      throw new BadRequestException(
        `Já existe um grupo com o nome "${createResearchGroupDto.name}" neste projeto`
      );
    }

    // Criar grupo de pesquisa
    const group = await this.prisma.researchGroup.create({
      data: createResearchGroupDto,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        coordinator: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            fieldSurveys: true,
            questions: true,
          },
        },
      },
    });

    this.logger.log(`Grupo de pesquisa criado: ${group.id}`);
    return group;
  }

  /**
   * Listar grupos de pesquisa com filtros
   */
  async findAll(filters?: {
    projectId?: string;
    coordinatorId?: string;
    search?: string;
  }) {
    this.logger.log('Listando grupos de pesquisa');

    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.coordinatorId) {
      where.coordinatorId = filters.coordinatorId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const groups = await this.prisma.researchGroup.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        coordinator: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            fieldSurveys: true,
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups;
  }

  /**
   * Buscar grupo de pesquisa por ID
   */
  async findOne(id: string) {
    this.logger.log(`Buscando grupo de pesquisa: ${id}`);

    const group = await this.prisma.researchGroup.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                acronym: true,
              },
            },
          },
        },
        coordinator: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
              },
            },
          },
        },
        members: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        fieldSurveys: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            category: true,
            createdAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    return group;
  }

  /**
   * Atualizar grupo de pesquisa
   */
  async update(id: string, updateResearchGroupDto: UpdateResearchGroupDto, userId: string) {
    this.logger.log(`Atualizando grupo de pesquisa: ${id}`);

    // Verificar se grupo existe
    const group = await this.prisma.researchGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    // Se estiver alterando o nome, verificar duplicação
    if (updateResearchGroupDto.name && updateResearchGroupDto.name !== group.name) {
      const existingGroup = await this.prisma.researchGroup.findFirst({
        where: {
          projectId: group.projectId,
          name: {
            equals: updateResearchGroupDto.name,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (existingGroup) {
        throw new BadRequestException(
          `Já existe um grupo com o nome "${updateResearchGroupDto.name}" neste projeto`
        );
      }
    }

    // Se estiver alterando coordenador, validar
    if (updateResearchGroupDto.coordinatorId) {
      const coordinator = await this.prisma.researcher.findUnique({
        where: { id: updateResearchGroupDto.coordinatorId },
      });

      if (!coordinator) {
        throw new NotFoundException('Coordenador não encontrado');
      }
    }

    // Atualizar grupo
    const updatedGroup = await this.prisma.researchGroup.update({
      where: { id },
      data: updateResearchGroupDto,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        coordinator: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            fieldSurveys: true,
            questions: true,
          },
        },
      },
    });

    this.logger.log(`Grupo de pesquisa atualizado: ${id}`);
    return updatedGroup;
  }

  /**
   * Remover grupo de pesquisa
   * Apenas se não tiver pesquisas de campo ou questões associadas
   */
  async remove(id: string, userId: string) {
    this.logger.log(`Removendo grupo de pesquisa: ${id}`);

    // Verificar se grupo existe
    const group = await this.prisma.researchGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            fieldSurveys: true,
            questions: true,
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    // Verificar dependências
    const dependencies = [];
    if (group._count.fieldSurveys > 0) {
      dependencies.push(`${group._count.fieldSurveys} pesquisa(s) de campo`);
    }
    if (group._count.questions > 0) {
      dependencies.push(`${group._count.questions} questão(ões)`);
    }

    if (dependencies.length > 0) {
      throw new BadRequestException(
        `Não é possível deletar o grupo. Ele possui: ${dependencies.join(', ')}. Remova essas associações primeiro.`
      );
    }

    // Deletar grupo (membros serão deletados em cascata)
    await this.prisma.researchGroup.delete({
      where: { id },
    });

    this.logger.log(`Grupo de pesquisa removido: ${id}`);
    return { message: 'Grupo de pesquisa removido com sucesso' };
  }

  /**
   * Adicionar membro ao grupo
   */
  async addMember(groupId: string, addMemberDto: AddGroupMemberDto, userId: string) {
    this.logger.log(`Adicionando membro ${addMemberDto.researcherId} ao grupo ${groupId}`);

    // Verificar se grupo existe
    const group = await this.prisma.researchGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    // Verificar se pesquisador existe
    const researcher = await this.prisma.researcher.findUnique({
      where: { id: addMemberDto.researcherId },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    // Verificar se já é membro
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        researchGroupId_researcherId: {
          researchGroupId: groupId,
          researcherId: addMemberDto.researcherId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Pesquisador já é membro deste grupo');
    }

    // Adicionar membro
    const member = await this.prisma.groupMember.create({
      data: {
        researchGroupId: groupId,
        researcherId: addMemberDto.researcherId,
        role: addMemberDto.role || UserRole.PESQUISADOR,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Membro adicionado: ${addMemberDto.researcherId}`);
    return member;
  }

  /**
   * Remover membro do grupo
   */
  async removeMember(groupId: string, researcherId: string, userId: string) {
    this.logger.log(`Removendo membro ${researcherId} do grupo ${groupId}`);

    // Verificar se existe
    const member = await this.prisma.groupMember.findUnique({
      where: {
        researchGroupId_researcherId: {
          researchGroupId: groupId,
          researcherId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado neste grupo');
    }

    // Remover membro
    await this.prisma.groupMember.delete({
      where: {
        researchGroupId_researcherId: {
          researchGroupId: groupId,
          researcherId,
        },
      },
    });

    this.logger.log(`Membro removido: ${researcherId}`);
    return { message: 'Membro removido com sucesso' };
  }

  /**
   * Listar membros do grupo
   */
  async getMembers(groupId: string) {
    this.logger.log(`Listando membros do grupo: ${groupId}`);

    // Verificar se grupo existe
    const group = await this.prisma.researchGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    const members = await this.prisma.groupMember.findMany({
      where: { researchGroupId: groupId },
      include: {
        researcher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members;
  }

  /**
   * Obter estatísticas do grupo
   */
  async getStatistics(groupId: string) {
    this.logger.log(`Obtendo estatísticas do grupo: ${groupId}`);

    // Verificar se grupo existe
    const group = await this.prisma.researchGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Grupo de pesquisa não encontrado');
    }

    const [memberCount, fieldSurveyCount, questionCount] = await Promise.all([
      this.prisma.groupMember.count({ where: { researchGroupId: groupId } }),
      this.prisma.fieldSurvey.count({ where: { researchGroupId: groupId } }),
      this.prisma.question.count({ where: { researchGroupId: groupId } }),
    ]);

    return {
      members: memberCount,
      fieldSurveys: fieldSurveyCount,
      questions: questionCount,
      totalParticipants: memberCount + 1, // +1 pelo coordenador
    };
  }

  /**
   * Listar grupos de pesquisa de um projeto específico
   */
  async findByProject(projectId: string) {
    this.logger.log(`Listando grupos do projeto: ${projectId}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return this.findAll({ projectId });
  }
}
