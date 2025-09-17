import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import UserForm from './UserForm'
import { useUserStore } from '../../../stores/userStore'
import type { User, CreateUser, UpdateUser } from '../../../types/user.types'

interface UserModalProps {
  isOpen: boolean
  user?: User
  onClose: () => void
  onSuccess?: () => void
}

const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, 
  user, 
  onClose, 
  onSuccess 
}) => {
  const { createUser, updateUser, loading, error, setError } = useUserStore()
  const isEdit = !!user

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen, setError])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleClose = () => {
    if (loading) return
    setError(null)
    onClose()
  }

  const handleSubmit = async (data: CreateUser | UpdateUser) => {
    try {
      if (isEdit && user) {
        await updateUser(user.id, data as UpdateUser)
      } else {
        await createUser(data as CreateUser)
      }
      
      onSuccess?.()
      handleClose()
    } catch {
      // Error is already handled by the store
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Form */}
            <UserForm
              user={user}
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserModal