import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { FindAllMessagesDto } from '../dto/find-all-messages.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import {
  CursorPaginationDto,
  CursorPaginationResponse,
  MessageCursor,
  SortOrder,
} from '../dto/cursor-pagination.dto';

@Injectable()
export class MessagePaginationService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findAll(queryDto: FindAllMessagesDto): Promise<PaginationResponseDto> {
    const {
      conversation_id,
      sender_type,
      sender_user,
      sender_bot,
      date_from,
      date_to,
      unread_only,
      page = 1,
      limit = 20,
    } = queryDto;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.bot', 'bot')
      .leftJoinAndSelect('message.attachments', 'attachments');

    if (conversation_id) {
      queryBuilder.andWhere('message.conversation_id = :conversation_id', {
        conversation_id,
      });
    }

    if (sender_type) {
      queryBuilder.andWhere('message.sender_type = :sender_type', {
        sender_type,
      });
    }

    if (sender_user) {
      queryBuilder.andWhere('message.sender_user = :sender_user', {
        sender_user,
      });
    }

    if (sender_bot) {
      queryBuilder.andWhere('message.sender_bot = :sender_bot', { sender_bot });
    }

    if (date_from && date_to) {
      queryBuilder.andWhere(
        'message.delivered_at BETWEEN :date_from AND :date_to',
        {
          date_from,
          date_to,
        },
      );
    } else if (date_from) {
      queryBuilder.andWhere('message.delivered_at >= :date_from', {
        date_from,
      });
    } else if (date_to) {
      queryBuilder.andWhere('message.delivered_at <= :date_to', { date_to });
    }

    if (unread_only) {
      queryBuilder.andWhere('message.read_at IS NULL');
    }

    queryBuilder
      .orderBy('message.delivered_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByConversation(
    conversationId: number,
    page = 1,
    limit = 20,
  ): Promise<PaginationResponseDto> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.bot', 'bot')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.conversation_id = :conversationId', { conversationId })
      .orderBy('message.delivered_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByConversationCursor(
    conversationId: number,
    paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    const { cursor, limit = 20, order = SortOrder.ASC } = paginationDto;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.bot', 'bot')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.conversation_id = :conversationId', { conversationId });

    // Apply cursor if provided
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor) {
        if (order === SortOrder.DESC) {
          queryBuilder.andWhere(
            '(message.delivered_at < :cursorDate OR (message.delivered_at = :cursorDate AND message.id < :cursorId))',
            {
              cursorDate: decodedCursor.delivered_at,
              cursorId: decodedCursor.id,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(message.delivered_at > :cursorDate OR (message.delivered_at = :cursorDate AND message.id > :cursorId))',
            {
              cursorDate: decodedCursor.delivered_at,
              cursorId: decodedCursor.id,
            },
          );
        }
      }
    }

    // Get one extra record to check if there's a next page
    queryBuilder
      .orderBy('message.delivered_at', order)
      .addOrderBy('message.id', order)
      .limit(limit + 1);

    const messages = await queryBuilder.getMany();
    const hasNextPage = messages.length > limit;

    // Remove the extra record if it exists
    if (hasNextPage) {
      messages.pop();
    }

    const hasPreviousPage = !!cursor;
    const nextCursor =
      hasNextPage && messages.length > 0
        ? this.encodeCursor({
            id: messages[messages.length - 1].id,
            delivered_at:
              messages[messages.length - 1].delivered_at.toISOString(),
          })
        : undefined;

    const previousCursor =
      hasPreviousPage && messages.length > 0
        ? this.encodeCursor({
            id: messages[0].id,
            delivered_at: messages[0].delivered_at.toISOString(),
          })
        : undefined;

    return {
      data: messages,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        nextCursor,
        previousCursor,
      },
    };
  }

  async searchInConversation(
    conversationId: number,
    searchTerm: string,
    paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    const { cursor, limit = 20, order = SortOrder.DESC } = paginationDto;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .leftJoinAndSelect('message.bot', 'bot')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.body ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });

    // Apply cursor if provided
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor) {
        if (order === SortOrder.DESC) {
          queryBuilder.andWhere(
            '(message.delivered_at < :cursorDate OR (message.delivered_at = :cursorDate AND message.id < :cursorId))',
            {
              cursorDate: decodedCursor.delivered_at,
              cursorId: decodedCursor.id,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(message.delivered_at > :cursorDate OR (message.delivered_at = :cursorDate AND message.id > :cursorId))',
            {
              cursorDate: decodedCursor.delivered_at,
              cursorId: decodedCursor.id,
            },
          );
        }
      }
    }

    queryBuilder
      .orderBy('message.delivered_at', order)
      .addOrderBy('message.id', order)
      .limit(limit + 1);

    const messages = await queryBuilder.getMany();
    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
      messages.pop();
    }

    const hasPreviousPage = !!cursor;
    const nextCursor =
      hasNextPage && messages.length > 0
        ? this.encodeCursor({
            id: messages[messages.length - 1].id,
            delivered_at:
              messages[messages.length - 1].delivered_at.toISOString(),
          })
        : undefined;

    return {
      data: messages,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        nextCursor,
      },
    };
  }

  private encodeCursor(cursor: MessageCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
  }

  private decodeCursor(cursor: string): MessageCursor | null {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch {
      return null;
    }
  }
}
