import type { Conversation, Contact, Message } from '../../types/conversation.types'
import type { TagColor } from '../../types/tag.types'

// API Response interfaces based on your backend data
interface APITag {
  id: number
  name: string
  color: string
  created_at: string
  updated_at: string
}

interface APIContact {
  id: number
  external_id: string
  name: string
  phone_number: string
  created_at: string
  last_activity_at: string
  tags?: APITag[]
  contact_type?: 'ads' | 'all' | 'support'
}

interface APIUser {
  id: number
  name: string
  username: string
  password: string
  role_id: number
  online: boolean
  created_at: string
  last_activity_at: string
}

interface APIBot {
  id: number
  name: string
  description: string
  created_at: string
}

interface APIAttachment {
  id: number
  message_id: number
  kind: 'image' | 'video' | 'audio' | 'document'
  url: string
  mime_type: string
  name: string
  size: number | null
  file_size: number
  duration_ms: number | null
  width: number | null
  height: number | null
  thumbnail_url: string | null
  preview_url: string | null
}

// API Message interface (moved up to be used by APIConversation)
interface APIMessage {
  id: number
  conversation_id: number
  sender_type: 'contact' | 'user' | 'bot' | 'system'
  sender_user: number | null
  sender_bot: number | null
  body: string
  created_at: string
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  failed_at: string | null
  whatsapp_message_id: string | null
  whatsapp_status: string
  user: APIUser | null
  bot: APIBot | null
  attachments: APIAttachment[]
}

interface APIConversation {
  id: number
  contact_id: number
  integration_id: number
  assigned_user: number | null
  assigned_bot: number | null
  created_at: string
  last_activity_at: string
  last_contact_message_at?: string | null
  contact: APIContact
  user: APIUser | null
  bot: APIBot | null
  last_message?: APIMessage
  unread_count?: number
}

interface APIConversationsResponse {
  data: APIConversation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Adapter functions
export function adaptContact(apiContact: APIContact): Contact {
  return {
    id: apiContact.id.toString(),
    name: apiContact.name,
    phone: apiContact.phone_number,
    avatar: undefined, // Not provided by API
    isOnline: false, // Default to false, could be updated via WebSocket
    lastSeen: undefined, // Not provided by API, could be updated via WebSocket
    tags: apiContact.tags?.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color as TagColor,
      created_at: tag.created_at,
      updated_at: tag.updated_at
    })) || [],
    contact_type: apiContact.contact_type
  }
}

export function adaptConversation(apiConversation: APIConversation): Conversation {
  return {
    id: apiConversation.id.toString(),
    contact: adaptContact(apiConversation.contact),
    lastMessage: apiConversation.last_message ? adaptMessage(apiConversation.last_message) : undefined,
    unreadCount: apiConversation.unread_count || 0,
    assignedTo: apiConversation.assigned_user?.toString(),
    assignedUser: apiConversation.user ? {
      id: apiConversation.user.id.toString(),
      name: apiConversation.user.name,
      avatar: undefined
    } : undefined,
    assignedBot: apiConversation.bot ? {
      id: apiConversation.bot.id.toString(),
      name: apiConversation.bot.name,
      avatar: undefined
    } : undefined,
    createdAt: apiConversation.created_at,
    updatedAt: apiConversation.last_activity_at,
    lastContactMessageAt: apiConversation.last_contact_message_at || undefined,
    isTyping: false // Default to false, would be updated via WebSocket
  }
}

export function adaptConversationsResponse(apiResponse: APIConversationsResponse): {
  conversations: Conversation[]
  total: number
  page: number
  totalPages: number
} {
  return {
    conversations: apiResponse.data.map(adaptConversation),
    total: apiResponse.total,
    page: apiResponse.page,
    totalPages: apiResponse.totalPages
  }
}


interface APIMessagesResponse {
  data: APIMessage[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Message adapter
export function adaptMessage(apiMessage: APIMessage): Message {
  // Debug: Log incoming API message
  console.log('🔄 Adapting API message:', {
    id: apiMessage.id,
    body: apiMessage.body,
    attachments: apiMessage.attachments,
    sender_type: apiMessage.sender_type
  })

  // Map WhatsApp status to our status types
  const mapStatus = (whatsappStatus: string): Message['status'] => {
    switch (whatsappStatus) {
      case 'sent': return 'sent'
      case 'delivered': return 'delivered'
      case 'read': return 'read'
      case 'failed': return 'failed'
      default: return 'sent'
    }
  }

  // Determine message type based on attachments
  const getMessageType = (): Message['type'] => {
    if (!apiMessage.attachments || apiMessage.attachments.length === 0) {
      return 'text'
    }
    
    // Use the first attachment to determine type
    const firstAttachment = apiMessage.attachments[0]
    console.log('📎 First attachment:', firstAttachment)
    return firstAttachment.kind
  }

  // Get attachment data
  const firstAttachment = apiMessage.attachments?.[0]
  const messageType = getMessageType()

  const adaptedMessage = {
    id: apiMessage.id.toString(),
    conversationId: apiMessage.conversation_id.toString(),
    content: apiMessage.body || '',
    type: messageType,
    direction: (apiMessage.sender_type === 'contact' ? 'inbound' : 'outbound') as 'inbound' | 'outbound',
    status: mapStatus(apiMessage.whatsapp_status || 'sent'),
    timestamp: apiMessage.created_at,
    senderId: apiMessage.sender_user?.toString() || apiMessage.sender_bot?.toString() || '',
    senderName: apiMessage.sender_type === 'user' ? apiMessage.user?.name : 
                apiMessage.sender_type === 'bot' ? apiMessage.bot?.name : undefined,
    mediaUrl: firstAttachment?.url,
    fileName: firstAttachment?.name,
    fileSize: firstAttachment?.file_size
  }

  console.log('✅ Adapted message:', adaptedMessage)
  return adaptedMessage
}

export function adaptMessagesResponse(apiResponse: APIMessagesResponse): {
  messages: Message[]
  total: number
  page: number
  totalPages: number
} {
  // Sort messages by created_at (oldest first for proper chat order)
  const sortedMessages = apiResponse.data
    .map(adaptMessage)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return {
    messages: sortedMessages,
    total: apiResponse.total,
    page: apiResponse.page,
    totalPages: apiResponse.totalPages
  }
}

// WebSocket conversation format
interface WebSocketConversation {
  id: number
  contact: {
    id: number
    name: string | null
    phone: string
    external_id: string
    contact_type?: 'ads' | 'all' | 'support'
  }
  integration: {
    id: number
    name: string
    phone_number_id: string
  }
  unread_count: number
  read: boolean
  created_at: string
  last_activity_at: string
  last_contact_message_at?: string | null
}

// Adapter for WebSocket conversation format
export function adaptWebSocketConversation(wsConversation: WebSocketConversation): Conversation {
  return {
    id: wsConversation.id.toString(),
    contact: {
      id: wsConversation.contact.id.toString(),
      name: wsConversation.contact.name || wsConversation.contact.phone,
      phone: wsConversation.contact.phone,
      avatar: undefined,
      isOnline: false,
      lastSeen: undefined,
      contact_type: wsConversation.contact.contact_type
    },
    lastMessage: undefined, // Will be set separately if message is provided
    unreadCount: wsConversation.unread_count || 0,
    assignedTo: undefined, // Not provided in this WebSocket format
    assignedUser: undefined, // Not provided in this WebSocket format
    createdAt: wsConversation.created_at,
    updatedAt: wsConversation.last_activity_at,
    lastContactMessageAt: wsConversation.last_contact_message_at || undefined,
    isTyping: false
  }
}