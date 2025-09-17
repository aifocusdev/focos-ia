import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';

@Injectable()
export class WebhookContactProcessor {
  private readonly logger = new Logger(WebhookContactProcessor.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async processContact(waId: string, name?: string): Promise<Contact> {
    try {
      return await this.findOrCreateContact(waId, name);
    } catch (error) {
      this.logger.error(`Failed to process contact: ${waId}`, error.stack);
      throw error;
    }
  }

  async findOrCreateContact(waId: string, name?: string): Promise<Contact> {
    let contact = await this.contactRepository.findOne({
      where: { external_id: waId },
    });

    if (!contact) {
      contact = await this.createNewContact(waId, name);
    } else if (name && !contact.name) {
      contact = await this.updateContactName(contact, name);
    }

    return contact;
  }

  private async createNewContact(
    waId: string,
    name?: string,
  ): Promise<Contact> {
    const contact = this.contactRepository.create({
      external_id: waId,
      name: name || undefined,
      phone_number: waId,
    });

    await this.contactRepository.save(contact);
    return contact;
  }

  private async updateContactName(
    contact: Contact,
    name: string,
  ): Promise<Contact> {
    contact.name = name;
    await this.contactRepository.save(contact);
    return contact;
  }
}
