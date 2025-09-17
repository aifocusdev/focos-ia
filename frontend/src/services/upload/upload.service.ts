import { api } from '../api'
import type { UploadProgress, UploadResponse } from '../../types'

class UploadService {
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    // Simple validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo é 10MB.')
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.upload<UploadResponse>(
        '/upload/single',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress: UploadProgress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
              }
              onProgress(progress)
            }
          }
        }
      )
      return response
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } }
      
      if (axiosError.response?.status === 413) {
        throw new Error('Arquivo muito grande.')
      }
      
      if (axiosError.response?.status === 415) {
        throw new Error('Tipo de arquivo não suportado.')
      }
      
      throw new Error('Falha no upload do arquivo')
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const uploadService = new UploadService()
  return uploadService.uploadFile(file, onProgress)
}

export const formatFileSize = (bytes: number): string => {
  const uploadService = new UploadService()
  return uploadService.formatFileSize(bytes)
}