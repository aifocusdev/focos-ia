import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappMessageType } from '../enums/whatsapp-message-type.enum';
import { WebhookMessage } from '../interfaces/meta-api.interface';
import { Message } from '../../messages/entities/message.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { WhatsappIntegrationConfig } from '../../whatsapp-integration-config/entities/whatsapp-integration-config.entity';
import { MessageAttachmentsService } from '../../message-attachments/services/message-attachments.service';
import { MetaWhatsappApiService } from './meta-whatsapp-api.service';
import { AttachmentKind } from '../../../common/enums';

export interface MediaInfo {
  mediaId: string;
  mimeType: string;
  filename?: string;
  attachmentKind: AttachmentKind;
}

@Injectable()
export class MediaAttachmentProcessor {
  private readonly logger = new Logger(MediaAttachmentProcessor.name);

  constructor(
    @InjectRepository(WhatsappIntegrationConfig)
    private readonly integrationRepository: Repository<WhatsappIntegrationConfig>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(forwardRef(() => MessageAttachmentsService))
    private readonly messageAttachmentsService: MessageAttachmentsService,
    @Inject(forwardRef(() => MetaWhatsappApiService))
    private readonly metaApiService: MetaWhatsappApiService,
  ) {}

  async processMediaAttachment(
    message: Message,
    webhookMessage: WebhookMessage,
    conversation: Conversation,
  ): Promise<void> {
    if (!this.isMediaMessage(webhookMessage.type)) {
      return;
    }

    this.logger.log(
      `Starting media attachment processing for message ${message.id}, type: ${webhookMessage.type}`,
    );

    try {
      const integration = await this.getIntegration(conversation);
      const mediaInfo = this.extractMediaInfo(webhookMessage);

      this.validateMediaInfo(mediaInfo, message);
      this.validateIntegration(integration);

      const mediaUrl = await this.metaApiService.getMediaUrl(
        mediaInfo.mediaId,
        integration,
      );

      const mediaBuffer = await this.metaApiService.downloadMedia(
        mediaUrl,
        integration,
      );

      const file = this.createFileFromBuffer(
        mediaBuffer,
        mediaInfo,
        webhookMessage,
      );

      const attachment =
        await this.messageAttachmentsService.createFromUploadedFile(
          message.id,
          file,
          `whatsapp-${mediaInfo.attachmentKind}`,
        );

      this.logger.log(
        `Media attachment created successfully for message: ${message.id}, attachment ID: ${attachment.id}, type: ${mediaInfo.attachmentKind}, URL: ${attachment.url}`,
      );
    } catch (error) {
      await this.handleProcessingError(
        error,
        message,
        webhookMessage,
        conversation,
      );
    }
  }

  private isMediaMessage(messageType: WhatsappMessageType): boolean {
    return [
      WhatsappMessageType.IMAGE,
      WhatsappMessageType.VIDEO,
      WhatsappMessageType.AUDIO,
      WhatsappMessageType.DOCUMENT,
    ].includes(messageType);
  }

  private async getIntegration(
    conversation: Conversation,
  ): Promise<WhatsappIntegrationConfig> {
    const integration = await this.integrationRepository.findOne({
      where: { id: conversation.integration_id },
    });

    if (!integration) {
      throw new Error(
        `No integration found for conversation: ${conversation.id}, cannot process media attachment`,
      );
    }

    return integration;
  }

  private extractMediaInfo(webhookMessage: WebhookMessage): MediaInfo {
    let mediaId: string | undefined;
    let mimeType: string | undefined;
    let filename: string | undefined;
    let attachmentKind: AttachmentKind = AttachmentKind.DOCUMENT;

    switch (webhookMessage.type) {
      case WhatsappMessageType.IMAGE:
        mediaId = webhookMessage.image?.id;
        mimeType = webhookMessage.image?.mime_type;
        attachmentKind = AttachmentKind.IMAGE;
        break;
      case WhatsappMessageType.VIDEO:
        mediaId = webhookMessage.video?.id;
        mimeType = webhookMessage.video?.mime_type;
        attachmentKind = AttachmentKind.VIDEO;
        break;
      case WhatsappMessageType.AUDIO:
        mediaId = webhookMessage.audio?.id;
        mimeType = webhookMessage.audio?.mime_type;
        attachmentKind = AttachmentKind.AUDIO;
        break;
      case WhatsappMessageType.DOCUMENT:
        mediaId = webhookMessage.document?.id;
        mimeType = webhookMessage.document?.mime_type;
        filename = webhookMessage.document?.filename;
        attachmentKind = AttachmentKind.DOCUMENT;
        break;
    }

    return {
      mediaId: mediaId!,
      mimeType: mimeType!,
      filename,
      attachmentKind,
    };
  }

  private validateMediaInfo(mediaInfo: MediaInfo, message: Message): void {
    if (!mediaInfo.mediaId || !mediaInfo.mimeType) {
      throw new Error(
        `Missing required media information for message ${message.id}: mediaId=${mediaInfo.mediaId}, mimeType=${mediaInfo.mimeType}`,
      );
    }
  }

  private validateIntegration(integration: WhatsappIntegrationConfig): void {
    if (!integration.access_token || !integration.phone_number_id) {
      throw new Error(
        `Integration ${integration.id} missing required fields: access_token=${!!integration.access_token}, phone_number_id=${!!integration.phone_number_id}`,
      );
    }
  }

  private createFileFromBuffer(
    mediaBuffer: Buffer,
    mediaInfo: MediaInfo,
    webhookMessage: WebhookMessage,
  ): Express.Multer.File {
    const file = {
      buffer: mediaBuffer,
      mimetype: mediaInfo.mimeType,
      originalname:
        mediaInfo.filename || `${webhookMessage.type}_${Date.now()}`,
      size: mediaBuffer.length,
    } as Express.Multer.File;

    return file;
  }

  private async handleProcessingError(
    error: any,
    message: Message,
    webhookMessage: WebhookMessage,
    conversation: Conversation,
  ): Promise<void> {
    const errorContext = {
      messageId: message.id,
      conversationId: conversation.id,
      webhookMessageType: webhookMessage.type,
      webhookMessageId: webhookMessage.id,
      integrationId: conversation.integration_id,
    };

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logSpecificError(errorMessage, errorContext, errorStack);
    await this.updateMessageWithFailureNotice(message);
  }

  private logSpecificError(
    errorMessage: string,
    errorContext: any,
    errorStack?: string,
  ): void {
    if (errorMessage?.includes('access_token')) {
      this.logger.error(
        `Authentication error processing media attachment: ${errorMessage}`,
        { ...errorContext, errorType: 'AUTH_ERROR' },
      );
    } else if (errorMessage?.includes('media')) {
      this.logger.error(
        `Media API error processing attachment: ${errorMessage}`,
        { ...errorContext, errorType: 'MEDIA_API_ERROR' },
      );
    } else if (
      errorMessage?.includes('upload') ||
      errorMessage?.includes('storage')
    ) {
      this.logger.error(
        `Storage/upload error processing attachment: ${errorMessage}`,
        { ...errorContext, errorType: 'STORAGE_ERROR' },
      );
    } else {
      this.logger.error(
        `Unknown error processing media attachment: ${errorMessage}`,
        { ...errorContext, errorType: 'UNKNOWN_ERROR', stack: errorStack },
      );
    }
  }

  private async updateMessageWithFailureNotice(
    message: Message,
  ): Promise<void> {
    try {
      const currentBody = message.body || '';
      const failureNotice = ' (Attachment failed to process)';

      if (!currentBody.includes(failureNotice)) {
        message.body = currentBody + failureNotice;
        await this.messageRepository.save(message);
      }
    } catch (updateError) {
      const updateErrorMessage =
        updateError instanceof Error
          ? updateError.message
          : String(updateError);
      this.logger.error(
        `Failed to update message body after attachment error: ${updateErrorMessage}`,
      );
    }
  }
}
