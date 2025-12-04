import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFieldSurveyDto } from './dto/create-field-survey.dto';
import { UpdateFieldSurveyDto } from './dto/update-field-survey.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

/**
 * Service responsável pela lógica de negócio das pesquisas de campo
 * 
 * Funcionalidades:
 * - CRUD completo de pesquisas de campo
 * - Gerenciamento de participantes
 * - Vinculação com grupos de pesquisa
 * - Associação de questionários
 * - Estatísticas e relatórios
 * - Validações de datas e relacionamentos
 */
@Injectable()
export class FieldSurveysService {
  private readonly logger = new Logger(FieldSurveysService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova pesquisa de campo
   * 
   * Validações:
   * - Grupo de pesquisa deve existir
   * - Título deve ser único dentro do grupo
   * - Se datas forem fornecidas, endDate deve ser posterior a startDate
   * 
   * @param createFieldSurveyDto - Dados da pesquisa de campo
   * @returns Pesquisa de campo criada com relacionamentos
   */
  async create(createFieldSurveyDto: CreateFieldSurveyDto) {
    this.logger.log(`Criando pesquisa de campo: ${createFieldSurveyDto.title}`);

    // Valida grupo de pesquisa
    const researchGroupExists = await this.prisma.researchGroup.findUnique({
      where: { id: createFieldSurveyDto.researchGroupId },
    });

    if (!researchGroupExists) {
      throw new NotFoundException(
        `Grupo de pesquisa com ID ${createFieldSurveyDto.researchGroupId} não encontrado`,
      );
    }

    // Verifica título único no grupo
    const existingFieldSurvey = await this.prisma.fieldSurvey.findFirst({
      where: {
        title: {
          equals: createFieldSurveyDto.title,
          mode: 'insensitive',
        },
        researchGroupId: createFieldSurveyDto.researchGroupId,
      },
    });

    if (existingFieldSurvey) {
      throw new ConflictException(
        `Já existe uma pesquisa de campo com o título "${createFieldSurveyDto.title}" neste grupo`,
      );
    }

    // Valida datas se fornecidas
    if (createFieldSurveyDto.startDate && createFieldSurveyDto.endDate) {
      const startDate = new Date(createFieldSurveyDto.startDate);
      const endDate = new Date(createFieldSurveyDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException(
          'Data de término deve ser posterior à data de início',
        );
      }
    }

    // Cria a pesquisa de campo
    const fieldSurvey = await this.prisma.fieldSurvey.create({
      data: {
        title: createFieldSurveyDto.title,
        description: createFieldSurveyDto.description,
        location: createFieldSurveyDto.location,
        startDate: createFieldSurveyDto.startDate
          ? new Date(createFieldSurveyDto.startDate)
          : undefined,
        endDate: createFieldSurveyDto.endDate
          ? new Date(createFieldSurveyDto.endDate)
          : undefined,
        researchGroupId: createFieldSurveyDto.researchGroupId,
      },
      include: {
        researchGroup: {
          select: {
            id: true,
            name: true,
            coordinator: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            project: {
              select: {
                id: true,
                title: true,
                institution: {
                  select: {
                    id: true,
                    name: true,
                    acronym: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
    });

    this.logger.log(`Pesquisa de campo criada com sucesso: ${fieldSurvey.id}`);
    return fieldSurvey;
  }

  /**
   * Lista todas as pesquisas de campo com filtros opcionais
   * 
   * Filtros disponíveis:
   * - researchGroupId: grupo de pesquisa
   * - search: busca textual em title, description e location
   * 
   * @param filters - Filtros opcionais
   * @returns Lista de pesquisas de campo
   */
  async findAll(filters?: {
    researchGroupId?: string;
    search?: string;
  }) {
    this.logger.log('Listando pesquisas de campo com filtros:', filters);

    const where: any = {};

    if (filters?.researchGroupId) {
      where.researchGroupId = filters.researchGroupId;
    }

    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          location: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const fieldSurveys = await this.prisma.fieldSurvey.findMany({
      where,
      include: {
        researchGroup: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(`Encontradas ${fieldSurveys.length} pesquisas de campo`);
    return fieldSurveys;
  }

  /**
   * Busca uma pesquisa de campo por ID com todos os detalhes
   * 
   * Inclui:
   * - Grupo de pesquisa (com coordenador, projeto e instituição)
   * - Participantes (ordenados por data de entrada)
   * - Questionários (10 mais recentes)
   * - Contadores
   * 
   * @param id - ID da pesquisa de campo
   * @returns Pesquisa de campo com detalhes completos
   */
  async findOne(id: string) {
    this.logger.log(`Buscando pesquisa de campo: ${id}`);

    const fieldSurvey = await this.prisma.fieldSurvey.findUnique({
      where: { id },
      include: {
        researchGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            coordinator: {
              select: {
                id: true,
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
            project: {
              select: {
                id: true,
                title: true,
                status: true,
                institution: {
                  select: {
                    id: true,
                    name: true,
                    acronym: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        participants: {
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
        },
        questionnaires: {
          take: 10,
          select: {
            id: true,
            title: true,
            type: true,
            applicationDate: true,
            estimatedDuration: true,
            createdAt: true,
            _count: {
              select: {
                participants: true,
                questions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
    });

    if (!fieldSurvey) {
      throw new NotFoundException(`Pesquisa de campo com ID ${id} não encontrada`);
    }

    this.logger.log(`Pesquisa de campo encontrada: ${fieldSurvey.title}`);
    return fieldSurvey;
  }

  /**
   * Atualiza uma pesquisa de campo
   * 
   * Validações:
   * - Pesquisa de campo deve existir
   * - Se título for alterado, verifica unicidade no grupo
   * - Se datas forem alteradas, endDate deve ser posterior a startDate
   * 
   * @param id - ID da pesquisa de campo
   * @param updateFieldSurveyDto - Dados para atualização
   * @returns Pesquisa de campo atualizada
   */
  async update(id: string, updateFieldSurveyDto: UpdateFieldSurveyDto) {
    this.logger.log(`Atualizando pesquisa de campo: ${id}`);

    // Verifica se existe
    const existingFieldSurvey = await this.prisma.fieldSurvey.findUnique({
      where: { id },
    });

    if (!existingFieldSurvey) {
      throw new NotFoundException(`Pesquisa de campo com ID ${id} não encontrada`);
    }

    // Valida título único no grupo se foi alterado
    if (updateFieldSurveyDto.title && updateFieldSurveyDto.title !== existingFieldSurvey.title) {
      const duplicateTitle = await this.prisma.fieldSurvey.findFirst({
        where: {
          title: {
            equals: updateFieldSurveyDto.title,
            mode: 'insensitive',
          },
          researchGroupId: existingFieldSurvey.researchGroupId,
          id: {
            not: id,
          },
        },
      });

      if (duplicateTitle) {
        throw new ConflictException(
          `Já existe uma pesquisa de campo com o título "${updateFieldSurveyDto.title}" neste grupo`,
        );
      }
    }

    // Valida datas se foram alteradas
    const newStartDate = updateFieldSurveyDto.startDate !== undefined
      ? updateFieldSurveyDto.startDate
        ? new Date(updateFieldSurveyDto.startDate)
        : null
      : existingFieldSurvey.startDate;

    const newEndDate = updateFieldSurveyDto.endDate !== undefined
      ? updateFieldSurveyDto.endDate
        ? new Date(updateFieldSurveyDto.endDate)
        : null
      : existingFieldSurvey.endDate;

    if (newStartDate && newEndDate && newEndDate <= newStartDate) {
      throw new BadRequestException(
        'Data de término deve ser posterior à data de início',
      );
    }

    // Atualiza a pesquisa de campo
    const updatedFieldSurvey = await this.prisma.fieldSurvey.update({
      where: { id },
      data: {
        ...(updateFieldSurveyDto.title && { title: updateFieldSurveyDto.title }),
        ...(updateFieldSurveyDto.description !== undefined && { description: updateFieldSurveyDto.description }),
        ...(updateFieldSurveyDto.location !== undefined && { location: updateFieldSurveyDto.location }),
        ...(updateFieldSurveyDto.startDate !== undefined && {
          startDate: updateFieldSurveyDto.startDate
            ? new Date(updateFieldSurveyDto.startDate)
            : null,
        }),
        ...(updateFieldSurveyDto.endDate !== undefined && {
          endDate: updateFieldSurveyDto.endDate
            ? new Date(updateFieldSurveyDto.endDate)
            : null,
        }),
      },
      include: {
        researchGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
    });

    this.logger.log(`Pesquisa de campo atualizada com sucesso: ${id}`);
    return updatedFieldSurvey;
  }

  /**
   * Remove uma pesquisa de campo
   * 
   * Comportamento:
   * - Participantes são deletados em cascata (OnDelete: Cascade)
   * - Questionários associados permanecem (fieldSurveyId fica null)
   * - Não há restrições para deleção
   * 
   * @param id - ID da pesquisa de campo
   * @returns Mensagem de sucesso
   */
  async remove(id: string) {
    this.logger.log(`Removendo pesquisa de campo: ${id}`);

    // Verifica se existe
    const fieldSurvey = await this.prisma.fieldSurvey.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
    });

    if (!fieldSurvey) {
      throw new NotFoundException(`Pesquisa de campo com ID ${id} não encontrada`);
    }

    // Deleta a pesquisa de campo (participantes deletados em cascata)
    await this.prisma.fieldSurvey.delete({
      where: { id },
    });

    this.logger.log(`Pesquisa de campo removida com sucesso: ${id}`);
    return {
      message: 'Pesquisa de campo removida com sucesso',
      deletedParticipants: fieldSurvey._count.participants,
      affectedQuestionnaires: fieldSurvey._count.questionnaires,
    };
  }

  /**
   * Adiciona um participante à pesquisa de campo
   * 
   * Validações:
   * - Pesquisa de campo deve existir
   * - Pesquisador deve existir
   * - Pesquisador não pode estar já participando
   * 
   * @param fieldSurveyId - ID da pesquisa de campo
   * @param addParticipantDto - Dados do participante
   * @returns Participante criado
   */
  async addParticipant(fieldSurveyId: string, addParticipantDto: AddParticipantDto) {
    this.logger.log(`Adicionando participante à pesquisa de campo: ${fieldSurveyId}`);

    // Valida pesquisa de campo
    const fieldSurveyExists = await this.prisma.fieldSurvey.findUnique({
      where: { id: fieldSurveyId },
    });

    if (!fieldSurveyExists) {
      throw new NotFoundException(`Pesquisa de campo com ID ${fieldSurveyId} não encontrada`);
    }

    // Valida pesquisador
    const researcherExists = await this.prisma.researcher.findUnique({
      where: { id: addParticipantDto.researcherId },
    });

    if (!researcherExists) {
      throw new NotFoundException(
        `Pesquisador com ID ${addParticipantDto.researcherId} não encontrado`,
      );
    }

    // Verifica se já é participante
    const alreadyParticipant = await this.prisma.surveyParticipant.findUnique({
      where: {
        fieldSurveyId_researcherId: {
          fieldSurveyId,
          researcherId: addParticipantDto.researcherId,
        },
      },
    });

    if (alreadyParticipant) {
      throw new ConflictException(
        'Este pesquisador já é participante desta pesquisa de campo',
      );
    }

    // Adiciona o participante
    const participant = await this.prisma.surveyParticipant.create({
      data: {
        fieldSurveyId,
        researcherId: addParticipantDto.researcherId,
        role: addParticipantDto.role || 'PESQUISADOR',
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

    this.logger.log(`Participante adicionado com sucesso à pesquisa de campo: ${fieldSurveyId}`);
    return participant;
  }

  /**
   * Remove um participante da pesquisa de campo
   * 
   * @param fieldSurveyId - ID da pesquisa de campo
   * @param researcherId - ID do pesquisador
   * @returns Mensagem de sucesso
   */
  async removeParticipant(fieldSurveyId: string, researcherId: string) {
    this.logger.log(`Removendo participante da pesquisa de campo: ${fieldSurveyId}`);

    // Verifica se o participante existe
    const participant = await this.prisma.surveyParticipant.findUnique({
      where: {
        fieldSurveyId_researcherId: {
          fieldSurveyId,
          researcherId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException(
        'Participante não encontrado nesta pesquisa de campo',
      );
    }

    // Remove o participante
    await this.prisma.surveyParticipant.delete({
      where: {
        fieldSurveyId_researcherId: {
          fieldSurveyId,
          researcherId,
        },
      },
    });

    this.logger.log(`Participante removido com sucesso da pesquisa de campo: ${fieldSurveyId}`);
    return {
      message: 'Participante removido com sucesso',
    };
  }

  /**
   * Lista todos os participantes de uma pesquisa de campo
   * 
   * @param fieldSurveyId - ID da pesquisa de campo
   * @returns Lista de participantes ordenados por data de entrada
   */
  async getParticipants(fieldSurveyId: string) {
    this.logger.log(`Listando participantes da pesquisa de campo: ${fieldSurveyId}`);

    // Valida pesquisa de campo
    const fieldSurveyExists = await this.prisma.fieldSurvey.findUnique({
      where: { id: fieldSurveyId },
    });

    if (!fieldSurveyExists) {
      throw new NotFoundException(`Pesquisa de campo com ID ${fieldSurveyId} não encontrada`);
    }

    // Busca participantes
    const participants = await this.prisma.surveyParticipant.findMany({
      where: { fieldSurveyId },
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

    this.logger.log(`Encontrados ${participants.length} participantes`);
    return participants;
  }

  /**
   * Obtém estatísticas de uma pesquisa de campo
   * 
   * @param fieldSurveyId - ID da pesquisa de campo
   * @returns Estatísticas da pesquisa de campo
   */
  async getStatistics(fieldSurveyId: string) {
    this.logger.log(`Obtendo estatísticas da pesquisa de campo: ${fieldSurveyId}`);

    // Valida pesquisa de campo
    const fieldSurvey = await this.prisma.fieldSurvey.findUnique({
      where: { id: fieldSurveyId },
      include: {
        _count: {
          select: {
            participants: true,
            questionnaires: true,
          },
        },
      },
    });

    if (!fieldSurvey) {
      throw new NotFoundException(`Pesquisa de campo com ID ${fieldSurveyId} não encontrada`);
    }

    // Calcula duração em dias se datas forem fornecidas
    let durationInDays: number | null = null;
    if (fieldSurvey.startDate && fieldSurvey.endDate) {
      const diffTime = Math.abs(fieldSurvey.endDate.getTime() - fieldSurvey.startDate.getTime());
      durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const statistics = {
      totalParticipants: fieldSurvey._count.participants,
      totalQuestionnaires: fieldSurvey._count.questionnaires,
      startDate: fieldSurvey.startDate,
      endDate: fieldSurvey.endDate,
      durationInDays,
      location: fieldSurvey.location,
    };

    this.logger.log(`Estatísticas obtidas para pesquisa de campo: ${fieldSurveyId}`);
    return statistics;
  }

  /**
   * Lista pesquisas de campo de um grupo de pesquisa
   * 
   * @param researchGroupId - ID do grupo de pesquisa
   * @returns Lista de pesquisas de campo
   */
  async findByResearchGroup(researchGroupId: string) {
    this.logger.log(`Listando pesquisas de campo do grupo de pesquisa: ${researchGroupId}`);

    // Valida grupo de pesquisa
    const researchGroupExists = await this.prisma.researchGroup.findUnique({
      where: { id: researchGroupId },
    });

    if (!researchGroupExists) {
      throw new NotFoundException(
        `Grupo de pesquisa com ID ${researchGroupId} não encontrado`,
      );
    }

    return this.findAll({ researchGroupId });
  }
}
