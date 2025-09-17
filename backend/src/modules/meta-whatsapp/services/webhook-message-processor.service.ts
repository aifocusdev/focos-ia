import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookMessage } from '../interfaces/meta-api.interface';
import { WhatsappMessageType } from '../enums/whatsapp-message-type.enum';
import { Message } from '../../messages/entities/message.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { WhatsappIntegrationConfig } from '../../whatsapp-integration-config/entities/whatsapp-integration-config.entity';
import { MessageSender } from '../../../common/enums';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { WebhookContactProcessor } from './webhook-contact-processor.service';
import { MediaAttachmentProcessor } from './media-attachment-processor.service';
import {
  WebhookEventEmitter,
  MessageEventData,
} from './webhook-event-emitter.service';
import { N8NBotService } from '../../n8n-bot/services/n8n-bot.service';

export interface ProcessMessageResult {
  message: Message;
  conversation: Conversation;
  contact: Contact;
  isNewConversation: boolean;
}

@Injectable()
export class WebhookMessageProcessor {
  private readonly logger = new Logger(WebhookMessageProcessor.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(WhatsappIntegrationConfig)
    private readonly integrationRepository: Repository<WhatsappIntegrationConfig>,
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
    private readonly webhookContactProcessor: WebhookContactProcessor,
    private readonly mediaAttachmentProcessor: MediaAttachmentProcessor,
    private readonly webhookEventEmitter: WebhookEventEmitter,
    private readonly n8nBotService: N8NBotService,
  ) {}

  async processIncomingMessage(
    webhookMessage: WebhookMessage,
    contactName?: string,
    integration?: WhatsappIntegrationConfig,
  ): Promise<ProcessMessageResult | null> {
    try {
      this.logger.log(
        `Processing incoming message: ${webhookMessage.id} from ${webhookMessage.from}`,
      );

      const contact = await this.processContact(webhookMessage, contactName);

      const { conversation, isNew } = await this.findOrCreateConversation(
        contact.id,
        integration,
      );

      const message = await this.processMessage(
        webhookMessage,
        conversation.id,
      );

      const result: ProcessMessageResult = {
        message,
        conversation,
        contact,
        isNewConversation: isNew,
      };

      await this.emitAppropriateEvent(result);

      // Send to N8N Bot asynchronously (fire-and-forget) only if conversation has bot assignment
      // if (result.conversation.assigned_bot) {
      //   void this.sendToN8NBot(webhookMessage);
      // }

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process incoming message: ${webhookMessage.id}`,
        error.stack,
      );
      return null;
    }
  }

  private async processContact(
    webhookMessage: WebhookMessage,
    contactName?: string,
  ): Promise<Contact> {
    return await this.webhookContactProcessor.findOrCreateContact(
      webhookMessage.from,
      contactName || this.extractContactName(webhookMessage),
    );
  }

  private async processMessage(
    webhookMessage: WebhookMessage,
    conversationId: number,
  ): Promise<Message> {
    const message = await this.createMessageFromWebhook(
      webhookMessage,
      conversationId,
    );

    await this.mediaAttachmentProcessor.processMediaAttachment(
      message,
      webhookMessage,
      { id: conversationId } as Conversation,
    );

    await this.updateConversationCounters(conversationId);

    const messageWithAttachments = await this.reloadMessageWithAttachments(
      message.id,
    );

    if (!messageWithAttachments) {
      throw new Error(`Failed to reload message: ${message.id}`);
    }

    return messageWithAttachments;
  }

  private async createMessageFromWebhook(
    webhookMessage: WebhookMessage,
    conversationId: number,
  ): Promise<Message> {
    const messageBody = this.extractMessageBody(webhookMessage);
    const deliveredAt = new Date();

    const message = this.messageRepository.create({
      conversation_id: conversationId,
      sender_type: MessageSender.CONTACT,
      body: messageBody,
      delivered_at: deliveredAt,
      whatsapp_message_id: webhookMessage.id,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last_activity_at and last_contact_message_at
    await this.conversationRepository.update(
      { id: conversationId },
      {
        last_activity_at: deliveredAt,
        last_contact_message_at: deliveredAt,
      },
    );

    this.logger.log(`Message saved successfully: ${savedMessage.id}`);
    return savedMessage;
  }

  private async updateConversationCounters(
    conversationId: number,
  ): Promise<void> {
    await this.conversationRepository.increment(
      { id: conversationId },
      'unread_count',
      1,
    );
    await this.conversationsService.markAsUnreadOnNewMessage(conversationId);
  }

  private async reloadMessageWithAttachments(
    messageId: number,
  ): Promise<Message | null> {
    const messageWithAttachments = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['attachments', 'user', 'bot'],
    });

    if (!messageWithAttachments) {
      this.logger.error(
        `Failed to reload message with attachments: ${messageId}`,
      );
    }

    return messageWithAttachments;
  }

  private async emitAppropriateEvent(
    result: ProcessMessageResult,
  ): Promise<void> {
    if (result.isNewConversation) {
      await this.emitConversationNewEvent(result);
    } else {
      this.emitMessageEvent(result);
    }
  }

  private async emitConversationNewEvent(
    result: ProcessMessageResult,
  ): Promise<void> {
    const fullConversation = await this.conversationRepository.findOne({
      where: { id: result.conversation.id },
      relations: ['contact', 'integration'],
    });

    if (!fullConversation) {
      this.logger.error(
        `Conversation not found for CONVERSATION_NEW event: ${result.conversation.id}`,
      );
      return;
    }

    this.webhookEventEmitter.emitConversationNewEvent(
      result.conversation,
      result.contact,
      result.message,
      fullConversation,
    );
  }

  private emitMessageEvent(result: ProcessMessageResult): void {
    const eventData: MessageEventData = {
      conversationId: result.conversation.id,
      message: result.message,
      contact: result.contact,
      conversation: result.conversation,
    };

    this.webhookEventEmitter.emitMessageEvent(eventData);
  }

  private async findOrCreateConversation(
    contactId: number,
    integration?: WhatsappIntegrationConfig,
  ): Promise<{ conversation: Conversation; isNew: boolean }> {
    let conversation = await this.conversationRepository.findOne({
      where: { contact_id: contactId },
      order: { created_at: 'DESC' },
    });

    if (!conversation) {
      const integrationToUse =
        integration || (await this.findFirstAvailableIntegration());
      conversation = await this.createNewConversation(
        contactId,
        integrationToUse.id,
      );
      return { conversation, isNew: true };
    }

    return { conversation, isNew: false };
  }

  private async findFirstAvailableIntegration(): Promise<WhatsappIntegrationConfig> {
    const integration = await this.integrationRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!integration) {
      throw new Error(
        'No WhatsApp integration found. Please configure at least one integration.',
      );
    }

    return integration;
  }

  private async createNewConversation(
    contactId: number,
    integrationId: number,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      contact_id: contactId,
      integration_id: integrationId,
    });

    await this.conversationRepository.save(conversation);
    this.logger.log(
      `New conversation created: ${conversation.id} with integration: ${integrationId}`,
    );

    return conversation;
  }

  private extractMessageBody(webhookMessage: WebhookMessage): string | null {
    switch (webhookMessage.type) {
      case WhatsappMessageType.TEXT:
        return webhookMessage.text?.body || null;
      case WhatsappMessageType.IMAGE:
        return webhookMessage.image?.caption || null;
      case WhatsappMessageType.DOCUMENT:
        return webhookMessage.document?.caption || null;
      case WhatsappMessageType.AUDIO:
        return null;
      case WhatsappMessageType.VIDEO:
        return webhookMessage.video?.caption || null;
      case WhatsappMessageType.LOCATION:
        return `[Location: ${webhookMessage.location?.name || 'Shared location'}]`;
      case WhatsappMessageType.CONTACTS:
        return `[Contact: ${webhookMessage.contacts?.[0]?.name?.formatted_name}]`;
      default:
        return `[${webhookMessage.type}]`;
    }
  }

  private extractContactName(
    webhookMessage: WebhookMessage,
  ): string | undefined {
    if (
      webhookMessage.type === WhatsappMessageType.CONTACTS &&
      webhookMessage.contacts &&
      webhookMessage.contacts.length > 0
    ) {
      return webhookMessage.contacts[0].name?.formatted_name;
    }
    return undefined;
  }

  private async sendToN8NBot(webhookMessage: WebhookMessage): Promise<void> {
    try {
      const { DateTime } = await import('luxon');
      const currentTimestamp =
        DateTime.now().setZone('America/Sao_Paulo').toISO() || '';

      const messageBody = this.extractMessageBody(webhookMessage);
      const botMessageType = this.mapWhatsappTypeToBot(webhookMessage.type);

      await this.n8nBotService.processMessageForBot(
        webhookMessage.id,
        webhookMessage.from,
        currentTimestamp,
        botMessageType,
        messageBody || undefined,
        this.extractAssetUrl(webhookMessage),
      );

      this.logger.log(`Message sent to N8N Bot: ${webhookMessage.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to N8N Bot: ${webhookMessage.id}`,
        error.message,
      );
    }
  }

  private mapWhatsappTypeToBot(type: WhatsappMessageType): string {
    switch (type) {
      case WhatsappMessageType.TEXT:
        return 'Text';
      case WhatsappMessageType.IMAGE:
        return 'Image';
      case WhatsappMessageType.VIDEO:
        return 'Video';
      case WhatsappMessageType.AUDIO:
        return 'Audio';
      case WhatsappMessageType.DOCUMENT:
        return 'Document';
      default:
        return 'Text';
    }
  }

  private extractAssetUrl(webhookMessage: WebhookMessage): string | undefined {
    switch (webhookMessage.type) {
      case WhatsappMessageType.IMAGE:
        return webhookMessage.image?.id; // You might need to convert this to actual URL
      case WhatsappMessageType.VIDEO:
        return webhookMessage.video?.id;
      case WhatsappMessageType.AUDIO:
        return webhookMessage.audio?.id;
      case WhatsappMessageType.DOCUMENT:
        return webhookMessage.document?.id;
      default:
        return undefined;
    }
  }
}
