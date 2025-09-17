import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { FindAllDevicesDto } from '../dto/find-all-devices.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { DEVICE_ERRORS } from '../constants/device.constants';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const existingDevice = await this.deviceRepository.findOne({
      where: { name: createDeviceDto.name },
    });

    if (existingDevice) {
      throw new ConflictException(DEVICE_ERRORS.NAME_EXISTS);
    }

    try {
      const device = this.deviceRepository.create(createDeviceDto);
      return await this.deviceRepository.save(device);
    } catch {
      throw new BadRequestException(DEVICE_ERRORS.INVALID_DATA);
    }
  }

  async findAll(queryDto: FindAllDevicesDto): Promise<PaginationResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.deviceRepository.createQueryBuilder('device');

    if (search) {
      queryBuilder.where('device.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('device.created_at', 'DESC')
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

  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(DEVICE_ERRORS.NOT_FOUND);
    }

    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);

    if (updateDeviceDto.name && updateDeviceDto.name !== device.name) {
      const existingDevice = await this.deviceRepository.findOne({
        where: { name: updateDeviceDto.name },
      });

      if (existingDevice) {
        throw new ConflictException(DEVICE_ERRORS.NAME_EXISTS);
      }
    }

    try {
      await this.deviceRepository.update(id, updateDeviceDto);
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(DEVICE_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device);
  }
}
