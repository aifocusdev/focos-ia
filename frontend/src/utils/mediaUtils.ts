/**
 * Utility functions for handling media files and metadata
 */

export interface MediaInfo {
  type: 'image' | 'video' | 'audio' | 'document'
  mimeType?: string
  size?: number
  duration?: number
  dimensions?: {
    width: number
    height: number
  }
}

/**
 * Get file extension from filename or URL
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Determine media type from file extension or MIME type
 */
export const getMediaType = (filename: string, mimeType?: string): MediaInfo['type'] => {
  const extension = getFileExtension(filename)
  
  // Check by MIME type first
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }
  
  // Check by file extension
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp']
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']
  
  if (imageExtensions.includes(extension)) return 'image'
  if (videoExtensions.includes(extension)) return 'video'
  if (audioExtensions.includes(extension)) return 'audio'
  
  return 'document'
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format duration in MM:SS or HH:MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get image dimensions from URL
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Get video metadata including duration and dimensions
 */
export const getVideoMetadata = (url: string): Promise<{
  duration: number
  width: number
  height: number
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      })
    }
    video.onerror = reject
    video.src = url
  })
}

/**
 * Check if file is supported for preview
 */
export const isPreviewSupported = (filename: string, mimeType?: string): boolean => {
  const mediaType = getMediaType(filename, mimeType)
  const extension = getFileExtension(filename)
  
  switch (mediaType) {
    case 'image':
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
    case 'video':
      return ['mp4', 'webm', 'mov'].includes(extension)
    case 'audio':
      return ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension)
    case 'document':
      return ['pdf'].includes(extension)
    default:
      return false
  }
}

/**
 * Validate file type for security
 */
export const isFileTypeAllowed = (filename: string, _mimeType?: string): boolean => {
  const extension = getFileExtension(filename)
  
  // Define allowed extensions
  const allowedExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    // Videos
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
    // Audio
    'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'rtf', 'csv', 'zip', 'rar', '7z'
  ]
  
  return allowedExtensions.includes(extension)
}