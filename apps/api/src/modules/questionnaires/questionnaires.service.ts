import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { QuestionnaireType } from '@prisma/client';

/**
 * Service responsável pela lógica de negócio dos questionários
 * 
 * Funcionalidades:
 * - CRUD completo de questionários
 * - Gerenciamento de participantes
 * - Vinculação com pesquisas de campo
 * - Associação de questões
 * - Estatísticas e relatórios
 */
@Injectable()
export class QuestionnairesService {
  private readonly logger = new Logger(QuestionnairesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo questionário
   * 
   * Validações:
   * - Se fieldSurveyId for fornecido, valida que a pesquisa existe
   * - Título deve ser único
   * - Data de aplicação deve ser futura (se fornecida)
   * 
   * @param createQuestionnaireDto - Dados do questionário
   * @returns Questionário criado com relacionamentos
   */
  async create(createQuestionnaireDto: CreateQuestionnaireDto) {
    this.logger.log(`Criando questionário: ${createQuestionnaireDto.title}`);

    // Valida pesquisa de campo se fornecida
    if (createQuestionnaireDto.fieldSurveyId) {
      const fieldSurveyExists = await this.prisma.fieldSurvey.findUnique({
        where: { id: createQuestionnaireDto.fieldSurveyId },
      });

      if (!fieldSurveyExists) {
        throw new NotFoundException(
          `Pesquisa de campo com ID ${createQuestionnaireDto.fieldSurveyId} não encontrada`,
        );
      }
    }

    // Verifica título único
    const existingQuestionnaire = await this.prisma.questionnaire.findFirst({
      where: {
        title: {
          equals: createQuestionnaireDto.title,
          mode: 'insensitive',
        },
      },
    });

    if (existingQuestionnaire) {
      throw new ConflictException(
        `Já existe um questionário com o título "${createQuestionnaireDto.title}"`,
      );
    }

    // Valida data de aplicação (se fornecida, deve ser futura)
    if (createQuestionnaireDto.applicationDate) {
      const applicationDate = new Date(createQuestionnaireDto.applicationDate);
      const now = new Date();
      
      if (applicationDate < now) {
        throw new BadRequestException(
          'Data de aplicação deve ser no futuro',
        );
      }
    }

    // Cria o questionário
    const questionnaire = await this.prisma.questionnaire.create({
      data: {
        title: createQuestionnaireDto.title,
        description: createQuestionnaireDto.description,
        type: createQuestionnaireDto.type || QuestionnaireType.ONLINE,
        applicationLocation: createQuestionnaireDto.applicationLocation,
        applicationDate: createQuestionnaireDto.applicationDate
          ? new Date(createQuestionnaireDto.applicationDate)
          : undefined,
        estimatedDuration: createQuestionnaireDto.estimatedDuration,
        fieldSurveyId: createQuestionnaireDto.fieldSurveyId,
      },
      include: {
        fieldSurvey: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
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
          },
        },
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    this.logger.log(`Questionário criado com sucesso: ${questionnaire.id}`);
    return questionnaire;
  }

  /**
   * Lista todos os questionários com filtros opcionais
   * 
   * Filtros disponíveis:
   * - type: tipo do questionário
   * - fieldSurveyId: pesquisa de campo associada
   * - search: busca textual em title e description
   * 
   * @param filters - Filtros opcionais
   * @returns Lista de questionários
   */
  async findAll(filters?: {
    type?: QuestionnaireType;
    fieldSurveyId?: string;
    search?: string;
  }) {
    this.logger.log('Listando questionários com filtros:', filters);

    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.fieldSurveyId) {
      where.fieldSurveyId = filters.fieldSurveyId;
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
      ];
    }

    const questionnaires = await this.prisma.questionnaire.findMany({
      where,
      include: {
        fieldSurvey: {
          select: {
            id: true,
            title: true,
            researchGroup: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
    });

    this.logger.log(`Encontrados ${questionnaires.length} questionários`);
    return questionnaires;
  }

  /**
   * Busca um questionário por ID com todos os detalhes
   * 
   * Inclui:
   * - Pesquisa de campo (com grupo e projeto)
   * - Participantes (ordenados por data de entrada)
   * - Questões (10 mais recentes)
   * - Contadores
   * 
   * @param id - ID do questionário
   * @returns Questionário com detalhes completos
   */
  async findOne(id: string) {
    this.logger.log(`Buscando questionário: ${id}`);

    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        fieldSurvey: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            researchGroup: {
              select: {
                id: true,
                name: true,
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
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        questions: {
          take: 10,
          select: {
            id: true,
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                category: true,
                scope: true,
              },
            },
            order: true,
            required: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionário com ID ${id} não encontrado`);
    }

    this.logger.log(`Questionário encontrado: ${questionnaire.title}`);
    return questionnaire;
  }

  /**
   * Atualiza um questionário
   * 
   * Validações:
   * - Questionário deve existir
   * - Se título for alterado, verifica unicidade
   * - Se fieldSurveyId for alterado, valida que a pesquisa existe
   * - Se data de aplicação for alterada, valida que é futura
   * 
   * @param id - ID do questionário
   * @param updateQuestionnaireDto - Dados para atualização
   * @returns Questionário atualizado
   */
  async update(id: string, updateQuestionnaireDto: UpdateQuestionnaireDto) {
    this.logger.log(`Atualizando questionário: ${id}`);

    // Verifica se existe
    const existingQuestionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
    });

    if (!existingQuestionnaire) {
      throw new NotFoundException(`Questionário com ID ${id} não encontrado`);
    }

    // Valida título único se foi alterado
    if (updateQuestionnaireDto.title && updateQuestionnaireDto.title !== existingQuestionnaire.title) {
      const duplicateTitle = await this.prisma.questionnaire.findFirst({
        where: {
          title: {
            equals: updateQuestionnaireDto.title,
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateTitle) {
        throw new ConflictException(
          `Já existe um questionário com o título "${updateQuestionnaireDto.title}"`,
        );
      }
    }

    // Valida pesquisa de campo se foi alterada
    if (updateQuestionnaireDto.fieldSurveyId) {
      const fieldSurveyExists = await this.prisma.fieldSurvey.findUnique({
        where: { id: updateQuestionnaireDto.fieldSurveyId },
      });

      if (!fieldSurveyExists) {
        throw new NotFoundException(
          `Pesquisa de campo com ID ${updateQuestionnaireDto.fieldSurveyId} não encontrada`,
        );
      }
    }

    // Valida data de aplicação se foi alterada
    if (updateQuestionnaireDto.applicationDate) {
      const applicationDate = new Date(updateQuestionnaireDto.applicationDate);
      const now = new Date();
      
      if (applicationDate < now) {
        throw new BadRequestException(
          'Data de aplicação deve ser no futuro',
        );
      }
    }

    // Atualiza o questionário
    const updatedQuestionnaire = await this.prisma.questionnaire.update({
      where: { id },
      data: {
        ...(updateQuestionnaireDto.title && { title: updateQuestionnaireDto.title }),
        ...(updateQuestionnaireDto.description !== undefined && { description: updateQuestionnaireDto.description }),
        ...(updateQuestionnaireDto.type && { type: updateQuestionnaireDto.type }),
        ...(updateQuestionnaireDto.applicationLocation !== undefined && { applicationLocation: updateQuestionnaireDto.applicationLocation }),
        ...(updateQuestionnaireDto.applicationDate !== undefined && {
          applicationDate: updateQuestionnaireDto.applicationDate
            ? new Date(updateQuestionnaireDto.applicationDate)
            : null,
        }),
        ...(updateQuestionnaireDto.estimatedDuration !== undefined && { estimatedDuration: updateQuestionnaireDto.estimatedDuration }),
        ...(updateQuestionnaireDto.fieldSurveyId !== undefined && { fieldSurveyId: updateQuestionnaireDto.fieldSurveyId }),
      },
      include: {
        fieldSurvey: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    this.logger.log(`Questionário atualizado com sucesso: ${id}`);
    return updatedQuestionnaire;
  }

  /**
   * Remove um questionário
   * 
   * Comportamento:
   * - Participantes são deletados em cascata (OnDelete: Cascade)
   * - Questões são desassociadas (QuestionnaireQuestion deletados)
   * - Não há restrições para deleção
   * 
   * @param id - ID do questionário
   * @returns Mensagem de sucesso
   */
  async remove(id: string) {
    this.logger.log(`Removendo questionário: ${id}`);

    // Verifica se existe
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionário com ID ${id} não encontrado`);
    }

    // Deleta o questionário (participantes e questões deletados em cascata)
    await this.prisma.questionnaire.delete({
      where: { id },
    });

    this.logger.log(`Questionário removido com sucesso: ${id}`);
    return {
      message: 'Questionário removido com sucesso',
      deletedParticipants: questionnaire._count.participants,
      deletedQuestions: questionnaire._count.questions,
    };
  }

  /**
   * Adiciona um participante ao questionário
   * 
   * Validações:
   * - Questionário deve existir
   * - Pesquisador deve existir
   * - Pesquisador não pode estar já participando
   * 
   * @param questionnaireId - ID do questionário
   * @param addParticipantDto - Dados do participante
   * @returns Participante criado
   */
  async addParticipant(questionnaireId: string, addParticipantDto: AddParticipantDto) {
    this.logger.log(`Adicionando participante ao questionário: ${questionnaireId}`);

    // Valida questionário
    const questionnaireExists = await this.prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
    });

    if (!questionnaireExists) {
      throw new NotFoundException(`Questionário com ID ${questionnaireId} não encontrado`);
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
    const alreadyParticipant = await this.prisma.questionnaireParticipant.findUnique({
      where: {
        questionnaireId_researcherId: {
          questionnaireId,
          researcherId: addParticipantDto.researcherId,
        },
      },
    });

    if (alreadyParticipant) {
      throw new ConflictException(
        'Este pesquisador já é participante deste questionário',
      );
    }

    // Adiciona o participante
    const participant = await this.prisma.questionnaireParticipant.create({
      data: {
        questionnaireId,
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

    this.logger.log(`Participante adicionado com sucesso ao questionário: ${questionnaireId}`);
    return participant;
  }

  /**
   * Remove um participante do questionário
   * 
   * @param questionnaireId - ID do questionário
   * @param researcherId - ID do pesquisador
   * @returns Mensagem de sucesso
   */
  async removeParticipant(questionnaireId: string, researcherId: string) {
    this.logger.log(`Removendo participante do questionário: ${questionnaireId}`);

    // Verifica se o participante existe
    const participant = await this.prisma.questionnaireParticipant.findUnique({
      where: {
        questionnaireId_researcherId: {
          questionnaireId,
          researcherId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException(
        'Participante não encontrado neste questionário',
      );
    }

    // Remove o participante
    await this.prisma.questionnaireParticipant.delete({
      where: {
        questionnaireId_researcherId: {
          questionnaireId,
          researcherId,
        },
      },
    });

    this.logger.log(`Participante removido com sucesso do questionário: ${questionnaireId}`);
    return {
      message: 'Participante removido com sucesso',
    };
  }

  /**
   * Lista todos os participantes de um questionário
   * 
   * @param questionnaireId - ID do questionário
   * @returns Lista de participantes ordenados por data de entrada
   */
  async getParticipants(questionnaireId: string) {
    this.logger.log(`Listando participantes do questionário: ${questionnaireId}`);

    // Valida questionário
    const questionnaireExists = await this.prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
    });

    if (!questionnaireExists) {
      throw new NotFoundException(`Questionário com ID ${questionnaireId} não encontrado`);
    }

    // Busca participantes
    const participants = await this.prisma.questionnaireParticipant.findMany({
      where: { questionnaireId },
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
   * Obtém estatísticas de um questionário
   * 
   * @param questionnaireId - ID do questionário
   * @returns Estatísticas do questionário
   */
  async getStatistics(questionnaireId: string) {
    this.logger.log(`Obtendo estatísticas do questionário: ${questionnaireId}`);

    // Valida questionário
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: {
        _count: {
          select: {
            participants: true,
            questions: true,
          },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionário com ID ${questionnaireId} não encontrado`);
    }

    const statistics = {
      totalParticipants: questionnaire._count.participants,
      totalQuestions: questionnaire._count.questions,
      type: questionnaire.type,
      hasFieldSurvey: !!questionnaire.fieldSurveyId,
      estimatedDuration: questionnaire.estimatedDuration,
      applicationDate: questionnaire.applicationDate,
    };

    this.logger.log(`Estatísticas obtidas para questionário: ${questionnaireId}`);
    return statistics;
  }

  /**
   * Lista questionários de uma pesquisa de campo
   * 
   * @param fieldSurveyId - ID da pesquisa de campo
   * @returns Lista de questionários
   */
  async findByFieldSurvey(fieldSurveyId: string) {
    this.logger.log(`Listando questionários da pesquisa de campo: ${fieldSurveyId}`);

    // Valida pesquisa de campo
    const fieldSurveyExists = await this.prisma.fieldSurvey.findUnique({
      where: { id: fieldSurveyId },
    });

    if (!fieldSurveyExists) {
      throw new NotFoundException(
        `Pesquisa de campo com ID ${fieldSurveyId} não encontrada`,
      );
    }

    return this.findAll({ fieldSurveyId });
  }
}
