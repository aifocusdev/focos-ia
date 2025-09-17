import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './services/conversations.service';
import { ConversationAutoAssignmentService } from './services/conversation-auto-assignment.service';
import { CacheModule } from '../cache';
import { ConversationsController } from './controllers/conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { WhatsappIntegrationConfigModule } from '../whatsapp-integration-config/whatsapp-integration-config.module';
import { UsersModule } from '../users/users.module';
import { BotsModule } from '../bots/bots.module';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    ContactsModule,
    WhatsappIntegrationConfigModule,
    UsersModule,
    BotsModule,
    CacheModule,
    forwardRef(() => WebsocketModule),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationAutoAssignmentService],
  exports: [ConversationsService, ConversationAutoAssignmentService],
})
export class ConversationsModule {}
