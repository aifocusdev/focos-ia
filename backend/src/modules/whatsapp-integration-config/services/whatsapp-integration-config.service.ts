import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappIntegrationConfig } from '../entities/whatsapp-integration-config.entity';
import { CreateWhatsappIntegrationConfigDto } from '../dto/create-whatsapp-integration-config.dto';
import { UpdateWhatsappIntegrationConfigDto } from '../dto/update-whatsapp-integration-config.dto';
import { FindAllWhatsappIntegrationConfigsDto } from '../dto/find-all-whatsapp-integration-configs.dto';
import { WhatsappIntegrationConfigPaginationResponseDto } from '../dto/pagination-response.dto';
import { WHATSAPP_INTEGRATION_CONFIG_ERRORS } from '../constants/whatsapp-integration-config.constants';

@Injectable()
export class WhatsappIntegrationConfigService {
  constructor(
    @InjectRepository(WhatsappIntegrationConfig)
    private readonly configRepository: Repository<WhatsappIntegrationConfig>,
  ) {}

  async create(
    createDto: CreateWhatsappIntegrationConfigDto,
  ): Promise<WhatsappIntegrationConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { phone_number_id: createDto.phone_number_id },
    });

    if (existingConfig) {
      throw new ConflictException(
        WHATSAPP_INTEGRATION_CONFIG_ERRORS.PHONE_NUMBER_EXISTS,
      );
    }

    const config = this.configRepository.create(createDto);
    return await this.configRepository.save(config);
  }

  async findAllWithPagination(
    filters: FindAllWhatsappIntegrationConfigsDto,
  ): Promise<WhatsappIntegrationConfigPaginationResponseDto> {
    const { page = 1, limit = 10, ...filterParams } = filters;

    const queryBuilder =
      this.configRepository.createQueryBuilder('whatsapp_config');

    if (filterParams.phone_number_id) {
      queryBuilder.andWhere(
        'whatsapp_config.phone_number_id ILIKE :phone_number_id',
        { phone_number_id: `%${filterParams.phone_number_id}%` },
      );
    }

    if (filterParams.business_account_id) {
      queryBuilder.andWhere(
        'whatsapp_config.business_account_id ILIKE :business_account_id',
        { business_account_id: `%${filterParams.business_account_id}%` },
      );
    }

    if (filterParams.api_version) {
      queryBuilder.andWhere('whatsapp_config.api_version = :api_version', {
        api_version: filterParams.api_version,
      });
    }

    queryBuilder.orderBy('whatsapp_config.created_at', 'ASC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<WhatsappIntegrationConfig> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        WHATSAPP_INTEGRATION_CONFIG_ERRORS.INVALID_ID,
      );
    }

    const config = await this.configRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(WHATSAPP_INTEGRATION_CONFIG_ERRORS.NOT_FOUND);
    }

    return config;
  }

  async update(
    id: number,
    updateDto: UpdateWhatsappIntegrationConfigDto,
  ): Promise<WhatsappIntegrationConfig> {
    const config = await this.findOne(id);

    if (
      updateDto.phone_number_id &&
      updateDto.phone_number_id !== config.phone_number_id
    ) {
      const existingConfig = await this.configRepository.findOne({
        where: { phone_number_id: updateDto.phone_number_id },
      });
      if (existingConfig) {
        throw new ConflictException(
          WHATSAPP_INTEGRATION_CONFIG_ERRORS.PHONE_NUMBER_EXISTS,
        );
      }
    }

    Object.assign(config, updateDto);
    return await this.configRepository.save(config);
  }

  async remove(id: number): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepository.remove(config);
  }

  async findByPhoneNumberId(
    phoneNumberId: string,
  ): Promise<WhatsappIntegrationConfig | null> {
    return await this.configRepository.findOne({
      where: { phone_number_id: phoneNumberId },
    });
  }
}
