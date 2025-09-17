// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  WEBSOCKET_NAMESPACE: '/crm',
} as const;

// Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000, // 1 second
  MAX_RECONNECT_DELAY: 30000, // 30 seconds
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  TYPING_TIMEOUT: 2000, // 2 seconds
  MESSAGE_PAGE_SIZE: 20,
  CONVERSATION_PAGE_SIZE: 20,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  CURRENT_USER: 'currentUser',
  THEME: 'theme',
  SETTINGS: 'settings',
} as const;

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  UNAUTHORIZED: 'Sua sessão expirou. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para executar esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  RATE_LIMITED: 'Muitas tentativas. Tente novamente mais tarde.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo é 10MB.',
  FILE_TYPE_NOT_SUPPORTED: 'Tipo de arquivo não suportado.',
  UPLOAD_FAILED: 'Falha no upload do arquivo.',
  WEBSOCKET_CONNECTION_FAILED: 'Falha na conexão em tempo real.',
  MAX_RECONNECT_ATTEMPTS: 'Não foi possível restabelecer a conexão. Recarregue a página.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  MESSAGE_SENT: 'Mensagem enviada!',
  FILE_UPLOADED: 'Arquivo enviado com sucesso!',
  CONVERSATION_ASSIGNED: 'Conversa atribuída com sucesso!',
  CONVERSATION_CLOSED: 'Conversa fechada com sucesso!',
  SETTINGS_SAVED: 'Configurações salvas!',
} as const;

// Status Labels
export const STATUS_LABELS = {
  CONVERSATION: {
    queue: 'Na Fila',
    active: 'Ativa',
    closed: 'Fechada',
    transferred: 'Transferida',
  },
  CONNECTION: {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    connecting: 'Conectando...',
    error: 'Erro de conexão',
  },
  MESSAGE: {
    pending: 'Enviando...',
    sent: 'Enviado',
    delivered: 'Entregue',
    read: 'Lido',
    failed: 'Falha no envio',
  },
} as const;

// Feature Flags (for future features)
export const FEATURE_FLAGS = {
  ENABLE_FILE_UPLOAD: true,
  ENABLE_VOICE_MESSAGES: false,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_EMOJI_PICKER: false,
} as const;