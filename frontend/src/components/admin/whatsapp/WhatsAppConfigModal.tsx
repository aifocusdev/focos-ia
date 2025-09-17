import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import WhatsAppConfigForm from './WhatsAppConfigForm'
import { useWhatsAppStore } from '../../../stores/whatsAppStore'
import type { WhatsAppConfig, CreateWhatsAppConfig, UpdateWhatsAppConfig } from '../../../types/whatsapp.types'

interface WhatsAppConfigModalProps {
  isOpen: boolean
  config?: WhatsAppConfig
  onClose: () => void
  onSuccess?: () => void
}

const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({ 
  isOpen, 
  config, 
  onClose, 
  onSuccess 
}) => {
  const { createConfig, updateConfig, loading, error, setError } = useWhatsAppStore()
  const isEdit = !!config

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

  const handleSubmit = async (data: CreateWhatsAppConfig | UpdateWhatsAppConfig) => {
    try {
      if (isEdit && config) {
        await updateConfig(config.id, data as UpdateWhatsAppConfig)
      } else {
        await createConfig(data as CreateWhatsAppConfig)
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
        <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              {isEdit ? 'Editar Configuração' : 'Nova Configuração'} WhatsApp
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
            <WhatsAppConfigForm
              config={config}
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

export default WhatsAppConfigModal