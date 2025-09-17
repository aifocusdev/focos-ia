import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookPayload, WebhookEntry } from '../interfaces/meta-api.interface';
import { WebhookContactProcessor } from './webhook-contact-processor.service';
import { WebhookMessageProcessor } from './webhook-message-processor.service';
import { WebhookStatusProcessor } from './webhook-status-processor.service';
import { WhatsappIntegrationCacheService } from '../cache/whatsapp-integration-cache.service';

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name);
  private readonly verifyToken: string;

  constructor(
    private configService: ConfigService,
    private webhookContactProcessor: WebhookContactProcessor,
    private webhookMessageProcessor: WebhookMessageProcessor,
    private webhookStatusProcessor: WebhookStatusProcessor,
    private whatsappIntegrationCacheService: WhatsappIntegrationCacheService,
  ) {
    this.verifyToken =
      this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || '';
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verified successfully');
      return challenge;
    }

    this.logger.warn('Webhook verification failed');
    return null;
  }

  async processWebhook(payload: WebhookPayload): Promise<void> {
    const results = await Promise.allSettled(
      payload.entry.map((entry) => this.processEntry(entry)),
    );

    const failedCount = results.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      this.logger.warn(
        `${failedCount} entries failed to process out of ${payload.entry.length}`,
      );
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(`Entry ${index} failed:`, result.reason);
        }
      });
    }
  }

  private async processEntry(entry: WebhookEntry): Promise<void> {
    for (const change of entry.changes) {
      const { value } = change;

      // Validate phone_number_id exists in integrations
      if (!value.metadata?.phone_number_id) {
        this.logger.warn(
          'Webhook received without phone_number_id in metadata',
        );
        throw new BadRequestException(
          'phone_number_id is required in webhook metadata',
        );
      }

      const integration =
        await this.whatsappIntegrationCacheService.getIntegrationByPhoneNumberId(
          value.metadata.phone_number_id,
        );

      if (!integration) {
        this.logger.warn(
          `No integration found for phone_number_id: ${value.metadata.phone_number_id}`,
        );
        throw new BadRequestException(
          `Integration not found for phone_number_id: ${value.metadata.phone_number_id}`,
        );
      }

      // Create a map of contact names for this entry
      const contactNames = new Map<string, string>();
      if (value.contacts) {
        for (const contact of value.contacts) {
          contactNames.set(contact.wa_id, contact.profile.name);
          await this.webhookContactProcessor.processContact(
            contact.wa_id,
            contact.profile.name,
          );
        }
      }

      if (value.messages) {
        for (const message of value.messages) {
          const contactName = contactNames.get(message.from);
          await this.webhookMessageProcessor.processIncomingMessage(
            message,
            contactName,
            integration,
          );
        }
      }

      if (value.statuses) {
        for (const status of value.statuses) {
          await this.webhookStatusProcessor.processMessageStatus(status);
        }
      }
    }
  }
}
