import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { WhatsappWebhookService } from '../services/whatsapp-webhook.service';
import { WebhookVerificationDto } from '../dto/webhook-verification.dto';
import { WebhookPayload } from '../interfaces/meta-api.interface';
import { BotResponseProcessor } from '../services/bot-response-processor.service';
import { TransferToQueueService } from '../services/transfer-to-queue.service';
import { BotResponseDto } from '../dto/bot-response.dto';

@Controller('meta-whatsapp/webhook')
export class MetaWhatsappWebhookController {
  private readonly logger = new Logger(MetaWhatsappWebhookController.name);

  constructor(
    private readonly whatsappWebhookService: WhatsappWebhookService,
    private readonly botResponseProcessor: BotResponseProcessor,
    private readonly transferToQueueService: TransferToQueueService,
  ) {}

  @Public()
  @Get()
  verifyWebhook(@Query() query: WebhookVerificationDto): string {
    try {
      const challenge = this.whatsappWebhookService.verifyWebhook(
        query['hub.mode'],
        query['hub.verify_token'],
        query['hub.challenge'],
      );

      if (!challenge) {
        this.logger.warn('Webhook verification failed', {
          mode: query['hub.mode'],
          token: query['hub.verify_token'],
        });
        throw new HttpException(
          'Webhook verification failed',
          HttpStatus.FORBIDDEN,
        );
      }

      this.logger.log('Webhook verification successful');
      return challenge;
    } catch (error) {
      this.logger.error('Error verifying webhook', error);
      throw new HttpException(
        'Failed to verify webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post()
  async receiveWebhook(
    @Body() payload: WebhookPayload,
  ): Promise<{ status: string }> {
    try {
      this.logger.log('Received webhook payload', {
        object: payload.object,
        entryCount: payload.entry?.length || 0,
      });

      await this.whatsappWebhookService.processWebhook(payload);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('b0t-r3sp0ns3-w3bh00k-7x9z4a')
  async receiveBotResponse(
    @Body() botResponseDto: BotResponseDto,
  ): Promise<{ status: string }> {
    try {
      this.logger.log('Received bot response', {
        userId: botResponseDto.userId,
        outputLength: botResponseDto.output?.length || 0,
      });

      return await this.botResponseProcessor.processBotResponse(botResponseDto);
    } catch (error) {
      this.logger.error('Error processing bot response', error);
      throw new HttpException(
        'Failed to process bot response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('tr4nsf3r-t0-qu3u3-8b2x1p')
  async transferToQueue(
    @Body('userId') userId: string,
  ): Promise<{ status: string; message: string }> {
    try {
      this.logger.log('Transfer to queue requested', { userId });

      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      return await this.transferToQueueService.transferToQueue(userId);
    } catch (error) {
      this.logger.error('Error transferring conversation to queue', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to transfer conversation to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
