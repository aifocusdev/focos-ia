import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useQuickReplyStore } from '../../stores/quickReplyStore'
import Button from '../ui/Button'
import type { QuickReply } from '../../types/quickReply.types'

interface QuickReplyDeleteModalProps {
  quickReply: QuickReply | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const QuickReplyDeleteModal: React.FC<QuickReplyDeleteModalProps> = ({
  quickReply,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { deleteQuickReply, isDeleting } = useQuickReplyStore()

  const handleDelete = async () => {
    if (!quickReply) return

    const success = await deleteQuickReply(quickReply.id)
    if (success) {
      onSuccess()
      onClose()
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  if (!isOpen || !quickReply) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Confirmar Exclusão
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Tem certeza que deseja excluir a resposta rápida{' '}
            <span className="font-semibold text-white">"{quickReply.title}"</span>?
          </p>
          
          <div className="bg-red-900/20 border border-red-700/50 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Esta ação é irreversível!</p>
                <p>
                  A resposta rápida será permanentemente removida do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-md p-3 mb-6">
            <h4 className="text-sm font-medium text-white mb-2">
              Informações da resposta rápida:
            </h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><span className="font-medium">ID:</span> {quickReply.id}</p>
              <p><span className="font-medium">Título:</span> {quickReply.title}</p>
              <p>
                <span className="font-medium">Shortcut:</span>{' '}
                <span className="font-mono bg-gray-600 px-2 py-1 rounded text-blue-400">
                  {quickReply.shortcut}
                </span>
              </p>
              <div>
                <span className="font-medium">Conteúdo:</span>
                <div className="mt-1 bg-gray-600 p-2 rounded text-xs max-h-20 overflow-y-auto">
                  {quickReply.body}
                </div>
              </div>
              <p>
                <span className="font-medium">Criado em:</span>{' '}
                {new Date(quickReply.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              loading={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Resposta Rápida
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickReplyDeleteModal