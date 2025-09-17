import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappIntegrationConfigModule } from './modules/whatsapp-integration-config/whatsapp-integration-config.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { BotsModule } from './modules/bots/bots.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MessageAttachmentsModule } from './modules/message-attachments/message-attachments.module';
import { ServersModule } from './modules/servers/servers.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { TagsModule } from './modules/tags/tags.module';
import { DevicesModule } from './modules/devices/devices.module';
import { ContactUserAccountsModule } from './modules/contact-user-accounts/contact-user-accounts.module';
import { QuickRepliesModule } from './modules/quick-replies/quick-replies.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { WebsocketModule } from './websocket/websocket.module';
import { MetaWhatsappModule } from './modules/meta-whatsapp/meta-whatsapp.module';
import { CommonModule } from './common/common.module';
import { N8NBotModule } from './modules/n8n-bot/n8n-bot.module';
import { DataMaskingInterceptor } from './common/interceptors/data-masking.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(databaseConfig()),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    CommonModule,
    AuthModule,
    RolesModule,
    UsersModule,
    WhatsappIntegrationConfigModule,
    ContactsModule,
    BotsModule,
    ConversationsModule,
    MessagesModule,
    MessageAttachmentsModule,
    ServersModule,
    ApplicationsModule,
    TagsModule,
    DevicesModule,
    ContactUserAccountsModule,
    QuickRepliesModule,
    WebsocketModule,
    MetaWhatsappModule,
    N8NBotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataMaskingInterceptor,
    },
  ],
})
export class AppModule {}
