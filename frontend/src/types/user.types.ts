export interface User {
  id: string
  username: string
  role: string
  name?: string // Optional field for display name
  email?: string
  createdAt?: string
  updatedAt?: string
  contact_type_preference: 'ads' | 'all' | 'support'
  contact_type_restriction: boolean
}

export interface Role {
  id: number
  name: string
  created_at: string
  last_activity_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy'
}