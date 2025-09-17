import { api } from '../api'
import type { 
  Tag, 
  TagListResponse, 
  TagListParams, 
  CreateTagRequest, 
  UpdateTagRequest 
} from '../../types/tag.types'

class TagService {
  async getTags(params: TagListParams = {}): Promise<TagListResponse> {
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
    const url = queryString ? `/tags?${queryString}` : '/tags'
    
    return await api.get<TagListResponse>(url)
  }

  async getTag(id: number): Promise<Tag> {
    return await api.get<Tag>(`/tags/${id}`)
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    return await api.post<Tag>('/tags', data)
  }

  async updateTag(id: number, data: UpdateTagRequest): Promise<Tag> {
    return await api.patch<Tag>(`/tags/${id}`, data)
  }

  async deleteTag(id: number): Promise<void> {
    await api.delete(`/tags/${id}`)
  }
}

export const tagService = new TagService()