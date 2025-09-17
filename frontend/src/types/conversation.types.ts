import type { Tag } from './tag.types'

export interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  notes?: string
  tags?: Tag[]
  accepts_remarketing?: boolean
  contact_type?: 'ads' | 'all' | 'support'
}

export interface Message {
  id: string
  conversationId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document'
  direction: 'inbound' | 'outbound'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  senderId: string
  senderName?: string
  mediaUrl?: string
  fileName?: string
  fileSize?: number
}

export interface Conversation {
  id: string
  contact: Contact
  lastMessage?: Message
  unreadCount: number
  assignedTo?: string
  assignedUser?: {
    id: string
    name: string
    avatar?: string
  }
  assignedBot?: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  lastContactMessageAt?: string
  isTyping: boolean
}

export interface ConversationFilters {
  assignedTo?: string | 'all'
  search?: string
  unassignment?: boolean
  assigned_bot?: boolean
  unread?: boolean
  tag_ids?: number[]
}

export interface ConversationSort {
  field: 'updatedAt' | 'createdAt' | 'id'
  order: 'asc' | 'desc'
}