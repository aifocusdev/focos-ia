import React from 'react'
import { X, File, Image, Video, Music, FileText } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { formatFileSize } from '../../../../services/upload/upload.service'

interface FilePreviewProps {
  files: File[]
  onRemoveFile: (index?: number) => void
  disabled?: boolean
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemoveFile,
  disabled = false
}) => {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5" />
    }
    if (file.type.startsWith('video/')) {
      return <Video className="w-5 h-5" />
    }
    if (file.type.startsWith('audio/')) {
      return <Music className="w-5 h-5" />
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5" />
    }
    return <File className="w-5 h-5" />
  }

  const getFileTypeColor = (file: File) => {
    if (file.type.startsWith('image/')) {
      return 'text-green-400'
    }
    if (file.type.startsWith('video/')) {
      return 'text-purple-400'
    }
    if (file.type.startsWith('audio/')) {
      return 'text-yellow-400'
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return 'text-red-400'
    }
    return 'text-blue-400'
  }

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name
    
    const extension = name.split('.').pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...'
    
    return `${truncatedName}.${extension}`
  }

  if (files.length === 0) return null

  return (
    <div className="mb-3 space-y-2">
      <h4 className="text-sm font-medium text-gray-300">
        Arquivo selecionado
      </h4>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className={cn(
              'flex items-center gap-3 p-2 bg-gray-700 rounded-md',
              disabled && 'opacity-50'
            )}
          >
            <div className={cn('flex-shrink-0', getFileTypeColor(file))}>
              {getFileIcon(file)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">
                {truncateFileName(file.name)}
              </p>
              <p className="text-xs text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
            
            <button
              onClick={() => onRemoveFile()}
              disabled={disabled}
              className={cn(
                'flex-shrink-0 p-1 rounded-full transition-colors',
                disabled
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
              )}
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {files.length > 0 && (
        <div className="text-xs text-gray-500">
          Total: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
        </div>
      )}
    </div>
  )
}

export default FilePreview