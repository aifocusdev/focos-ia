import React from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '../../../../utils/cn'

export interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error'
  progress: number
  message?: string
}

interface UploadProgressProps {
  state: UploadState
  className?: string
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  state,
  className
}) => {
  if (state.status === 'idle') return null

  const getStatusIcon = () => {
    switch (state.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (state.status) {
      case 'uploading':
        return `Enviando... ${state.progress}%`
      case 'success':
        return state.message || 'Upload concluído!'
      case 'error':
        return state.message || 'Erro no upload'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (state.status) {
      case 'uploading':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {getStatusIcon()}
      
      <div className="flex-1">
        <div className={cn('text-sm', getStatusColor())}>
          {getStatusText()}
        </div>
        
        {state.status === 'uploading' && (
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadProgress