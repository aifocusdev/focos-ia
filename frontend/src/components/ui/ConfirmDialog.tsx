import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel()
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
  }, [isOpen, loading, onCancel])

  const handleConfirm = async () => {
    if (loading) return
    await onConfirm()
  }

  const handleCancel = () => {
    if (loading) return
    onCancel()
  }

  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-900',
          iconColor: 'text-red-400',
          buttonVariant: 'danger' as const
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-900',
          iconColor: 'text-yellow-400',
          buttonVariant: 'primary' as const
        }
      case 'info':
        return {
          iconBg: 'bg-blue-900',
          iconColor: 'text-blue-400',
          buttonVariant: 'primary' as const
        }
      default:
        return {
          iconBg: 'bg-red-900',
          iconColor: 'text-red-400',
          buttonVariant: 'danger' as const
        }
    }
  }

  const { iconBg, iconColor, buttonVariant } = getVariantStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mr-4`}>
                <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={buttonVariant}
                onClick={handleConfirm}
                loading={loading}
                disabled={loading}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog