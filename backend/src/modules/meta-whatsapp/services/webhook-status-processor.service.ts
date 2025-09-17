import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookStatus } from '../interfaces/meta-api.interface';
import { Message } from '../../messages/entities/message.entity';
import { WhatsappStatus } from '../enums/whatsapp-status.enum';
import {
  WebhookEventEmitter,
  MessageStatusEventData,
} from './webhook-event-emitter.service';

@Injectable()
export class WebhookStatusProcessor {
  private readonly logger = new Logger(WebhookStatusProcessor.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly webhookEventEmitter: WebhookEventEmitter,
  ) {}

  async processMessageStatus(status: WebhookStatus): Promise<void> {
    try {
      const message = await this.findMessageByWhatsAppId(status.id);
      if (!message) {
        this.logger.warn(`Message not found for status update: ${status.id}`);
        return;
      }

      await this.updateMessageStatus(message, status);
      this.emitStatusEvent(message, status);
    } catch (error) {
      this.logger.error(
        `Failed to process message status: ${status.id}`,
        error.stack,
      );
    }
  }

  private async findMessageByWhatsAppId(
    whatsappMessageId: string,
  ): Promise<Message | null> {
    return await this.messageRepository.findOne({
      where: { whatsapp_message_id: whatsappMessageId },
    });
  }

  private async updateMessageStatus(
    message: Message,
    status: WebhookStatus,
  ): Promise<void> {
    const statusTimestamp = new Date(Number(status.timestamp) * 1000);

    switch (status.status) {
      case WhatsappStatus.READ:
        message.read_at = statusTimestamp;
        break;
      case WhatsappStatus.DELIVERED:
        message.delivered_at = statusTimestamp;
        break;
    }

    await this.messageRepository.save(message);
  }

  private emitStatusEvent(message: Message, status: WebhookStatus): void {
    const eventData: MessageStatusEventData = {
      messageId: message.id,
      whatsappMessageId: status.id,
      status: status.status,
      timestamp: status.timestamp,
    };

    this.webhookEventEmitter.emitMessageStatusEvent(eventData);
  }
}
