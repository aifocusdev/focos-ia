import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';
import { BotResponseDto } from '../dto/bot-response.dto';
import { MessagesService } from '../../messages/services/messages.service';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { BotsService } from '../../bots/services/bots.service';

@Injectable()
export class BotResponseProcessor {
  private readonly logger = new Logger(BotResponseProcessor.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly botsService: BotsService,
  ) {}

  async processBotResponse(
    botResponseDto: BotResponseDto,
  ): Promise<{ status: string }> {
    try {
      this.logger.log(
        `Processing bot response for userId: ${botResponseDto.userId}`,
      );

      // Buscar contato pelo número
      const contact = await this.contactRepository.findOne({
        where: { phone_number: botResponseDto.userId },
      });

      if (!contact) {
        throw new NotFoundException(
          `Contact not found for userId: ${botResponseDto.userId}`,
        );
      }

      // Buscar o primeiro bot da tabela
      const bots = await this.botsService.findAll({ page: 1, limit: 1 });
      if (!bots.data || bots.data.length === 0) {
        throw new NotFoundException('No bot found in the system');
      }
      const bot = bots.data[0];

      // Buscar conversa mais recente do contato
      const conversations = await this.conversationsService.findByContactId(
        contact.id,
      );

      if (!conversations || conversations.length === 0) {
        throw new NotFoundException(
          `No conversation found for contact: ${contact.id}`,
        );
      }

      const conversation = conversations[0];

      // Criar mensagem de bot usando o novo método
      const message = await this.messagesService.createBotMessage(
        {
          conversation_id: conversation.id,
          body: botResponseDto.output,
        },
        bot,
      );

      this.logger.log(`Bot message created successfully: ${message.id}`);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        `Failed to process bot response for userId: ${botResponseDto.userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
