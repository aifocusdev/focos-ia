import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUserAccount } from '../entities/contact-user-account.entity';
import { CreateContactUserAccountDto } from '../dto/create-contact-user-account.dto';
import { UpdateContactUserAccountDto } from '../dto/update-contact-user-account.dto';
import { FindAllContactUserAccountsDto } from '../dto/find-all-contact-user-accounts.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { ContactsService } from '../../contacts/services/contacts.service';
import { ServersService } from '../../servers/services/servers.service';
import { CONTACT_USER_ACCOUNT_ERRORS } from '../constants/contact-user-account.constants';

@Injectable()
export class ContactUserAccountsService {
  constructor(
    @InjectRepository(ContactUserAccount)
    private readonly contactUserAccountRepository: Repository<ContactUserAccount>,
    private readonly contactsService: ContactsService,
    private readonly serversService: ServersService,
  ) {}

  async create(
    createContactUserAccountDto: CreateContactUserAccountDto,
  ): Promise<ContactUserAccount> {
    const { contact_id, server_id, username_final } =
      createContactUserAccountDto;

    // Validate contact exists
    await this.contactsService.findOne(contact_id);

    // Validate server exists
    await this.serversService.findOne(server_id);

    // Check if username already exists for this server
    const existingAccount = await this.contactUserAccountRepository.findOne({
      where: {
        username_final: username_final,
        server_id: server_id,
      },
    });

    if (existingAccount) {
      throw new ConflictException(CONTACT_USER_ACCOUNT_ERRORS.USERNAME_EXISTS);
    }

    try {
      const account = this.contactUserAccountRepository.create(
        createContactUserAccountDto,
      );
      return await this.contactUserAccountRepository.save(account);
    } catch {
      throw new BadRequestException(CONTACT_USER_ACCOUNT_ERRORS.INVALID_DATA);
    }
  }

  async findAll(
    queryDto: FindAllContactUserAccountsDto,
  ): Promise<PaginationResponseDto> {
    const {
      contact_id,
      server_id,
      username_search,
      exp_before,
      exp_after,
      expired_only,
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.contactUserAccountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.contact', 'contact')
      .leftJoinAndSelect('account.server', 'server');

    if (contact_id) {
      queryBuilder.andWhere('account.contact_id = :contact_id', { contact_id });
    }

    if (server_id) {
      queryBuilder.andWhere('account.server_id = :server_id', { server_id });
    }

    if (username_search) {
      queryBuilder.andWhere('account.username_final ILIKE :username_search', {
        username_search: `%${username_search}%`,
      });
    }

    if (exp_before) {
      queryBuilder.andWhere('account.date_exp <= :exp_before', { exp_before });
    }

    if (exp_after) {
      queryBuilder.andWhere('account.date_exp >= :exp_after', { exp_after });
    }

    if (expired_only) {
      queryBuilder.andWhere('account.date_exp IS NOT NULL');
      queryBuilder.andWhere('account.date_exp <= NOW()');
    }

    queryBuilder
      .orderBy('account.created_at', 'DESC')
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

  async findOne(id: number): Promise<ContactUserAccount> {
    const account = await this.contactUserAccountRepository.findOne({
      where: { id },
      relations: ['contact', 'server'],
    });

    if (!account) {
      throw new NotFoundException(CONTACT_USER_ACCOUNT_ERRORS.NOT_FOUND);
    }

    return account;
  }

  async findByContactId(contactId: number): Promise<ContactUserAccount[]> {
    return await this.contactUserAccountRepository.find({
      where: { contact_id: contactId },
      relations: ['contact', 'server'],
      order: { created_at: 'DESC' },
    });
  }
  async update(
    id: number,
    updateContactUserAccountDto: UpdateContactUserAccountDto,
  ): Promise<ContactUserAccount> {
    const account = await this.findOne(id);

    const { server_id, username_final } = updateContactUserAccountDto;

    // Validate server exists if provided
    if (server_id) {
      await this.serversService.findOne(server_id);
    }

    // Check username uniqueness if both username and server are being updated
    if (username_final || server_id) {
      const finalUsername = username_final || account.username_final;
      const finalServerId = server_id || account.server_id;

      if (
        finalUsername !== account.username_final ||
        finalServerId !== account.server_id
      ) {
        const existingAccount = await this.contactUserAccountRepository.findOne(
          {
            where: {
              username_final: finalUsername,
              server_id: finalServerId,
            },
          },
        );

        if (existingAccount && existingAccount.id !== id) {
          throw new ConflictException(
            CONTACT_USER_ACCOUNT_ERRORS.USERNAME_EXISTS,
          );
        }
      }
    }

    try {
      await this.contactUserAccountRepository.update(
        id,
        updateContactUserAccountDto,
      );
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(CONTACT_USER_ACCOUNT_ERRORS.INVALID_DATA);
    }
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.contactUserAccountRepository.remove(account);
  }
}
