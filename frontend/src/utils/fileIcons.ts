import { 
  FileText, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio,
  FileSpreadsheet,
  Presentation,
  Archive,
  FileCode,
  type LucideIcon
} from 'lucide-react'

export interface FileTypeInfo {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}

/**
 * Map file extensions to their corresponding icons and colors
 */
export const getFileTypeInfo = (filename: string): FileTypeInfo => {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  
  const fileTypes: Record<string, FileTypeInfo> = {
    // Documents
    pdf: {
      icon: FileText,
      color: '#ef4444', // red-500
      bgColor: '#fef2f2', // red-50
      label: 'PDF'
    },
    doc: {
      icon: FileText,
      color: '#2563eb', // blue-600
      bgColor: '#eff6ff', // blue-50
      label: 'Word'
    },
    docx: {
      icon: FileText,
      color: '#2563eb',
      bgColor: '#eff6ff',
      label: 'Word'
    },
    txt: {
      icon: FileText,
      color: '#6b7280', // gray-500
      bgColor: '#f9fafb', // gray-50
      label: 'Text'
    },
    rtf: {
      icon: FileText,
      color: '#6b7280',
      bgColor: '#f9fafb',
      label: 'RTF'
    },
    
    // Spreadsheets
    xls: {
      icon: FileSpreadsheet,
      color: '#059669', // emerald-600
      bgColor: '#ecfdf5', // emerald-50
      label: 'Excel'
    },
    xlsx: {
      icon: FileSpreadsheet,
      color: '#059669',
      bgColor: '#ecfdf5',
      label: 'Excel'
    },
    csv: {
      icon: FileSpreadsheet,
      color: '#059669',
      bgColor: '#ecfdf5',
      label: 'CSV'
    },
    
    // Presentations
    ppt: {
      icon: Presentation,
      color: '#dc2626', // red-600
      bgColor: '#fef2f2',
      label: 'PowerPoint'
    },
    pptx: {
      icon: Presentation,
      color: '#dc2626',
      bgColor: '#fef2f2',
      label: 'PowerPoint'
    },
    
    // Archives
    zip: {
      icon: Archive,
      color: '#7c3aed', // violet-600
      bgColor: '#f5f3ff', // violet-50
      label: 'ZIP'
    },
    rar: {
      icon: Archive,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      label: 'RAR'
    },
    '7z': {
      icon: Archive,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      label: '7-Zip'
    },
    tar: {
      icon: Archive,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      label: 'TAR'
    },
    
    // Images
    jpg: {
      icon: FileImage,
      color: '#ea580c', // orange-600
      bgColor: '#fff7ed', // orange-50
      label: 'JPEG'
    },
    jpeg: {
      icon: FileImage,
      color: '#ea580c',
      bgColor: '#fff7ed',
      label: 'JPEG'
    },
    png: {
      icon: FileImage,
      color: '#ea580c',
      bgColor: '#fff7ed',
      label: 'PNG'
    },
    gif: {
      icon: FileImage,
      color: '#ea580c',
      bgColor: '#fff7ed',
      label: 'GIF'
    },
    webp: {
      icon: FileImage,
      color: '#ea580c',
      bgColor: '#fff7ed',
      label: 'WebP'
    },
    svg: {
      icon: FileImage,
      color: '#ea580c',
      bgColor: '#fff7ed',
      label: 'SVG'
    },
    
    // Videos
    mp4: {
      icon: FileVideo,
      color: '#9333ea', // purple-600
      bgColor: '#faf5ff', // purple-50
      label: 'MP4'
    },
    avi: {
      icon: FileVideo,
      color: '#9333ea',
      bgColor: '#faf5ff',
      label: 'AVI'
    },
    mov: {
      icon: FileVideo,
      color: '#9333ea',
      bgColor: '#faf5ff',
      label: 'MOV'
    },
    wmv: {
      icon: FileVideo,
      color: '#9333ea',
      bgColor: '#faf5ff',
      label: 'WMV'
    },
    webm: {
      icon: FileVideo,
      color: '#9333ea',
      bgColor: '#faf5ff',
      label: 'WebM'
    },
    
    // Audio
    mp3: {
      icon: FileAudio,
      color: '#0891b2', // cyan-600
      bgColor: '#ecfeff', // cyan-50
      label: 'MP3'
    },
    wav: {
      icon: FileAudio,
      color: '#0891b2',
      bgColor: '#ecfeff',
      label: 'WAV'
    },
    ogg: {
      icon: FileAudio,
      color: '#0891b2',
      bgColor: '#ecfeff',
      label: 'OGG'
    },
    aac: {
      icon: FileAudio,
      color: '#0891b2',
      bgColor: '#ecfeff',
      label: 'AAC'
    },
    flac: {
      icon: FileAudio,
      color: '#0891b2',
      bgColor: '#ecfeff',
      label: 'FLAC'
    },
    m4a: {
      icon: FileAudio,
      color: '#0891b2',
      bgColor: '#ecfeff',
      label: 'M4A'
    },
    
    // Code files
    js: {
      icon: FileCode,
      color: '#f59e0b', // amber-500
      bgColor: '#fffbeb', // amber-50
      label: 'JavaScript'
    },
    ts: {
      icon: FileCode,
      color: '#3b82f6', // blue-500
      bgColor: '#eff6ff', // blue-50
      label: 'TypeScript'
    },
    html: {
      icon: FileCode,
      color: '#dc2626', // red-600
      bgColor: '#fef2f2',
      label: 'HTML'
    },
    css: {
      icon: FileCode,
      color: '#2563eb', // blue-600
      bgColor: '#eff6ff',
      label: 'CSS'
    },
    json: {
      icon: FileCode,
      color: '#059669', // emerald-600
      bgColor: '#ecfdf5',
      label: 'JSON'
    },
    xml: {
      icon: FileCode,
      color: '#dc2626',
      bgColor: '#fef2f2',
      label: 'XML'
    }
  }
  
  // Return specific file type info or default
  return fileTypes[extension] || {
    icon: File,
    color: '#6b7280', // gray-500
    bgColor: '#f9fafb', // gray-50
    label: 'File'
  }
}

/**
 * Get file category for grouping
 */
export const getFileCategory = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  
  const categories: Record<string, string> = {
    // Images
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', 
    webp: 'image', svg: 'image', bmp: 'image',
    
    // Videos
    mp4: 'video', avi: 'video', mov: 'video', wmv: 'video',
    flv: 'video', webm: 'video', mkv: 'video',
    
    // Audio
    mp3: 'audio', wav: 'audio', ogg: 'audio', aac: 'audio',
    flac: 'audio', m4a: 'audio', wma: 'audio',
    
    // Documents
    pdf: 'document', doc: 'document', docx: 'document',
    txt: 'document', rtf: 'document',
    
    // Spreadsheets
    xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet',
    
    // Presentations
    ppt: 'presentation', pptx: 'presentation',
    
    // Archives
    zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive',
    
    // Code
    js: 'code', ts: 'code', html: 'code', css: 'code',
    json: 'code', xml: 'code', py: 'code', java: 'code'
  }
  
  return categories[extension] || 'file'
}