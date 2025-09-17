import { api } from '../api'
import type { 
  ContactUserAccount, 
  CreateContactUserAccountRequest, 
  UpdateContactUserAccountRequest 
} from '../../types/contact-user-accounts.types'

class ContactUserAccountsService {
  private baseUrl = '/contact-user-accounts'

  async getByContactId(contactId: string): Promise<ContactUserAccount[]> {
    return api.get<ContactUserAccount[]>(`${this.baseUrl}/contact/${contactId}`)
  }

  async create(data: CreateContactUserAccountRequest): Promise<ContactUserAccount> {
    return api.post<ContactUserAccount>(this.baseUrl, data)
  }

  async update(id: number, data: UpdateContactUserAccountRequest): Promise<ContactUserAccount> {
    return api.patch<ContactUserAccount>(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return api.delete<void>(`${this.baseUrl}/${id}`)
  }
}

export const contactUserAccountsService = new ContactUserAccountsService()