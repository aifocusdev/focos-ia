import { format, isToday, differenceInHours, differenceInMinutes } from 'date-fns'
import type { Message } from '../types/conversation.types'
import { MEDIA_LABELS, UI_LIMITS } from '../config/ui.constants'

/**
 * Format time for message bubbles and conversation items
 * Shows time if today, "ontem HH:mm" if yesterday, or "dd/MM HH:mm" for older
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return '--:--'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '--:--'
  }
  
  try {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 48) {
      return `ontem ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'dd/MM HH:mm')
    }
  } catch {
    return '--:--'
  }
}

/**
 * Format time for conversation list (simpler version)
 * Shows time if today, or date if older
 */
export const formatConversationTime = (dateString: string): string => {
  if (!dateString) return '--:--'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '--:--'
  }
  
  try {
    if (isToday(date)) {
      // Se for hoje, mostra apenas o horário (ex: 22:00)
      return format(date, 'HH:mm')
    } else {
      // Se não for hoje, mostra a data (ex: 10/04/2024)
      return format(date, 'dd/MM/yyyy')
    }
  } catch {
    return '--:--'
  }
}

/**
 * Format message preview for conversation list
 * Truncates text messages and shows media type labels
 */
export const formatMessagePreview = (message: Message | undefined): string => {
  if (!message) return 'Nenhuma mensagem'
  
  if (message.type === 'text') {
    return message.content.length > UI_LIMITS.MESSAGE_PREVIEW_LENGTH
      ? `${message.content.substring(0, UI_LIMITS.MESSAGE_PREVIEW_LENGTH)}...`
      : message.content
  }
  
  return MEDIA_LABELS[message.type] || 'Mensagem'
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
 * Format phone number for display
 * Removes country code and formats consistently
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // If starts with 55 (Brazil), format as Brazilian number
  if (cleaned.startsWith('55') && cleaned.length === 13) {
    const number = cleaned.slice(2) // Remove country code
    return `(${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`
  }
  
  // For other formats, just return as is with + prefix
  return phone.startsWith('+') ? phone : `+${phone}`
}

/**
 * Format contact name with fallback to phone
 */
export const formatContactName = (name?: string, phone?: string): string => {
  return name || phone || 'Contato Desconhecido'
}

/**
 * Check if a date is within the last 24 hours for WhatsApp Business API messaging window
 * Returns true if dateString is null/undefined (unknown state - assume valid)
 */
export const isWithin24Hours = (dateString?: string): boolean => {
  // If no date provided, assume valid (we don't know the history)
  if (!dateString) return true
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return true // Invalid date, assume valid
    
    const now = new Date()
    const hoursDiff = differenceInHours(now, date)
    
    return hoursDiff < 24
  } catch {
    return true // Error parsing, assume valid
  }
}

/**
 * Get hours remaining until the 24-hour WhatsApp messaging window expires
 * Returns null if no valid date or already expired
 */
export const getHoursUntilExpiry = (dateString?: string): number | null => {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    const now = new Date()
    const hoursDiff = differenceInHours(now, date)
    
    if (hoursDiff >= 24) return null // Already expired
    
    return 24 - hoursDiff
  } catch {
    return null
  }
}

/**
 * Get minutes remaining until the 24-hour WhatsApp messaging window expires
 * Returns null if no valid date or already expired
 */
export const getMinutesUntilExpiry = (dateString?: string): number | null => {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    const now = new Date()
    const minutesDiff = differenceInMinutes(now, date)
    const totalMinutesIn24Hours = 24 * 60
    
    if (minutesDiff >= totalMinutesIn24Hours) return null // Already expired
    
    return totalMinutesIn24Hours - minutesDiff
  } catch {
    return null
  }
}