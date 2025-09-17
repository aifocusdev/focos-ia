import { api } from '../api'
import type { Role } from '../../types/user.types'

class RoleService {
  private baseURL = '/roles'

  async getRoles(): Promise<Role[]> {
    return api.get<Role[]>(this.baseURL)
  }
}

export const roleService = new RoleService()