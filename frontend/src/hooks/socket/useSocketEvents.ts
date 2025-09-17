import { useCallback } from 'react'
import { useConversationStore } from '../../stores/conversationStore'
import { useAuthStore } from '../../stores/authStore'
import { shouldAcceptConversation, logContactTypeFilter } from '../../utils/contactTypeFilter'
import { adaptWebSocketConversation } from '../../services/conversation/conversation.adapter'

export const useSocketEvents = () => {
  const { 
    updateConversation,
    addNewConversation,
    addMessage,
    loadConversations
  } = useConversationStore()
  const { user } = useAuthStore()
  

  const onReconnect = useCallback((_attemptNumber: number) => {
    // Socket reconnected silently
  }, [])

  const onUnauthorized = useCallback((_error: string) => {
    // Socket unauthorized - handle silently
  }, [])


  const onConversationStatusChanged = useCallback((_data: any) => {
    // Conversation status changed silently
  }, [])

  // New conversation events
  const onConversationNew = useCallback((data: any) => {
    const { conversation, message } = data
    
    // Pre-validate conversation before adding to store
    const adaptedConversation = adaptWebSocketConversation(conversation)
    const shouldAccept = shouldAcceptConversation(user, adaptedConversation.contact)
    logContactTypeFilter(user, adaptedConversation.contact, shouldAccept)
    
    if (!shouldAccept) {
      console.log('🚫 Conversation rejected by contact type filter in socket event', {
        conversationId: conversation.id,
        contactType: adaptedConversation.contact.contact_type,
        userPreference: user?.contact_type_preference,
        restrictionEnabled: user?.contact_type_restriction
      })
      return
    }
    
    // Add conversation directly to store instead of reloading all conversations
    addNewConversation(conversation, message)
  }, [user?.id, user?.contact_type_preference, user?.contact_type_restriction, addNewConversation])

  const onConversationAssigned = useCallback((_data: any) => {
    // Reload conversations to reflect assignment changes
    loadConversations(true)
  }, [user?.id, loadConversations])

  const onMessageNew = useCallback((message: any) => {
    // Add message to store
    addMessage(message)
  }, [addMessage, user?.id])

  const onConversationRead = useCallback((data: any) => {
    // Find existing conversation and update only the unreadCount
    const { conversations, updateConversation } = useConversationStore.getState()
    const existingConversation = conversations.find(c => c.id === data.conversationId.toString())
    
    if (existingConversation) {
      updateConversation({
        ...existingConversation,
        unreadCount: data.unreadCount || 0
      })
    }
  }, [updateConversation])


  return {
    // Connection events
    onReconnect,
    onUnauthorized,
    
    
    // Conversation events
    onConversationStatusChanged,
    onConversationNew,
    onConversationAssigned,
    onConversationRead,
    
    // Message events
    onMessageNew
  }
}