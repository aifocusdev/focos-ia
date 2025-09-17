import type { Message, Conversation } from '../types/conversation.types'

export const messageUtils = {
  /**
   * Check if a message already exists in the messages array
   */
  isDuplicateMessage: (messages: Message[], newMessage: Message): boolean => {
    return messages.some(m => m.id === newMessage.id)
  },

  /**
   * Sort messages by timestamp in ascending order
   */
  sortMessagesByTimestamp: (messages: Message[]): Message[] => {
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  },

  /**
   * Update conversation with new message information
   */
  updateConversationWithMessage: (
    conversation: Conversation, 
    message: Message
  ): Conversation => {
    return {
      ...conversation,
      lastMessage: message,
      updatedAt: message.timestamp,
      unreadCount: message.direction === 'inbound' 
        ? conversation.unreadCount + 1 
        : conversation.unreadCount
    }
  },

  /**
   * Log message-related operations (only in development)
   */
  logMessageOperation: (operation: string, data: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 ${operation}:`, data)
    }
  }
}