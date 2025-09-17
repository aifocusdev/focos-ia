import { api } from '../api'
import type { Tag, TagResponse, TagFilters } from '../../types/contact.types'

class TagService {
  private readonly baseUrl = '/tags'

  async getTags(filters: TagFilters = {}): Promise<TagResponse> {
    const params = new URLSearchParams()
    
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString())
    }
    if (filters.search) {
      params.append('search', filters.search)
    }

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    return api.get<TagResponse>(url)
  }

  async getAllTags(): Promise<Tag[]> {
    // Busca todas as tags sem paginação (limit alto)
    const response = await this.getTags({ limit: 2000 })
    return response.data
  }
}

export const tagService = new TagService()