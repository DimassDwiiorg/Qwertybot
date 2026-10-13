export type Role = 'user' | 'model';

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // base64 string
  };
}

export interface TextPart {
  text: string;
}

export interface FunctionCallPart {
  functionCall: {
    name: string;
    args: Record<string, any>;
  };
}

export interface FunctionResponsePart {
  functionResponse: {
    name: string;
    response: Record<string, any>;
  };
}

export type GeminiPart = TextPart | InlineDataPart | FunctionCallPart | FunctionResponsePart;

export interface GeminiContent {
  role: Role;
  parts: GeminiPart[];
}

export interface AttachmentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  type: 'image' | 'audio' | 'document';
  url?: string;
  base64Data?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: AttachmentMeta[];
}

export interface Session {
  id: string;
  ownerId?: string;
  sessionCode: string; // e.g. "QW-94821"
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ChatRequestPayload {
  sessionCode?: string;
  sessionId?: string;
  message: string;
  attachments?: AttachmentMeta[];
}

export interface QuotaInfo {
  isLoggedIn: boolean;
  isOwner?: boolean;
  isUnlimited?: boolean;
  maxQuota: number;
  usedCount: number;
  remaining: number;
  resetAt: number;
  resetInSeconds: number;
  isExhausted: boolean;
  formattedResetTime: string;
}
