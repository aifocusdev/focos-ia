import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import { MessageSender } from '../../../common/enums';
import { MESSAGE_ERRORS } from '../constants/message.constants';
import { User } from '../../users/entities/user.entity';
import { Bot } from '../../bots/entities/bot.entity';

@Injectable()
export class MessageCrudService {
  private readonly logger = new Logger(MessageCrudService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    currentUser: User,
  ): Promise<Message> {
    const now = new Date();
    const message = this.messageRepository.create({
      ...createMessageDto,
      sender_type: MessageSender.USER,
      sender_user: currentUser.id,
      delivered_at: createMessageDto.delivered_at || now,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last_activity_at and last_contact_message_at if needed
    const updateData: Partial<Conversation> = {
      last_activity_at: savedMessage.delivered_at,
    };

    // If message is from contact, also update last_contact_message_at
    if (savedMessage.sender_type === MessageSender.CONTACT) {
      updateData.last_contact_message_at = savedMessage.delivered_at;
    }

    const updateResult = await this.conversationRepository.update(
      { id: createMessageDto.conversation_id },
      updateData,
    );

    this.logger.log(
      `Updated conversation ${createMessageDto.conversation_id}. Fields updated: ${Object.keys(updateData).join(', ')}. Affected rows: ${updateResult.affected}`,
    );

    return savedMessage;
  }

  async createBotMessage(
    createMessageDto: CreateMessageDto,
    bot: Bot,
  ): Promise<Message> {
    const now = new Date();
    const message = this.messageRepository.create({
      ...createMessageDto,
      sender_type: MessageSender.BOT,
      sender_bot: bot.id,
      delivered_at: createMessageDto.delivered_at || now,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last_activity_at
    const updateData: Partial<Conversation> = {
      last_activity_at: savedMessage.delivered_at,
    };

    const updateResult = await this.conversationRepository.update(
      { id: createMessageDto.conversation_id },
      updateData,
    );

    this.logger.log(
      `Updated conversation ${createMessageDto.conversation_id}. Fields updated: ${Object.keys(updateData).join(', ')}. Affected rows: ${updateResult.affected}`,
    );

    return savedMessage;
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['conversation', 'user', 'bot', 'attachments'],
    });

    if (!message) {
      throw new NotFoundException(MESSAGE_ERRORS.NOT_FOUND);
    }

    return message;
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    await this.findOne(id);

    await this.messageRepository.update(id, updateMessageDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  async updateWhatsAppMessageId(
    id: number,
    whatsappMessageId: string,
  ): Promise<void> {
    await this.messageRepository.update(id, {
      whatsapp_message_id: whatsappMessageId,
    });
  }

  async markAsRead(markAsReadDto: MarkAsReadDto): Promise<void> {
    try {
      const { message_ids } = markAsReadDto;
      const now = new Date();

      await this.messageRepository.update(message_ids, { read_at: now });

      this.logger.log(`Marked ${message_ids.length} messages as read`);
    } catch (error) {
      this.logger.error(
        `Failed to mark messages as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markConversationAsRead(conversationId: number): Promise<void> {
    try {
      const now = new Date();

      await this.messageRepository.update(
        { conversation_id: conversationId, read_at: IsNull() },
        { read_at: now },
      );

      // Reset unread count to 0
      await this.conversationRepository.update(
        { id: conversationId },
        { unread_count: 0 },
      );

      this.logger.log(`Marked conversation ${conversationId} as read`);
    } catch (error) {
      this.logger.error(
        `Failed to mark conversation as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUnreadCount(conversationId?: number): Promise<number> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.read_at IS NULL');

    if (conversationId) {
      queryBuilder.andWhere('message.conversation_id = :conversationId', {
        conversationId,
      });
    }

    return await queryBuilder.getCount();
  }

  async getUnreadContactMessages(conversationId: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: {
        conversation_id: conversationId,
        sender_type: MessageSender.CONTACT,
        read_at: IsNull(),
      },
      relations: ['attachments'],
      order: { delivered_at: 'ASC' },
    });
  }

  async getUnreadAgentMessages(conversationId: number): Promise<Message[]> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.sender_type IN (:...senderTypes)', {
        senderTypes: [MessageSender.USER, MessageSender.BOT],
      })
      .andWhere('message.read_at IS NULL')
      .orderBy('message.delivered_at', 'ASC');

    return await queryBuilder.getMany();
  }

  async reloadWithAttachments(messageId: number): Promise<Message | null> {
    const messageWithAttachments = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['attachments', 'user', 'bot'],
    });

    if (!messageWithAttachments) {
      this.logger.error(
        `Failed to reload message with attachments: ${messageId}`,
      );
    }

    return messageWithAttachments;
  }
}
