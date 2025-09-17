import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContactsService } from '../../contacts/services/contacts.service';
import { ConversationsService } from '../../conversations/services/conversations.service';

@Injectable()
export class TransferToQueueService {
  private readonly logger = new Logger(TransferToQueueService.name);

  constructor(
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async transferToQueue(userId: string): Promise<{
    status: string;
    message: string;
    conversationId: number;
  }> {
    this.logger.log('Processing transfer to queue request', { userId });

    // Buscar contact pelo phone number
    const contact = await this.contactsService.findByPhoneNumber(userId);

    // Buscar conversa ativa do contato usando método direto
    const conversations = await this.conversationsService.findByContactId(
      contact.id,
    );

    if (!conversations || conversations.length === 0) {
      throw new NotFoundException(
        `No conversation found for contact: ${contact.id}`,
      );
    }

    const conversation = conversations[0];

    // Desatribuir bot e usuário (colocar na fila)
    await this.conversationsService.unassign(conversation.id);

    this.logger.log('Conversation transferred to queue successfully', {
      userId,
      contactId: contact.id,
      conversationId: conversation.id,
    });

    return {
      status: 'success',
      message: 'Conversation transferred to queue successfully',
      conversationId: conversation.id,
    };
  }
}
