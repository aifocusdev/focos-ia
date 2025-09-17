import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../../messages/entities/message.entity';
import { FindAllConversationsDto } from '../dto/find-all-conversations.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { AssignConversationDto } from '../dto/assign-conversation.dto';
import { UsersService } from '../../users/services/users.service';
import { CONVERSATION_ERRORS } from '../constants/conversation.constants';
import { CrmWebsocketGateway } from '../../../websocket/crm-websocket.gateway';
import { CRM_EVENTS } from '../../../websocket/events/crm-events';
import { LastMessageCacheService } from '../../cache/services/last-message-cache.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly usersService: UsersService,
    private readonly lastMessageCache: LastMessageCacheService,
    @Inject(forwardRef(() => CrmWebsocketGateway))
    private readonly websocketGateway: CrmWebsocketGateway,
  ) {
    // Start periodic cache cleanup
    this.lastMessageCache.startPeriodicCleanup();
  }

  async findAll(
    queryDto: FindAllConversationsDto,
    currentUserId: number,
  ): Promise<PaginationResponseDto> {
    const {
      contact_id,
      assigned_bot,
      unassignment,
      unread,
      tag_ids,
      search,
      page = 1,
      limit = 10,
      sortBy = 'last_activity_at',
      sortOrder = 'desc',
      contact_type,
      contact_types,
    } = queryDto;

    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.contact', 'contact')
      .leftJoinAndSelect('contact.tags', 'tags')
      .leftJoinAndSelect('conversation.integration', 'integration')
      .leftJoinAndSelect('conversation.user', 'user')
      .leftJoinAndSelect('conversation.bot', 'bot');

    if (contact_id) {
      queryBuilder.andWhere('conversation.contact_id = :contact_id', {
        contact_id,
      });
    }

    // Privacy filter: By default show only user's conversations, unless specific filters are applied
    if (unassignment === true) {
      // Show only unassigned conversations (no user, no bot)
      queryBuilder.andWhere(
        'conversation.assigned_user IS NULL AND conversation.assigned_bot IS NULL',
      );
    } else if (assigned_bot === true) {
      // Show conversations with bots (could be assigned to user or unassigned)
      queryBuilder.andWhere('conversation.assigned_bot IS NOT NULL');
      queryBuilder.andWhere(
        '(conversation.assigned_user IS NULL OR conversation.assigned_user = :currentUserId)',
        { currentUserId },
      );
    } else {
      // Default: Show only conversations assigned to current user
      queryBuilder.andWhere('conversation.assigned_user = :currentUserId', {
        currentUserId,
      });
    }

    // Apply unread filter
    if (unread !== undefined) {
      queryBuilder.andWhere('conversation.read = :read', { read: !unread });
    }

    // Apply tag filter
    if (tag_ids && tag_ids.length > 0) {
      queryBuilder
        .leftJoin('contact.tags', 'contactTag')
        .andWhere('contactTag.id IN (:...tag_ids)', { tag_ids });
    }

    // Apply search filter
    if (search) {
      this.applySearchFilter(queryBuilder, search);
    }

    // Apply contact type filter
    if (contact_type) {
      queryBuilder.andWhere('contact.contact_type = :contact_type', {
        contact_type,
      });
    }

    if (contact_types && contact_types.length > 0) {
      queryBuilder.andWhere('contact.contact_type IN (:...contact_types)', {
        contact_types,
      });
    }

    queryBuilder
      .orderBy(
        `conversation.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Get last message for each conversation
    if (data.length > 0) {
      await this.addLastMessagesToConversations(data);
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Helper method to apply search filter across contact name, last 4 digits of phone and contact-user-accounts
  private applySearchFilter(
    queryBuilder: SelectQueryBuilder<Conversation>,
    search: string,
  ): void {
    queryBuilder
      .leftJoin('contact.contactUserAccounts', 'contactUserAccount')
      .andWhere(
        "(contact.name ILIKE :search OR RIGHT(REGEXP_REPLACE(contact.phone_number, '[^0-9]', '', 'g'), 4) ILIKE :search OR contact.notes ILIKE :search OR contactUserAccount.username_final ILIKE :search)",
        { search: `%${search}%` },
      );
  }

  // Helper method to add last messages to conversations (extracted from findAll)
  private async addLastMessagesToConversations(
    conversations: Conversation[],
  ): Promise<void> {
    const conversationIds = conversations.map((conv) => conv.id);
    const lastMessages =
      await this.getCachedOrQueryLastMessages(conversationIds);

    // Add last_message to each conversation
    conversations.forEach((conversation) => {
      conversation.last_message = lastMessages.get(conversation.id);
    });
  }

  private async getCachedOrQueryLastMessages(
    conversationIds: number[],
  ): Promise<Map<number, Message>> {
    const lastMessagesByConversation = new Map<number, Message>();
    const conversationsNeedingQuery: number[] = [];

    // Check cache first
    for (const conversationId of conversationIds) {
      const cachedMessage = this.lastMessageCache.get(conversationId);
      if (cachedMessage) {
        lastMessagesByConversation.set(conversationId, cachedMessage);
      } else {
        conversationsNeedingQuery.push(conversationId);
      }
    }

    // Query database for conversations not in cache
    if (conversationsNeedingQuery.length > 0) {
      const lastMessages = await this.queryLastMessages(
        conversationsNeedingQuery,
      );

      // Cache the results and map to conversations
      lastMessages.forEach((msg) => {
        lastMessagesByConversation.set(msg.conversation_id, msg);
        this.lastMessageCache.set(msg.conversation_id, msg);
      });
    }

    return lastMessagesByConversation;
  }

  private async queryLastMessages(
    conversationIds: number[],
  ): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.bot', 'bot')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where(
        'message.id IN (' +
          'SELECT id FROM (' +
          'SELECT id, ROW_NUMBER() OVER (' +
          'PARTITION BY conversation_id ' +
          'ORDER BY delivered_at DESC, id DESC' +
          ') as rn ' +
          'FROM message ' +
          'WHERE conversation_id = ANY(:conversationIds)' +
          ') ranked WHERE rn = 1' +
          ')',
        { conversationIds },
      )
      .getMany();
  }

  async findOne(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['contact', 'integration', 'user', 'bot'],
    });

    if (!conversation) {
      throw new NotFoundException(CONVERSATION_ERRORS.NOT_FOUND);
    }

    return conversation;
  }

  async findByContactId(contactId: number): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { contact_id: contactId },
      relations: ['contact', 'integration', 'user', 'bot'],
      order: { last_activity_at: 'DESC' },
    });
  }

  async assign(
    id: number,
    assignDto: AssignConversationDto,
    currentUserId: number,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);
    const { assigned_user } = assignDto;

    // Auto-assignment logic: assign to specified user or current user if none specified
    const targetUserId = assigned_user || currentUserId;

    // Validate target user exists
    await this.usersService.findOne(targetUserId);

    // Check if conversation already has a user assignment
    if (conversation.assigned_user) {
      throw new ConflictException(CONVERSATION_ERRORS.ALREADY_ASSIGNED);
    }

    const updateData: Partial<Conversation> = {
      assigned_user: targetUserId,
      assigned_bot: null, // Clear any bot assignment
      unread_count: 0, // Reset unread count when conversation is assigned
    };

    await this.conversationRepository.update(id, updateData);
    const updatedConversation = await this.findOne(id);

    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_ASSIGNED, {
      conversationId: id,
      assignedUser: targetUserId,
      assignedBot: null,
      timestamp: new Date(),
    });

    // Emit unread reset event
    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_UNREAD_RESET, {
      conversationId: id,
      timestamp: new Date(),
    });

    return updatedConversation;
  }

  async markAsRead(id: number, currentUserId: number): Promise<Conversation> {
    const conversation = await this.findOne(id);
    this.validateConversationAccess(conversation, currentUserId);

    // Mark conversation as read and reset unread count
    await this.conversationRepository.update(id, {
      read: true,
      unread_count: 0,
    });

    const updatedConversation = await this.findOne(id);

    // Emit WebSocket event
    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_READ, {
      conversationId: id,
      read: true,
      unreadCount: 0,
      timestamp: new Date(),
    });

    return updatedConversation;
  }

  async markAsUnread(id: number, currentUserId: number): Promise<Conversation> {
    const conversation = await this.findOne(id);
    this.validateConversationAccess(conversation, currentUserId);

    // Mark conversation as unread
    await this.conversationRepository.update(id, {
      read: false,
    });

    // Use atomic increment operation to avoid race conditions
    await this.conversationRepository.increment({ id }, 'unread_count', 1);

    const updatedConversation = await this.findOne(id);

    // Emit WebSocket event
    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_UNREAD, {
      conversationId: id,
      read: false,
      unreadCount: updatedConversation.unread_count,
      timestamp: new Date(),
    });

    return updatedConversation;
  }

  async markAsUnreadOnNewMessage(conversationId: number): Promise<void> {
    await this.conversationRepository.update(
      { id: conversationId },
      { read: false },
    );
  }

  async unassign(id: number): Promise<Conversation> {
    await this.findOne(id); // Validate conversation exists

    const updateData: Partial<Conversation> = {
      assigned_user: null,
      assigned_bot: null,
    };

    await this.conversationRepository.update(id, updateData);
    const updatedConversation = await this.findOne(id);

    this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_ASSIGNED, {
      conversationId: id,
      assignedUser: null,
      assignedBot: null,
      timestamp: new Date(),
    });

    return updatedConversation;
  }

  private validateConversationAccess(
    conversation: Conversation,
    currentUserId: number,
  ): void {
    // Validate access: user can access their own conversations, unassigned conversations, and bot conversations
    const hasAccess =
      !conversation.assigned_user || // Unassigned conversation
      conversation.assigned_user === currentUserId || // User's own conversation
      conversation.assigned_bot !== null; // Bot conversation

    if (!hasAccess) {
      throw new BadRequestException(
        'You do not have access to this conversation',
      );
    }
  }
}
