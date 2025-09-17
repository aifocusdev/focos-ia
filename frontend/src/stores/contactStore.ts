import { create } from 'zustand'
import { getContact, updateContact, addTagsToContact, removeTagsFromContact } from '../services/contact/contact.service'
import type { Contact } from '../types/conversation.types'

interface ContactStoreState {
  contact: Contact | null
  isLoading: boolean
  isUpdating: boolean
  isUpdatingTags: boolean
  error: Error | null
  fetchContact: (contactId: string) => Promise<void>
  updateContactNotes: (contactId: string, notes: string) => Promise<void>
  updateRemarketingPreference: (contactId: string, acceptsRemarketing: boolean) => Promise<void>
  updateContactType: (contactId: string, contactType: 'ads' | 'all' | 'support') => Promise<void>
  addTags: (contactId: string, tagIds: number[]) => Promise<void>
  removeTags: (contactId: string, tagIds: number[]) => Promise<void>
  clearContact: () => void
}

export const useContactStore = create<ContactStoreState>((set) => ({
  contact: null,
  isLoading: false,
  isUpdating: false,
  isUpdatingTags: false,
  error: null,

  fetchContact: async (contactId) => {
    set({ isLoading: true, error: null })
    try {
      const contactData = await getContact(contactId)
      set({ contact: contactData, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  updateContactNotes: async (contactId, notes) => {
    set({ isUpdating: true, error: null })
    try {
      const updatedContact = await updateContact(contactId, { notes })
      set({ contact: updatedContact, isUpdating: false })
    } catch (error) {
      set({ error: error as Error, isUpdating: false })
      throw error
    }
  },

  updateRemarketingPreference: async (contactId, acceptsRemarketing) => {
    set({ isUpdating: true, error: null })
    try {
      const updatedContact = await updateContact(contactId, { accepts_remarketing: acceptsRemarketing })
      set({ contact: updatedContact, isUpdating: false })
    } catch (error) {
      set({ error: error as Error, isUpdating: false })
      throw error
    }
  },

  updateContactType: async (contactId, contactType) => {
    set({ isUpdating: true, error: null })
    try {
      const updatedContact = await updateContact(contactId, { contact_type: contactType })
      set({ contact: updatedContact, isUpdating: false })
    } catch (error) {
      set({ error: error as Error, isUpdating: false })
      throw error
    }
  },

  addTags: async (contactId, tagIds) => {
    set({ isUpdatingTags: true, error: null })
    try {
      const updatedContact = await addTagsToContact(contactId, tagIds)
      set({ contact: updatedContact, isUpdatingTags: false })
    } catch (error) {
      set({ error: error as Error, isUpdatingTags: false })
      throw error
    }
  },

  removeTags: async (contactId, tagIds) => {
    set({ isUpdatingTags: true, error: null })
    try {
      const updatedContact = await removeTagsFromContact(contactId, tagIds)
      set({ contact: updatedContact, isUpdatingTags: false })
    } catch (error) {
      set({ error: error as Error, isUpdatingTags: false })
      throw error
    }
  },

  clearContact: () => {
    set({ contact: null, error: null })
  }
}))
