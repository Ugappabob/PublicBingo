export interface Notification {
  id: string;
  type: 'game' | 'win' | 'chat' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  data?: Record<string, unknown>;
} 