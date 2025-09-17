import React from 'react'
import { Download, Eye, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useDocumentHandler } from '../../hooks/ui/useDocumentHandler'
import { formatFileSize } from '../../utils/mediaUtils'

interface DocumentViewerProps {
  fileName: string
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  className?: string
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  fileName,
  fileUrl,
  fileSize,
  mimeType,
  className 
}) => {
  const {
    isDownloading,
    downloadProgress,
    fileTypeInfo,
    isAllowed,
    canPreview,
    download,
    openPreview
  } = useDocumentHandler(fileName, fileUrl, mimeType)

  const { icon: FileIcon, color, label } = fileTypeInfo

  if (!isAllowed) {
    return (
      <div className={cn(
        "flex items-center gap-3 bg-red-900/20 border border-red-700/30 rounded-lg p-3 min-w-[280px] max-w-sm",
        className
      )}>
        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-red-300 text-sm font-medium truncate">
            Tipo de arquivo não permitido
          </div>
          <div className="text-red-400 text-xs mt-0.5 truncate">
            {fileName}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 bg-gray-700/80 backdrop-blur-sm rounded-lg p-3 min-w-[280px] max-w-sm group hover:bg-gray-700 transition-colors",
      className
    )}>
      {/* File Icon */}
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: `${color}20` }}
      >
        <FileIcon 
          className="w-6 h-6" 
          style={{ color }} 
        />
        
        {/* File type label */}
        <div 
          className="absolute bottom-0 left-0 right-0 text-[8px] font-bold text-center py-0.5 text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate mb-0.5">
          {fileName}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {fileSize && (
            <span>{formatFileSize(fileSize)}</span>
          )}
          {fileSize && mimeType && <span>•</span>}
          {mimeType && (
            <span className="truncate">{mimeType}</span>
          )}
        </div>

        {/* Download Progress */}
        {isDownloading && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
              <span>Baixando...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {/* Preview Button */}
        {canPreview && fileUrl && (
          <button
            onClick={openPreview}
            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors group/preview"
            title="Visualizar"
          >
            <Eye className="w-4 h-4 text-white group-hover/preview:text-blue-300" />
          </button>
        )}

        {/* Download Button */}
        {fileUrl && (
          <button
            onClick={download}
            disabled={isDownloading}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Baixar"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* External Link (if no fileUrl) */}
        {!fileUrl && (
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentViewer