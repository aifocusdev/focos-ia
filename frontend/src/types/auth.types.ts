export interface User {
  id: number
  name: string
  username: string
  role_id: number
  online: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}