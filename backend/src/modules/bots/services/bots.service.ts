import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../entities/bot.entity';
import { CreateBotDto } from '../dto/create-bot.dto';
import { UpdateBotDto } from '../dto/update-bot.dto';
import { FindAllBotsDto } from '../dto/find-all-bots.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { BOT_ERRORS } from '../constants/bot.constants';

@Injectable()
export class BotsService {
  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  async create(createBotDto: CreateBotDto): Promise<Bot> {
    const existingBot = await this.botRepository.findOne({
      where: { name: createBotDto.name },
    });

    if (existingBot) {
      throw new ConflictException(BOT_ERRORS.NAME_EXISTS);
    }

    try {
      const bot = this.botRepository.create(createBotDto);
      return await this.botRepository.save(bot);
    } catch {
      throw new BadRequestException(BOT_ERRORS.INVALID_DATA);
    }
  }

  async findAll(queryDto: FindAllBotsDto): Promise<PaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.botRepository.createQueryBuilder('bot');

    if (search) {
      queryBuilder.where(
        'bot.name ILIKE :search OR bot.description ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('bot.created_at', 'DESC')
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

  async findOne(id: number): Promise<Bot> {
    const bot = await this.botRepository.findOne({
      where: { id },
    });

    if (!bot) {
      throw new NotFoundException(BOT_ERRORS.NOT_FOUND);
    }

    return bot;
  }

  async update(id: number, updateBotDto: UpdateBotDto): Promise<Bot> {
    const bot = await this.findOne(id);

    if (updateBotDto.name && updateBotDto.name !== bot.name) {
      const existingBot = await this.botRepository.findOne({
        where: { name: updateBotDto.name },
      });

      if (existingBot) {
        throw new ConflictException(BOT_ERRORS.NAME_EXISTS);
      }
    }

    try {
      await this.botRepository.update(id, updateBotDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(BOT_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const bot = await this.findOne(id);
    await this.botRepository.remove(bot);
  }
}
