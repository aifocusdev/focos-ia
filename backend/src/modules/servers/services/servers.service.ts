import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from '../entities/server.entity';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { FindAllServersDto } from '../dto/find-all-servers.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { SERVER_ERRORS } from '../constants/server.constants';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  async create(createServerDto: CreateServerDto): Promise<Server> {
    const existingServer = await this.serverRepository.findOne({
      where: { name: createServerDto.name },
    });

    if (existingServer) {
      throw new ConflictException(SERVER_ERRORS.NAME_EXISTS);
    }

    try {
      const server = this.serverRepository.create(createServerDto);
      return await this.serverRepository.save(server);
    } catch {
      throw new BadRequestException(SERVER_ERRORS.INVALID_DATA);
    }
  }

  async findAll(queryDto: FindAllServersDto): Promise<PaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.serverRepository.createQueryBuilder('server');

    if (search) {
      queryBuilder.where('server.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('server.created_at', 'DESC')
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

  async findOne(id: number): Promise<Server> {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException(SERVER_ERRORS.NOT_FOUND);
    }

    return server;
  }

  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server> {
    const server = await this.findOne(id);

    if (updateServerDto.name && updateServerDto.name !== server.name) {
      const existingServer = await this.serverRepository.findOne({
        where: { name: updateServerDto.name },
      });

      if (existingServer) {
        throw new ConflictException(SERVER_ERRORS.NAME_EXISTS);
      }
    }

    try {
      await this.serverRepository.update(id, updateServerDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(SERVER_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const server = await this.findOne(id);
    await this.serverRepository.remove(server);
  }
}
