import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { defaultPhraseLists, PhraseList } from '../data/defaultPhraseLists';

// Firebase imports - will be available in production
let db: any, collection: any, addDoc: any, getDocs: any, query: any, where: any, doc: any, getDoc: any, updateDoc: any, deleteDoc: any;

try {
  const firebase = require('../firebase/index');
  db = firebase.db;
  collection = firebase.collection;
  addDoc = firebase.addDoc;
  getDocs = firebase.getDocs;
  query = firebase.query;
  where = firebase.where;
  doc = firebase.doc;
  getDoc = firebase.getDoc;
  updateDoc = firebase.updateDoc;
  deleteDoc = firebase.deleteDoc;
} catch (error) {
  // Firebase not available in development
  console.log('Firebase not available, using localStorage fallback');
}

export interface UserContribution {
  id: string;
  name: string;
  description: string;
  category: string;
  phrases: string[];
  contributorName: string;
  contributorId: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  timesUsed: number;
}

export interface PublicPhraseListService {
  getAllPublicLists(): Promise<PhraseList[]>;
  getPublicListById(id: string): Promise<PhraseList | undefined>;
  getPublicListsByCategory(category: string): Promise<PhraseList[]>;
  getPublicListCategories(): Promise<string[]>;
  searchPublicLists(query: string): Promise<PhraseList[]>;
  getUserContributions(): Promise<UserContribution[]>;
  getApprovedContributions(): Promise<UserContribution[]>;
  getAllAvailableLists(): Promise<(PhraseList | UserContribution)[]>;
  searchAllLists(query: string): Promise<(PhraseList | UserContribution)[]>;
  approveContribution(contributionId: string): Promise<boolean>;
  rejectContribution(contributionId: string): Promise<boolean>;
  deleteUserContribution(contributionId: string): Promise<boolean>;
}

class PublicPhraseListServiceImpl implements PublicPhraseListService {
  private publicLists: PhraseList[] = defaultPhraseLists;
  private isProduction: boolean;

  constructor() {
    // Check if we're in production (Firebase available)
    this.isProduction = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' &&
      db && collection;
  }

  async getAllPublicLists(): Promise<PhraseList[]> {
    console.log('🔄 publicPhraseListService: getAllPublicLists called');
    console.log('🔄 publicPhraseListService: isProduction =', this.isProduction);
    console.log('🔄 publicPhraseListService: Firebase available =', !!(db && collection));
    console.log('🔄 publicPhraseListService: Built-in lists count =', this.publicLists.length);
    console.log('🔄 publicPhraseListService: Built-in list names =', this.publicLists.map(list => list.name));
    
    // Re-enable Firebase now that we have proper configuration
    if (this.isProduction && db && collection) {
      try {
        console.log('🔄 publicPhraseListService: Attempting Firebase fetch...');
        console.log('🔄 publicPhraseListService: db instance:', db);
        console.log('🔄 publicPhraseListService: db type:', typeof db);
        console.log('🔄 publicPhraseListService: db constructor:', db?.constructor?.name);
        console.log('🔄 publicPhraseListService: collection function:', collection);
        console.log('🔄 publicPhraseListService: collection type:', typeof collection);
        // Try to get lists from Firebase first
        const firebaseLists = await getDocs(collection(db, 'defaultPhraseLists'));
        console.log('📊 publicPhraseListService: Firebase returned', firebaseLists.size, 'documents');
        
        if (!firebaseLists.empty) {
          const lists: PhraseList[] = [];
          firebaseLists.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
            const data = d.data();
            lists.push({
              id: data.id,
              name: data.name,
              description: data.description,
              category: data.category,
              icon: data.icon,
              phrases: data.phrases
            });
          });
          console.log('✅ publicPhraseListService: Returning', lists.length, 'lists from Firebase');
          return lists;
        } else {
          // Firebase is empty, seed it with default lists
          console.log('🔄 publicPhraseListService: Firebase is empty, seeding with default phrase lists...');
          await this.seedDefaultLists();
          console.log('✅ publicPhraseListService: Seeded Firebase, returning built-in lists');
          return [...this.publicLists];
        }
      } catch (error: unknown) {
        console.error('❌ publicPhraseListService: Error loading lists from Firebase:', error);
        const e = error instanceof Error ? error : new Error(String(error));
        console.error('❌ publicPhraseListService: Error details:', e.message);
        console.log('🔄 publicPhraseListService: Firebase connection failed, using fallback default lists');
        // Return default lists even if Firebase fails
        console.log('✅ publicPhraseListService: Returning', this.publicLists.length, 'fallback lists');
        return [...this.publicLists];
      }
    }
    
    // Fallback to default lists
    console.log('✅ publicPhraseListService: Using built-in lists (not production or Firebase not available)');
    return [...this.publicLists];
  }

  private async seedDefaultLists(): Promise<void> {
    if (!this.isProduction || !db || !collection || !addDoc) {
      return;
    }

    try {
      for (const list of this.publicLists) {
        await addDoc(collection(db, 'defaultPhraseLists'), {
          ...list,
          createdAt: new Date().toISOString(),
          isDefault: true
        });
        console.log(`Seeded default list: ${list.name}`);
      }
      console.log('Successfully seeded default phrase lists to Firebase');
    } catch (error) {
      console.error('Error seeding default lists:', error);
    }
  }

  async getPublicListById(id: string): Promise<PhraseList | undefined> {
    const lists = await this.getAllPublicLists();
    return lists.find(list => list.id === id);
  }

  async getPublicListsByCategory(category: string): Promise<PhraseList[]> {
    const lists = await this.getAllPublicLists();
    return lists.filter(list => list.category === category);
  }

  async getPublicListCategories(): Promise<string[]> {
    const lists = await this.getAllPublicLists();
    const categories = new Set(lists.map(list => list.category));
    return Array.from(categories).sort();
  }

  async searchPublicLists(query: string): Promise<PhraseList[]> {
    const lists = await this.getAllPublicLists();
    const lowercaseQuery = query.toLowerCase();
    return lists.filter(list => 
      list.name.toLowerCase().includes(lowercaseQuery) ||
      list.description.toLowerCase().includes(lowercaseQuery) ||
      list.category.toLowerCase().includes(lowercaseQuery) ||
      list.phrases.some(phrase => phrase.toLowerCase().includes(lowercaseQuery))
    );
  }

    async getUserContributions(): Promise<UserContribution[]> {
      console.log('🔄 publicPhraseListService: getUserContributions called');
      console.log('🔄 publicPhraseListService: isProduction =', this.isProduction);
      console.log('🔄 publicPhraseListService: Firebase available =', !!(db && collection));
      
      // Re-enable Firebase now that we have proper configuration
      if (this.isProduction && db && collection) {
        try {
          console.log('🔄 publicPhraseListService: Attempting to fetch user contributions from Firebase...');
          const contributions = await getDocs(collection(db, 'userContributions'));
          console.log('📊 publicPhraseListService: Firebase returned', contributions.size, 'user contributions');
          
          const userContributions: UserContribution[] = [];
          contributions.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
            const data = d.data();
            console.log('📋 publicPhraseListService: Processing contribution:', data.name);
            userContributions.push({
              id: data.id,
              name: data.name,
              description: data.description,
              category: data.category,
              phrases: data.phrases,
              contributorName: data.contributorName,
              contributorId: data.contributorId,
              createdAt: data.createdAt,
              status: data.status,
              votes: data.votes || 0,
              timesUsed: data.timesUsed || 0
            });
          });
          console.log('✅ publicPhraseListService: Returning', userContributions.length, 'user contributions from Firebase');
          return userContributions;
        } catch (error: unknown) {
          console.error('❌ publicPhraseListService: Error loading user contributions from Firebase:', error);
          const e = error instanceof Error ? error : new Error(String(error));
          console.error('❌ publicPhraseListService: Error details:', e.message);
          console.log('🔄 publicPhraseListService: Firebase connection failed, using localStorage fallback');
        }
      }
      
      // Fallback to localStorage
      try {
        console.log('🔄 publicPhraseListService: Using localStorage fallback for user contributions');
        const contributions = localStorage.getItem('userContributions');
        const parsedContributions = contributions ? JSON.parse(contributions) : [];
        console.log('📊 publicPhraseListService: localStorage returned', parsedContributions.length, 'user contributions');
        return parsedContributions;
      } catch (error) {
        console.error('❌ publicPhraseListService: Error loading user contributions from localStorage:', error);
        return [];
      }
    }

  async getApprovedContributions(): Promise<UserContribution[]> {
    const contributions = await this.getUserContributions();
    return contributions.filter(contribution => contribution.status === 'approved');
  }

  async getAllAvailableLists(): Promise<(PhraseList | UserContribution)[]> {
    try {
      console.log('🔄 publicPhraseListService: getAllAvailableLists called');
      console.log('🔄 publicPhraseListService: isProduction =', this.isProduction);
      console.log('🔄 publicPhraseListService: Firebase available =', !!(db && collection));
      
      const defaultLists = await this.getAllPublicLists();
      console.log('📋 publicPhraseListService: Got', defaultLists.length, 'default lists');
      console.log('📋 publicPhraseListService: Default list names:', defaultLists.map(list => list.name));
      
      const allContributions = await this.getUserContributions();
      console.log('👤 publicPhraseListService: Got', allContributions.length, 'user contributions');
      
      const allLists = [...defaultLists, ...allContributions];
      console.log('✅ publicPhraseListService: Returning', allLists.length, 'total lists');
      return allLists;
    } catch (error: unknown) {
      console.error('❌ publicPhraseListService: Error loading available lists:', error);
      const e = error instanceof Error ? error : new Error(String(error));
      console.error('❌ publicPhraseListService: Error details:', e.message);
      console.error('❌ publicPhraseListService: Error stack:', e.stack);
      // Fallback to just default lists if everything fails
      console.log('🔄 publicPhraseListService: Using fallback default lists');
      return [...this.publicLists];
    }
  }

  async searchAllLists(query: string): Promise<(PhraseList | UserContribution)[]> {
    const allLists = await this.getAllAvailableLists();
    const lowercaseQuery = query.toLowerCase();
    
    return allLists.filter(list =>
      list.name.toLowerCase().includes(lowercaseQuery) ||
      list.description.toLowerCase().includes(lowercaseQuery) ||
      list.category.toLowerCase().includes(lowercaseQuery) ||
      list.phrases.some(phrase => phrase.toLowerCase().includes(lowercaseQuery))
    );
  }

  async approveContribution(contributionId: string): Promise<boolean> {
    if (this.isProduction && db && collection) {
      try {
        // Update in Firebase
        const contributionRef = doc(db, 'userContributions', contributionId);
        await updateDoc(contributionRef, { status: 'approved' });
        return true;
      } catch (error) {
        console.error('Error approving contribution in Firebase:', error);
        return false;
      }
    }
    
    // Fallback to localStorage
    try {
      const contributions = await this.getUserContributions();
      const updatedContributions = contributions.map(contribution =>
        contribution.id === contributionId
          ? { ...contribution, status: 'approved' as const }
          : contribution
      );
      localStorage.setItem('userContributions', JSON.stringify(updatedContributions));
      return true;
    } catch (error) {
      console.error('Error approving contribution:', error);
      return false;
    }
  }

  async rejectContribution(contributionId: string): Promise<boolean> {
    if (this.isProduction && db && collection) {
      try {
        // Update in Firebase
        const contributionRef = doc(db, 'userContributions', contributionId);
        await updateDoc(contributionRef, { status: 'rejected' });
        return true;
      } catch (error) {
        console.error('Error rejecting contribution in Firebase:', error);
        return false;
      }
    }
    
    // Fallback to localStorage
    try {
      const contributions = await this.getUserContributions();
      const updatedContributions = contributions.map(contribution =>
        contribution.id === contributionId
          ? { ...contribution, status: 'rejected' as const }
          : contribution
      );
      localStorage.setItem('userContributions', JSON.stringify(updatedContributions));
      return true;
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      return false;
    }
  }

  async deleteUserContribution(contributionId: string): Promise<boolean> {
    if (this.isProduction && db && collection) {
      try {
        // Delete from Firebase
        const contributionRef = doc(db, 'userContributions', contributionId);
        await deleteDoc(contributionRef);
        return true;
      } catch (error) {
        console.error('Error deleting contribution from Firebase:', error);
        return false;
      }
    }
    
    // Fallback to localStorage
    try {
      const contributions = await this.getUserContributions();
      const updatedContributions = contributions.filter(contribution => contribution.id !== contributionId);
      localStorage.setItem('userContributions', JSON.stringify(updatedContributions));
      return true;
    } catch (error) {
      console.error('Error deleting contribution:', error);
      return false;
    }
  }
}

// Export singleton instance
export const publicPhraseListService = new PublicPhraseListServiceImpl();

// Export the service interface for dependency injection
export default publicPhraseListService;
