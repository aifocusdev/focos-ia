import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { contactUserAccountsService } from '../services/contact-user-accounts/contact-user-accounts.service'
import type { 
  ContactUserAccount, 
  CreateContactUserAccountRequest, 
  UpdateContactUserAccountRequest 
} from '../types/contact-user-accounts.types'
import { showToast } from './uiStore'

interface ContactUserAccountsState {
  accounts: ContactUserAccount[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  selectedContactId: string | null
}

interface ContactUserAccountsActions {
  loadAccountsByContactId: (contactId: string) => Promise<void>
  createAccount: (data: CreateContactUserAccountRequest) => Promise<void>
  updateAccount: (id: number, data: UpdateContactUserAccountRequest) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
  clearAccounts: () => void
  clearError: () => void
}

type ContactUserAccountsStore = ContactUserAccountsState & ContactUserAccountsActions

export const useContactUserAccountsStore = create<ContactUserAccountsStore>()(
  devtools(
    (set) => ({
      accounts: [],
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      selectedContactId: null,

      loadAccountsByContactId: async (contactId: string) => {
        try {
          set({ isLoading: true, error: null, selectedContactId: contactId })
          
          const accounts = await contactUserAccountsService.getByContactId(contactId)
          
          set({ 
            accounts,
            isLoading: false
          })
        } catch (error) {
          console.error('Error loading contact user accounts:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar contas do usuário'
          
          set({ 
            error: errorMessage,
            isLoading: false,
            accounts: []
          })
          
          showToast.error('Erro', 'Falha ao carregar contas do usuário')
        }
      },

      createAccount: async (data: CreateContactUserAccountRequest) => {
        try {
          set({ isCreating: true, error: null })
          
          const newAccount = await contactUserAccountsService.create(data)
          
          set(state => ({
            accounts: [...state.accounts, newAccount],
            isCreating: false
          }))
          
          showToast.success('Sucesso', 'Conta criada com sucesso')
        } catch (error) {
          console.error('Error creating contact user account:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta do usuário'
          
          set({ 
            error: errorMessage,
            isCreating: false
          })
          
          // Mostra a mensagem específica da API em vez de uma genérica
          showToast.error('Erro', errorMessage)
          throw error
        }
      },

      updateAccount: async (id: number, data: UpdateContactUserAccountRequest) => {
        try {
          set({ isUpdating: true, error: null })
          
          const updatedAccount = await contactUserAccountsService.update(id, data)
          
          set(state => ({
            accounts: state.accounts.map(account => 
              account.id === id ? updatedAccount : account
            ),
            isUpdating: false
          }))
          
          showToast.success('Sucesso', 'Conta atualizada com sucesso')
        } catch (error) {
          console.error('Error updating contact user account:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar conta do usuário'
          
          set({ 
            error: errorMessage,
            isUpdating: false
          })
          
          showToast.error('Erro', errorMessage)
          throw error
        }
      },

      deleteAccount: async (id: number) => {
        try {
          set({ isDeleting: true, error: null })
          
          await contactUserAccountsService.delete(id)
          
          set(state => ({
            accounts: state.accounts.filter(account => account.id !== id),
            isDeleting: false
          }))
          
          showToast.success('Sucesso', 'Conta removida com sucesso')
        } catch (error) {
          console.error('Error deleting contact user account:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erro ao remover conta do usuário'
          
          set({ 
            error: errorMessage,
            isDeleting: false
          })
          
          showToast.error('Erro', errorMessage)
          throw error
        }
      },

      clearAccounts: () => {
        set({ 
          accounts: [], 
          selectedContactId: null,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'contact-user-accounts-store'
    }
  )
)