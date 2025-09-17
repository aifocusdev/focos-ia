export interface QuickReply {
  id: number
  title: string
  shortcut: string
  body: string
  created_at: string
  updated_at: string
}

export interface CreateQuickReplyRequest {
  title: string
  shortcut: string
  body: string
}

export interface UpdateQuickReplyRequest {
  title?: string
  shortcut?: string
  body?: string
}

export interface QuickReplyListResponse {
  data: QuickReply[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QuickReplyListParams {
  page?: number
  limit?: number
  search?: string
}