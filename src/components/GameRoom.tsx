import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import type { DocumentData } from 'firebase/firestore';
import { doc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, db } from '../firebase/index';
import { useAuth } from '../contexts/AuthContext';
import { generateUniquePlayerBoard } from '../utils/boardGenerator';
import type { Player, BingoCell } from '../types/types';
import LoadingSpinner from './common/LoadingSpinner';
import '../styles/App.css';

// Lazy load game components for better performance
const BingoCelebration = lazy(() => import('./BingoCelebration'));
const GameChat = lazy(() => import('./game/GameChat'));
const Leaderboard = lazy(() => import('./common/Leaderboard'));
const GameProgress = lazy(() => import('./common/GameProgress'));

// Define the actual game session structure from GameCreation
interface GameSession {
  id: string;
  createdBy: string;
  createdAt: string;
  status: 'creating' | 'active' | 'completed';
  participants: {
    [uid: string]: {
      displayName: string;
      lastActive: string;
    };
  };
  phrases: Array<{
    text: string;
    addedBy: string;
    addedByName: string;
    timestamp: string | Date;
  }>;
  // Multiplayer additions
  markedPhrases?: string[];
  players?: {
    [uid: string]: {
      displayName: string;
      markedCells: string[];
      hasWon: boolean;
      lastActive: string;
    };
  };
}

// Game state interface
interface GameState {
  isPlaying: boolean;
  currentPhrase: string | null;
  calledPhrases: string[];
  playerBoard: BingoCell[];
  hasWon: boolean;
  // Multiplayer additions
  markedPhrases: string[];
  otherPlayers: {
    [uid: string]: {
      displayName: string;
      markedCells: string[];
      hasWon: boolean;
    };
  };
}

// Replace empty interface with a proper type
type GameRoomProps = Record<string, never>;

const GameRoom: React.FC<GameRoomProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [game, setGame] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentPhrase: null,
    calledPhrases: [],
    playerBoard: [],
    hasWon: false,
    markedPhrases: [],
    otherPlayers: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingGame, setStartingGame] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationWinner, setCelebrationWinner] = useState<string>('');
  const { currentUser } = useAuth();
  const boardSetupRef = React.useRef(false);

  // Debug logging
  console.log('GameRoom received sessionId:', sessionId);
  console.log('GameRoom sessionId type:', typeof sessionId);

  useEffect(() => {
    const initializeGame = async () => {
      if (!sessionId) {
        console.error('GameRoom: sessionId is required but not provided');
        setError('Game ID is required');
        setLoading(false);
        return;
      }

      // Check if user is authenticated (including guest users)
      if (!currentUser) {
        // Check for guest user in localStorage as fallback
        const guestUser = localStorage.getItem('guestUser');
        if (guestUser) {
          try {
            const guestData = JSON.parse(guestUser);
            console.log('GameRoom: Found guest user in localStorage:', guestData);
            // Continue with guest user - the AuthContext should handle this
            // but let's proceed anyway for development
          } catch (err) {
            console.error('Error parsing guest user data:', err);
          }
        } else {
          console.log('GameRoom: User not authenticated, showing sign-in options');
          setError('Please sign in to join this game. You can use "Play as Guest" to join without an account.');
          setLoading(false);
          return;
        }
      }

      console.log('GameRoom: Initializing game with sessionId:', sessionId);
      console.log('GameRoom: Current user:', {
        uid: currentUser?.uid,
        displayName: currentUser?.displayName,
        email: currentUser?.email
      });

      try {
        // Try to get the game document from Firestore
        const gameRef = doc(db, 'gameSessions', sessionId);
        const gameDoc = await getDoc(gameRef);
        
        if (!gameDoc.exists()) {
          console.log('GameRoom: Game document not found, creating demo game for testing');
          // Create a demo game for testing purposes
          const demoGame: GameSession = {
            id: sessionId,
            createdBy: 'demo-host',
            createdAt: new Date().toISOString(),
            status: 'creating',
            participants: {
              'demo-host': {
                displayName: 'Demo Host',
                lastActive: new Date().toISOString()
              },
              [currentUser?.uid || 'guest']: {
                displayName: currentUser?.displayName || 'Test Player',
                lastActive: new Date().toISOString()
              }
            },
            phrases: [
              { text: 'Bingo Game', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Fun Times', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Great Day', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Awesome', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Fantastic', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Amazing', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Wonderful', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Excellent', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Perfect', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Outstanding', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Brilliant', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Superb', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Terrific', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Magnificent', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Splendid', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Glorious', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Marvelous', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Stunning', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Breathtaking', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Spectacular', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Phenomenal', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Extraordinary', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Incredible', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Unbelievable', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Remarkable', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() }
            ],
            markedPhrases: [],
            players: {
              [currentUser?.uid || 'guest']: {
                displayName: currentUser?.displayName || 'Test Player',
                markedCells: [],
                hasWon: false,
                lastActive: new Date().toISOString()
              }
            }
          };
          
          console.log('GameRoom: Using demo game data:', demoGame);
          setGame(demoGame);
          
          // Set up the game state with demo data
          if (demoGame.phrases && demoGame.phrases.length >= 24) {
            await setupGameState(demoGame);
          }
          
          setLoading(false);
          return;
        }

        const gameData = gameDoc.data() as GameSession;
        console.log('GameRoom: Game data loaded:', gameData);

        // Check if the game has enough phrases to start
        if (!gameData.phrases || gameData.phrases.length < 24) {
          console.log('GameRoom: Game has insufficient phrases:', gameData.phrases?.length || 0);
          
          // If this is a newly created game, wait a bit and retry
          if (gameData.status === 'creating') {
            console.log('GameRoom: Game is still being created, waiting for phrases to be added...');
            setLoading(false);
            return; // Don't show error, just wait
          }
          
          setError('Game is not ready yet. Please add more phrases.');
          setLoading(false);
          return;
        }

        setGame(gameData);
        
        // Set up the game state if the game is ready (has enough phrases)
        if (gameData.phrases && gameData.phrases.length >= 24) {
          await setupGameState(gameData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('GameRoom: Error initializing game:', err);
        
        // If Firebase is offline, create a demo game
        if (err instanceof Error && err.message.includes('offline')) {
          console.log('GameRoom: Firebase offline, creating demo game for testing');
          const demoGame: GameSession = {
            id: sessionId,
            createdBy: 'demo-host',
            createdAt: new Date().toISOString(),
            status: 'creating',
            participants: {
              'demo-host': {
                displayName: 'Demo Host',
                lastActive: new Date().toISOString()
              },
              [currentUser?.uid || 'guest']: {
                displayName: currentUser?.displayName || 'Test Player',
                lastActive: new Date().toISOString()
              }
            },
            phrases: [
              { text: 'Bingo Game', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Fun Times', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Great Day', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Awesome', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Fantastic', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Amazing', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Wonderful', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Excellent', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Perfect', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Outstanding', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Brilliant', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Superb', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Terrific', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Magnificent', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Splendid', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Glorious', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Marvelous', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Stunning', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Breathtaking', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Spectacular', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Phenomenal', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Extraordinary', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Incredible', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Unbelievable', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() },
              { text: 'Remarkable', addedBy: 'demo', addedByName: 'Demo', timestamp: new Date() }
            ],
            markedPhrases: [],
            players: {
              [currentUser?.uid || 'guest']: {
                displayName: currentUser?.displayName || 'Test Player',
                markedCells: [],
                hasWon: false,
                lastActive: new Date().toISOString()
              }
            }
          };
          
          console.log('GameRoom: Using demo game data (offline mode):', demoGame);
          setGame(demoGame);
          
          // Set up the game state with demo data
          if (demoGame.phrases && demoGame.phrases.length >= 24) {
            await setupGameState(demoGame);
          }
          
          setLoading(false);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to initialize game');
          setLoading(false);
        }
      }
    };

    initializeGame();
  }, [sessionId, currentUser]);

  // Set up real-time listener for game updates
  useEffect(() => {
    if (!sessionId) return;

    console.log('Setting up real-time listener for game:', sessionId);

    try {
      const unsubscribe = onSnapshot(
        doc(db, 'gameSessions', sessionId),
        (doc) => {
          if (doc.exists()) {
            const gameData = doc.data() as GameSession;
            console.log('Real-time game update:', gameData);
            
            // Update marked phrases from shared state
            if (gameData.markedPhrases) {
              console.log('Real-time update received:', {
                markedPhrases: gameData.markedPhrases,
                currentMarkedPhrases: gameState.markedPhrases
              });
              // Update the local board with the shared marked phrases
              setGameState(prev => {
                const updatedBoard = prev.playerBoard.map(cell => ({
                  ...cell,
                  marked: gameData.markedPhrases?.includes(cell.phrase) || false
                }));

                return {
                  ...prev,
                  markedPhrases: gameData.markedPhrases || [],
                  playerBoard: updatedBoard
                };
              });
            }

            // Update other players' information
            if (gameData.players && currentUser) {
              const otherPlayers: { [uid: string]: any } = {};
              Object.entries(gameData.players).forEach(([uid, playerData]) => {
                if (uid !== currentUser.uid) {
                  otherPlayers[uid] = {
                    displayName: playerData.displayName,
                    markedCells: playerData.markedCells || [],
                    hasWon: playerData.hasWon || false
                  };
                  
                  // Check if this player just won
                  if (playerData.hasWon && !gameState.otherPlayers[uid]?.hasWon) {
                    setCelebrationWinner(playerData.displayName || 'Someone');
                    setShowCelebration(true);
                  }
                }
              });
              
              setGameState(prev => ({
                ...prev,
                otherPlayers
              }));
            }

            setGame(gameData);
            
            // Set up game state if game is ready and board hasn't been set up yet
            if (gameData.phrases && gameData.phrases.length >= 24 && !boardSetupRef.current) {
              console.log('Setting up game state from real-time update');
              setupGameState(gameData);
            } else {
              console.log('Not setting up game state from real-time update:', {
                hasPhrases: !!gameData.phrases,
                phrasesLength: gameData.phrases?.length,
                boardSetupRef: boardSetupRef.current,
                condition: gameData.phrases && gameData.phrases.length >= 24 && !boardSetupRef.current
              });
            }
          }
        },
        (error) => {
          console.error('Error listening to game updates:', error);
          // Don't show error to user if Firebase is offline - this is expected in demo mode
          if (!error.message.includes('offline')) {
            console.warn('Firebase real-time listener error (non-critical):', error);
          }
        }
      );

      return () => {
        console.log('Cleaning up real-time listener');
        unsubscribe();
      };
    } catch (error) {
      console.warn('Could not set up real-time listener (Firebase may be offline):', error);
      // Don't show error to user - this is expected in demo mode
    }
  }, [sessionId, currentUser]);

  // Debug render condition
  useEffect(() => {
    if (game) {
      console.log('Render condition check:', {
        isPlaying: gameState.isPlaying,
        phrasesLength: game.phrases.length,
        boardLength: gameState.playerBoard.length,
        condition: gameState.isPlaying || (game.phrases.length >= 24 && gameState.playerBoard.length > 0)
      });
    }
  }, [game, gameState.isPlaying, gameState.playerBoard.length]);

  const setupGameState = async (gameData: GameSession) => {
    try {
      console.log('setupGameState called with:', {
        currentBoardLength: gameState.playerBoard.length,
        gameDataPhrases: gameData.phrases?.length,
        gameStatus: gameData.status,
        boardSetupRef: boardSetupRef.current,
        currentUser: currentUser?.uid
      });

      // Only generate board if it hasn't been set up yet
      if (boardSetupRef.current) {
        console.log('Board already set up, skipping generation');
        return;
      }

      console.log('Generating new board...');
      // Generate a unique bingo board for the current player
      const phraseTexts = gameData.phrases.map(p => p.text);
      console.log('Setting up game state with phrases:', phraseTexts);
      
      // Create a 5x5 board manually to ensure proper layout
      const playerBoard: BingoCell[] = [];
      
      // Use a consistent seed based on user UID for reproducible shuffling
      const seed = currentUser?.uid || 'guest';
      const shuffledPhrases = [...phraseTexts].sort((a, b) => {
        // Create a simple hash for consistent shuffling
        const hashA = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = a.length + b.length;
        return (hashA + hashB) % 3 - 1; // Simple but consistent sorting
      });
      
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const index = row * 5 + col;
          if (index === 12) {
            // FREE space in the center
            playerBoard.push({
              phrase: 'FREE',
              marked: false,
              position: { row, col }
            });
          } else {
            // Use phrases from the shuffled array
            const phraseIndex = index > 12 ? index - 1 : index;
            playerBoard.push({
              phrase: shuffledPhrases[phraseIndex % shuffledPhrases.length],
              marked: false,
              position: { row, col }
            });
          }
        }
      }
      
      console.log('Generated board:', playerBoard);
      
      // Mark board as set up BEFORE setting state
      boardSetupRef.current = true;
      
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        playerBoard: playerBoard,
        markedPhrases: gameData.markedPhrases || []
      }));

      console.log('Board setup complete');
    } catch (err) {
      console.error('Error setting up game state:', err);
      setError('Failed to set up game board');
    }
  };

  const handleStartGame = async () => {
    if (!game || !sessionId || !currentUser) return;

    setStartingGame(true);
    try {
      // Update game status in Firestore
      const gameRef = doc(db, 'gameSessions', sessionId);
      await updateDoc(gameRef, {
        status: 'active',
        gameStartedAt: new Date().toISOString(),
        markedPhrases: [],
        players: {
          [currentUser.uid]: {
            displayName: currentUser.displayName || 'Anonymous',
            markedCells: [],
            hasWon: false,
            lastActive: new Date().toISOString(),
          },
        },
      } as DocumentData);

      // Set up the game state only if board hasn't been set up yet
      if (!boardSetupRef.current) {
        await setupGameState(game);
      } else {
        // Just update the playing status
        setGameState(prev => ({
          ...prev,
          isPlaying: true
        }));
      }

      // Update local game state
      setGame(prev => prev ? { ...prev, status: 'active' } : null);
      
      console.log('Game started successfully!');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setStartingGame(false);
    }
  };

  const handleCellClick = async (cell: BingoCell) => {
    console.log('=== handleCellClick START ===');
    console.log('Cell click attempted:', {
      isPlaying: gameState.isPlaying,
      sessionId,
      currentUser: currentUser ? {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email
      } : null,
      boardExists: gameState.playerBoard.length > 0,
      boardLength: gameState.playerBoard.length,
      cell: cell
    });

    if (!sessionId || !currentUser) {
      console.log('Cell click blocked:', { 
        sessionId, 
        currentUser: !!currentUser 
      });
      return;
    }

    // Allow clicking if board exists and game is ready or active
    if (gameState.playerBoard.length === 0) {
      console.log('Cell click blocked - no board exists');
      return;
    }

    console.log('Cell clicked:', cell);
    console.log('=== handleCellClick VALIDATION PASSED ===');

    // Toggle the cell's marked state locally first for immediate feedback
    const newMarkedState = !cell.marked;
    console.log('Local state update:', {
      cell: cell.phrase,
      currentMarked: cell.marked,
      newMarkedState: newMarkedState
    });
    
    setGameState(prev => {
      console.log('Setting game state with new marked state:', newMarkedState);
      const updatedBoard = prev.playerBoard.map(c => {
        if (c.position && cell.position && 
            c.position.row === cell.position.row && 
            c.position.col === cell.position.col) {
          console.log('Updating cell in board:', c.phrase, 'to marked:', newMarkedState);
          return { ...c, marked: newMarkedState };
        }
        return c;
      });

      return {
        ...prev,
        playerBoard: updatedBoard,
        markedPhrases: newMarkedState 
          ? [...prev.markedPhrases, cell.phrase]
          : prev.markedPhrases.filter(p => p !== cell.phrase)
      };
    });
    
    console.log('=== handleCellClick LOCAL STATE UPDATED ===');

    // Update shared state in Firestore
    try {
      console.log('Updating Firestore for user:', currentUser.uid);
      console.log('User authentication details:', {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        isAnonymous: currentUser.isAnonymous,
        userType: typeof currentUser,
        hasGetIdToken: typeof currentUser.getIdToken === 'function'
      });
      
      // Verify user is properly authenticated (skip getIdToken for guest users)
      if (!currentUser.isAnonymous && typeof currentUser.getIdToken === 'function') {
        try {
          const token = await currentUser.getIdToken();
          console.log('User token obtained:', !!token);
        } catch (tokenError) {
          console.log('Could not get token (guest user):', tokenError);
        }
      } else {
        console.log('Guest user - skipping token verification');
      }
      
      const gameRef = doc(db, 'gameSessions', sessionId);
      
      // First, ensure the user is added to the game's participants
      const updateData: any = {};
      
      if (newMarkedState) {
        // Add to marked phrases
        console.log('Adding phrase to Firestore:', cell.phrase);
        updateData.markedPhrases = arrayUnion(cell.phrase);
        updateData[`players.${currentUser.uid}.markedCells`] = arrayUnion(cell.phrase);
        updateData[`players.${currentUser.uid}.lastActive`] = new Date().toISOString();
        updateData[`players.${currentUser.uid}.displayName`] = currentUser.displayName || 'Guest';
        updateData[`participants.${currentUser.uid}.displayName`] = currentUser.displayName || 'Guest';
        updateData[`participants.${currentUser.uid}.lastActive`] = new Date().toISOString();
      } else {
        // Remove from marked phrases
        console.log('Removing phrase from Firestore:', cell.phrase);
        updateData.markedPhrases = arrayRemove(cell.phrase);
        updateData[`players.${currentUser.uid}.markedCells`] = arrayRemove(cell.phrase);
        updateData[`players.${currentUser.uid}.lastActive`] = new Date().toISOString();
        updateData[`players.${currentUser.uid}.displayName`] = currentUser.displayName || 'Guest';
        updateData[`participants.${currentUser.uid}.displayName`] = currentUser.displayName || 'Guest';
        updateData[`participants.${currentUser.uid}.lastActive`] = new Date().toISOString();
      }
      
      await updateDoc(gameRef, updateData);
      console.log('Successfully updated Firestore');
      
      // Log the updated data for debugging
      console.log('Updated Firestore data:', updateData);

      // Check for win with the updated board state
      const updatedBoard = gameState.playerBoard.map(c => {
        if (c.position && cell.position && 
            c.position.row === cell.position.row && 
            c.position.col === cell.position.col) {
          return { ...c, marked: newMarkedState };
        }
        return c;
      });
      
      const hasWon = checkForWin(updatedBoard);
      console.log('Win check result:', {
        hasWon,
        currentHasWon: gameState.hasWon,
        updatedBoard: updatedBoard.map(c => ({ phrase: c.phrase, marked: c.marked }))
      });
      
      if (hasWon && !gameState.hasWon) {
        setGameState(prev => ({ ...prev, hasWon: true }));
        console.log('BINGO! You won!');
        
        // Update win status in Firestore
        await updateDoc(gameRef, {
          [`players.${currentUser.uid}.hasWon`]: true
        });
      }
    } catch (err) {
      console.error('Error updating shared state:', err);
      console.error('Error details:', {
        error: err,
        user: currentUser.uid,
        phrase: cell.phrase,
        newMarkedState
      });
      
      // If Firebase is offline, just continue with local state (demo mode)
      if (err instanceof Error && err.message.includes('offline')) {
        console.log('Firebase offline - continuing in demo mode with local state only');
        
        // Check for win with the updated board state
        const updatedBoard = gameState.playerBoard.map(c => {
          if (c.position && cell.position && 
              c.position.row === cell.position.row && 
              c.position.col === cell.position.col) {
            return { ...c, marked: newMarkedState };
          }
          return c;
        });
        
        const hasWon = checkForWin(updatedBoard);
        console.log('Win check result (demo mode):', {
          hasWon,
          currentHasWon: gameState.hasWon,
          updatedBoard: updatedBoard.map(c => ({ phrase: c.phrase, marked: c.marked }))
        });
        
        if (hasWon && !gameState.hasWon) {
          setGameState(prev => ({ ...prev, hasWon: true }));
          console.log('BINGO! You won! (Demo mode)');
        }
        
        return; // Don't revert local state in demo mode
      }
      
      // Revert local state if update failed (only for non-offline errors)
      setGameState(prev => {
        const revertedBoard = prev.playerBoard.map(c => {
          if (c.position && cell.position && 
              c.position.row === cell.position.row && 
              c.position.col === cell.position.col) {
            return { ...c, marked: cell.marked };
          }
          return c;
        });

        return {
          ...prev,
          playerBoard: revertedBoard,
          markedPhrases: cell.marked 
            ? [...prev.markedPhrases, cell.phrase]
            : prev.markedPhrases.filter(p => p !== cell.phrase)
        };
      });
    }
  };

  const checkForWin = (board: BingoCell[]): boolean => {
    console.log('Checking for win with board:', board.map(c => ({ phrase: c.phrase, marked: c.marked })));
    
    // Check rows
    for (let i = 0; i < 5; i++) {
      const row = board.slice(i * 5, (i + 1) * 5);
      console.log(`Row ${i}:`, row.map(c => ({ phrase: c.phrase, marked: c.marked })));
      if (row.every(cell => cell.marked)) {
        console.log(`BINGO! Row ${i} is complete!`);
        return true;
      }
    }

    // Check columns
    for (let j = 0; j < 5; j++) {
      const column = board.filter((_, index) => index % 5 === j);
      console.log(`Column ${j}:`, column.map(c => ({ phrase: c.phrase, marked: c.marked })));
      if (column.every(cell => cell.marked)) {
        console.log(`BINGO! Column ${j} is complete!`);
        return true;
      }
    }

    // Check diagonals
    const diagonal1 = [board[0], board[6], board[12], board[18], board[24]];
    const diagonal2 = [board[4], board[8], board[12], board[16], board[20]];
    
    console.log('Diagonal 1:', diagonal1.map(c => ({ phrase: c.phrase, marked: c.marked })));
    console.log('Diagonal 2:', diagonal2.map(c => ({ phrase: c.phrase, marked: c.marked })));
    
    if (diagonal1.every(cell => cell.marked)) {
      console.log('BINGO! Diagonal 1 is complete!');
      return true;
    }
    
    if (diagonal2.every(cell => cell.marked)) {
      console.log('BINGO! Diagonal 2 is complete!');
      return true;
    }

    console.log('No win condition found');
    return false;
  };

  const renderBingoBoard = () => {
    console.log('renderBingoBoard called with:', {
      boardLength: gameState.playerBoard.length,
      isPlaying: gameState.isPlaying,
      boardSetupRef: boardSetupRef.current,
      gameStatus: game?.status,
      currentUser: currentUser?.uid
    });

    if (!gameState.playerBoard.length) {
      console.log('No player board to render');
      return null;
    }

    console.log('Rendering board with', gameState.playerBoard.length, 'cells');
    console.log('Board cells:', gameState.playerBoard);
    console.log('Marked phrases:', gameState.markedPhrases);

    return (
      <div className="bingo-board" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <div 
          className="board-grid" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            maxWidth: '600px',
            width: '100%'
          }}
        >
          {gameState.playerBoard.map((cell, index) => {
            // Check if this cell's phrase is marked in shared state
            const isMarkedInSharedState = gameState.markedPhrases.includes(cell.phrase);
            const isMarked = cell.marked || isMarkedInSharedState;
            
            return (
              <div
                key={`${cell.position?.row}-${cell.position?.col}-${index}`}
                className={`board-cell ${isMarked ? 'marked' : ''} ${index === 12 ? 'free-space' : ''}`}
                style={{
                  aspectRatio: '1',
                  border: `2px solid ${isMarked ? '#4CAF50' : index === 12 ? '#ff9800' : '#ddd'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: '8px',
                  wordBreak: 'break-word',
                  minHeight: '80px',
                  color: isMarked ? 'white' : index === 12 ? 'white' : '#333',
                  background: index === 12 
                    ? 'linear-gradient(135deg, #ff9800, #f57c00)' 
                    : isMarked 
                      ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                      : 'white',
                  position: 'relative',
                  zIndex: 1
                }}
                onClick={() => {
                  console.log('Cell clicked:', cell);
                  console.log('About to call handleCellClick');
                  handleCellClick(cell);
                  console.log('handleCellClick called');
                }}
              >
                {cell.phrase}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOtherPlayers = () => {
    if (Object.keys(gameState.otherPlayers).length === 0) return null;

    return (
      <div className="other-players">
        <h3>Other Players</h3>
        {Object.entries(gameState.otherPlayers).map(([uid, player]) => (
          <div key={uid} className="player-status">
            <span>{player.displayName}</span>
            <span>Marked: {player.markedCells.length}</span>
            {player.hasWon && <span className="winner-badge">Winner!</span>}
          </div>
        ))}
      </div>
    );
  };

  const renderInviteSection = () => {
    if (!sessionId) return null;

    const gameUrl = `${window.location.origin}/game/${sessionId}`;
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(gameUrl);
        console.log('Game link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = gameUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Game link copied to clipboard!');
      }
    };

    return (
      <div className="invite-section">
        <h3>🎯 Invite Players</h3>
        <div className="game-code-display">
          <p><strong>Game Code:</strong> <span className="game-code">{sessionId}</span></p>
          <p><strong>Game Link:</strong></p>
          <div className="game-link-container">
            <input 
              type="text" 
              value={gameUrl} 
              readOnly 
              className="game-link-input"
            />
            <button onClick={copyToClipboard} className="copy-button">
              📋 Copy
            </button>
          </div>
        </div>
        <div className="share-options">
          <p>Share this code or link with friends to invite them to the game!</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="game-room-loading">
        <h2>Loading game...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show a different loading state when game is being created
  if (game && game.status === 'creating' && (!game.phrases || game.phrases.length < 24)) {
    return (
      <div className="game-room-loading">
        <h2>Setting up your game...</h2>
        <div className="loading-spinner"></div>
        <p className="loading-subtitle">Please wait while phrases are being added</p>
        <p className="loading-debug">Debug: Game has {game.phrases?.length || 0} phrases</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          Refresh if stuck
        </button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="game-room-error">
        <h2>Error</h2>
        <p>{error}</p>
        {error === 'Please sign in to join this game' ? (
          <div className="error-actions">
            <button onClick={() => window.location.href = '/guest'} className="guest-signin-button">
              🎮 Play as Guest
            </button>
            <button onClick={() => window.location.href = '/signin'} className="signin-button">
              🔐 Sign In
            </button>
            <button onClick={() => window.history.back()} className="back-button">
              ← Go Back
            </button>
          </div>
        ) : (
          <button onClick={() => window.history.back()}>Go Back</button>
        )}
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="game-room-not-found">
        <h2>Game Not Found</h2>
        <p>The requested game could not be found.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="game-room">
      <h1>Bingo Game</h1>
      <p>Game ID: {sessionId}</p>
      
      {/* Demo mode indicator */}
      {game?.createdBy === 'demo-host' && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>🎮 Demo Mode</strong> - Playing with sample data since Firebase is offline
        </div>
      )}
      
      <div className="game-info">
        <p>Status: {game.status}</p>
        <p>Created by: {game.participants[game.createdBy]?.displayName || 'Unknown'}</p>
        <p>Participants: {Object.keys(game.participants).length}</p>
        <p>Phrases: {game.phrases.length}</p>
      </div>
      
      {gameState.isPlaying || (game.phrases.length >= 24 && gameState.playerBoard.length > 0) ? (
        <div className="game-playing">
          <h3>{gameState.isPlaying ? 'Game in Progress' : 'Game Ready'}</h3>
          
          {/* Game Progress Section */}
          <div className="game-progress-section">
            <Suspense fallback={<LoadingSpinner size="small" text="Loading progress..." />}>
              <GameProgress 
                totalPhrases={game.phrases.length}
                calledPhrases={gameState.calledPhrases}
                playerMarkedCount={gameState.markedPhrases.length}
                totalPlayers={Object.keys(game.participants).length}
                gameStatus={game.status}
                isPlaying={gameState.isPlaying}
                onGameStart={handleStartGame}
              />
            </Suspense>
          </div>
            <Suspense fallback={<LoadingSpinner size="small" text="Loading celebration..." />}>
              <BingoCelebration 
                isVisible={gameState.hasWon || showCelebration}
                winnerName={gameState.hasWon ? (currentUser?.displayName || 'You') : celebrationWinner}
                onClose={() => {
                  setGameState(prev => ({ ...prev, hasWon: false }));
                  setShowCelebration(false);
                }}
              />
            </Suspense>
            {renderBingoBoard()}
          {renderOtherPlayers()}
          
          {/* Leaderboard Section */}
          <div className="leaderboard-section">
            <Suspense fallback={<LoadingSpinner size="small" text="Loading leaderboard..." />}>
              <Leaderboard 
                players={gameState.otherPlayers}
                gameId={sessionId || ''}
                showStats={true}
                maxPlayers={10}
              />
            </Suspense>
          </div>
          
          {!gameState.isPlaying && game.status !== 'active' && (
            <div className="start-game-section">
              <h4>Ready to start!</h4>
              <p>All {game.phrases.length} phrases have been added.</p>
              <button 
                className="start-game-button"
                onClick={handleStartGame}
                disabled={startingGame}
              >
                {startingGame ? 'Starting Game...' : 'Start Game'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="game-board-placeholder">
          <h3>Game Board</h3>
          <p>Game board will be rendered here</p>
          <p>This game has {game.phrases.length} phrases ready to play!</p>
          
          {game.phrases.length >= 24 && game.status !== 'active' && (
            <div className="game-ready">
              <h4>Game is ready to start!</h4>
              <p>All {game.phrases.length} phrases have been added.</p>
              <button 
                className="start-game-button"
                onClick={handleStartGame}
                disabled={startingGame}
              >
                {startingGame ? 'Starting Game...' : 'Start Game'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {renderInviteSection()}
      
      {/* Game Chat Section */}
      <div className="game-chat-section">
        <Suspense fallback={<LoadingSpinner size="small" text="Loading chat..." />}>
          <GameChat 
            gameId={sessionId || ''}
            maxMessages={50}
            messageRateLimit={10}
            systemMessages={true}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default GameRoom; 