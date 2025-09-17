import React, { useState, useEffect } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { useWhatsAppStore } from '../../stores/whatsAppStore'
import WhatsAppConfigFilters from '../../components/admin/whatsapp/WhatsAppConfigFilters'
import WhatsAppConfigTable from '../../components/admin/whatsapp/WhatsAppConfigTable'
import WhatsAppConfigModal from '../../components/admin/whatsapp/WhatsAppConfigModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import type { WhatsAppConfig } from '../../types/whatsapp.types'

const WhatsAppIntegrationPage: React.FC = () => {
  const { fetchConfigs, deleteConfig, error, setError } = useWhatsAppStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<WhatsAppConfig | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<WhatsAppConfig | null>(null)

  // Load configs on component mount
  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  // Clear error when component unmounts or modals close
  useEffect(() => {
    return () => {
      setError(null)
    }
  }, [setError])

  const handleCreateConfig = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditConfig = (config: WhatsAppConfig) => {
    setEditConfig(config)
  }

  const handleDeleteConfig = (config: WhatsAppConfig) => {
    setDeleteConfirm(config)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await deleteConfig(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch {
      // Error is already handled by the store
    }
  }

  const handleModalSuccess = () => {
    // Reset any error state
    setError(null)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center shadow-lg mr-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Integração WhatsApp
                </h1>
                <p className="text-gray-300">
                  Configurações e status da integração com WhatsApp Business API
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCreateConfig}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Configuração
            </Button>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Filters */}
        <WhatsAppConfigFilters />

        {/* Configurations Table */}
        <WhatsAppConfigTable
          onEditConfig={handleEditConfig}
          onDeleteConfig={handleDeleteConfig}
        />

        {/* Create Config Modal */}
        <WhatsAppConfigModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleModalSuccess}
        />

        {/* Edit Config Modal */}
        <WhatsAppConfigModal
          isOpen={!!editConfig}
          config={editConfig || undefined}
          onClose={() => setEditConfig(null)}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a configuração do Phone Number ID "${deleteConfirm?.phone_number_id}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </div>
  )
}

export default WhatsAppIntegrationPage