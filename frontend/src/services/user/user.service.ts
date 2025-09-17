import { api } from '../api'
import type { 
  User, 
  CreateUser, 
  UpdateUser, 
  UserFilters, 
  UserResponse 
} from '../../types/user.types'

class UserService {
  private baseURL = '/users'

  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.name) params.append('name', filters.name)
    if (filters.username) params.append('username', filters.username)
    if (filters.role_id) params.append('role_id', filters.role_id.toString())

    const queryString = params.toString()
    const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL

    return api.get<UserResponse>(url)
  }

  async getUserById(id: number, includeRole = false): Promise<User> {
    const params = includeRole ? '?includeRole=true' : ''
    return api.get<User>(`${this.baseURL}/${id}${params}`)
  }

  async createUser(userData: CreateUser): Promise<User> {
    return api.post<User>(this.baseURL, userData)
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User> {
    return api.patch<User>(`${this.baseURL}/${id}`, userData)
  }

  async deleteUser(id: number): Promise<void> {
    return api.delete<void>(`${this.baseURL}/${id}`)
  }
}

export const userService = new UserService()