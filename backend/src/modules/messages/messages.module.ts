import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './services/messages.service';
import { MessageCrudService } from './services/message-crud.service';
import { MessagePaginationService } from './services/message-pagination.service';
import { MessagesController } from './controllers/messages.controller';
import { Message } from './entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { ConversationsModule } from '../conversations/conversations.module';
import { CacheModule } from '../cache';
import { UsersModule } from '../users/users.module';
import { BotsModule } from '../bots/bots.module';
import { WebsocketModule } from '../../websocket/websocket.module';
import { MetaWhatsappModule } from '../meta-whatsapp/meta-whatsapp.module';
import { MessageAttachmentsModule } from '../message-attachments/message-attachments.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    ConversationsModule,
    CacheModule,
    UsersModule,
    BotsModule,
    CommonModule,
    forwardRef(() => MetaWhatsappModule),
    forwardRef(() => MessageAttachmentsModule),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessageCrudService,
    MessagePaginationService,
  ],
  exports: [
    MessagesService,
    MessageCrudService,
    MessagePaginationService,
  ],
})
export class MessagesModule {}
