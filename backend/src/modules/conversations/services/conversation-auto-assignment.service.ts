import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, IsNull } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { CrmWebsocketGateway } from '../../../websocket/crm-websocket.gateway';
import { CRM_EVENTS } from '../../../websocket/events/crm-events';

@Injectable()
export class ConversationAutoAssignmentService {
  private readonly logger = new Logger(ConversationAutoAssignmentService.name);
  private readonly BOT_ID = 1; // Bot ID para reassignment automático
  private readonly MINUTES_THRESHOLD = 35; // Minutos para reassignment

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly websocketGateway: CrmWebsocketGateway,
  ) {}

  /**
   * Cron job que executa a cada 10 minutos para verificar conversas
   * que precisam ser reassignadas para o bot automaticamente
   */
  @Cron('*/10 * * * *')
  async handleAutoAssignment(): Promise<void> {
    this.logger.log('Iniciando verificação de auto-assignment de conversas');

    try {
      const conversations = await this.findConversationsForAutoAssignment();

      if (conversations.length === 0) {
        this.logger.log('Nenhuma conversa encontrada para auto-assignment');
        return;
      }

      this.logger.log(
        `Encontradas ${conversations.length} conversas para auto-assignment`,
      );

      for (const conversation of conversations) {
        await this.reassignConversationToBot(conversation);
      }

      this.logger.log(
        `Auto-assignment concluído: ${conversations.length} conversas reassignadas para o bot ${this.BOT_ID}`,
      );
    } catch (error) {
      this.logger.error(
        'Erro durante o processo de auto-assignment',
        error.stack,
      );
    }
  }

  /**
   * Busca conversas que estão assignadas a usuários há mais de 35 minutos
   */
  private async findConversationsForAutoAssignment(): Promise<Conversation[]> {
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - this.MINUTES_THRESHOLD);

    return await this.conversationRepository.find({
      where: {
        assigned_user: Not(IsNull()),
        assigned_bot: IsNull(),
        updated_at: LessThan(cutoffDate),
      },
      relations: ['contact', 'integration', 'user'],
    });
  }

  /**
   * Reassigna uma conversa específica para o bot
   */
  private async reassignConversationToBot(
    conversation: Conversation,
  ): Promise<void> {
    try {
      const previousUserId = conversation.assigned_user;

      // Atualiza a conversa para ser assignada ao bot
      await this.conversationRepository.update(conversation.id, {
        assigned_user: null,
        assigned_bot: this.BOT_ID,
        unread_count: 0, // Reset unread count quando assignada ao bot
      });

      this.logger.log(
        `Conversa ${conversation.id} reassignada do usuário ${previousUserId} para o bot ${this.BOT_ID}`,
      );

      // Emitir evento WebSocket para notificar a mudança
      this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_ASSIGNED, {
        conversationId: conversation.id,
        assignedUser: null,
        assignedBot: this.BOT_ID,
        previousAssignedUser: previousUserId,
        autoAssignment: true,
        timestamp: new Date(),
      });

      // Emitir evento de reset de unread count
      this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_UNREAD_RESET, {
        conversationId: conversation.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Erro ao reassignar conversa ${conversation.id}`,
        error.stack,
      );
    }
  }

  /**
   * Método manual para executar o auto-assignment (útil para testes)
   */
  async executeManualAutoAssignment(): Promise<{
    processed: number;
    errors: number;
  }> {
    this.logger.log('Executando auto-assignment manual');

    const conversations = await this.findConversationsForAutoAssignment();
    let processed = 0;
    let errors = 0;

    for (const conversation of conversations) {
      try {
        await this.reassignConversationToBot(conversation);
        processed++;
      } catch (error) {
        errors++;
        this.logger.error(
          `Erro ao processar conversa ${conversation.id}`,
          error.stack,
        );
      }
    }

    return { processed, errors };
  }
}
