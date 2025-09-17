import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { CrmWebsocketGateway } from '../../../websocket/crm-websocket.gateway';
import { CRM_EVENTS } from '../../../websocket/events/crm-events';
import { WebhookEventType } from '../enums/webhook-event-type.enum';
import { Contact } from '../../contacts/entities/contact.entity';
import { Message } from '../../messages/entities/message.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';

export interface ConversationNewEventData {
  conversation: {
    id: number;
    contact: {
      id: number;
      name: string | null;
      phone: string;
      external_id: string;
    };
    integration: {
      id: number;
      name: string;
      phone_number_id: string;
    };
    unread_count: number;
    read: boolean;
    created_at: Date;
    updated_at: Date;
  };
  message: {
    id: number;
    body: string | null;
    sender_type: string;
    delivered_at: Date;
    whatsapp_message_id: string;
    attachments: any[];
  };
  timestamp: Date;
}

export interface MessageEventData {
  conversationId: number;
  message: Message;
  contact: Contact;
  conversation: Conversation;
}

export interface MessageStatusEventData {
  messageId: number;
  whatsappMessageId: string;
  status: string;
  timestamp: string;
}

@Injectable()
export class WebhookEventEmitter {
  private readonly logger = new Logger(WebhookEventEmitter.name);

  constructor(
    @Inject(forwardRef(() => CrmWebsocketGateway))
    private readonly websocketGateway: CrmWebsocketGateway,
  ) {}

  emitConversationNewEvent(
    conversation: Conversation,
    contact: Contact,
    message: Message,
    fullConversation: Conversation,
  ): void {
    try {
      const eventData: ConversationNewEventData = {
        conversation: {
          id: fullConversation.id,
          contact: {
            id: contact.id,
            name: contact.name,
            phone: contact.phone_number,
            external_id: contact.external_id,
          },
          integration: {
            id: fullConversation.integration?.id,
            name: 'WhatsApp',
            phone_number_id: fullConversation.integration?.phone_number_id,
          },
          unread_count: fullConversation.unread_count,
          read: fullConversation.read,
          created_at: fullConversation.created_at,
          updated_at: fullConversation.updated_at,
        },
        message: {
          id: message.id,
          body: message.body,
          sender_type: message.sender_type,
          delivered_at: message.delivered_at,
          whatsapp_message_id: message.whatsapp_message_id,
          attachments: message.attachments || [],
        },
        timestamp: new Date(),
      };

      this.websocketGateway.emitToAll(CRM_EVENTS.CONVERSATION_NEW, eventData);

      this.logger.log(
        `Emitted CONVERSATION_NEW event for conversation: ${conversation.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit CONVERSATION_NEW event for conversation: ${conversation.id}`,
        error.stack,
      );
    }
  }

  emitMessageEvent(eventData: MessageEventData): void {
    try {
      this.emitWebSocketEvent(WebhookEventType.MESSAGE, eventData);
    } catch (error) {
      this.logger.error(
        `Failed to emit MESSAGE event for conversation: ${eventData.conversationId}`,
        error.stack,
      );
    }
  }

  emitMessageStatusEvent(eventData: MessageStatusEventData): void {
    try {
      this.emitWebSocketEvent(WebhookEventType.MESSAGE_STATUS, eventData);
    } catch (error) {
      this.logger.error(
        `Failed to emit MESSAGE_STATUS event for message: ${eventData.messageId}`,
        error.stack,
      );
    }
  }

  private emitWebSocketEvent(eventType: WebhookEventType, data: any): void {
    if (this.websocketGateway?.server) {
      // Emit to all connected clients
      this.websocketGateway.server.emit(`whatsapp:${eventType}`, data);

      // If it's a message event, also emit to specific conversation room
      if (eventType === WebhookEventType.MESSAGE && data.conversationId) {
        this.websocketGateway.server
          .to(`conversation:${data.conversationId}`)
          .emit(`whatsapp:message`, data);
      }

      // If it's a status event, emit to message room
      if (eventType === WebhookEventType.MESSAGE_STATUS && data.messageId) {
        this.websocketGateway.server
          .to(`message:${data.messageId}`)
          .emit(`whatsapp:message_status`, data);
      }
    }
  }
}
