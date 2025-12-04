import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Controller para gerenciamento de notificações
 * 
 * Endpoints:
 * - POST /notifications - Criar notificação
 * - GET /notifications - Listar notificações
 * - GET /notifications/unread/:receiverId - Listar notificações não lidas
 * - GET /notifications/count/:receiverId - Obter contadores
 * - GET /notifications/:id - Buscar notificação por ID
 * - PATCH /notifications/:id/read - Marcar como lida
 * - PATCH /notifications/:id/unread - Marcar como não lida
 * - PATCH /notifications/mark-all-read/:receiverId - Marcar todas como lidas
 * - DELETE /notifications/:id - Deletar notificação
 * - DELETE /notifications/all/:receiverId - Deletar todas as notificações
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Destinatário ou remetente não encontrado' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as notificações com filtros opcionais' })
  @ApiQuery({ name: 'receiverId', required: false, type: String })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  findAll(
    @Query('receiverId') receiverId?: string,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ) {
    const readBoolean = read !== undefined ? read === 'true' : undefined;
    return this.notificationsService.findAll({ receiverId, read: readBoolean, type });
  }

  @Get('unread/:receiverId')
  @ApiOperation({ summary: 'Listar notificações não lidas de um destinatário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações não lidas' })
  @ApiResponse({ status: 404, description: 'Destinatário não encontrado' })
  findUnread(@Param('receiverId', ParseUUIDPipe) receiverId: string) {
    return this.notificationsService.findUnread(receiverId);
  }

  @Get('count/:receiverId')
  @ApiOperation({ summary: 'Obter contadores de notificações de um destinatário' })
  @ApiResponse({ status: 200, description: 'Contadores de notificações' })
  @ApiResponse({ status: 404, description: 'Destinatário não encontrado' })
  getCount(@Param('receiverId', ParseUUIDPipe) receiverId: string) {
    return this.notificationsService.getCount(receiverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notificação por ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Marcar notificação como não lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como não lida' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  markAsUnread(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsUnread(id);
  }

  @Patch('mark-all-read/:receiverId')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Notificações marcadas como lidas' })
  @ApiResponse({ status: 404, description: 'Destinatário não encontrado' })
  markAllAsRead(@Param('receiverId', ParseUUIDPipe) receiverId: string) {
    return this.notificationsService.markAllAsRead(receiverId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  @ApiResponse({ status: 200, description: 'Notificação deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('all/:receiverId')
  @ApiOperation({ summary: 'Deletar todas as notificações de um destinatário' })
  @ApiResponse({ status: 200, description: 'Notificações deletadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Destinatário não encontrado' })
  removeAll(@Param('receiverId', ParseUUIDPipe) receiverId: string) {
    return this.notificationsService.removeAll(receiverId);
  }
}
