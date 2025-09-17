import { 
  Clock, 
  Check, 
  CheckCheck, 
  AlertCircle 
} from 'lucide-react'

// Message status icons - used by MessageBubble and ConversationListItem
export const MESSAGE_STATUS_ICONS = {
  sending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
  failed: AlertCircle
} as const

// Priority options for conversation filtering
export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
] as const

// Priority colors for conversation list items
export const PRIORITY_COLORS = {
  low: 'border-l-gray-400',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
} as const

// Sort options for conversations
export const CONVERSATION_SORT_OPTIONS = [
  { field: 'updatedAt', order: 'desc', label: 'Mais Recentes' },
  { field: 'updatedAt', order: 'asc', label: 'Mais Antigas' },
  { field: 'createdAt', order: 'desc', label: 'Criadas Recentemente' },
  { field: 'id', order: 'desc', label: 'Por ID' }
] as const

// Media type labels for message previews
export const MEDIA_LABELS = {
  image: '📷 Imagem',
  video: '🎥 Vídeo', 
  audio: '🎵 Áudio',
  document: '📄 Documento'
} as const

// Message status colors for UI
export const MESSAGE_STATUS_COLORS = {
  sending: 'text-gray-400',
  sent: 'text-gray-400',
  delivered: 'text-blue-400',
  read: 'text-green-500',
  failed: 'text-red-500'
} as const

// Common UI limits and constraints
export const UI_LIMITS = {
  MESSAGE_PREVIEW_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 4096, // WhatsApp limit
  SEARCH_DEBOUNCE_MS: 500,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  SCROLL_THRESHOLD_PX: 100
} as const