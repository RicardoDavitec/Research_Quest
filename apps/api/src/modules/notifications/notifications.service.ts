import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Service responsável pela lógica de negócio das notificações
 * 
 * Funcionalidades:
 * - CRUD de notificações
 * - Marcar como lida/não lida
 * - Listagem com filtros
 * - Notificações não lidas
 * - Contadores de notificações
 * - Deleção em massa
 * - Sistema preparado para envio de email/SMS (integração futura)
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova notificação
   * 
   * Validações:
   * - Destinatário deve existir
   * - Remetente deve existir (se fornecido)
   * - Tipo deve ser válido
   * 
   * @param createNotificationDto - Dados da notificação
   * @returns Notificação criada
   */
  async create(createNotificationDto: CreateNotificationDto) {
    this.logger.log(`Criando notificação: ${createNotificationDto.type}`);

    // Valida destinatário
    const receiverExists = await this.prisma.researcher.findUnique({
      where: { id: createNotificationDto.receiverId },
    });

    if (!receiverExists) {
      throw new NotFoundException(
        `Destinatário com ID ${createNotificationDto.receiverId} não encontrado`,
      );
    }

    // Valida remetente se fornecido
    if (createNotificationDto.senderId) {
      const senderExists = await this.prisma.researcher.findUnique({
        where: { id: createNotificationDto.senderId },
      });

      if (!senderExists) {
        throw new NotFoundException(
          `Remetente com ID ${createNotificationDto.senderId} não encontrado`,
        );
      }
    }

    // Cria a notificação
    const notification = await this.prisma.notification.create({
      data: {
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        senderId: createNotificationDto.senderId,
        receiverId: createNotificationDto.receiverId,
        relatedId: createNotificationDto.relatedId,
        relatedType: createNotificationDto.relatedType,
        read: false,
      },
      include: {
        sender: {
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
        receiver: {
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

    this.logger.log(`Notificação criada com sucesso: ${notification.id}`);

    // TODO: Integração futura com sistema de envio de email/SMS
    // if (sentViaEmail) await this.sendEmail(notification);
    // if (sentViaSMS) await this.sendSMS(notification);

    return notification;
  }

  /**
   * Lista todas as notificações com filtros opcionais
   * 
   * Filtros disponíveis:
   * - receiverId: filtrar por destinatário
   * - read: filtrar por lida/não lida
   * - type: filtrar por tipo
   * 
   * @param filters - Filtros opcionais
   * @returns Lista de notificações
   */
  async findAll(filters?: {
    receiverId?: string;
    read?: boolean;
    type?: string;
  }) {
    this.logger.log('Listando notificações com filtros:', filters);

    const where: any = {};

    if (filters?.receiverId) {
      where.receiverId = filters.receiverId;
    }

    if (filters?.read !== undefined) {
      where.read = filters.read;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      include: {
        sender: {
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
        receiver: {
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
        createdAt: 'desc',
      },
    });

    this.logger.log(`Encontradas ${notifications.length} notificações`);
    return notifications;
  }

  /**
   * Busca uma notificação por ID
   * 
   * @param id - ID da notificação
   * @returns Notificação com detalhes completos
   */
  async findOne(id: string) {
    this.logger.log(`Buscando notificação: ${id}`);

    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        sender: {
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
        receiver: {
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
    });

    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    this.logger.log(`Notificação encontrada: ${notification.type}`);
    return notification;
  }

  /**
   * Marca uma notificação como lida
   * 
   * @param id - ID da notificação
   * @returns Notificação atualizada
   */
  async markAsRead(id: string) {
    this.logger.log(`Marcando notificação como lida: ${id}`);

    // Verifica se existe
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    // Atualiza para lida
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
      include: {
        sender: {
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
      },
    });

    this.logger.log(`Notificação marcada como lida: ${id}`);
    return updatedNotification;
  }

  /**
   * Marca uma notificação como não lida
   * 
   * @param id - ID da notificação
   * @returns Notificação atualizada
   */
  async markAsUnread(id: string) {
    this.logger.log(`Marcando notificação como não lida: ${id}`);

    // Verifica se existe
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    // Atualiza para não lida
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: {
        read: false,
        readAt: null,
      },
      include: {
        sender: {
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
      },
    });

    this.logger.log(`Notificação marcada como não lida: ${id}`);
    return updatedNotification;
  }

  /**
   * Marca todas as notificações de um destinatário como lidas
   * 
   * @param receiverId - ID do destinatário
   * @returns Número de notificações marcadas
   */
  async markAllAsRead(receiverId: string) {
    this.logger.log(`Marcando todas as notificações como lidas para: ${receiverId}`);

    // Valida destinatário
    const receiverExists = await this.prisma.researcher.findUnique({
      where: { id: receiverId },
    });

    if (!receiverExists) {
      throw new NotFoundException(
        `Destinatário com ID ${receiverId} não encontrado`,
      );
    }

    // Marca todas como lidas
    const result = await this.prisma.notification.updateMany({
      where: {
        receiverId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`${result.count} notificações marcadas como lidas`);
    return {
      message: `${result.count} notificações marcadas como lidas`,
      count: result.count,
    };
  }

  /**
   * Remove uma notificação
   * 
   * @param id - ID da notificação
   * @returns Mensagem de sucesso
   */
  async remove(id: string) {
    this.logger.log(`Removendo notificação: ${id}`);

    // Verifica se existe
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notificação com ID ${id} não encontrada`);
    }

    // Deleta a notificação
    await this.prisma.notification.delete({
      where: { id },
    });

    this.logger.log(`Notificação removida com sucesso: ${id}`);
    return {
      message: 'Notificação removida com sucesso',
    };
  }

  /**
   * Remove todas as notificações de um destinatário
   * 
   * @param receiverId - ID do destinatário
   * @returns Número de notificações removidas
   */
  async removeAll(receiverId: string) {
    this.logger.log(`Removendo todas as notificações para: ${receiverId}`);

    // Valida destinatário
    const receiverExists = await this.prisma.researcher.findUnique({
      where: { id: receiverId },
    });

    if (!receiverExists) {
      throw new NotFoundException(
        `Destinatário com ID ${receiverId} não encontrado`,
      );
    }

    // Remove todas as notificações
    const result = await this.prisma.notification.deleteMany({
      where: {
        receiverId,
      },
    });

    this.logger.log(`${result.count} notificações removidas`);
    return {
      message: `${result.count} notificações removidas`,
      count: result.count,
    };
  }

  /**
   * Lista notificações não lidas de um destinatário
   * 
   * @param receiverId - ID do destinatário
   * @returns Lista de notificações não lidas
   */
  async findUnread(receiverId: string) {
    this.logger.log(`Listando notificações não lidas para: ${receiverId}`);

    // Valida destinatário
    const receiverExists = await this.prisma.researcher.findUnique({
      where: { id: receiverId },
    });

    if (!receiverExists) {
      throw new NotFoundException(
        `Destinatário com ID ${receiverId} não encontrado`,
      );
    }

    return this.findAll({ receiverId, read: false });
  }

  /**
   * Obtém contadores de notificações de um destinatário
   * 
   * @param receiverId - ID do destinatário
   * @returns Contadores de notificações
   */
  async getCount(receiverId: string) {
    this.logger.log(`Obtendo contadores de notificações para: ${receiverId}`);

    // Valida destinatário
    const receiverExists = await this.prisma.researcher.findUnique({
      where: { id: receiverId },
    });

    if (!receiverExists) {
      throw new NotFoundException(
        `Destinatário com ID ${receiverId} não encontrado`,
      );
    }

    const [total, unread, read] = await Promise.all([
      this.prisma.notification.count({
        where: { receiverId },
      }),
      this.prisma.notification.count({
        where: { receiverId, read: false },
      }),
      this.prisma.notification.count({
        where: { receiverId, read: true },
      }),
    ]);

    const counts = {
      total,
      unread,
      read,
    };

    this.logger.log(`Contadores obtidos para destinatário: ${receiverId}`);
    return counts;
  }
}
