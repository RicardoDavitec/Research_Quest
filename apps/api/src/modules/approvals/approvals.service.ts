import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ReviewApprovalDto } from './dto/review-approval.dto';
import { ApprovalStatus } from '@prisma/client';

/**
 * Service responsável pela lógica de negócio das aprovações
 * 
 * Funcionalidades:
 * - CRUD de solicitações de aprovação
 * - Sistema de revisão (aprovar/rejeitar)
 * - Listagem com filtros por status e tipo
 * - Gerenciamento de aprovadores
 * - Histórico de aprovações
 * - Notificações de aprovação (integração futura)
 */
@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova solicitação de aprovação
   * 
   * Validações:
   * - Solicitante deve existir
   * - Se questionId for fornecido, questão deve existir
   * - Tipo de solicitação deve ser válido
   * 
   * @param createApprovalDto - Dados da solicitação
   * @returns Solicitação de aprovação criada
   */
  async create(createApprovalDto: CreateApprovalDto) {
    this.logger.log(`Criando solicitação de aprovação: ${createApprovalDto.type}`);

    // Valida solicitante
    const requesterExists = await this.prisma.researcher.findUnique({
      where: { id: createApprovalDto.requesterId },
    });

    if (!requesterExists) {
      throw new NotFoundException(
        `Solicitante com ID ${createApprovalDto.requesterId} não encontrado`,
      );
    }

    // Valida questão se fornecida
    if (createApprovalDto.questionId) {
      const questionExists = await this.prisma.question.findUnique({
        where: { id: createApprovalDto.questionId },
      });

      if (!questionExists) {
        throw new NotFoundException(
          `Questão com ID ${createApprovalDto.questionId} não encontrada`,
        );
      }
    }

    // Cria a solicitação
    const approval = await this.prisma.approvalRequest.create({
      data: {
        type: createApprovalDto.type,
        requesterId: createApprovalDto.requesterId,
        questionId: createApprovalDto.questionId,
        requestData: createApprovalDto.requestData,
        comments: createApprovalDto.comments,
        status: ApprovalStatus.PENDENTE,
      },
      include: {
        requester: {
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
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            category: true,
          },
        },
      },
    });

    this.logger.log(`Solicitação de aprovação criada com sucesso: ${approval.id}`);
    return approval;
  }

  /**
   * Lista todas as solicitações de aprovação com filtros opcionais
   * 
   * Filtros disponíveis:
   * - status: filtrar por status (PENDENTE, APROVADO, REJEITADO)
   * - type: filtrar por tipo de solicitação
   * - requesterId: filtrar por solicitante
   * - approverId: filtrar por aprovador
   * 
   * @param filters - Filtros opcionais
   * @returns Lista de solicitações de aprovação
   */
  async findAll(filters?: {
    status?: ApprovalStatus;
    type?: string;
    requesterId?: string;
    approverId?: string;
  }) {
    this.logger.log('Listando solicitações de aprovação com filtros:', filters);

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.requesterId) {
      where.requesterId = filters.requesterId;
    }

    if (filters?.approverId) {
      where.approverId = filters.approverId;
    }

    const approvals = await this.prisma.approvalRequest.findMany({
      where,
      include: {
        requester: {
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
        approver: {
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
        question: {
          select: {
            id: true,
            text: true,
            type: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    this.logger.log(`Encontradas ${approvals.length} solicitações de aprovação`);
    return approvals;
  }

  /**
   * Busca uma solicitação de aprovação por ID
   * 
   * @param id - ID da solicitação
   * @returns Solicitação de aprovação com detalhes completos
   */
  async findOne(id: string) {
    this.logger.log(`Buscando solicitação de aprovação: ${id}`);

    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        requester: {
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
            primaryInstitution: {
              select: {
                id: true,
                name: true,
                acronym: true,
              },
            },
          },
        },
        approver: {
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
        question: true,
      },
    });

    if (!approval) {
      throw new NotFoundException(`Solicitação de aprovação com ID ${id} não encontrada`);
    }

    this.logger.log(`Solicitação de aprovação encontrada: ${approval.type}`);
    return approval;
  }

  /**
   * Revisa uma solicitação de aprovação (aprovar ou rejeitar)
   * 
   * Validações:
   * - Solicitação deve existir
   * - Solicitação deve estar pendente
   * - Aprovador deve existir
   * - Status deve ser APROVADO ou REJEITADO
   * 
   * @param id - ID da solicitação
   * @param approverId - ID do aprovador
   * @param reviewApprovalDto - Dados da revisão
   * @returns Solicitação de aprovação atualizada
   */
  async review(id: string, approverId: string, reviewApprovalDto: ReviewApprovalDto) {
    this.logger.log(`Revisando solicitação de aprovação: ${id}`);

    // Valida solicitação
    const existingApproval = await this.prisma.approvalRequest.findUnique({
      where: { id },
    });

    if (!existingApproval) {
      throw new NotFoundException(`Solicitação de aprovação com ID ${id} não encontrada`);
    }

    // Verifica se está pendente
    if (existingApproval.status !== ApprovalStatus.PENDENTE) {
      throw new BadRequestException(
        `Esta solicitação já foi revisada com status: ${existingApproval.status}`,
      );
    }

    // Valida aprovador
    const approverExists = await this.prisma.researcher.findUnique({
      where: { id: approverId },
    });

    if (!approverExists) {
      throw new NotFoundException(`Aprovador com ID ${approverId} não encontrado`);
    }

    // Valida status
    if (reviewApprovalDto.status === ApprovalStatus.PENDENTE) {
      throw new BadRequestException(
        'Status deve ser APROVADO ou REJEITADO',
      );
    }

    // Atualiza a solicitação
    const updatedApproval = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: reviewApprovalDto.status,
        approverId,
        comments: reviewApprovalDto.comments || existingApproval.comments,
        reviewedAt: new Date(),
      },
      include: {
        requester: {
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
        approver: {
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
        question: {
          select: {
            id: true,
            text: true,
            type: true,
          },
        },
      },
    });

    this.logger.log(
      `Solicitação de aprovação revisada: ${id} - Status: ${reviewApprovalDto.status}`,
    );
    return updatedApproval;
  }

  /**
   * Cancela uma solicitação de aprovação pendente
   * 
   * Validações:
   * - Solicitação deve existir
   * - Solicitação deve estar pendente
   * - Apenas o solicitante pode cancelar
   * 
   * @param id - ID da solicitação
   * @param requesterId - ID do solicitante (para validação)
   * @returns Mensagem de sucesso
   */
  async cancel(id: string, requesterId: string) {
    this.logger.log(`Cancelando solicitação de aprovação: ${id}`);

    // Valida solicitação
    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException(`Solicitação de aprovação com ID ${id} não encontrada`);
    }

    // Verifica se está pendente
    if (approval.status !== ApprovalStatus.PENDENTE) {
      throw new BadRequestException(
        'Apenas solicitações pendentes podem ser canceladas',
      );
    }

    // Verifica se é o solicitante
    if (approval.requesterId !== requesterId) {
      throw new ForbiddenException(
        'Apenas o solicitante pode cancelar esta solicitação',
      );
    }

    // Deleta a solicitação
    await this.prisma.approvalRequest.delete({
      where: { id },
    });

    this.logger.log(`Solicitação de aprovação cancelada: ${id}`);
    return {
      message: 'Solicitação de aprovação cancelada com sucesso',
    };
  }

  /**
   * Lista solicitações pendentes
   * 
   * @returns Lista de solicitações pendentes
   */
  async findPending() {
    this.logger.log('Listando solicitações pendentes');
    return this.findAll({ status: ApprovalStatus.PENDENTE });
  }

  /**
   * Lista solicitações de um solicitante
   * 
   * @param requesterId - ID do solicitante
   * @returns Lista de solicitações do solicitante
   */
  async findByRequester(requesterId: string) {
    this.logger.log(`Listando solicitações do solicitante: ${requesterId}`);

    // Valida solicitante
    const requesterExists = await this.prisma.researcher.findUnique({
      where: { id: requesterId },
    });

    if (!requesterExists) {
      throw new NotFoundException(
        `Solicitante com ID ${requesterId} não encontrado`,
      );
    }

    return this.findAll({ requesterId });
  }

  /**
   * Lista solicitações revisadas por um aprovador
   * 
   * @param approverId - ID do aprovador
   * @returns Lista de solicitações revisadas pelo aprovador
   */
  async findByApprover(approverId: string) {
    this.logger.log(`Listando solicitações revisadas pelo aprovador: ${approverId}`);

    // Valida aprovador
    const approverExists = await this.prisma.researcher.findUnique({
      where: { id: approverId },
    });

    if (!approverExists) {
      throw new NotFoundException(
        `Aprovador com ID ${approverId} não encontrado`,
      );
    }

    return this.findAll({ approverId });
  }

  /**
   * Obtém estatísticas das aprovações
   * 
   * @returns Estatísticas de aprovações
   */
  async getStatistics() {
    this.logger.log('Obtendo estatísticas de aprovações');

    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.approvalRequest.count(),
      this.prisma.approvalRequest.count({
        where: { status: ApprovalStatus.PENDENTE },
      }),
      this.prisma.approvalRequest.count({
        where: { status: ApprovalStatus.APROVADO },
      }),
      this.prisma.approvalRequest.count({
        where: { status: ApprovalStatus.REJEITADO },
      }),
    ]);

    // Conta por tipo
    const byType = await this.prisma.approvalRequest.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    const statistics = {
      total,
      pending,
      approved,
      rejected,
      byType: byType.reduce((acc, curr) => {
        acc[curr.type] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) + '%' : '0%',
      rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(2) + '%' : '0%',
    };

    this.logger.log('Estatísticas de aprovações obtidas');
    return statistics;
  }
}
