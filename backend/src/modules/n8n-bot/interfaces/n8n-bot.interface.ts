export interface BotMessagePayload {
  messageId: string;
  userID: string;
  timestamp: string;
  type: 'Text' | 'Image' | 'Video' | 'Audio' | 'Document';
  message?: string;
  asset?: string;
}

export interface N8NBotResponse {
  success: boolean;
  message?: string;
  data?: any;
}
