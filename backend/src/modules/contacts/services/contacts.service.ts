import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { TagsService } from '../../tags/services/tags.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { FindAllContactsDto } from '../dto/find-all-contacts.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { AddTagsToContactDto } from '../dto/add-tags-to-contact.dto';
import { RemoveTagsFromContactDto } from '../dto/remove-tags-from-contact.dto';
import { CONTACT_ERRORS } from '../constants/contact.constants';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly tagsService: TagsService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const existingContactByExternalId = await this.contactRepository.findOne({
      where: { external_id: createContactDto.external_id },
    });

    if (existingContactByExternalId) {
      throw new ConflictException(CONTACT_ERRORS.EXTERNAL_ID_EXISTS);
    }

    if (createContactDto.phone_number) {
      const existingContactByPhone = await this.contactRepository.findOne({
        where: { phone_number: createContactDto.phone_number },
      });

      if (existingContactByPhone) {
        throw new ConflictException(CONTACT_ERRORS.PHONE_NUMBER_EXISTS);
      }
    }

    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAllWithPagination(
    filters: FindAllContactsDto,
  ): Promise<PaginationResponseDto> {
    const {
      page = 1,
      limit = 10,
      include_tags,
      tag_ids,
      date_exp_from,
      date_exp_to,
      contact_type,
      contact_types,
      ...filterParams
    } = filters;

    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    if (include_tags) {
      queryBuilder.leftJoinAndSelect('contact.tags', 'tags');
    }

    if (filterParams.search) {
      queryBuilder
        .leftJoin('contact.contactUserAccounts', 'contactUserAccount')
        .andWhere(
          '(contact.name ILIKE :search OR contact.phone_number ILIKE :search OR contactUserAccount.username_final ILIKE :search)',
          { search: `%${filterParams.search}%` },
        );
    }

    if (date_exp_from || date_exp_to) {
      if (!filterParams.search) {
        queryBuilder.leftJoin(
          'contact.contactUserAccounts',
          'contactUserAccount',
        );
      }

      if (date_exp_from && date_exp_to) {
        queryBuilder.andWhere(
          'contactUserAccount.date_exp >= :date_exp_from AND contactUserAccount.date_exp <= :date_exp_to',
          { date_exp_from, date_exp_to },
        );
      } else if (date_exp_from) {
        queryBuilder.andWhere('contactUserAccount.date_exp >= :date_exp_from', {
          date_exp_from,
        });
      } else if (date_exp_to) {
        queryBuilder.andWhere('contactUserAccount.date_exp <= :date_exp_to', {
          date_exp_to,
        });
      }
    }

    if (filterParams.external_id) {
      queryBuilder.andWhere('contact.external_id ILIKE :external_id', {
        external_id: `%${filterParams.external_id}%`,
      });
    }

    if (tag_ids && tag_ids.length > 0) {
      queryBuilder
        .innerJoin('contact.tags', 'tag_filter')
        .andWhere('tag_filter.id IN (:...tag_ids)', { tag_ids });
    }

    if (contact_type) {
      queryBuilder.andWhere('contact.contact_type = :contact_type', {
        contact_type,
      });
    }

    if (contact_types && contact_types.length > 0) {
      queryBuilder.andWhere('contact.contact_type IN (:...contact_types)', {
        contact_types,
      });
    }

    queryBuilder.distinct(true).orderBy('contact.created_at', 'ASC');

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

  async findOne(id: number, includeTags = true): Promise<Contact> {
    if (!id || id <= 0) {
      throw new BadRequestException(CONTACT_ERRORS.INVALID_ID);
    }

    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: includeTags ? ['tags'] : [],
    });

    if (!contact) {
      throw new NotFoundException(CONTACT_ERRORS.NOT_FOUND);
    }
    return contact;
  }

  async findByExternalId(external_id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { external_id },
    });
    if (!contact) {
      throw new NotFoundException(CONTACT_ERRORS.NOT_FOUND);
    }
    return contact;
  }

  async findByPhoneNumber(phone_number: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { phone_number },
    });
    if (!contact) {
      throw new NotFoundException(CONTACT_ERRORS.NOT_FOUND);
    }
    return contact;
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.findOne(id);

    if (
      updateContactDto.external_id &&
      updateContactDto.external_id !== contact.external_id
    ) {
      const existingContactByExternalId = await this.contactRepository.findOne({
        where: { external_id: updateContactDto.external_id },
      });
      if (existingContactByExternalId) {
        throw new ConflictException(CONTACT_ERRORS.EXTERNAL_ID_EXISTS);
      }
    }

    if (
      updateContactDto.phone_number &&
      updateContactDto.phone_number !== contact.phone_number
    ) {
      const existingContactByPhone = await this.contactRepository.findOne({
        where: { phone_number: updateContactDto.phone_number },
      });
      if (existingContactByPhone) {
        throw new ConflictException(CONTACT_ERRORS.PHONE_NUMBER_EXISTS);
      }
    }

    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async remove(id: number): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
  }

  async addTagsToContact(
    id: number,
    addTagsDto: AddTagsToContactDto,
  ): Promise<Contact> {
    const contact = await this.findOne(id, true);

    const tags = await this.tagsService.findByIds(addTagsDto.tag_ids);
    if (tags.length !== addTagsDto.tag_ids.length) {
      throw new BadRequestException('Some tags were not found');
    }

    const existingTagIds = contact.tags.map((tag) => tag.id);
    const newTags = tags.filter((tag) => !existingTagIds.includes(tag.id));

    contact.tags.push(...newTags);
    return await this.contactRepository.save(contact);
  }

  async removeTagsFromContact(
    id: number,
    removeTagsDto: RemoveTagsFromContactDto,
  ): Promise<Contact> {
    const contact = await this.findOne(id, true);

    contact.tags = contact.tags.filter(
      (tag) => !removeTagsDto.tag_ids.includes(tag.id),
    );
    return await this.contactRepository.save(contact);
  }

  async getContactTags(id: number): Promise<Tag[]> {
    const contact = await this.findOne(id, true);
    return contact.tags;
  }

  async findContactsByTag(tagId: number): Promise<Contact[]> {
    await this.tagsService.findOne(tagId);

    return await this.contactRepository
      .createQueryBuilder('contact')
      .innerJoin('contact.tags', 'tag')
      .where('tag.id = :tagId', { tagId })
      .orderBy('contact.created_at', 'ASC')
      .getMany();
  }
}
