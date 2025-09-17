import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { FindAllMessagesDto } from '../dto/find-all-messages.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import {
  CursorPaginationDto,
  CursorPaginationResponse,
} from '../dto/cursor-pagination.dto';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { LastMessageCacheService } from '../../cache/services/last-message-cache.service';
import { User } from '../../users/entities/user.entity';
import { Bot } from '../../bots/entities/bot.entity';
import { CrmWebsocketGateway } from '../../../websocket/crm-websocket.gateway';
import { CRM_EVENTS } from '../../../websocket/events/crm-events';
import { SendMessageWithMediaDto } from '../dto/send-message-with-media.dto';
import { MessageCrudService } from './message-crud.service';
import { MessagePaginationService } from './message-pagination.service';
// WhatsAppMessageDispatcher removed - using local storage instead of Supabase

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly messageCrudService: MessageCrudService,
    private readonly messagePaginationService: MessagePaginationService,
    private readonly conversationsService: ConversationsService,
    private readonly lastMessageCache: LastMessageCacheService,
    @Inject(forwardRef(() => CrmWebsocketGateway))
    private readonly websocketGateway: CrmWebsocketGateway,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    currentUser: User,
  ): Promise<Message> {
    const { conversation_id } = createMessageDto;

    // Validate conversation exists and get it with integration and contact
    const conversation =
      await this.conversationsService.findOne(conversation_id);

    // Create message using CRUD service
    const savedMessage = await this.messageCrudService.create(
      createMessageDto,
      currentUser,
    );

    // Invalidate cache for this conversation's last message
    this.lastMessageCache.invalidate(conversation_id);

    // Reload message with attachments for websocket event
    const messageWithAttachments = await this.messageCrudService.findOne(
      savedMessage.id,
    );

    // Emit MESSAGE_NEW immediately
    this.websocketGateway.emitToAll(CRM_EVENTS.MESSAGE_NEW, {
      message: messageWithAttachments,
      timestamp: new Date(),
    });

    // Send to WhatsApp in background if body is provided
    if (
      createMessageDto.body &&
      conversation.contact?.phone_number &&
      conversation.integration
    ) {
      setImmediate(() => {
        this.sendToWhatsAppAsync(messageWithAttachments, conversation).catch(
          (error) => {
            this.logger.error(
              `Failed to send message to WhatsApp for conversation ${conversation_id}: ${error.message}`,
            );
          },
        );
      });
    }

    return messageWithAttachments;
  }

  async createBotMessage(
    createMessageDto: CreateMessageDto,
    bot: Bot,
  ): Promise<Message> {
    const { conversation_id } = createMessageDto;

    // Validate conversation exists and get it with integration and contact
    const conversation =
      await this.conversationsService.findOne(conversation_id);

    // Create bot message using CRUD service
    const savedMessage = await this.messageCrudService.createBotMessage(
      createMessageDto,
      bot,
    );

    // Invalidate cache for this conversation's last message
    this.lastMessageCache.invalidate(conversation_id);

    // Reload message with attachments for websocket event
    const messageWithAttachments = await this.messageCrudService.findOne(
      savedMessage.id,
    );

    // Emit MESSAGE_NEW immediately
    this.websocketGateway.emitToAll(CRM_EVENTS.MESSAGE_NEW, {
      message: messageWithAttachments,
      timestamp: new Date(),
    });

    // Send to WhatsApp in background if body is provided
    if (
      createMessageDto.body &&
      conversation.contact?.phone_number &&
      conversation.integration
    ) {
      setImmediate(() => {
        this.sendToWhatsAppAsync(messageWithAttachments, conversation).catch(
          (error) => {
            this.logger.error(
              `Failed to send bot message to WhatsApp for conversation ${conversation_id}: ${error.message}`,
            );
          },
        );
      });
    }

    return messageWithAttachments;
  }

  async updateWhatsAppMessageId(
    id: number,
    whatsappMessageId: string,
  ): Promise<void> {
    await this.messageCrudService.updateWhatsAppMessageId(
      id,
      whatsappMessageId,
    );
  }

  private async sendToWhatsAppAsync(
    message: Message,
    conversation: Conversation,
  ): Promise<void> {
    try {
      // WhatsApp sending disabled - using local storage
      // const whatsappMessageId = await this.whatsappMessageDispatcher.sendTextMessage(
      //   message,
      //   conversation,
      // );
      // if (whatsappMessageId) {
      //   await this.updateWhatsAppMessageId(message.id, whatsappMessageId);
      //   await this.emitMessageUpdateEvent(message);
      // }
    } catch (error) {
      this.logger.error(
        `Failed to send message to WhatsApp for conversation ${message.conversation_id}: ${error.message}`,
      );
    }
  }

  private async emitMessageUpdateEvent(message: Message): Promise<void> {
    const updatedMessage = await this.messageCrudService.findOne(message.id);
    // WhatsApp event emission disabled - using local storage
    // this.whatsappMessageDispatcher.emitMessageUpdateEvent(
    //   message.conversation_id,
    //   updatedMessage,
    // );
  }

  async findByConversationCursor(
    conversationId: number,
    paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    return this.messagePaginationService.findByConversationCursor(
      conversationId,
      paginationDto,
    );
  }

  async searchInConversation(
    conversationId: number,
    searchTerm: string,
    paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    return this.messagePaginationService.searchInConversation(
      conversationId,
      searchTerm,
      paginationDto,
    );
  }

  async findAll(queryDto: FindAllMessagesDto): Promise<PaginationResponseDto> {
    return this.messagePaginationService.findAll(queryDto);
  }

  async findOne(id: number): Promise<Message> {
    return this.messageCrudService.findOne(id);
  }

  async findByConversation(
    conversationId: number,
    page = 1,
    limit = 20,
  ): Promise<PaginationResponseDto> {
    return this.messagePaginationService.findByConversation(
      conversationId,
      page,
      limit,
    );
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageCrudService.update(id, updateMessageDto);
  }

  async markAsRead(markAsReadDto: MarkAsReadDto): Promise<void> {
    await this.messageCrudService.markAsRead(markAsReadDto);

    // Emit WebSocket events
    const { message_ids } = markAsReadDto;
    const now = new Date();

    // We need to get the conversation IDs to emit events
    // This could be optimized by returning them from the CRUD service
    const messages = await Promise.all(
      message_ids.map((id) => this.messageCrudService.findOne(id)),
    );

    const conversationIds = [
      ...new Set(messages.map((m) => m.conversation_id)),
    ];

    conversationIds.forEach((conversationId) => {
      this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_READ, {
        conversationId,
        readAt: now,
        timestamp: new Date(),
      });
    });
  }

  async markConversationAsRead(conversationId: number): Promise<void> {
    await this.messageCrudService.markConversationAsRead(conversationId);

    const now = new Date();

    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_UNREAD_RESET, {
      conversationId,
      timestamp: new Date(),
    });

    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_READ, {
      conversationId,
      readAt: now,
      timestamp: new Date(),
    });
  }

  async getUnreadCount(conversationId?: number): Promise<number> {
    return this.messageCrudService.getUnreadCount(conversationId);
  }

  async getUnreadContactMessages(conversationId: number): Promise<Message[]> {
    return this.messageCrudService.getUnreadContactMessages(conversationId);
  }

  async getUnreadAgentMessages(conversationId: number): Promise<Message[]> {
    return this.messageCrudService.getUnreadAgentMessages(conversationId);
  }

  async remove(id: number): Promise<void> {
    return this.messageCrudService.remove(id);
  }

  async sendMessageWithMedia(
    conversationId: number,
    sendMessageWithMediaDto: SendMessageWithMediaDto,
    files: Express.Multer.File[],
    currentUser: User,
  ): Promise<Message> {
    const { text } = sendMessageWithMediaDto;

    // Validate conversation exists and get it with integration and contact
    const conversation =
      await this.conversationsService.findOne(conversationId);

    if (!conversation.integration) {
      throw new NotFoundException(
        'WhatsApp integration not found for this conversation',
      );
    }

    if (!conversation.contact?.phone_number) {
      throw new NotFoundException(
        'Contact phone number not found for this conversation',
      );
    }

    // Create message using CRUD service
    const createMessageDto = {
      conversation_id: conversationId,
      body: text || '', // Text is optional with media
    };

    const savedMessage = await this.messageCrudService.create(
      createMessageDto,
      currentUser,
    );

    // Invalidate cache
    this.lastMessageCache.invalidate(conversationId);

    // Send media using dispatcher (which handles uploads and attachments)
    // WhatsApp media sending disabled - using local storage
    // await this.whatsappMessageDispatcher.sendMediaMessage(
    //   savedMessage,
    //   conversation,
    //   files,
    //   text,
    // );

    // Reload message with attachments for websocket event
    const reloadedMessage = await this.messageCrudService.reloadWithAttachments(
      savedMessage.id,
    );

    if (reloadedMessage) {
      // Emit MESSAGE_NEW immediately
      this.websocketGateway.emitToAll(CRM_EVENTS.MESSAGE_NEW, {
        message: reloadedMessage,
        timestamp: new Date(),
      });

      return reloadedMessage;
    }

    return savedMessage;
  }

  // private async sendMediaToWhatsAppAsync(
  //   message: Message,
  //   conversation: Conversation,
  //   files: Express.Multer.File[],
  //   text?: string,
  // ): Promise<void> {
  //   try {
  //     const firstMessageId =
  //       // await // this.whatsappMessageDispatcher.sendMediaMessage(
  //         message,
  //         conversation,
  //         files,
  //         text,
  //       );
  //
  //     if (firstMessageId) {
  //       await this.updateWhatsAppMessageId(message.id, firstMessageId);
  //       await this.emitMessageUpdateEvent(message);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to send media messages to WhatsApp for conversation ${message.conversation_id}: ${error.message}`,
  //     );
  //   }
  // }
}
