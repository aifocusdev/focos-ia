import { api } from '../api'
import type { 
  QuickReply, 
  QuickReplyListResponse, 
  QuickReplyListParams, 
  CreateQuickReplyRequest, 
  UpdateQuickReplyRequest 
} from '../../types/quickReply.types'

class QuickReplyService {
  async getQuickReplies(params: QuickReplyListParams = {}): Promise<QuickReplyListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/quick-replies?${queryString}` : '/quick-replies'
    
    return await api.get<QuickReplyListResponse>(url)
  }

  async getQuickReply(id: number): Promise<QuickReply> {
    return await api.get<QuickReply>(`/quick-replies/${id}`)
  }

  async createQuickReply(data: CreateQuickReplyRequest): Promise<QuickReply> {
    return await api.post<QuickReply>('/quick-replies', data)
  }

  async updateQuickReply(id: number, data: UpdateQuickReplyRequest): Promise<QuickReply> {
    return await api.patch<QuickReply>(`/quick-replies/${id}`, data)
  }

  async deleteQuickReply(id: number): Promise<void> {
    await api.delete(`/quick-replies/${id}`)
  }
}

export const quickReplyService = new QuickReplyService()