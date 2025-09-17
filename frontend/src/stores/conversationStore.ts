import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { conversationService } from '../services/conversation/conversation.service'
import { socketService } from '../services/websocket/socket.service'
import { messageUtils } from '../utils/messageUtils'
import { adaptWebSocketConversation } from '../services/conversation/conversation.adapter'
import { shouldAcceptConversation, logContactTypeFilter } from '../utils/contactTypeFilter'
import { useAuthStore } from './authStore'
import type { 
  Conversation, 
  ConversationFilters, 
  ConversationSort, 
  Message 
} from '../types/conversation.types'

type ConversationTab = 'mine' | 'queue' | 'bot'

interface ConversationState {
  // Data state
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Record<string, Message[]>
  messagesCache: Record<string, { timestamp: number; loaded: boolean }>
  messagesPagination: Record<string, { page: number; hasMore: boolean; isLoading: boolean }>
  
  // UI state
  isLoading: boolean
  isLoadingMessages: boolean
  filters: ConversationFilters
  sort: ConversationSort
  searchQuery: string
  activeTab: ConversationTab
  
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  
  // Actions
  loadConversations: (reset?: boolean) => Promise<void>
  loadMoreConversations: () => Promise<void>
  setActiveConversation: (conversation: Conversation | null) => void
  loadMessages: (conversationId: string, reset?: boolean) => Promise<void>
  loadMessagesIfNeeded: (conversationId: string) => Promise<void>
  loadMoreMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string) => Promise<void>
  sendMessageWithMedia: (conversationId: string, text: string, files: File[], onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void) => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  
  // Filters and search
  setFilters: (filters: Partial<ConversationFilters>) => void
  setSort: (sort: ConversationSort) => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: ConversationTab) => void
  markConversationAsRead: (conversationId: string) => Promise<void>
  markConversationAsUnread: (conversationId: string) => Promise<void>
  unassignConversation: (conversationId: string) => Promise<void>
  assignConversationToMe: (conversationId: string) => Promise<void>
  
  // Real-time updates
  updateConversation: (conversation: Conversation) => void
  addNewConversation: (wsConversation: any, wsMessage?: any) => void
  addMessage: (message: Message) => void
  updateMessageStatus: (messageId: string, status: Message['status']) => void
  
  // Utilities
  reset: () => void
}

const initialFilters: ConversationFilters = {
  assignedTo: 'all',
  search: ''
}

const initialSort: ConversationSort = {
  field: 'updatedAt',
  order: 'desc'
}

export const useConversationStore = create<ConversationState>()(
  subscribeWithSelector((set, get) => {
    // Polling fallback - 1 minute interval
    let pollingInterval: number | null = null
    
    const startPolling = () => {
      if (pollingInterval) return
      
      pollingInterval = setInterval(() => {
        console.log('🔄 Polling: Refreshing conversations (fallback)')
        get().loadConversations(true)
      }, 60000) // 1 minute
    }
    
    const stopPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
    }

    return {
    // Initial state
    conversations: [],
    activeConversation: null,
    messages: {},
    messagesCache: {},
    messagesPagination: {},
    isLoading: false,
    isLoadingMessages: false,
    filters: initialFilters,
    sort: initialSort,
    searchQuery: '',
    activeTab: 'mine',
    currentPage: 1,
    totalPages: 1,
    hasMore: true,

    // Load conversations
    loadConversations: async (reset = false) => {
      const { filters, sort, activeTab } = get()
      
      // Build filters based on active tab
      const tabFilters = { ...filters }
      
      switch (activeTab) {
        case 'queue':
          tabFilters.unassignment = true
          break
        case 'bot':
          tabFilters.assigned_bot = true
          break
        case 'mine':
        default:
          // Default API behavior - user sees only their own conversations
          break
      }
      
      messageUtils.logMessageOperation('Loading conversations', { reset, filters: tabFilters, sort, activeTab })
      set({ isLoading: true })
      
      try {
        const page = reset ? 1 : get().currentPage
        const response = await conversationService.getConversations(tabFilters, sort, page)
        
        messageUtils.logMessageOperation('Conversations loaded', response)
        
        set({
          conversations: reset ? response.conversations : [...get().conversations, ...response.conversations],
          currentPage: page,
          totalPages: response.totalPages,
          hasMore: page < response.totalPages,
          isLoading: false
        })
      } catch (error) {
        console.error('❌ Failed to load conversations:', error)
        set({ isLoading: false })
      }
    },

    // Load more conversations (pagination)
    loadMoreConversations: async () => {
      const { currentPage, hasMore, isLoading } = get()
      
      if (!hasMore || isLoading) return
      
      set({ currentPage: currentPage + 1 })
      await get().loadConversations(false)
    },

    // Set active conversation
    setActiveConversation: (conversation) => {
      set({ activeConversation: conversation })
    },

    // Load messages for conversation
    loadMessages: async (conversationId, reset = false) => {
      set({ isLoadingMessages: true })
      
      try {
        const response = await conversationService.getMessages(conversationId, 1, 50)
        const currentMessages = get().messages[conversationId] || []
        
        // Merge and deduplicate messages, then sort chronologically
        const mergedMessages = reset ? 
          messageUtils.sortMessagesByTimestamp(response.messages) : 
          messageUtils.sortMessagesByTimestamp(
            [...currentMessages, ...response.messages].filter((msg, index, arr) => 
              arr.findIndex(m => m.id === msg.id) === index
            )
          )

        set({
          messages: {
            ...get().messages,
            [conversationId]: mergedMessages
          },
          messagesCache: {
            ...get().messagesCache,
            [conversationId]: { timestamp: Date.now(), loaded: true }
          },
          messagesPagination: {
            ...get().messagesPagination,
            [conversationId]: {
              page: 1,
              hasMore: response.totalPages > 1,
              isLoading: false
            }
          },
          isLoadingMessages: false
        })
      } catch (error) {
        console.error('❌ Failed to load messages:', error)
        set({ isLoadingMessages: false })
      }
    },

    // Load messages only if needed (cache check)
    loadMessagesIfNeeded: async (conversationId) => {
      const { messages, messagesCache } = get()
      const cache = messagesCache[conversationId]
      const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
      
      // Check if messages exist and are recent
      const hasMessages = messages[conversationId]?.length > 0
      const isCacheValid = cache?.loaded && (Date.now() - cache.timestamp) < CACHE_TTL
      
      if (!hasMessages || !isCacheValid) {
        messageUtils.logMessageOperation('Loading messages (cache miss/expired)', {
          conversationId,
          hasMessages,
          isCacheValid,
          cacheAge: cache ? Date.now() - cache.timestamp : 0
        })
        await get().loadMessages(conversationId, true)
      } else {
        messageUtils.logMessageOperation('Using cached messages', {
          conversationId,
          messageCount: messages[conversationId]?.length,
          cacheAge: Date.now() - cache.timestamp
        })
      }
    },

    // Load more (older) messages for conversation
    loadMoreMessages: async (conversationId) => {
      const { messagesPagination, messages } = get()
      const pagination = messagesPagination[conversationId]
      
      if (!pagination || pagination.isLoading || !pagination.hasMore) {
        return
      }
      
      // Set loading state for this conversation
      set({
        messagesPagination: {
          ...get().messagesPagination,
          [conversationId]: {
            ...pagination,
            isLoading: true
          }
        }
      })
      
      try {
        const nextPage = pagination.page + 1
        const response = await conversationService.getMessages(conversationId, nextPage, 50)
        const currentMessages = messages[conversationId] || []
        
        // Prepend older messages (they come from API in reverse chronological order)
        const mergedMessages = messageUtils.sortMessagesByTimestamp(
          [...response.messages, ...currentMessages].filter((msg, index, arr) => 
            arr.findIndex(m => m.id === msg.id) === index
          )
        )
        
        set({
          messages: {
            ...get().messages,
            [conversationId]: mergedMessages
          },
          messagesPagination: {
            ...get().messagesPagination,
            [conversationId]: {
              page: nextPage,
              hasMore: nextPage < response.totalPages,
              isLoading: false
            }
          }
        })
        
        messageUtils.logMessageOperation('Loaded more messages', {
          conversationId,
          page: nextPage,
          totalMessages: mergedMessages.length,
          hasMore: nextPage < response.totalPages
        })
      } catch (error) {
        console.error('❌ Failed to load more messages:', error)
        set({
          messagesPagination: {
            ...get().messagesPagination,
            [conversationId]: {
              ...pagination,
              isLoading: false
            }
          }
        })
      }
    },

    // Send message
    sendMessage: async (conversationId, content) => {
      try {
        const message = await conversationService.sendMessage(conversationId, content)
        get().addMessage(message)
      } catch (error) {
        console.error('Failed to send message:', error)
        // TODO: Add error handling/retry mechanism
      }
    },

    // Send message with media
    sendMessageWithMedia: async (conversationId, text, files, onProgress) => {
      try {
        const message = await conversationService.sendMessageWithMedia(conversationId, text, files, onProgress)
        get().addMessage(message)
      } catch (error) {
        console.error('Failed to send message with media:', error)
        throw error // Re-throw to allow UI to handle error
      }
    },

    // Set filters
    setFilters: (newFilters) => {
      set({ 
        filters: { ...get().filters, ...newFilters },
        currentPage: 1 
      })
      get().loadConversations(true)
    },

    // Set sort
    setSort: (sort) => {
      set({ 
        sort, 
        currentPage: 1,
        conversations: [], // Clear conversations immediately to show proper loading
        activeConversation: null // Clear active conversation when changing sort
      })
      get().loadConversations(true)
    },

    // Set search query
    setSearchQuery: (query) => {
      const currentQuery = get().searchQuery
      set({ 
        searchQuery: query,
        filters: { ...get().filters, search: query },
        currentPage: 1 
      })
      
      // Only reload if query is not empty OR if it actually changed from current
      // This prevents unnecessary reload when initializing with empty string
      if (query.trim() !== '' || currentQuery !== query) {
        set({ 
          conversations: [], // Clear conversations immediately to show proper loading
          activeConversation: null // Clear active conversation when searching
        })
        get().loadConversations(true)
      }
    },

    // Set active tab
    setActiveTab: (tab) => {
      set({ 
        activeTab: tab,
        currentPage: 1,
        conversations: [], // Clear conversations immediately to show proper loading
        activeConversation: null // Clear active conversation when changing tab
      })
      get().loadConversations(true)
    },

    // Mark conversation as read via WebSocket
    markConversationAsRead: async (conversationId) => {
      try {
        if (socketService.connected) {
          // Use WebSocket - broadcasts conversation:read to all users
          socketService.markConversationAsRead(conversationId)
          console.log('📨 Using WebSocket to mark conversation as read:', conversationId)
          
          // Update local state immediately (optimistic update)
          set({
            conversations: get().conversations.map(conv =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          })
        } else {
          // Fallback to HTTP if WebSocket not connected
          console.warn('🔄 WebSocket not connected, falling back to HTTP')
          await conversationService.markAsRead(conversationId)
          
          // Update local state for HTTP fallback
          set({
            conversations: get().conversations.map(conv =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          })
        }
      } catch (error) {
        console.error('Failed to mark conversation as read:', error)
        
        // Try HTTP fallback if WebSocket fails
        try {
          console.log('🔄 WebSocket failed, trying HTTP fallback')
          await conversationService.markAsRead(conversationId)
          
          set({
            conversations: get().conversations.map(conv =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          })
        } catch (httpError) {
          console.error('Both WebSocket and HTTP failed:', httpError)
        }
      }
    },

    // Mark conversation as unread
    markConversationAsUnread: async (conversationId) => {
      try {
        await conversationService.markAsUnread(conversationId)
        
        // Update local state - mark as unread (increase unread count)
        set({
          conversations: get().conversations.map(conv =>
            conv.id === conversationId ? { ...conv, unreadCount: Math.max(1, conv.unreadCount + 1) } : conv
          )
        })
        
        // Update active conversation if it's the one being marked as unread
        const activeConv = get().activeConversation
        if (activeConv && activeConv.id === conversationId) {
          set({ activeConversation: { ...activeConv, unreadCount: Math.max(1, activeConv.unreadCount + 1) } })
        }
      } catch (error) {
        console.error('Failed to mark conversation as unread:', error)
      }
    },

    // Unassign conversation
    unassignConversation: async (conversationId) => {
      try {
        const updatedConversation = await conversationService.unassignConversation(conversationId)
        
        // Update the conversation in the store
        get().updateConversation(updatedConversation)
      } catch (error) {
        console.error('Failed to unassign conversation:', error)
        throw error
      }
    },

    // Assign conversation to current user
    assignConversationToMe: async (conversationId) => {
      try {
        const updatedConversation = await conversationService.assignToMe(conversationId)
        
        // Update the conversation in the store
        get().updateConversation(updatedConversation)
      } catch (error) {
        console.error('Failed to assign conversation to me:', error)
        throw error
      }
    },

    // Update conversation (real-time)
    updateConversation: (updatedConversation) => {
      const { conversations, sort } = get()
      
      // Substituir a conversa atualizada
      const updatedConversations = conversations.map(conv =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
      
      // Reordenar baseado no sort atual
      const sortedConversations = updatedConversations.sort((a, b) => {
        const aValue = sort.field === 'updatedAt' ? a.updatedAt : 
                       sort.field === 'createdAt' ? a.createdAt : a.id
        const bValue = sort.field === 'updatedAt' ? b.updatedAt : 
                       sort.field === 'createdAt' ? b.createdAt : b.id
        
        const comparison = new Date(bValue).getTime() - new Date(aValue).getTime()
        return sort.order === 'desc' ? comparison : -comparison
      })
      
      set({
        conversations: sortedConversations,
        activeConversation: get().activeConversation?.id === updatedConversation.id 
          ? updatedConversation 
          : get().activeConversation
      })
    },

    // Add new conversation (real-time)
    addNewConversation: (wsConversation, wsMessage) => {
      const { conversations, sort } = get()
      
      // Check if conversation already exists
      const existingConversation = conversations.find(c => c.id === wsConversation.id.toString())
      if (existingConversation) {
        messageUtils.logMessageOperation('Conversation already exists, skipping', wsConversation.id)
        return
      }
      
      // Adapt WebSocket conversation to internal format
      const newConversation = adaptWebSocketConversation(wsConversation)
      
      // Get current user to check contact type preferences
      const currentUser = useAuthStore.getState().user
      
      // Check if conversation should be accepted based on contact type preferences
      const shouldAccept = shouldAcceptConversation(currentUser, newConversation.contact)
      logContactTypeFilter(currentUser, newConversation.contact, shouldAccept)
      
      if (!shouldAccept) {
        messageUtils.logMessageOperation('Conversation filtered out due to contact type restriction', {
          conversationId: wsConversation.id,
          contactType: newConversation.contact.contact_type,
          userPreference: currentUser?.contact_type_preference,
          restrictionEnabled: currentUser?.contact_type_restriction
        })
        return
      }
      
      // If message is provided, set it as lastMessage
      if (wsMessage) {
        newConversation.lastMessage = {
          id: wsMessage.id.toString(),
          conversationId: wsConversation.id.toString(),
          content: wsMessage.body || '',
          type: 'text',
          direction: wsMessage.sender_type === 'contact' ? 'inbound' : 'outbound',
          status: 'delivered',
          timestamp: wsMessage.delivered_at || wsConversation.last_activity_at,
          senderId: wsMessage.sender_type === 'contact' ? wsConversation.contact.id.toString() : ''
        }
      }
      
      messageUtils.logMessageOperation('Adding new conversation to store', newConversation)
      
      // Add to conversations and sort
      const updatedConversations = [newConversation, ...conversations]
      
      // Reordenar baseado no sort atual
      const sortedConversations = updatedConversations.sort((a, b) => {
        const aValue = sort.field === 'updatedAt' ? a.updatedAt : 
                       sort.field === 'createdAt' ? a.createdAt : a.id
        const bValue = sort.field === 'updatedAt' ? b.updatedAt : 
                       sort.field === 'createdAt' ? b.createdAt : b.id
        
        const comparison = new Date(bValue).getTime() - new Date(aValue).getTime()
        return sort.order === 'desc' ? comparison : -comparison
      })
      
      set({ conversations: sortedConversations })
      messageUtils.logMessageOperation('New conversation added. Total conversations:', sortedConversations.length)
    },

    // Add new message (real-time)
    addMessage: (message) => {
      messageUtils.logMessageOperation('Adding message to store', message)
      
      const { conversationId } = message
      const currentMessages = get().messages[conversationId] || []
      
      // Avoid duplicates using utility function
      if (messageUtils.isDuplicateMessage(currentMessages, message)) {
        messageUtils.logMessageOperation('Message already exists, skipping', message.id)
        return
      }
      
      // Add and sort messages using utility function
      const updatedMessages = messageUtils.sortMessagesByTimestamp([...currentMessages, message])
      
      set({
        messages: {
          ...get().messages,
          [conversationId]: updatedMessages
        }
      })
      
      messageUtils.logMessageOperation('Message added to store. Total messages for conversation ' + conversationId, updatedMessages.length)
      
      // Update conversation using utility function
      const conversation = get().conversations.find(c => c.id === conversationId)
      
      if (conversation) {
        const updatedConversation = messageUtils.updateConversationWithMessage(conversation, message)
        get().updateConversation(updatedConversation)
        messageUtils.logMessageOperation('Conversation updated with new last message', updatedConversation)
      } else {
        messageUtils.logMessageOperation('No conversation found with ID', conversationId)
        messageUtils.logMessageOperation('Available conversations', get().conversations.map(c => ({ id: c.id, contact: c.contact?.name })))
        
        // Only log warning, don't force full reload - WebSocket will handle updates
        messageUtils.logMessageOperation('Conversation not found locally, but message added via WebSocket', conversationId)
      }
    },

    // Update message status
    updateMessageStatus: (messageId, status) => {
      const { messages } = get()
      const updatedMessages = { ...messages }
      
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      })
      
      set({ messages: updatedMessages })
    },


    // Start/Stop polling
    startPolling,
    stopPolling,

    // Reset store
    reset: () => {
      stopPolling() // Stop polling when resetting
      set({
        conversations: [],
        activeConversation: null,
        messages: {},
        messagesCache: {},
        messagesPagination: {},
        isLoading: false,
        isLoadingMessages: false,
        filters: initialFilters,
        sort: initialSort,
        searchQuery: '',
        activeTab: 'mine',
        currentPage: 1,
        totalPages: 1,
        hasMore: true
      })
    }
    }
  })
)