import { useCallback } from 'react'
import { useSocketStore } from '../../stores/socketStore'
import { useConversationStore } from '../../stores/conversationStore'
import { useAuthStore } from '../../stores/authStore'
import { adaptMessage } from '../../services/conversation/conversation.adapter'

export const useSocketMessages = () => {
  const socketStore = useSocketStore()
  const { 
    addMessage, 
    updateConversation, 
    updateMessageStatus,
    conversations
  } = useConversationStore()
  const { user } = useAuthStore()
  
  const { updateActivity, setHasNewMessages } = socketStore

  const onNewMessage = useCallback((data: any) => {
    updateActivity()
    setHasNewMessages(true)
    
    // Extract message from WebSocket payload: { message: {...}, timestamp: "..." }
    const apiMessage = data.message || data
    
    // Convert API message format to internal store format
    const internalMessage = adaptMessage(apiMessage)
    
    // Add message to conversation store
    addMessage(internalMessage)
  }, [updateActivity, setHasNewMessages, addMessage])

  const onWhatsAppMessage = useCallback((data: {
    conversationId: number
    message: {
      id: number
      body: string
      created_at: string
      whatsapp_status: string
      attachments?: Array<{
        kind: 'image' | 'video' | 'audio' | 'document'
        url: string
        name: string
        file_size: number
      }>
    }
    contact: { id: number; name?: string; phone_number?: string }
    conversation?: { assigned_user?: number }
  }) => {
    const { conversationId, message, contact } = data
    
    // Determine message type based on attachments
    const getMessageType = () => {
      if (!message.attachments || message.attachments.length === 0) {
        return 'text' as const
      }
      return message.attachments[0].kind as 'text' | 'image' | 'video' | 'audio' | 'document'
    }

    // Get attachment data
    const firstAttachment = message.attachments?.[0]
    
    // Convert API message format to store format
    const formattedMessage = {
      id: message.id.toString(),
      conversationId: conversationId.toString(),
      content: message.body || '',
      type: getMessageType(),
      direction: 'inbound' as const,
      status: message.whatsapp_status === 'delivered' ? 'delivered' as const : 
              message.whatsapp_status === 'read' ? 'read' as const : 
              message.whatsapp_status === 'sent' ? 'sent' as const : 'sent' as const,
      timestamp: new Date(message.created_at).toISOString(),
      senderId: contact.id.toString(),
      mediaUrl: firstAttachment?.url,
      fileName: firstAttachment?.name,
      fileSize: firstAttachment?.file_size
    }
    
    updateActivity()
    setHasNewMessages(true)
    
    // Add message to conversation store
    addMessage(formattedMessage)
  }, [updateActivity, setHasNewMessages, addMessage, conversations, user?.id])

  const onMessageStatus = useCallback((data: any) => {
    // Update message status in conversation store
    updateMessageStatus(data.messageId, data.status)
  }, [updateMessageStatus])

  const onConversationAssigned = useCallback((data: any) => {
    // Update conversation in store
    updateConversation(data.conversation)
  }, [updateConversation])

  const onConversationUpdated = useCallback((conversation: any) => {
    updateConversation(conversation)
  }, [updateConversation])

  const onNotification = useCallback((_notification: any) => {
    // Notification received but not displayed
  }, [])

  return {
    // Message handlers
    onNewMessage,
    onWhatsAppMessage,
    onMessageStatus,
    
    // Conversation handlers
    onConversationAssigned,
    onConversationUpdated,
    
    // Notification handlers
    onNotification
  }
}