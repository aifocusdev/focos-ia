import React from 'react'
import { X, Download, ZoomIn, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useImageViewer } from '../../hooks/ui/useImageViewer'
import { formatFileSize } from '../../utils/mediaUtils'

interface ImageViewerProps {
  src: string
  alt?: string
  fileName?: string
  fileSize?: number
  className?: string
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  src, 
  alt = 'Imagem', 
  fileName,
  fileSize,
  className 
}) => {
  const {
    isLoading,
    isError,
    isModalOpen,
    dimensions,
    openModal,
    closeModal
  } = useImageViewer(src)

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(src, '_blank')
  }

  if (isError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-red-900/20 border border-red-700/30 rounded-lg p-6 min-h-[120px]",
        className
      )}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-red-300 text-sm font-medium">
            Erro ao carregar imagem
          </div>
          <div className="text-red-400 text-xs mt-1">
            Não foi possível exibir este arquivo
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail */}
      <div className={cn("relative group cursor-pointer", className)}>
        <div className="relative overflow-hidden rounded-lg bg-gray-700">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 z-10">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          )}
          
          <img
            src={src}
            alt={alt}
            className={cn(
              "max-w-full h-auto max-h-64 object-contain transition-all duration-200",
              "group-hover:scale-105",
              isLoading && "opacity-0"
            )}
            onClick={openModal}
            onLoad={() => {}}
            onError={() => {}}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={openModal}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleDownload}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Image info */}
        {(dimensions || fileSize) && (
          <div className="mt-2 text-xs text-gray-400 space-y-0.5">
            {dimensions && (
              <div>{dimensions.width} × {dimensions.height}</div>
            )}
            {fileSize && (
              <div>{formatFileSize(fileSize)}</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white">
                {fileName && (
                  <div className="font-medium">{fileName}</div>
                )}
                {dimensions && (
                  <div className="text-sm opacity-75">
                    {dimensions.width} × {dimensions.height}
                    {fileSize && ` • ${formatFileSize(fileSize)}`}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={closeModal}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Image */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ImageViewer