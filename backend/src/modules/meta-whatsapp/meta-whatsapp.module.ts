import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MetaWhatsappApiService } from './services/meta-whatsapp-api.service';
import { WhatsappWebhookService } from './services/whatsapp-webhook.service';
import { WebhookEventEmitter } from './services/webhook-event-emitter.service';
import { MediaAttachmentProcessor } from './services/media-attachment-processor.service';
import { WebhookContactProcessor } from './services/webhook-contact-processor.service';
import { WebhookStatusProcessor } from './services/webhook-status-processor.service';
import { WebhookMessageProcessor } from './services/webhook-message-processor.service';
import { BotResponseProcessor } from './services/bot-response-processor.service';
import { TransferToQueueService } from './services/transfer-to-queue.service';
import { MetaWhatsappWebhookController } from './controllers/meta-whatsapp-webhook.controller';
import { Contact } from '../contacts/entities/contact.entity';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { WhatsappIntegrationConfig } from '../whatsapp-integration-config/entities/whatsapp-integration-config.entity';
import { WebsocketModule } from '../../websocket/websocket.module';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { ContactsModule } from '../contacts/contacts.module';
import { WhatsappIntegrationConfigModule } from '../whatsapp-integration-config/whatsapp-integration-config.module';
import { MessageAttachmentsModule } from '../message-attachments/message-attachments.module';
import { CacheModule } from '../../common/cache/cache.module';
import { WhatsappIntegrationCacheService } from './cache/whatsapp-integration-cache.service';
import { N8NBotModule } from '../n8n-bot/n8n-bot.module';
import { BotsModule } from '../bots/bots.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Contact,
      Message,
      Conversation,
      WhatsappIntegrationConfig,
    ]),
    forwardRef(() => WebsocketModule),
    forwardRef(() => MessagesModule),
    forwardRef(() => ConversationsModule),
    forwardRef(() => ContactsModule),
    forwardRef(() => MessageAttachmentsModule),
    WhatsappIntegrationConfigModule,
    CacheModule,
    N8NBotModule,
    BotsModule,
  ],
  controllers: [MetaWhatsappWebhookController],
  providers: [
    MetaWhatsappApiService,
    WhatsappWebhookService,
    WebhookEventEmitter,
    MediaAttachmentProcessor,
    WebhookContactProcessor,
    WebhookStatusProcessor,
    WebhookMessageProcessor,
    BotResponseProcessor,
    TransferToQueueService,
    WhatsappIntegrationCacheService,
  ],
  exports: [
    MetaWhatsappApiService,
    WhatsappWebhookService,
    WebhookEventEmitter,
    MediaAttachmentProcessor,
    WebhookContactProcessor,
    WebhookStatusProcessor,
    WebhookMessageProcessor,
    WhatsappIntegrationCacheService,
  ],
})
export class MetaWhatsappModule {}
