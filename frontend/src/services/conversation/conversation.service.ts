import { api } from '../api'
import { adaptConversationsResponse, adaptMessagesResponse, adaptMessage } from './conversation.adapter'
import type { Conversation, ConversationFilters, ConversationSort, Message } from '../../types/conversation.types'

export const conversationService = {
  // Get all conversations with filters and sorting
  async getConversations(
    filters?: ConversationFilters,
    sort?: ConversationSort,
    page = 1,
    limit = 20
  ): Promise<{
    conversations: Conversation[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (filters?.assignedTo && filters.assignedTo !== 'all') {
      params.append('assignedTo', filters.assignedTo)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    if (filters?.unassignment === true) {
      params.append('unassignment', 'true')
    }
    if (filters?.assigned_bot === true) {
      params.append('assigned_bot', 'true')
    }
    if (filters?.unread === true) {
      params.append('unread', 'true')
    }
    if (filters?.tag_ids && filters.tag_ids.length > 0) {
      filters.tag_ids.forEach(tagId => {
        params.append('tag_ids', tagId.toString())
      })
    }
    if (sort?.field) {
      // Map frontend field names to API field names
      const fieldMapping: Record<string, string> = {
        'updatedAt': 'last_activity_at',
        'createdAt': 'created_at',
        'id': 'id'
      }
      
      const apiField = fieldMapping[sort.field] || sort.field
      params.append('sortBy', apiField)
      params.append('sortOrder', sort.order)
    }

    const response = await api.get<any>(`/conversations?${params}`)
    return adaptConversationsResponse(response)
  },

  // Get single conversation by ID
  async getConversation(id: string): Promise<Conversation> {
    return await api.get<Conversation>(`/conversations/${id}`)
  },

  // Get messages for a conversation
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{
    messages: Message[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log('📬 Fetching messages for conversation:', conversationId, 'page:', page)
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      // Order by timestamp desc to get newest first, but we'll reverse in adapter for proper chronological order
      sortBy: 'timestamp',
      sortOrder: 'desc'
    })
    
    const response = await api.get<any>(`/messages/conversation/${conversationId}?${params}`)
    console.log('📬 Raw API response:', response)
    const adapted = adaptMessagesResponse(response)
    console.log('📬 Adapted messages response:', adapted)
    return adapted
  },

  // Send message in conversation
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await api.post<any>(`/messages`, {
      conversation_id: conversationId,
      body: content
    })
    return adaptMessage(response)
  },

  // Send message with media attachments
  async sendMessageWithMedia(
    conversationId: string, 
    text: string, 
    files: File[],
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<Message> {
    const formData = new FormData()
    
    // Add text content
    if (text.trim()) {
      formData.append('text', text.trim())
    }
    
    // Add files
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await api.upload<any>(`/messages/send-with-media/${conversationId}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
          onProgress(progress)
        }
      }
    })
    return adaptMessage(response)
  },



  // Assign conversation to user
  async assignConversation(id: string, assignedTo: string): Promise<Conversation> {
    return await api.patch<Conversation>(`/conversations/${id}`, { assignedTo })
  },

  // Mark conversation as read
  async markAsRead(id: string): Promise<void> {
    await api.patch<void>(`/conversations/${id}/read`)
  },

  // Mark conversation as unread
  async markAsUnread(id: string): Promise<void> {
    await api.patch<void>(`/conversations/${id}/unread`)
  },

  // Unassign conversation
  async unassignConversation(id: string): Promise<Conversation> {
    return await api.patch<Conversation>(`/conversations/${id}/unassign`)
  },

  // Assign conversation to current user
  async assignToMe(id: string): Promise<Conversation> {
    return await api.patch<Conversation>(`/conversations/${id}/assign`)
  },

  // Search conversations
  async searchConversations(query: string): Promise<Conversation[]> {
    return await api.get<Conversation[]>(`/conversations/search?q=${encodeURIComponent(query)}`)
  }
}