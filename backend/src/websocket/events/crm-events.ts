export const CRM_EVENTS = {
  // Message events
  MESSAGE_NEW: 'message:new',
  MESSAGE_UPDATE: 'message:update',

  // Conversation events
  CONVERSATION_NEW: 'conversation:new',
  CONVERSATION_ASSIGNED: 'conversation:assigned',
  CONVERSATION_STATUS_CHANGED: 'conversation:status_changed',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_UNREAD_RESET: 'conversation:unread_reset',
  CONVERSATION_READ: 'conversation:read',
  CONVERSATION_UNREAD: 'conversation:unread',

  // System events
  SYSTEM_NOTIFICATION: 'system:notification',
  SYSTEM_ERROR: 'system:error',

  // Room events
  JOIN_CONVERSATION: 'join:conversation',
  LEAVE_CONVERSATION: 'leave:conversation',
} as const;

export type CrmEventType = (typeof CRM_EVENTS)[keyof typeof CRM_EVENTS];
