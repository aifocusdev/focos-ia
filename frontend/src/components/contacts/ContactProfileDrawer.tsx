import React, { useState, useEffect } from 'react'
import { User, Plus, Notebook, Settings, Users } from 'lucide-react'
import Drawer from '../ui/Drawer'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Select from '../ui/Select'
import ContactUserAccountList from './ContactUserAccountList'
import CreateContactUserAccountForm from './CreateContactUserAccountForm'
import EditContactUserAccountForm from './EditContactUserAccountForm'
import { ContactTagsManager } from './ContactTagsManager'
import { useContactUserAccountsStore } from '../../stores/contactUserAccountsStore'
import { useContactStore } from '../../stores/contactStore'
import type { ContactUserAccount, CreateContactUserAccountRequest, UpdateContactUserAccountRequest } from '../../types/contact-user-accounts.types'
import Textarea from '../ui/Textarea'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ContactProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  contactId: string | null
}

type FormMode = 'create' | 'edit' | null

const ContactProfileDrawer: React.FC<ContactProfileDrawerProps> = ({
  isOpen,
  onClose,
  contactId
}) => {
  const scrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#4B5563 #1F2937',
  }
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingAccount, setEditingAccount] = useState<ContactUserAccount | null>(null)
  const [notes, setNotes] = useState('')
  const [acceptsRemarketing, setAcceptsRemarketing] = useState(false)
  const [contactType, setContactType] = useState<'ads' | 'all' | 'support' | null>(null)

  const { 
    contact,
    isLoading: isContactLoading,
    isUpdating: isContactUpdating,
    fetchContact,
    updateContactNotes,
    updateRemarketingPreference,
    updateContactType,
    clearContact
  } = useContactStore()

  const {
    accounts,
    isLoading: isAccountsLoading,
    isCreating,
    isUpdating,
    isDeleting,
    loadAccountsByContactId,
    createAccount,
    updateAccount,
    deleteAccount,
    clearAccounts
  } = useContactUserAccountsStore()

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContact(contactId)
      loadAccountsByContactId(contactId)
    } else if (!isOpen) {
      clearContact()
      clearAccounts()
      setFormMode(null)
      setEditingAccount(null)
    }
  }, [isOpen, contactId, fetchContact, loadAccountsByContactId, clearContact, clearAccounts])

  useEffect(() => {
    if (contact) {
      setNotes(contact.notes || '')
      setAcceptsRemarketing(contact.accepts_remarketing || false)
      setContactType(contact.contact_type || null)
    }
  }, [contact])

  const handleCreateAccount = () => {
    setFormMode('create')
    setEditingAccount(null)
  }

  const handleEditAccount = (account: ContactUserAccount) => {
    setFormMode('edit')
    setEditingAccount(account)
  }

  const handleCancelForm = () => {
    setFormMode(null)
    setEditingAccount(null)
  }

  const handleSubmitForm = async (data: CreateContactUserAccountRequest | UpdateContactUserAccountRequest) => {
    try {
      if (formMode === 'create' && contactId) {
        await createAccount(data as CreateContactUserAccountRequest)
      } else if (formMode === 'edit' && editingAccount) {
        await updateAccount(editingAccount.id, data as UpdateContactUserAccountRequest)
      }
      setFormMode(null)
      setEditingAccount(null)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleDeleteAccount = async (accountId: number) => {
    await deleteAccount(accountId)
  }

  const handleSaveNotes = async () => {
    if (contact) {
      await updateContactNotes(contact.id, notes)
    }
  }

  const handleRemarketingToggle = async (checked: boolean) => {
    if (contact) {
      setAcceptsRemarketing(checked)
      try {
        await updateRemarketingPreference(contact.id, checked)
      } catch (error) {
        // Revert the change if API call fails
        setAcceptsRemarketing(contact.accepts_remarketing || false)
        console.error('Error updating remarketing preference:', error)
      }
    }
  }

  const handleContactTypeChange = async (value: string | number | null) => {
    if (contact && value && typeof value === 'string') {
      const newContactType = value as 'ads' | 'all' | 'support'
      setContactType(newContactType)
      try {
        await updateContactType(contact.id, newContactType)
      } catch (error) {
        // Revert the change if API call fails
        setContactType(contact.contact_type || null)
        console.error('Error updating contact type:', error)
      }
    }
  }

  const notesChanged = contact?.notes !== notes

  if (isContactLoading || !contact) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Perfil do Contato" size="xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </Drawer>
    )
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Contato"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Contact Header */}
        <div className="flex-shrink-0 bg-wine-800 border-b border-wine-700/50">
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {contact.avatar ? (
                    <img 
                      src={contact.avatar} 
                      alt={contact.name || 'Contato'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    contact.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-lg font-semibold text-white mb-1">
                    {contact.name || 'Contato Desconhecido'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <span className="font-medium">{contact.phone}</span>
                  </div>
                  
                  {/* Tags */}
                  <div className="mb-2">
                    <ContactTagsManager 
                      contactId={contact.id}
                      tags={contact.tags || []}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{accounts.length} conta{accounts.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>ID: {contact.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Custom Scrollable */}
        <div 
          className="flex-1 overflow-y-auto"
          style={scrollbarStyles}
        >
          {/* Notes Section - Enhanced CRM Style */}
          <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/30">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-wine-700/10 rounded-lg">
                    <Notebook className="w-5 h-5 text-wine-400" />
                  </div>
                  Notas Internas
                </h3>
                {notesChanged && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span>Alterações não salvas</span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações importantes sobre este contato, histórico de interações, preferências ou qualquer informação relevante..."
                  className="bg-gray-900/50 border-gray-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 resize-none text-gray-100 placeholder:text-gray-500"
                  rows={5}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {notes.length} caracteres
                </div>
              </div>
              
              {notesChanged && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-400 order-2 sm:order-1">
                    Última atualização: Nunca
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => setNotes(contact.notes || '')}
                      disabled={isContactUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotes}
                      loading={isContactUpdating}
                      disabled={isContactUpdating}
                      className="bg-wine-800 hover:bg-wine-700"
                    >
                      Salvar Notas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remarketing Preferences Section */}
          <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/30">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-wine-700/10 rounded-lg">
                    <Settings className="w-5 h-5 text-wine-400" />
                  </div>
                  Preferências de Marketing
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Checkbox
                      checked={acceptsRemarketing}
                      onChange={(e) => handleRemarketingToggle(e.target.checked)}
                      label="Receber mensagens de remarketing"
                      description="Permitir que este contato receba mensagens promocionais e de remarketing automatizadas"
                      disabled={isContactUpdating}
                    />
                  </div>
                  
                  {isContactUpdating && (
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  As alterações são salvas automaticamente
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignment Section */}
          <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/30">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-wine-700/10 rounded-lg">
                    <Users className="w-5 h-5 text-wine-400" />
                  </div>
                  Equipe Atribuída
                </h3>
                
                {isContactUpdating && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="max-w-sm">
                  <Select
                    label="Tipo de Contato"
                    options={[
                      { value: 'ads', label: 'Ads' },
                      { value: 'all', label: 'All' },
                      { value: 'support', label: 'Support' }
                    ]}
                    value={contactType}
                    onChange={handleContactTypeChange}
                    placeholder="Selecione a equipe..."
                    disabled={isContactUpdating}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  Define qual equipe é responsável por este contato
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Section - Modern CRM Style */}
          <div className="flex-1">
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-wine-700/10 rounded-lg">
                    <User className="w-5 h-5 text-wine-400" />
                  </div>
                  <span className="hidden sm:inline">Contas de Usuário</span>
                  <span className="sm:hidden">Contas</span>
                  <span className="text-sm bg-wine-700 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                    {accounts.length}
                  </span>
                </h3>
                
                {formMode === null && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateAccount}
                    disabled={isAccountsLoading}
                    className="flex items-center gap-2 bg-wine-800 hover:bg-wine-700 shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Conta</span>
                    <span className="sm:hidden">Nova</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {formMode ? (
              <div className="max-w-4xl">
                <div className="mb-6 p-6 bg-dark-800 rounded-xl border border-gray-700/50 shadow-xl">
                  <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                    {formMode === 'create' ? (
                      <>
                        <div className="p-2 bg-wine-700/10 rounded-lg">
                          <Plus className="w-5 h-5 text-wine-400" />
                        </div>
                        Criar Nova Conta
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-wine-700/10 rounded-lg">
                          <User className="w-5 h-5 text-wine-400" />
                        </div>
                        Editar Conta
                      </>
                    )}
                  </h4>
                  {formMode === 'edit' && editingAccount && (
                    <div className="flex items-center gap-2">
                      <div className="text-gray-300 text-sm bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600/50">
                        <span className="text-gray-400">Editando:</span> <span className="font-medium text-white">{editingAccount.username_final}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {formMode === 'create' ? (
                  <CreateContactUserAccountForm
                    contactId={contactId!}
                    isLoading={isCreating}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                  />
                ) : editingAccount && (
                  <EditContactUserAccountForm
                    account={editingAccount}
                    isLoading={isUpdating}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                  />
                )}
              </div>
            ) : (
              <ContactUserAccountList
                accounts={accounts}
                isLoading={isAccountsLoading}
                isDeleting={isDeleting}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default ContactProfileDrawer
