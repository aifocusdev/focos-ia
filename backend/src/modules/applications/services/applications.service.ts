import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { FindAllApplicationsDto } from '../dto/find-all-applications.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { APPLICATION_ERRORS } from '../constants/application.constants';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { name: createApplicationDto.name },
    });

    if (existingApplication) {
      throw new ConflictException(APPLICATION_ERRORS.NAME_EXISTS);
    }

    try {
      const application =
        this.applicationRepository.create(createApplicationDto);
      return await this.applicationRepository.save(application);
    } catch {
      throw new BadRequestException(APPLICATION_ERRORS.INVALID_DATA);
    }
  }

  async findAll(
    queryDto: FindAllApplicationsDto,
  ): Promise<PaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder =
      this.applicationRepository.createQueryBuilder('application');

    if (search) {
      queryBuilder.where('application.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('application.created_at', 'DESC')
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

  async findOne(id: number): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(APPLICATION_ERRORS.NOT_FOUND);
    }

    return application;
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.findOne(id);

    if (
      updateApplicationDto.name &&
      updateApplicationDto.name !== application.name
    ) {
      const existingApplication = await this.applicationRepository.findOne({
        where: { name: updateApplicationDto.name },
      });

      if (existingApplication) {
        throw new ConflictException(APPLICATION_ERRORS.NAME_EXISTS);
      }
    }

    try {
      await this.applicationRepository.update(id, updateApplicationDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(APPLICATION_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }
}
