export type Role = 'user' | 'model';

export interface AttachmentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  type: 'image' | 'audio' | 'document';
  url?: string;
  previewUrl?: string;
  file?: File;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: AttachmentMeta[];
}

export interface SessionSummary {
  id: string;
  ownerId?: string;
  sessionCode: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
}

export interface SessionDetails {
  id: string;
  ownerId?: string;
  sessionCode: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
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
