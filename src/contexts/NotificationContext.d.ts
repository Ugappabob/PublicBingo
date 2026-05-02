import { Notification } from '../types/notification';

// This file is here to satisfy TypeScript module resolution.
export function useNotifications(): { 
  notifications: Notification[]; 
  unreadCount: number; 
  markAsRead: (id: string) => Promise<void>; 
  markAllAsRead: () => Promise<void>; 
  clearNotifications: () => Promise<void> 
}; 