import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { FindAllTagsDto } from '../dto/find-all-tags.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { TAG_ERRORS } from '../constants/tag.constants';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException(TAG_ERRORS.NAME_EXISTS);
    }

    try {
      const tag = this.tagRepository.create(createTagDto);
      return await this.tagRepository.save(tag);
    } catch {
      throw new BadRequestException(TAG_ERRORS.INVALID_DATA);
    }
  }

  async findAll(queryDto: FindAllTagsDto): Promise<PaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.tagRepository.createQueryBuilder('tag');

    if (search) {
      queryBuilder.where('tag.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .orderBy('tag.created_at', 'DESC')
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

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(TAG_ERRORS.NOT_FOUND);
    }

    return tag;
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return await this.tagRepository.find({
      where: { id: In(ids) },
    });
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });

      if (existingTag) {
        throw new ConflictException(TAG_ERRORS.NAME_EXISTS);
      }
    }

    try {
      await this.tagRepository.update(id, updateTagDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(TAG_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }
}
