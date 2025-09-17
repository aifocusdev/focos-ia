import { api } from '../api'
import type { LoginRequest, LoginResponse, User } from '../../types'

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const loginData: LoginRequest = { username, password }
  const response = await api.post<LoginResponse>('/auth/login', loginData)
  
  if (response.accessToken) {
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('currentUser', JSON.stringify(response.user))
  }
  
  return response
}

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.error('Logout API error:', error)
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('currentUser')
  }
}

export const getMe = async (): Promise<User> => {
  return await api.get<User>('/auth/me')
}

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await api.post<{ accessToken: string }>('/auth/refresh')
  
  if (response.accessToken) {
    localStorage.setItem('accessToken', response.accessToken)
  }
  
  return response
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken')
}

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}