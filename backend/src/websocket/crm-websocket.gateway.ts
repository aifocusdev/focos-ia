import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { WsThrottleGuard } from './guards/ws-throttle.guard';
import { CurrentUserWs } from './decorators/current-user-ws.decorator';
import { AuthenticatedSocket } from './interfaces/authenticated-socket.interface';
import { User } from '../modules/users/entities/user.entity';
import { CRM_EVENTS } from './events/crm-events';
import { WsAuthMiddleware } from './middleware/ws-auth.middleware';
import { ConversationsService } from '../modules/conversations/services/conversations.service';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/crm',
})
export class CrmWebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrmWebsocketGateway.name);
  private readonly connectedUsers = new Map<number, Set<string>>();

  constructor(
    private readonly wsAuthMiddleware: WsAuthMiddleware,
    private readonly wsThrottleGuard: WsThrottleGuard,
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
  ) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      void this.wsAuthMiddleware.authenticate(socket, next);
    });

    // Setup periodic cleanup for rate limiting
    setInterval(() => {
      this.wsThrottleGuard.cleanup();
    }, 60000); // Every minute

    this.logger.log(
      'WebSocket Gateway initialized with authentication and rate limiting',
    );
  }

  handleConnection(client: AuthenticatedSocket) {
    if (client.user) {
      this.addUserConnection(client.user.id, client.id);
      this.logger.log(`User ${client.user.id} connected: ${client.id}`);
    } else {
      this.logger.warn(`Unauthenticated client connected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.removeUserConnection(client.user.id, client.id);
      this.logger.log(`User ${client.user.id} disconnected: ${client.id}`);
    }
  }

  @UseGuards(WsJwtAuthGuard, WsThrottleGuard)
  @SubscribeMessage(CRM_EVENTS.JOIN_CONVERSATION)
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
    @CurrentUserWs() user: User,
  ) {
    const room = `conversation_${data.conversationId}`;
    await client.join(room);

    this.logger.log(
      `User ${user.id} joined conversation ${data.conversationId}`,
    );

    client.emit('joined_conversation', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @UseGuards(WsJwtAuthGuard, WsThrottleGuard)
  @SubscribeMessage(CRM_EVENTS.LEAVE_CONVERSATION)
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
    @CurrentUserWs() user: User,
  ) {
    const room = `conversation_${data.conversationId}`;
    await client.leave(room);

    this.logger.log(`User ${user.id} left conversation ${data.conversationId}`);

    client.emit('left_conversation', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @UseGuards(WsJwtAuthGuard, WsThrottleGuard)
  @SubscribeMessage(CRM_EVENTS.CONVERSATION_READ)
  async handleConversationRead(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
    @CurrentUserWs() user: User,
  ) {
    try {
      this.logger.debug(
        `User ${user.id} marking conversation ${data.conversationId} as read`,
      );

      // Call the existing service method that handles the business logic
      await this.conversationsService.markAsRead(data.conversationId, user.id);

      // Send confirmation back to the client
      client.emit('conversation_read_confirmed', {
        conversationId: data.conversationId,
        read: true,
        unreadCount: 0,
        timestamp: new Date(),
      });

      this.logger.log(
        `User ${user.id} successfully marked conversation ${data.conversationId} as read`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark conversation ${data.conversationId} as read for user ${user.id}`,
        error.stack,
      );

      // Send error back to the client
      client.emit('conversation_read_error', {
        conversationId: data.conversationId,
        error: 'Failed to mark conversation as read',
        timestamp: new Date(),
      });
    }
  }

  private addUserConnection(userId: number, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
  }

  private removeUserConnection(userId: number, socketId: string) {
    const userConnections = this.connectedUsers.get(userId);
    if (userConnections) {
      userConnections.delete(socketId);
      if (userConnections.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  emitToConversation(conversationId: number, event: string, data: any) {
    const room = `conversation_${conversationId}`;
    this.server.to(room).emit(event, data);
  }

  emitToUser(userId: number, event: string, data: any) {
    const userConnections = this.connectedUsers.get(userId);
    if (userConnections) {
      userConnections.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
