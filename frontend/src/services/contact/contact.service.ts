import { api } from '../api'
import type { 
  Contact, 
  ContactResponse, 
  ContactFilters, 
  ContactUserAccount, 
  ContactProfileData 
} from '../../types/contact.types'

class ContactService {
  private readonly baseUrl = '/contacts'

  async getContacts(filters: ContactFilters = {}): Promise<ContactResponse> {
    const params = new URLSearchParams()
    
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString())
    }
    if (filters.search) {
      params.append('search', filters.search)
    }
    if (filters.external_id) {
      params.append('external_id', filters.external_id)
    }
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      filters.tag_ids.forEach(tagId => {
        params.append('tag_ids', tagId.toString())
      })
    }
    if (filters.include_tags !== undefined) {
      params.append('include_tags', filters.include_tags.toString())
    }
    if (filters.date_exp_from) {
      params.append('date_exp_from', filters.date_exp_from)
    }
    if (filters.date_exp_to) {
      params.append('date_exp_to', filters.date_exp_to)
    }

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    return api.get<ContactResponse>(url)
  }

  async getContactById(id: number): Promise<Contact> {
    return api.get<Contact>(`${this.baseUrl}/${id}`)
  }

  async getContactUserAccounts(contactId: number): Promise<ContactUserAccount[]> {
    return api.get<ContactUserAccount[]>(`/contact-user-accounts/contact/${contactId}`)
  }

  async getContactProfile(contactId: number): Promise<ContactProfileData> {
    const [contact, userAccounts] = await Promise.all([
      this.getContactById(contactId),
      this.getContactUserAccounts(contactId)
    ])

    return {
      contact,
      userAccounts
    }
  }
}

export const contactService = new ContactService()