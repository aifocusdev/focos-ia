import { useState, useCallback } from 'react'
import { getFileTypeInfo } from '../../utils/fileIcons'
import { isFileTypeAllowed, isPreviewSupported } from '../../utils/mediaUtils'

interface UseDocumentHandlerReturn {
  isDownloading: boolean
  downloadProgress: number
  fileTypeInfo: ReturnType<typeof getFileTypeInfo>
  isAllowed: boolean
  canPreview: boolean
  download: () => Promise<void>
  openPreview: () => void
}

export const useDocumentHandler = (
  fileName: string, 
  fileUrl?: string,
  mimeType?: string
): UseDocumentHandlerReturn => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const fileTypeInfo = getFileTypeInfo(fileName)
  const isAllowed = isFileTypeAllowed(fileName, mimeType)
  const canPreview = isPreviewSupported(fileName, mimeType)

  const download = useCallback(async (): Promise<void> => {
    if (!fileUrl || !isAllowed) {
      console.warn('Download not allowed or no URL provided')
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const response = await fetch(fileUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : 0

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      // Read the response stream with progress tracking
      const chunks: Uint8Array[] = []
      let receivedLength = 0

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        chunks.push(value)
        receivedLength += value.length

        if (total > 0) {
          const progress = (receivedLength / total) * 100
          setDownloadProgress(Math.round(progress))
        }
      }

      // Create blob and download
      const blob = new Blob(chunks)
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Download failed:', error)
      // For fallback, just open the URL
      if (fileUrl) {
        window.open(fileUrl, '_blank')
      }
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }, [fileUrl, fileName, isAllowed])

  const openPreview = useCallback(() => {
    if (fileUrl && canPreview) {
      window.open(fileUrl, '_blank')
    }
  }, [fileUrl, canPreview])

  return {
    isDownloading,
    downloadProgress,
    fileTypeInfo,
    isAllowed,
    canPreview,
    download,
    openPreview
  }
}