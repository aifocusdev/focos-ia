import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuickReply } from '../entities/quick-reply.entity';
import { CreateQuickReplyDto } from '../dto/create-quick-reply.dto';
import { UpdateQuickReplyDto } from '../dto/update-quick-reply.dto';
import { FindAllQuickRepliesDto } from '../dto/find-all-quick-replies.dto';
import { QuickReplyPaginationResponseDto } from '../dto/pagination-response.dto';
import { QUICK_REPLY_ERRORS } from '../constants/quick-reply.constants';

@Injectable()
export class QuickRepliesService {
  private readonly logger = new Logger(QuickRepliesService.name);

  constructor(
    @InjectRepository(QuickReply)
    private readonly quickReplyRepository: Repository<QuickReply>,
  ) {}

  async create(createQuickReplyDto: CreateQuickReplyDto): Promise<QuickReply> {
    const existingQuickReply = await this.quickReplyRepository.findOne({
      where: { shortcut: createQuickReplyDto.shortcut },
    });

    if (existingQuickReply) {
      throw new ConflictException(QUICK_REPLY_ERRORS.SHORTCUT_EXISTS);
    }

    try {
      const quickReply = this.quickReplyRepository.create(createQuickReplyDto);
      return await this.quickReplyRepository.save(quickReply);
    } catch (error) {
      this.logger.error('Error creating quick reply', {
        error: error.message,
        shortcut: createQuickReplyDto.shortcut,
        stack: error.stack,
      });
      if (error.code === '23505') {
        throw new ConflictException(QUICK_REPLY_ERRORS.SHORTCUT_EXISTS);
      }
      throw error;
    }
  }

  async findAll(
    queryDto: FindAllQuickRepliesDto,
  ): Promise<QuickReplyPaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;
    const offset = (page - 1) * limit;

    const queryBuilder = this.quickReplyRepository
      .createQueryBuilder('quickReply')
      .orderBy('quickReply.title', 'ASC');

    if (search && search.trim()) {
      queryBuilder.where(
        '(quickReply.title ILIKE :search OR quickReply.shortcut ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<QuickReply> {
    const quickReply = await this.quickReplyRepository.findOne({
      where: { id },
    });

    if (!quickReply) {
      throw new NotFoundException(QUICK_REPLY_ERRORS.NOT_FOUND);
    }

    return quickReply;
  }

  async update(
    id: number,
    updateQuickReplyDto: UpdateQuickReplyDto,
  ): Promise<QuickReply> {
    const quickReply = await this.findOne(id);

    if (
      updateQuickReplyDto.shortcut &&
      updateQuickReplyDto.shortcut !== quickReply.shortcut
    ) {
      const existingQuickReply = await this.quickReplyRepository.findOne({
        where: { shortcut: updateQuickReplyDto.shortcut },
      });

      if (existingQuickReply) {
        throw new ConflictException(QUICK_REPLY_ERRORS.SHORTCUT_EXISTS);
      }
    }

    try {
      Object.assign(quickReply, updateQuickReplyDto);
      return await this.quickReplyRepository.save(quickReply);
    } catch (error) {
      this.logger.error('Error updating quick reply', {
        error: error.message,
        id,
        shortcut: updateQuickReplyDto.shortcut,
        stack: error.stack,
      });
      if (error.code === '23505') {
        throw new ConflictException(QUICK_REPLY_ERRORS.SHORTCUT_EXISTS);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const quickReply = await this.findOne(id);
    await this.quickReplyRepository.remove(quickReply);
  }
}
