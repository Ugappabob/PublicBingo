import type { DocumentData } from 'firebase/firestore';
import {
  db,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  usingMockFirebase,
} from '../firebase/index';

export interface GameSession {
  id: string;
  createdBy: string;
  createdAt: string;
  status: 'creating' | 'active' | 'completed';
  phrases: Array<{
    text: string;
    addedBy: string;
    addedByName: string;
    timestamp: string;
  }>;
  participants: {
    [uid: string]: {
      displayName: string;
      lastActive: string;
    };
  };
  players: {
    [uid: string]: {
      displayName: string;
      markedCells: string[];
      hasWon: boolean;
      lastActive: string;
      board?: any[]; // Store each player's unique board
    };
  };
  markedPhrases?: string[];
}

class GameService {
  private isProduction: boolean;

  constructor() {
    // Check if we're in production (Firebase available)
    // For now, let's force production mode for localhost:5000 to test Firebase
    this.isProduction = typeof window !== 'undefined' &&
      (window.location.hostname !== 'localhost' || window.location.port === '5000');
    
    console.log('🎮 GameService constructor:');
    console.log('🌐 Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
    console.log('🌐 URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
    console.log('🏭 Is Production:', this.isProduction);
    console.log('🔥 Firebase available:', !!db);
    console.log('🔥 Firebase app name:', db?.app?.name || 'no app');
    
    // Debug logging removed for production
  }

  // Debug logging removed for production

  async createGameSession(phrases: string[], createdBy: string, createdByName: string): Promise<string> {
    console.log('=== GAME SERVICE ENTRY ===');
    console.log('🎮 createGameSession called!');
    console.log(`📝 Received ${phrases.length} phrases`);
    console.log('🏭 Is Production:', this.isProduction);
    console.log('🔥 Firebase available:', !!db);
    console.log('🔥 Firebase app name:', db?.app?.name || 'no app');
    console.log(`First few phrases: ${phrases.slice(0, 3).join(', ')}`);
    console.log(`Full phrases array: ${JSON.stringify(phrases)}`);
    
    console.log('=== GAME SERVICE DEBUG ===');
    console.log('Received phrases:', phrases);
    console.log('Phrases length:', phrases.length);
    console.log('First few phrases:', phrases.slice(0, 5));
    console.log('Created by:', createdBy);
    console.log('Created by name:', createdByName);
    
    const gameId = Date.now().toString();
    const gameSession: GameSession = {
      id: gameId,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'active',
      phrases: phrases.map(phrase => ({
        text: phrase,
        addedBy: createdBy,
        addedByName: createdByName,
        timestamp: new Date().toISOString()
      })),
      participants: {},
      players: {}
    };
    
        console.log('Game session phrases:', gameSession.phrases);
        console.log('Game session phrases length:', gameSession.phrases.length);
        console.log(`About to save game session with ${gameSession.phrases.length} phrases`);

                // Check if we have a real Firebase instance (not a mock)
                const isRealFirebase =
                  this.isProduction && !usingMockFirebase && db?.app?.name !== 'mock-app';
                
                // Debug logging removed for production
                
                if (isRealFirebase) {
                  // Use Firebase in production
                  try {
                    console.log('Saving to Firebase...');
                    console.log(`db type: ${typeof db}`);
                    console.log(`db constructor: ${db?.constructor?.name}`);
                    console.log(`db keys: ${Object.keys(db || {}).join(', ')}`);
                    console.log(`db app: ${db?.app?.name || 'no app'}`);
                    console.log(`doc function: ${typeof doc}`);
                    console.log(`setDoc function: ${typeof setDoc}`);
                    console.log(`About to call doc(db, 'games', gameId)...`);
                    const docRef = doc(db, 'games', gameId);
                    await setDoc(docRef, gameSession);
                    console.log(`Game session saved to Firebase with ${gameSession.phrases.length} phrases`);
                    console.log('Game session created in Firebase:', gameId);
                    // Debug logging removed for production
                    return gameId;
                  } catch (error) {
                    console.error(`Error saving to Firebase: ${error}`);
                    console.error('Error creating game session in Firebase:', error);
                    // Debug logging removed for production
                    throw error;
                  }
                } else {
                  // Use localStorage in development
                  console.log('Saving to localStorage...');
                  localStorage.setItem(`gameSession_${gameId}`, JSON.stringify(gameSession));
                  console.log(`Game session saved to localStorage with ${gameSession.phrases.length} phrases`);
                  console.log('Game session created in localStorage:', gameId);
                  // Debug logging removed for production
                  return gameId;
                }
  }

  async getGameSession(gameId: string): Promise<GameSession | null> {
    console.log(`Loading game session: ${gameId}`);
    
        // Check if we have a real Firebase instance (not a mock)
        const isRealFirebase =
          this.isProduction && !usingMockFirebase && db?.app?.name !== 'mock-app';
        
        if (isRealFirebase) {
          // Use Firebase in production
          try {
            console.log(`Attempting to load from Firebase collection 'games' with ID: ${gameId}`);
            const docRef = doc(db, 'games', gameId);
            const gameDoc = await getDoc(docRef);
            console.log(`Firebase document exists: ${gameDoc.exists()}`);
            console.log(`Firebase document ID: ${gameDoc.id}`);
            console.log(`Firebase document path: ${gameDoc.ref.path}`);
            if (gameDoc.exists()) {
              const gameData = gameDoc.data() as GameSession;
              console.log(`Game session loaded from Firebase with ${gameData.phrases?.length || 0} phrases`);
              console.log(`Raw Firebase data: ${JSON.stringify(gameData)}`);
              console.log(`Phrases structure: ${JSON.stringify(gameData.phrases)}`);
              console.log(`Game data keys: ${Object.keys(gameData).join(', ')}`);
              console.log(`Phrases type: ${typeof gameData.phrases}`);
              console.log(`Phrases is array: ${Array.isArray(gameData.phrases)}`);
              return gameData;
            }
            console.log(`Game session not found in Firebase for ID: ${gameId}`);
            console.log(`Checking if this is a production environment: ${this.isProduction}`);
            console.log(`Firebase functions available: getDoc=${!!getDoc}, doc=${!!doc}, db=${!!db}`);
            return null;
          } catch (error) {
            console.error(`Error loading game session: ${error}`);
            console.error('Error getting game session from Firebase:', error);
            return null;
          }
        } else {
      // Use localStorage in development
      const sessionData = localStorage.getItem(`gameSession_${gameId}`);
      if (sessionData) {
        try {
          const gameData = JSON.parse(sessionData) as GameSession;
          console.log(`Game session loaded from localStorage with ${gameData.phrases?.length || 0} phrases`);
          return gameData;
        } catch (error) {
          console.error(`Error parsing game session: ${error}`);
          console.error('Error parsing game session from localStorage:', error);
          return null;
        }
      }
      console.log('Game session not found in localStorage');
      return null;
    }
  }

  async updateGameSession(gameId: string, updates: Partial<GameSession>): Promise<void> {
    console.log('🔄 updateGameSession called:');
    console.log('🎮 Game ID:', gameId);
    console.log('📝 Updates:', updates);
    console.log('🏭 Is Production:', this.isProduction);
    console.log('🔥 Firebase available:', !!db);
    console.log('🔥 Firebase app name:', db?.app?.name || 'no app');
    
    // Check if we have a real Firebase instance (not a mock)
            const isRealFirebase =
              this.isProduction && !usingMockFirebase && db?.app?.name !== 'mock-app';
    
    console.log('🔍 Firebase decision logic:');
    console.log('🏭 this.isProduction:', this.isProduction);
    console.log('🔧 updateDoc available:', !!updateDoc);
    console.log('🔧 doc available:', !!doc);
    console.log('🔧 db available:', !!db);
    console.log('🔧 db.app available:', !!db?.app);
    console.log('🔧 db.app.name:', db?.app?.name);
    console.log('✅ isRealFirebase:', isRealFirebase);
    
    if (isRealFirebase) {
      // Use Firebase in production
      console.log('🔥 Using REAL Firebase for game session update');
      try {
                const docRef = doc(db, 'games', gameId);
        console.log('📄 Created docRef for update:', docRef);
        console.log('📝 Update data being sent to Firebase:', updates);
        console.log('📝 Update data type:', typeof updates);
        console.log('📝 Update data stringified:', JSON.stringify(updates, null, 2));
        console.log('📝 About to call updateDoc with:', { docRef, updates });
        await updateDoc(docRef, updates as DocumentData);
        console.log('✅ Game session updated in Firebase:', gameId);
        console.log('✅ Firebase update completed successfully');
        console.log('✅ Firebase updateDoc call completed without error');
        
        // Verify the update by reading back from Firebase
        setTimeout(async () => {
          try {
            console.log('🔍 Starting Firebase Update Verification...');
            const verifyDoc = await getDoc(docRef);
            console.log('🔍 Firebase Update Verification:', {
              gameId,
              docExists: verifyDoc.exists(),
              docData: verifyDoc.exists() ? verifyDoc.data() : null,
              playersKeys: verifyDoc.exists() ? Object.keys(verifyDoc.data()?.players || {}) : []
            });
            
            // Debug logging removed for production
            
            // If the update didn't work, try to read the document again with a different approach
            if (verifyDoc.exists() && Object.keys(verifyDoc.data()?.players || {}).length === 0) {
              console.log('🔍 Firebase Update Failed - Players object is empty, trying alternative read...');
              try {
                const altDoc = await getDoc(docRef);
                console.log('🔍 Alternative Firebase Read:', {
                  gameId,
                  altDocExists: altDoc.exists(),
                  altDocData: altDoc.exists() ? altDoc.data() : null,
                  altPlayersKeys: altDoc.exists() ? Object.keys(altDoc.data()?.players || {}) : []
                });
              } catch (altError) {
                console.error('❌ Alternative Firebase read failed:', altError);
              }
            }
          } catch (error) {
            console.error('❌ Error verifying Firebase update:', error);
            // Debug logging removed for production
          }
        }, 500);
        
      } catch (error) {
        console.error('❌ Error updating game session in Firebase:', error);
        throw error;
      }
    } else {
      // Use localStorage in development
      console.log('💾 Using localStorage for game session update');
      const sessionData = localStorage.getItem(`gameSession_${gameId}`);
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData) as GameSession;
          const updatedSession = { ...session, ...updates };
          localStorage.setItem(`gameSession_${gameId}`, JSON.stringify(updatedSession));
          console.log('✅ Game session updated in localStorage:', gameId);
        } catch (error) {
          console.error('❌ Error updating game session in localStorage:', error);
          throw error;
        }
      }
    }
  }

  subscribeToGameSession(gameId: string, callback: (session: GameSession | null) => void): () => void {
    console.log('👂 subscribeToGameSession called:');
    console.log('🎮 Game ID:', gameId);
    console.log('🏭 Is Production:', this.isProduction);
    console.log('🔥 Firebase available:', !!db);
    console.log('🔥 Firebase app name:', db?.app?.name || 'no app');
    
    // Check if we have a real Firebase instance (not a mock)
            const isRealFirebase =
              this.isProduction && !usingMockFirebase && db?.app?.name !== 'mock-app';
    
    console.log('🔍 Firebase decision logic:');
    console.log('🏭 this.isProduction:', this.isProduction);
    console.log('🔧 onSnapshot available:', !!onSnapshot);
    console.log('🔧 doc available:', !!doc);
    console.log('🔧 db available:', !!db);
    console.log('🔧 db.app available:', !!db?.app);
    console.log('🔧 db.app.name:', db?.app?.name);
    console.log('✅ isRealFirebase:', isRealFirebase);
    
    if (isRealFirebase) {
      // Use Firebase real-time listener in production
      console.log('🔥 Using REAL Firebase for real-time subscription');
              const docRef = doc(db, 'games', gameId);
      console.log('📄 Created docRef for subscription:', docRef);
      const unsubscribe = onSnapshot(
        docRef,
        (snap: { exists: () => boolean; data: () => GameSession | undefined }) => {
          console.log('📡 Firebase real-time update received:', snap.exists());
          if (snap.exists()) {
            const data = snap.data() as GameSession;
            console.log('📊 Real-time data:', data);
            callback(data);
          } else {
            console.log('📭 Document does not exist');
            callback(null);
          }
        },
        (err: unknown) => {
          console.error('❌ Error listening to game session:', err);
          callback(null);
        }
      );
      console.log('✅ Firebase real-time listener set up');
      return unsubscribe;
    } else {
      // Use localStorage polling in development
      console.log('💾 Using localStorage polling for subscription');
      const pollInterval = setInterval(() => {
        const sessionData = localStorage.getItem(`gameSession_${gameId}`);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData) as GameSession;
            console.log('📊 Polling update from localStorage:', session);
            callback(session);
          } catch (error) {
            console.error('❌ Error parsing game session:', error);
            callback(null);
          }
        } else {
          console.log('📭 No session data in localStorage');
          callback(null);
        }
      }, 1000);

      console.log('✅ localStorage polling set up');
      return () => clearInterval(pollInterval);
    }
  }
}

export const gameService = new GameService();
