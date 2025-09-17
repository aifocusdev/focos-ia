import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CrmWebsocketGateway } from './crm-websocket.gateway';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { WsThrottleGuard } from './guards/ws-throttle.guard';
import { WsAuthMiddleware } from './middleware/ws-auth.middleware';
import { UsersModule } from '../modules/users/users.module';
import { ConversationsModule } from '../modules/conversations/conversations.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => ConversationsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CrmWebsocketGateway,
    WsJwtAuthGuard,
    WsThrottleGuard,
    WsAuthMiddleware,
  ],
  exports: [CrmWebsocketGateway],
})
export class WebsocketModule {}
