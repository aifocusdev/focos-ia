import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  MetaTextMessage,
  MetaMediaMessage,
  MetaApiResponse,
  MetaApiError,
} from '../interfaces/meta-api.interface';
import { WhatsappMessageType } from '../enums/whatsapp-message-type.enum';
import { WhatsappIntegrationConfig } from '../../whatsapp-integration-config/entities/whatsapp-integration-config.entity';

// Internal DTOs for WhatsApp API communication
interface SendTextMessageDto {
  to: string;
  text: string;
}

interface SendMediaMessageDto {
  to: string;
  type: WhatsappMessageType;
  mediaId: string;
  caption?: string;
  filename?: string;
}

interface SendMediaUrlMessageDto {
  to: string;
  type: WhatsappMessageType;
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

@Injectable()
export class MetaWhatsappApiService {
  private readonly logger = new Logger(MetaWhatsappApiService.name);
  private readonly baseUrl = 'https://graph.facebook.com';

  constructor() {}

  private createHttpClient(
    integration: WhatsappIntegrationConfig,
  ): AxiosInstance {
    const httpClient = axios.create({
      baseURL: `${this.baseUrl}/${integration.api_version}`,
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors(httpClient);
    return httpClient;
  }

  private setupInterceptors(httpClient: AxiosInstance): void {
    httpClient.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(new Error(String(error)));
      },
    );

    httpClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.logger.error(
          'Response interceptor error:',
          error.response?.data || error.message,
        );
        return Promise.reject(new Error(String(error)));
      },
    );
  }

  async sendTextMessage(
    dto: SendTextMessageDto,
    integration: WhatsappIntegrationConfig,
  ): Promise<MetaApiResponse> {
    try {
      const httpClient = this.createHttpClient(integration);

      const payload: MetaTextMessage = {
        messaging_product: 'whatsapp',
        to: dto.to,
        type: 'text',
        text: {
          body: dto.text,
        },
      };

      const response: AxiosResponse<MetaApiResponse> = await httpClient.post(
        `/${integration.phone_number_id}/messages`,
        payload,
      );

      this.logger.log(`Text message sent successfully to ${dto.to}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Failed to send text message');
    }
  }

  async sendMediaMessage(
    dto: SendMediaMessageDto,
    integration: WhatsappIntegrationConfig,
  ): Promise<MetaApiResponse> {
    try {
      const httpClient = this.createHttpClient(integration);

      const payload: MetaMediaMessage = {
        messaging_product: 'whatsapp',
        to: dto.to,
        type: dto.type,
      };

      this.setMediaPayloadByType(payload, dto.type, {
        mediaId: dto.mediaId,
        caption: dto.caption,
        filename: dto.filename,
      });

      const response: AxiosResponse<MetaApiResponse> = await httpClient.post(
        `/${integration.phone_number_id}/messages`,
        payload,
      );

      this.logger.log(
        `Media message (${dto.type}) sent successfully to ${dto.to}`,
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Failed to send media message');
    }
  }

  async sendMediaUrlMessage(
    dto: SendMediaUrlMessageDto,
    integration: WhatsappIntegrationConfig,
  ): Promise<MetaApiResponse> {
    try {
      const httpClient = this.createHttpClient(integration);

      const payload: MetaMediaMessage = {
        messaging_product: 'whatsapp',
        to: dto.to,
        type: dto.type,
      };

      this.setMediaPayloadByType(payload, dto.type, {
        mediaUrl: dto.mediaUrl,
        caption: dto.caption,
        filename: dto.filename,
      });

      const response: AxiosResponse<MetaApiResponse> = await httpClient.post(
        `/${integration.phone_number_id}/messages`,
        payload,
      );

      this.logger.log(
        `Media URL message (${dto.type}) sent successfully to ${dto.to}`,
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Failed to send media URL message');
    }
  }

  async markMessageAsRead(
    messageId: string,
    integration: WhatsappIntegrationConfig,
  ): Promise<void> {
    try {
      const httpClient = this.createHttpClient(integration);

      await httpClient.post(`/${integration.phone_number_id}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      this.logger.log(`Message marked as read: ${messageId}`);
    } catch (error) {
      this.handleApiError(error, 'Failed to mark message as read');
    }
  }

  async getMediaUrl(
    mediaId: string,
    integration: WhatsappIntegrationConfig,
  ): Promise<string> {
    try {
      const httpClient = this.createHttpClient(integration);

      // First, get the media info to get the download URL
      const response: AxiosResponse<{
        url: string;
        mime_type: string;
        sha256: string;
        file_size: number;
        id: string;
      }> = await httpClient.get(`/${mediaId}`);

      this.logger.log(`Retrieved media URL for: ${mediaId}`);
      return response.data.url;
    } catch (error) {
      this.logger.error(
        `Failed to get media URL for ${mediaId}: ${error.message}`,
        { mediaId, integrationId: integration.id },
      );
      this.handleApiError(error, `Failed to get media URL for ${mediaId}`);
    }
  }

  async downloadMedia(
    mediaUrl: string,
    integration: WhatsappIntegrationConfig,
  ): Promise<Buffer> {
    try {
      const httpClient = this.createHttpClient(integration);

      // Download the actual media file
      const response: AxiosResponse<ArrayBuffer> = await httpClient.get(
        mediaUrl,
        {
          responseType: 'arraybuffer',
        },
      );

      const buffer = Buffer.from(response.data);
      this.logger.debug(
        `Media download completed, buffer size: ${buffer.length} bytes, content-type: ${response.headers['content-type']}`,
      );
      this.logger.log(`Downloaded media from URL: ${mediaUrl}`);
      return buffer;
    } catch (error) {
      this.logger.error(
        `Failed to download media from ${mediaUrl}: ${error.message}`,
        { mediaUrl, integrationId: integration.id },
      );
      this.handleApiError(error, `Failed to download media from ${mediaUrl}`);
    }
  }

  private setMediaPayloadByType(
    payload: MetaMediaMessage,
    type: WhatsappMessageType,
    options: {
      mediaId?: string;
      mediaUrl?: string;
      caption?: string;
      filename?: string;
    },
  ): void {
    const { mediaId, mediaUrl, caption, filename } = options;

    switch (type) {
      case WhatsappMessageType.IMAGE:
        payload.image = {
          ...(mediaId ? { id: mediaId } : { link: mediaUrl! }),
          caption,
        };
        break;
      case WhatsappMessageType.DOCUMENT:
        payload.document = {
          ...(mediaId ? { id: mediaId } : { link: mediaUrl! }),
          caption,
          filename,
        };
        break;
      case WhatsappMessageType.AUDIO:
        payload.audio = {
          ...(mediaId ? { id: mediaId } : { link: mediaUrl! }),
        };
        break;
      case WhatsappMessageType.VIDEO:
        payload.video = {
          ...(mediaId ? { id: mediaId } : { link: mediaUrl! }),
          caption,
        };
        break;
      default:
        throw new HttpException(
          `Unsupported media type: ${type}`,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private handleApiError(error: any, message: string): never {
    if (error.response?.data) {
      const apiError: MetaApiError = error.response.data;
      this.logger.error(
        `${message}: ${apiError.error.message}`,
        apiError.error,
      );
      throw new HttpException(
        {
          message: apiError.error.message,
          code: apiError.error.code,
          type: apiError.error.type,
        },
        (error.response?.status as number) || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.error(`${message}: ${error.message}`, error.stack);
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
