import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, doc, setDoc, getDoc, collection, query, orderBy, limit, addDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp, usingMockFirebase, getDocs } from '../firebase/index';

export interface FirebaseUsageStats {
  listId: string;
  listName: string;
  listType: 'default' | 'user-contributed';
  usageCount: number;
  lastUsed: any;
  createdBy?: string;
  category?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseGameSession {
  sessionId: string;
  phrases: string[];
  createdBy: string;
  createdByName: string;
  createdAt: any;
  completedAt?: any;
  duration?: number; // in seconds
  winCondition?: string;
  totalClicks?: number;
}

export interface FirebaseUserEngagement {
  userId: string;
  userName: string;
  totalSessions: number;
  totalGamesPlayed: number;
  totalTimeSpent: number; // in seconds
  favoriteLists: string[];
  lastActive: any;
  createdAt: any;
}

export interface FirebaseAnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalGamesPlayed: number;
  averageSessionDuration: number;
  mostPopularLists: FirebaseUsageStats[];
  userEngagement: FirebaseUserEngagement[];
  dailyStats: {
    date: string;
    sessions: number;
    games: number;
    users: number;
  }[];
}

class FirebaseAnalyticsService {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Record list usage in Firebase
   */
  async recordListUsage(
    listId: string, 
    listName: string, 
    listType: 'default' | 'user-contributed' = 'default',
    createdBy?: string,
    category?: string
  ): Promise<void> {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return;
    }

    try {
      const usageRef = doc(db, 'analytics', 'listUsage', listId);
      const usageDoc = await getDoc(usageRef);
      
      if (usageDoc.exists()) {
        // Update existing usage
        const existing = usageDoc.data() as FirebaseUsageStats;
        await updateDoc(usageRef, {
          usageCount: (existing?.usageCount || 0) + 1,
          lastUsed: serverTimestamp(),
          updatedAt: serverTimestamp()
        } as any);
      } else {
        // Create new usage record
        const usageData: FirebaseUsageStats = {
          listId,
          listName,
          listType,
          usageCount: 1,
          lastUsed: serverTimestamp(),
          createdBy,
          category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(usageRef, usageData);
      }
      
      console.log(`Recorded usage for list: ${listName} (${listId}) in Firebase`);
    } catch (error) {
      console.error('Error recording list usage in Firebase:', error);
    }
  }

  /**
   * Record game session analytics
   */
  async recordGameSession(
    sessionId: string,
    phrases: string[],
    createdBy: string,
    createdByName: string,
    completedAt?: Date,
    duration?: number,
    winCondition?: string,
    totalClicks?: number
  ): Promise<void> {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return;
    }

    try {
      const sessionRef = doc(db, 'analytics', 'gameSessions', sessionId);
      const sessionData: FirebaseGameSession = {
        sessionId,
        phrases,
        createdBy,
        createdByName,
        createdAt: serverTimestamp(),
        completedAt: completedAt ? completedAt.toISOString() : undefined,
        duration,
        winCondition,
        totalClicks
      };
      
      await setDoc(sessionRef, sessionData);
      console.log(`Recorded game session: ${sessionId} in Firebase`);
    } catch (error) {
      console.error('Error recording game session in Firebase:', error);
    }
  }

  /**
   * Record user engagement
   */
  async recordUserEngagement(
    userId: string,
    userName: string,
    sessionDuration?: number,
    favoriteListId?: string
  ): Promise<void> {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return;
    }

    try {
      const userRef = doc(db, 'analytics', 'userEngagement', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const existingData = userDoc.data() as FirebaseUserEngagement;
        const updates: any = {
          lastActive: serverTimestamp(),
          totalSessions: existingData.totalSessions + 1
        };
        
        if (sessionDuration) {
          updates.totalTimeSpent = existingData.totalTimeSpent + sessionDuration;
        }
        
        if (favoriteListId && !existingData.favoriteLists.includes(favoriteListId)) {
          updates.favoriteLists = [...existingData.favoriteLists, favoriteListId];
        }
        
        await updateDoc(userRef, updates);
      } else {
        const engagementData: FirebaseUserEngagement = {
          userId,
          userName,
          totalSessions: 1,
          totalGamesPlayed: 0,
          totalTimeSpent: sessionDuration || 0,
          favoriteLists: favoriteListId ? [favoriteListId] : [],
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, engagementData);
      }
      
      console.log(`Recorded user engagement for: ${userName} (${userId}) in Firebase`);
    } catch (error) {
      console.error('Error recording user engagement in Firebase:', error);
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(): Promise<FirebaseAnalyticsData> {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return this.getEmptyAnalyticsData();
    }

    try {
      // Get list usage stats
      const listUsageQuery = query(
        collection(db, 'analytics', 'listUsage'),
        orderBy('usageCount', 'desc'),
        limit(10)
      );
      const listUsageSnapshot = await getDocs(listUsageQuery);
      const mostPopularLists = listUsageSnapshot.docs.map((d: unknown) =>
        (d as QueryDocumentSnapshot<DocumentData>).data() as FirebaseUsageStats
      );

      // Get user engagement
      const userEngagementQuery = query(
        collection(db, 'analytics', 'userEngagement'),
        orderBy('lastActive', 'desc'),
        limit(50)
      );
      const userEngagementSnapshot = await getDocs(userEngagementQuery);
      const userEngagement = userEngagementSnapshot.docs.map((d: unknown) =>
        (d as QueryDocumentSnapshot<DocumentData>).data() as FirebaseUserEngagement
      );

      // Get session stats
      const sessionQuery = query(
        collection(db, 'analytics', 'gameSessions'),
        orderBy('createdAt', 'desc')
      );
      const sessionSnapshot = await getDocs(sessionQuery);
      const sessions = sessionSnapshot.docs.map((d: unknown) =>
        (d as QueryDocumentSnapshot<DocumentData>).data() as FirebaseGameSession
      );

      // Calculate aggregate stats
      const totalUsers = userEngagement.length;
      const totalSessions = sessions.length;
      const totalGamesPlayed = sessions.filter((s: FirebaseGameSession) => s.completedAt).length;
      const withDuration = sessions.filter((s: FirebaseGameSession) => s.duration);
      const averageSessionDuration =
        withDuration.length > 0
          ? withDuration.reduce(
              (sum: number, s: FirebaseGameSession) => sum + (s.duration || 0),
              0
            ) / withDuration.length
          : 0;

      // Get daily stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dailyStats = this.calculateDailyStats(sessions, thirtyDaysAgo);

      return {
        totalUsers,
        totalSessions,
        totalGamesPlayed,
        averageSessionDuration,
        mostPopularLists,
        userEngagement,
        dailyStats
      };
    } catch (error) {
      console.error('Error getting analytics data from Firebase:', error);
      return this.getEmptyAnalyticsData();
    }
  }

  /**
   * Get real-time analytics updates
   */
  subscribeToAnalytics(callback: (data: FirebaseAnalyticsData) => void): () => void {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return () => {};
    }

    // This would be implemented with Firestore real-time listeners
    // For now, we'll use polling
    const interval = setInterval(async () => {
      const data = await this.getAnalyticsData();
      callback(data);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(): Promise<string> {
    if (!this.isProduction || !db || usingMockFirebase) {
      console.log('Analytics skipped (dev or mock Firebase).');
      return '{}';
    }

    try {
      const data = await this.getAnalyticsData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      return '{}';
    }
  }

  private calculateDailyStats(sessions: FirebaseGameSession[], startDate: Date) {
    const dailyStats: { [date: string]: { sessions: number; games: number; users: Set<string> } } = {};
    
    sessions.forEach(session => {
      const sessionDate = session.createdAt.toDate().toISOString().split('T')[0];
      if (sessionDate >= startDate.toISOString().split('T')[0]) {
        if (!dailyStats[sessionDate]) {
          dailyStats[sessionDate] = { sessions: 0, games: 0, users: new Set() };
        }
        dailyStats[sessionDate].sessions++;
        dailyStats[sessionDate].users.add(session.createdBy);
        if (session.completedAt) {
          dailyStats[sessionDate].games++;
        }
      }
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      sessions: stats.sessions,
      games: stats.games,
      users: stats.users.size
    }));
  }

  private getEmptyAnalyticsData(): FirebaseAnalyticsData {
    return {
      totalUsers: 0,
      totalSessions: 0,
      totalGamesPlayed: 0,
      averageSessionDuration: 0,
      mostPopularLists: [],
      userEngagement: [],
      dailyStats: []
    };
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();
