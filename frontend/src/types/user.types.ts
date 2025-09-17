export interface User {
  id: number
  name: string
  username: string
  role_id: number
  contact_type_preference: 'ads' | 'all' | 'support'
  contact_type_restriction: boolean
  created_at: string
  updated_at: string
  role?: {
    id: number
    name: string
  }
}

export interface CreateUser {
  name: string
  username: string
  password: string
  role_id: number
  contact_type_preference: 'ads' | 'all' | 'support'
  contact_type_restriction: boolean
}

export interface UpdateUser {
  name?: string
  username?: string
  password?: string
  role_id?: number
  contact_type_preference?: 'ads' | 'all' | 'support'
  contact_type_restriction?: boolean
}

export interface UserFilters {
  page?: number
  limit?: number
  name?: string
  username?: string
  role_id?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type UserResponse = PaginatedResponse<User>

export interface Role {
  id: number
  name: string
}