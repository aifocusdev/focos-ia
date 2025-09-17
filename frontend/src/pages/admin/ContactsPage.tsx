import React, { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { useContactStore } from '../../stores/admin/adminContactStore'
import ContactFilters from '../../components/admin/contacts/ContactFilters'
import ContactTable from '../../components/admin/contacts/ContactTable'
import ContactProfile from '../../components/admin/contacts/ContactProfile'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import type { Contact } from '../../types/contact.types'

const ContactsPage: React.FC = () => {
  const { fetchContacts, error, setError } = useContactStore()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setError(null)
    }
  }, [setError])

  const handleViewProfile = (contact: Contact) => {
    setSelectedContact(contact)
    setIsProfileOpen(true)
  }

  const handleCloseProfile = () => {
    setIsProfileOpen(false)
    setSelectedContact(null)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center shadow-lg mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gerenciamento de Contatos
                </h1>
                <p className="text-gray-300">
                  Visualize e gerencie todos os contatos e suas informações
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Filters */}
        <ContactFilters />

        {/* Contacts Table */}
        <ContactTable onViewProfile={handleViewProfile} />

        {/* Contact Profile Drawer */}
        <ContactProfile
          isOpen={isProfileOpen}
          contact={selectedContact}
          onClose={handleCloseProfile}
        />
      </div>
    </div>
  )
}

export default ContactsPage