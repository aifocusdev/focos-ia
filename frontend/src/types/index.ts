// Re-export User from user.types for consistency
export type { User } from './user.types'

// Re-export types from user.types
export type { LoginRequest, LoginResponse } from './user.types'

// Re-export Application types
export type { 
  Application, 
  ApplicationListResponse, 
  ApplicationListParams, 
  CreateApplicationRequest, 
  UpdateApplicationRequest 
} from './application.types'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResponse {
  id: string
  url: string
  name: string
  size: number
  mimeType: string
  kind: 'image' | 'video' | 'audio' | 'document'
}