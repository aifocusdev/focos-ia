import React, { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '../../../../utils/cn'

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  disabled = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt']
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFiles = useCallback((files: File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    if (files.length > maxFiles) {
      errors.push(`Máximo ${maxFiles} arquivos permitidos`)
      return { valid: [], errors }
    }

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: Arquivo muito grande (máx. ${Math.round(maxSize / 1024 / 1024)}MB)`)
        return
      }

      // Check file type
      const isTypeAllowed = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''))
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      })

      if (!isTypeAllowed) {
        errors.push(`${file.name}: Tipo de arquivo não suportado`)
        return
      }

      valid.push(file)
    })

    return { valid, errors }
  }, [maxFiles, maxSize, acceptedTypes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setError(null)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const { valid, errors } = validateFiles(files)

    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    if (valid.length > 0) {
      onFilesSelected(valid)
    }
  }, [disabled, validateFiles, onFilesSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const { valid, errors } = validateFiles(files)

    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    if (valid.length > 0) {
      onFilesSelected(valid)
    }

    // Reset input
    e.target.value = ''
  }, [validateFiles, onFilesSelected])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  return (
    <div className="relative">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          isDragOver && !disabled
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm">
            <p className="text-gray-300">
              Arraste um arquivo aqui ou <span className="text-blue-400">clique para selecionar</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Máx. {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-md flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default FileDropZone