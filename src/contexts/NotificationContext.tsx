import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/index';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp, 
  addDoc,
  doc,
  writeBatch,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'game' | 'win' | 'chat' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  data?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          read: data.read,
          timestamp: data.timestamp.toDate(),
          data: data.data
        });
      });
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        userId: currentUser.uid,
        timestamp: Timestamp.now(),
        read: false
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const clearNotifications = async () => {
    if (!currentUser) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        sendNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 