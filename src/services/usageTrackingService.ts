import { firebaseAnalyticsService } from './firebaseAnalyticsService';

export interface ListUsageStats {
  listId: string;
  listName: string;
  listType: 'default' | 'user-contributed';
  usageCount: number;
  lastUsed: string;
  createdBy?: string;
  category?: string;
}

export interface UsageTrackingData {
  [listId: string]: {
    usageCount: number;
    lastUsed: string;
    listName: string;
    listType: 'default' | 'user-contributed';
    createdBy?: string;
    category?: string;
  };
}

class UsageTrackingService {
  private storageKey = 'phraseListUsage';

  /**
   * Record that a phrase list has been used
   */
  async recordListUsage(listId: string, listName: string, listType: 'default' | 'user-contributed' = 'default', createdBy?: string, category?: string): Promise<void> {
    try {
      // Record in localStorage (for development)
      const usageData = this.getUsageData();
      
      if (usageData[listId]) {
        // Increment existing usage
        usageData[listId].usageCount += 1;
        usageData[listId].lastUsed = new Date().toISOString();
      } else {
        // Create new entry
        usageData[listId] = {
          usageCount: 1,
          lastUsed: new Date().toISOString(),
          listName,
          listType,
          createdBy,
          category
        };
      }
      
      this.saveUsageData(usageData);
      console.log(`Recorded usage for list: ${listName} (${listId}) in localStorage`);
      
      // Also record in Firebase (for production)
      await firebaseAnalyticsService.recordListUsage(listId, listName, listType, createdBy, category);
    } catch (error) {
      console.error('Error recording list usage:', error);
    }
  }

  /**
   * Get all usage statistics
   */
  getAllUsageStats(): ListUsageStats[] {
    try {
      const usageData = this.getUsageData();
      
      return Object.entries(usageData).map(([listId, data]) => ({
        listId,
        listName: data.listName,
        listType: data.listType,
        usageCount: data.usageCount,
        lastUsed: data.lastUsed,
        createdBy: data.createdBy,
        category: data.category
      })).sort((a, b) => b.usageCount - a.usageCount); // Sort by usage count descending
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }

  /**
   * Get usage stats for a specific list
   */
  getListUsageStats(listId: string): ListUsageStats | null {
    try {
      const usageData = this.getUsageData();
      const data = usageData[listId];
      
      if (!data) return null;
      
      return {
        listId,
        listName: data.listName,
        listType: data.listType,
        usageCount: data.usageCount,
        lastUsed: data.lastUsed,
        createdBy: data.createdBy,
        category: data.category
      };
    } catch (error) {
      console.error('Error getting list usage stats:', error);
      return null;
    }
  }

  /**
   * Get total usage count across all lists
   */
  getTotalUsageCount(): number {
    try {
      const usageData = this.getUsageData();
      return Object.values(usageData).reduce((total, data) => total + data.usageCount, 0);
    } catch (error) {
      console.error('Error getting total usage count:', error);
      return 0;
    }
  }

  /**
   * Get usage stats by category
   */
  getUsageStatsByCategory(): { [category: string]: ListUsageStats[] } {
    try {
      const allStats = this.getAllUsageStats();
      const statsByCategory: { [category: string]: ListUsageStats[] } = {};
      
      allStats.forEach(stat => {
        const category = stat.category || 'Uncategorized';
        if (!statsByCategory[category]) {
          statsByCategory[category] = [];
        }
        statsByCategory[category].push(stat);
      });
      
      return statsByCategory;
    } catch (error) {
      console.error('Error getting usage stats by category:', error);
      return {};
    }
  }

  /**
   * Clear all usage data (admin function)
   */
  clearAllUsageData(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('All usage data cleared');
    } catch (error) {
      console.error('Error clearing usage data:', error);
    }
  }

  /**
   * Export usage data (for backup/analysis)
   */
  exportUsageData(): string {
    try {
      const usageData = this.getUsageData();
      return JSON.stringify(usageData, null, 2);
    } catch (error) {
      console.error('Error exporting usage data:', error);
      return '{}';
    }
  }

  /**
   * Import usage data (for backup/analysis)
   */
  importUsageData(data: string): boolean {
    try {
      const usageData = JSON.parse(data);
      this.saveUsageData(usageData);
      console.log('Usage data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing usage data:', error);
      return false;
    }
  }

  private getUsageData(): UsageTrackingData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting usage data from localStorage:', error);
      return {};
    }
  }

  private saveUsageData(data: UsageTrackingData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving usage data to localStorage:', error);
    }
  }
}

export const usageTrackingService = new UsageTrackingService();
