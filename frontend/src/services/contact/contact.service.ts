import { api } from '../api'
import type { Contact } from '../../types/conversation.types'

export interface UpdateContactData {
  notes?: string
  name?: string
  phone_number?: string
  external_id?: string
  accepts_remarketing?: boolean
  contact_type?: 'ads' | 'all' | 'support'
}

export const getContact = async (contactId: string): Promise<Contact> => {
  return await api.get<Contact>(`/contacts/${contactId}`)
}

export const updateContact = async (
  contactId: string,
  data: UpdateContactData
): Promise<Contact> => {
  return await api.patch<Contact>(`/contacts/${contactId}`, data)
}

export const addTagsToContact = async (
  contactId: string,
  tagIds: number[]
): Promise<Contact> => {
  return await api.post<Contact>(`/contacts/${contactId}/tags`, { tag_ids: tagIds })
}

export const removeTagsFromContact = async (
  contactId: string,
  tagIds: number[]
): Promise<Contact> => {
  return await api.delete<Contact>(`/contacts/${contactId}/tags`, { 
    data: { tag_ids: tagIds } 
  })
}
