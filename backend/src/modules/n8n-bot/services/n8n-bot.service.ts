import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  BotMessagePayload,
  N8NBotResponse,
} from '../interfaces/n8n-bot.interface';
import { N8NLog, N8NLogType, N8NLogStatus } from '../entities/n8n-log.entity';

@Injectable()
export class N8NBotService {
  private readonly logger = new Logger(N8NBotService.name);
  private readonly n8nEndpoint: string;
  private readonly requestTimeout: number;

  constructor(
    @InjectRepository(N8NLog)
    private readonly n8nLogRepository: Repository<N8NLog>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const endpoint = this.configService.get<string>('N8N_BOT_ENDPOINT');
    if (!endpoint) {
      throw new Error('N8N_BOT_ENDPOINT environment variable is required');
    }
    this.n8nEndpoint = endpoint;
    this.requestTimeout = 20000;
  }

  private async createLog(
    messageId: string | null,
    userId: string | null,
    payload: any,
    logType: N8NLogType = N8NLogType.OUTBOUND,
    endpoint?: string,
  ): Promise<N8NLog> {
    try {
      const log = this.n8nLogRepository.create({
        message_id: messageId,
        user_id: userId,
        log_type: logType,
        payload,
        endpoint,
        status: N8NLogStatus.PENDING,
      });

      return await this.n8nLogRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to create N8N log', {
        error: error.message,
        messageId,
        userId,
      });
      throw error;
    }
  }

  private async updateLogStatus(
    logId: number,
    status: N8NLogStatus,
    responseData?: any,
    errorMessage?: string,
    httpStatus?: number,
  ): Promise<void> {
    try {
      await this.n8nLogRepository.update(logId, {
        status,
        response_data: responseData,
        error_message: errorMessage,
        http_status: httpStatus,
      });
    } catch (error) {
      this.logger.error('Failed to update N8N log status', {
        error: error.message,
        logId,
        status,
      });
    }
  }

  async sendToN8N(payload: BotMessagePayload): Promise<N8NBotResponse> {
    let logEntry: N8NLog | null = null;

    try {
      // Criar log entry antes de enviar
      logEntry = await this.createLog(
        payload.messageId,
        payload.userID,
        payload,
        N8NLogType.OUTBOUND,
        this.n8nEndpoint,
      );

      this.logger.log(`Sending message to N8N: ${payload.messageId}`, {
        ...payload,
      });

      const response: AxiosResponse = await firstValueFrom(
        this.httpService
          .post(this.n8nEndpoint, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: this.requestTimeout,
          })
          .pipe(
            timeout(this.requestTimeout),
            catchError((error) => {
              this.logger.error('Error sending message to N8N', {
                error: error.message,
                messageId: payload.messageId,
                userID: payload.userID,
                logId: logEntry?.id,
              });
              throw error;
            }),
          ),
      );

      // Atualizar log com sucesso
      if (logEntry) {
        await this.updateLogStatus(
          logEntry.id,
          N8NLogStatus.SUCCESS,
          response.data,
          undefined,
          response.status,
        ).catch((logError) => {
          this.logger.warn('Failed to update success log status', {
            logId: logEntry!.id,
            error: logError.message,
          });
        });
      }

      this.logger.log(
        `Message sent successfully to N8N: ${payload.messageId}`,
        {
          status: response.status,
          data: response.data,
          logId: logEntry?.id,
        },
      );

      return {
        success: true,
        message: 'Message sent successfully',
        data: response.data,
      };
    } catch (error) {
      // Atualizar log com erro
      if (logEntry) {
        await this.updateLogStatus(
          logEntry.id,
          N8NLogStatus.ERROR,
          undefined,
          error.message || 'Unknown error',
          error.response?.status || undefined,
        ).catch((logError) => {
          this.logger.warn('Failed to update error log status', {
            logId: logEntry!.id,
            error: logError.message,
          });
        });
      }

      this.logger.error('Failed to send message to N8N', {
        error: error.message,
        messageId: payload.messageId,
        userID: payload.userID,
        logId: logEntry?.id,
        stack: error.stack,
      });

      return {
        success: false,
        message: `Failed to send message: ${error.message}`,
      };
    }
  }

  async processMessageForBot(
    messageId: string,
    userID: string,
    timestamp: string,
    type: string,
    message?: string,
    asset?: string,
  ): Promise<N8NBotResponse> {
    const payload: BotMessagePayload = {
      messageId,
      userID,
      timestamp,
      type: type as BotMessagePayload['type'],
      message,
      asset,
    };

    return this.sendToN8N(payload);
  }
}
