export type TagColor = string // Any hex color value

export interface Tag {
  id: number
  name: string
  color: TagColor
  created_at: string
  updated_at: string
}

export interface CreateTagRequest {
  name: string
  color: TagColor
}

export interface UpdateTagRequest {
  name: string
  color: TagColor
}

export interface TagListResponse {
  data: Tag[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TagListParams {
  page?: number
  limit?: number
  search?: string
}