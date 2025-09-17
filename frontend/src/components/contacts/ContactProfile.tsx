import React, { useEffect } from 'react'
import { X, User, Phone, Mail, Tag as TagIcon, FileText } from 'lucide-react'
import { useContactStore } from '../../stores/contactStore'
import LoadingSpinner from '../ui/LoadingSpinner'
import TagBadge from './TagBadge'
import ContactUserAccounts from './ContactUserAccounts'
import type { Contact } from '../../types/contact.types'

interface ContactProfileProps {
  isOpen: boolean
  contact: Contact | null
  onClose: () => void
}

const ContactProfile: React.FC<ContactProfileProps> = ({ isOpen, contact, onClose }) => {
  const { 
    selectedContact, 
    profileLoading, 
    error,
    fetchContactProfile,
    clearSelectedContact 
  } = useContactStore()

  // Fetch profile data when contact changes
  useEffect(() => {
    if (contact && isOpen) {
      fetchContactProfile(contact.id)
    }
  }, [contact, isOpen, fetchContactProfile])

  // Clear selected contact when closing
  useEffect(() => {
    if (!isOpen) {
      clearSelectedContact()
    }
  }, [isOpen, clearSelectedContact])


  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/^\+55/, '').replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  if (!isOpen || !contact) return null

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Perfil do Contato</h2>
              <p className="text-sm text-gray-300">{contact.name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {profileLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-300">Carregando perfil...</span>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          ) : selectedContact ? (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Básicas
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Nome</p>
                      <p className="text-white font-medium">{selectedContact.contact.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Telefone</p>
                      <p className="text-white font-medium">
                        {formatPhoneNumber(selectedContact.contact.phone_number)}
                      </p>
                    </div>
                  </div>
                  
                  
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Aceita Remarketing</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedContact.contact.accepts_remarketing
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {selectedContact.contact.accepts_remarketing ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedContact.contact.tags && selectedContact.contact.tags.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.contact.tags.map(tag => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedContact.contact.notes && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Observações
                  </h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedContact.contact.notes}</p>
                </div>
              )}

              {/* User Accounts */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contas Vinculadas ({selectedContact.userAccounts.length})
                </h3>
                <ContactUserAccounts userAccounts={selectedContact.userAccounts} />
              </div>

            </div>
          ) : null}
        </div>
    </div>
  )
}

export default ContactProfile