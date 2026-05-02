import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameService, GameSession } from '../services/gameService';
import BingoCelebration from './BingoCelebration';
import { BingoBoard } from './common/BingoBoard';
import type { BingoCell } from '../types/types';
import '../styles/SimpleGameRoom.css';


const SimpleGameRoom: React.FC = () => {
  console.log('=== SIMPLE GAME ROOM LOADED ===');
  console.log('SimpleGameRoom component loaded');
  console.log('🚨 BASIC TEST LOG - IF YOU SEE THIS, JAVASCRIPT IS WORKING');
  console.log('🚨 REACT COMPONENT LOADING - SimpleGameRoom component is initializing');
  
  // Test if JavaScript is working at all
  if (typeof window !== 'undefined') {
    console.log('🚨 WINDOW OBJECT EXISTS - JAVASCRIPT IS WORKING');
    console.log('🚨 REACT IS WORKING - Component is rendering');
    // Uncomment the next line to see an alert (only for testing)
    // alert('JavaScript is working!');
  }
  
  // Check if we're in Brave browser and provide guidance
  useEffect(() => {
    const isBrave = navigator.userAgent.includes('Brave') || 
                   (navigator as any).brave && (navigator as any).brave.isBrave;
    
    if (isBrave) {
      console.log('🚨 DETECTED BRAVE BROWSER - Ad blocker may be blocking JavaScript');
      // Show user-friendly message
      const braveWarning = document.createElement('div');
      braveWarning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6b6b;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      braveWarning.innerHTML = `
        <strong>🚨 Brave Browser Detected</strong><br>
        Your ad blocker may be blocking this app. Please click the Brave shield icon in the address bar and turn off "Shields" for this site, then refresh the page.
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #ff6b6b; border: none; border-radius: 3px; cursor: pointer;">Dismiss</button>
      `;
      document.body.appendChild(braveWarning);
    }
  }, []);
  
  const { sessionId } = useParams<{ sessionId: string }>();
  console.log('SessionId from params:', sessionId);
  console.log('🚨 COMPONENT STATE - About to initialize state variables');
  const { currentUser } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [playerBoard, setPlayerBoard] = useState<BingoCell[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boardGeneratedRef = useRef<string | null>(null); // Track if board generated for this session
  const isGeneratingRef = useRef<boolean>(false); // Track if currently generating board

  // Memoize the board to prevent infinite re-renders
  const memoizedBoard = useMemo(() => {
    console.log('🔍 memoizedBoard recalculated, playerBoard length:', playerBoard.length);
    return playerBoard;
  }, [playerBoard]);

  // Test Firebase connection and set up fallbacks
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log('🔍 Testing Firebase connection...');
        setConnectionStatus('checking');
        
        // Try to connect to Firebase with a timeout
        const testConnection = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 5000);
          
          // Test with a simple Firestore operation
          if (gameSession?.id) {
            gameService.getGameSession(gameSession.id)
              .then(() => {
                clearTimeout(timeout);
                resolve(true);
              })
              .catch((error) => {
                clearTimeout(timeout);
                reject(error);
              });
          } else {
            clearTimeout(timeout);
            resolve(true); // No session yet, but Firebase is available
          }
        });
        
        await testConnection;
        console.log('✅ Firebase connection successful');
        setConnectionStatus('connected');
        setUseLocalStorage(false);
      } catch (error) {
        console.log('❌ Firebase connection failed, using localStorage fallback');
        console.log('Error:', error);
        setConnectionStatus('disconnected');
        setUseLocalStorage(true);
      }
    };
    
    testFirebaseConnection();
  }, [gameSession?.id]);

  useEffect(() => {
    console.log('🎮 SimpleGameRoom useEffect triggered for sessionId:', sessionId);
    console.log('🚨 USEEFFECT RUNNING - Real-time subscription setup starting');
    
    // Debug logging removed for production
    
    if (!sessionId) {
      console.log('❌ No sessionId, returning');
      return;
    }

    console.log('👂 Setting up real-time subscription for game session:', sessionId);
    
    // Subscribe to real-time updates for this game session
    const unsubscribe = gameService.subscribeToGameSession(sessionId, (session) => {
      console.log('📡 Real-time update received in SimpleGameRoom:', session);
      
        if (session) {
        console.log('✅ Setting game session state');
          setGameSession(session);
        console.log('📊 Updated game session:', session);
        console.log('📝 Session phrases:', session.phrases);
        console.log('📏 Session phrases length:', session.phrases?.length);
        console.log('🔤 First few phrases:', session.phrases?.slice(0, 5));
        console.log('🔍 Phrase structure check:', session.phrases?.map(p => ({ text: p.text, hasText: !!p.text })));
        } else {
        console.log('❌ Game session not found or deleted');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up game session subscription');
      unsubscribe();
    };
  }, [sessionId]);

  const generateNewBoard = () => {
    console.log('🔍 generateNewBoard function called');
    console.log('🔍 generateNewBoard: gameSession exists:', !!gameSession);
    console.log('🔍 generateNewBoard: phrases exist:', !!gameSession?.phrases);
    console.log('🔍 generateNewBoard: phrases length:', gameSession?.phrases?.length);
    
    // Early return check with simplified logging
    if (!gameSession || !gameSession.phrases) {
      console.log('🔍 generateNewBoard early return - missing gameSession or phrases');
      return;
    }
    
    const playerId = currentUser?.uid || 'anonymous';
    console.log('🔍 generateNewBoard: Generating board for player:', playerId);
    
    const phraseTexts = gameSession.phrases.map(p => p.text);
    console.log('🔍 generateNewBoard: Using phrases:', phraseTexts.length, 'phrases');
    console.log('🔍 generateNewBoard: First few phrases:', phraseTexts.slice(0, 3));
    

    // Import and use the board generator with player-specific seed
    import('../utils/boardGenerator').then(async ({ generateUniquePlayerBoard }) => {
      console.log('🔍 generateNewBoard: Board generator imported successfully');
      
      // Get existing boards from the game session to ensure uniqueness
      const existingBoards = gameSession.players ? 
        Object.values(gameSession.players).map(player => player.board || []) : [];
      
      console.log('🔍 generateNewBoard: Existing boards count:', existingBoards.length);
      
      // Generate a unique board for this player
      const board = generateUniquePlayerBoard(phraseTexts, existingBoards);
      console.log('🔍 generateNewBoard: Generated board with', board.length, 'cells');
      console.log('🔍 generateNewBoard: Center cell (index 12):', board[12]);
      
      
      // Ensure the board is properly structured before setting it
      const structuredBoard = board.map((cell, index) => ({
        phrase: cell.phrase,
        marked: cell.marked || false,
        markedBy: cell.markedBy,
        markedAt: cell.markedAt,
        position: {
          row: Math.floor(index / 5),
          col: index % 5
        }
      }));
      
      console.log('🔍 generateNewBoard: Structured board created with', structuredBoard.length, 'cells');
      
      setPlayerBoard(structuredBoard);
      
      // Store this player's board in the game session
      if (gameSession && playerId) {
        const updatedPlayers = {
          ...gameSession.players,
          [playerId]: {
            displayName: currentUser?.displayName || 'Anonymous',
            markedCells: [],
            hasWon: false,
            lastActive: new Date().toISOString(),
            board: structuredBoard
          }
        };
        
        
        // Update the game session with this player's board
        try {
          console.log('🔍 generateNewBoard: Updating Firebase with player board');
          
          await gameService.updateGameSession(gameSession.id, {
            players: updatedPlayers
          });
          
          console.log('🔍 generateNewBoard: Firebase update successful');
          
          // Clear the generating flag after Firebase update completes
          isGeneratingRef.current = false;
          
        } catch (error) {
          console.error('🔍 generateNewBoard: Firebase update failed:', error);
          isGeneratingRef.current = false;
        }
        
        // Mark this session as having generated a board
        const sessionKey = `${gameSession.id}-${playerId}`;
        boardGeneratedRef.current = sessionKey;
        console.log('🔍 generateNewBoard: Marked board as generated for session:', sessionKey);
        
      }
    }).catch(error => {
      console.error('🔍 generateNewBoard: Error importing board generator:', error);
      isGeneratingRef.current = false; // Clear generating flag on error
    });
  };

  // Wrap generateNewBoard with try/catch to surface unexpected errors
  const safeGenerateNewBoard = () => {
    try {
      generateNewBoard();
    } catch (err: any) {
      console.error('Board Generation Exception:', err);
      isGeneratingRef.current = false;
    }
  };

  useEffect(() => {
    console.log('🔍 Board Generation useEffect triggered');
    console.log('🔍 gameSession:', !!gameSession);
    console.log('🔍 gameSession.phrases:', gameSession?.phrases?.length);
    console.log('🔍 currentUser:', currentUser?.uid);
    console.log('🔍 playerBoard.length:', playerBoard.length);
    console.log('🔍 connectionStatus:', connectionStatus);
    console.log('🔍 useLocalStorage:', useLocalStorage);
    
    if (!gameSession || !gameSession.phrases) {
      console.log('🔍 Early return: missing gameSession or phrases');
      return;
    }

    const playerId = currentUser?.uid || 'anonymous';
    const sessionKey = `${gameSession.id}-${playerId}`;
    
    // Check if we've already generated a board for this session
    if (boardGeneratedRef.current === sessionKey) {
      console.log('🔍 Early return: already generated board for this session');
      // Debug logging removed for production
      return;
    }

    // Check if we already have a local board (from real-time updates)
    if (playerBoard.length > 0) {
      console.log('🔍 Early return: already have local board');
      // Debug logging removed for production
      return;
    }
    console.log('🔍 Player ID:', playerId);
    console.log('🔍 gameSession.players:', gameSession.players);
    console.log('🔍 playerBoard.length:', playerBoard.length);
    
    // Debug logging removed for production
    
    // Check if this player already has a board in the game session
    console.log('🔍 Board Generation Checking Existing Board:', {
      playerId,
      hasPlayers: !!gameSession.players,
      playersKeys: gameSession.players ? Object.keys(gameSession.players) : [],
      playerExists: gameSession.players && gameSession.players[playerId],
      playerHasBoard: gameSession.players && gameSession.players[playerId] && gameSession.players[playerId].board,
      playerBoardLength: gameSession.players && gameSession.players[playerId] ? gameSession.players[playerId].board?.length : 0,
      connectionStatus,
      useLocalStorage
    });
    
    // Try to load from localStorage if Firebase is not available
    if (useLocalStorage && !gameSession.players?.[playerId]?.board) {
      const localBoard = loadBoardFromLocalStorage(gameSession.id, playerId);
      if (localBoard && localBoard.length > 0) {
        console.log('💾 Using board from localStorage');
        setPlayerBoard(localBoard);
        setHasWon(localBoard.some(cell => cell.marked) && checkWinCondition(localBoard));
        return;
      }
    }
    
    if (gameSession.players && gameSession.players[playerId] && gameSession.players[playerId].board) {
      console.log('✅ Player already has a board, using existing board');
      const existingBoard = gameSession.players[playerId].board!;
      console.log('🔍 Loading existing board from Firebase:', {
        boardLength: existingBoard.length,
        markedCells: existingBoard.filter(cell => cell.marked).length,
        playerId: playerId
      });
      setPlayerBoard(existingBoard);
      setHasWon(gameSession.players[playerId].hasWon || false);
      
      // Mark this session as having generated a board to prevent regeneration
      const sessionKey = `${gameSession.id}-${playerId}`;
      boardGeneratedRef.current = sessionKey;
      console.log('🔍 Marked existing board as loaded for session:', sessionKey);
      return;
    }


    // Debug logging removed for production

    // Set generating flag BEFORE timeout to prevent cleanup
    isGeneratingRef.current = true;
    console.log('🔒 Set isGeneratingRef to true to prevent cleanup');

    // Wait a bit for Firebase data to load before generating a new board
    console.log('⏳ Waiting for Firebase data to load before generating board...');
    // Debug logging removed for production
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log('⏳ Timeout reached, checking for board again');
      // Debug logging removed for production
      
      // Check again if player has a board after waiting
      if (gameSession.players && gameSession.players[playerId] && gameSession.players[playerId].board) {
        console.log('✅ Player board found after waiting, using existing board');
        // Debug logging removed for production
        const existingBoard = gameSession.players[playerId].board!;
        setPlayerBoard(existingBoard);
        setHasWon(gameSession.players[playerId].hasWon || false);
        return;
      }
      
      // Only generate if still no board exists
      if (playerBoard.length === 0) {
        console.log('🆕 No existing board found, generating new board');
        console.log('🆕 About to call safeGenerateNewBoard()');
        safeGenerateNewBoard();
      } else {
        console.log('🆕 Board already exists, skipping generation');
      }
    }, 1000); // Wait 1 second for Firebase data

    // Debug logging removed for production

    return () => {
      console.log('🧹 Board Generation useEffect cleanup - clearing timeout');
      console.log('🔍 Cleanup check - isGeneratingRef.current:', isGeneratingRef.current);
      // Debug logging removed for production
      
      // Don't clear timeout if we're currently generating a board
      if (isGeneratingRef.current) {
        console.log('🔒 Skipping cleanup - board generation in progress');
        // Debug logging removed for production
        return;
      }
      
      console.log('🧹 Proceeding with cleanup - clearing timeout');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [gameSession?.id, currentUser?.uid]); // Only trigger on session ID or user changes

  // Update player board when game session changes (from real-time updates)
  useEffect(() => {
    if (gameSession && currentUser?.uid && gameSession.players && gameSession.players[currentUser.uid]) {
      const playerData = gameSession.players[currentUser.uid];
      if (playerData.board) {
        console.log('🔍 Real-time update: Updating player board from session data');
        console.log('🔍 Real-time update: Board length:', playerData.board.length);
        
        // Only update if the board is different from current state
        const currentBoardString = JSON.stringify(playerBoard);
        const newBoardString = JSON.stringify(playerData.board);
        
        if (currentBoardString !== newBoardString) {
          console.log('🔍 Real-time update: Board changed, updating state');
          console.log('🔍 Real-time update: New board data:', {
            boardLength: playerData.board.length,
            markedCells: playerData.board.filter(cell => cell.marked).length,
            playerId: currentUser.uid
          });
          setPlayerBoard(playerData.board);
          setHasWon(playerData.hasWon || false);
        } else {
          console.log('🔍 Real-time update: Board unchanged, skipping update');
        }
      }
    }
  }, [gameSession?.players, currentUser?.uid]); // Only depend on players object, not entire gameSession

  // Local storage backup functions
  const saveBoardToLocalStorage = (board: BingoCell[], sessionId: string, userId: string) => {
    try {
      const boardData = {
        board,
        sessionId,
        userId,
        timestamp: Date.now()
      };
      localStorage.setItem(`bingo_board_${sessionId}_${userId}`, JSON.stringify(boardData));
      console.log('💾 Board saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  };

  const loadBoardFromLocalStorage = (sessionId: string, userId: string): BingoCell[] | null => {
    try {
      const stored = localStorage.getItem(`bingo_board_${sessionId}_${userId}`);
      if (stored) {
        const boardData = JSON.parse(stored);
        // Check if data is recent (within 24 hours)
        if (Date.now() - boardData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('💾 Board loaded from localStorage');
          return boardData.board;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
    }
    return null;
  };

  const handleCellClick = async (index: number) => {
    console.log('🖱️ handleCellClick called for index:', index);
    console.log('🔍 Current playerBoard length:', playerBoard.length);
    console.log('🔍 Current gameSession:', !!gameSession);
    console.log('🔍 Current user:', !!currentUser);
    console.log('🔍 Connection status:', connectionStatus);
    console.log('🔍 Using localStorage:', useLocalStorage);
    
    // Debug logging removed for production
    
    // Debug logging removed for production
    
    if (hasWon) {
      console.log('🏆 Game already won, ignoring click');
      // Debug logging removed for production
      return;
    }

    console.log('📝 Updating local board state');
    const newBoard = [...playerBoard];
    newBoard[index] = {
      ...newBoard[index],
      marked: !newBoard[index].marked
    };
    setPlayerBoard(newBoard);
    console.log('✅ Local board state updated');
    
    // Save to localStorage as backup
    if (gameSession && currentUser?.uid) {
      saveBoardToLocalStorage(newBoard, gameSession.id, currentUser.uid);
    }

    // Update the game session with the new board state
    if (gameSession && currentUser?.uid && connectionStatus === 'connected') {
      console.log('🔄 Updating game session with new board state');
      console.log('👤 Current user:', currentUser.uid);
      console.log('🎮 Game session ID:', gameSession.id);
      
      const currentPlayer = gameSession.players[currentUser.uid] || {};
      const updatedPlayers = {
        ...gameSession.players,
        [currentUser.uid]: {
          ...currentPlayer,
          board: newBoard,
          markedCells: newBoard.filter(cell => cell.marked).map((_, i) => i.toString()),
          lastActive: new Date().toISOString()
        }
      };

      console.log('📊 Updated players data for player:', currentUser.uid);
      // Debug logging removed for production
      
      try {
        console.log('🔄 Attempting Firebase update with data:', {
          gameSessionId: gameSession.id,
          playerId: currentUser.uid,
          boardLength: newBoard.length,
          markedCells: newBoard.filter(cell => cell.marked).length
        });
        
        await gameService.updateGameSession(gameSession.id, {
          players: updatedPlayers
        });
        console.log('✅ Firebase update completed successfully');
        console.log('✅ Board state saved to Firebase');
      } catch (error) {
        console.error('❌ Firebase update failed:', error);
        console.error('❌ Board state NOT saved to Firebase');
      }
    } else {
      console.log('❌ Cannot update game session - missing gameSession or currentUser');
      // Debug logging removed for production
    }

    // Check for win condition
    if (checkWinCondition(newBoard)) {
      console.log('🏆 Win condition detected!');
      setHasWon(true);
      setShowCelebration(true);
    }
  };

  const checkWinCondition = (board: BingoCell[]): boolean => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      let markedCount = 0;
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        if (board[index]?.marked) markedCount++;
      }
      if (markedCount === 5) return true;
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      let markedCount = 0;
      for (let row = 0; row < 5; row++) {
        const index = row * 5 + col;
        if (board[index]?.marked) markedCount++;
      }
      if (markedCount === 5) return true;
    }

    // Check diagonals
    let diagonal1 = 0;
    let diagonal2 = 0;
    for (let i = 0; i < 5; i++) {
      if (board[i * 5 + i]?.marked) diagonal1++;
      if (board[i * 5 + (4 - i)]?.marked) diagonal2++;
    }
    if (diagonal1 === 5 || diagonal2 === 5) return true;

    return false;
  };

  const handleNewGame = () => {
    setHasWon(false);
    setShowCelebration(false);
    // Regenerate a NEW UNIQUE board using the proper board generator
    if (gameSession) {
      const phraseTexts = gameSession.phrases.map(p => p.text);
      const playerId = currentUser?.uid || 'anonymous';
      console.log('Generating NEW UNIQUE board for player:', playerId);

      // Import and use the board generator
      import('../utils/boardGenerator').then(async ({ generateUniquePlayerBoard }) => {
        console.log('Board generator imported successfully for new game');
        
        // Get existing boards from the game session to ensure uniqueness
        const existingBoards = gameSession.players ? 
          Object.values(gameSession.players).map(player => player.board || []) : [];
        
        // Generate a unique board for this player
        const board = generateUniquePlayerBoard(phraseTexts, existingBoards);
        console.log('Generated NEW UNIQUE board with', board.length, 'cells');
        console.log('Center cell (index 12):', board[12]);
        console.log('Full new board:', board.map((cell, i) => `${i}: ${cell.phrase}`));
        
        // Ensure the board is properly structured before setting it
        const structuredBoard = board.map((cell, index) => ({
          phrase: cell.phrase,
          marked: cell.marked || false,
          markedBy: cell.markedBy,
          markedAt: cell.markedAt,
          position: {
            row: Math.floor(index / 5),
            col: index % 5
          }
        }));
        
        console.log('Structured NEW UNIQUE board:', structuredBoard);
        setPlayerBoard(structuredBoard);
        
        // Update the game session with this player's new board
        if (playerId) {
          const updatedPlayers = {
            ...gameSession.players,
            [playerId]: {
              ...gameSession.players[playerId],
              board: structuredBoard,
              markedCells: [],
              hasWon: false,
              lastActive: new Date().toISOString()
            }
          };
          
          await gameService.updateGameSession(gameSession.id, {
            players: updatedPlayers
          });
        }
      }).catch(error => {
        console.error('Error importing board generator for new game:', error);
      });
    }
  };

  if (loading) {
    return (
      <div className="game-room">
        <div className="loading-container">
          <h2>Loading Game...</h2>
          <p>Setting up your bingo board...</p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="game-room">
        <div className="error-container">
          <h2>Game Not Found</h2>
          <p>The game session could not be found.</p>
          <button onClick={() => window.location.href = '/create'}>
            Create New Game
          </button>
        </div>
      </div>
    );
  }

  // DEBUG: Show game session data on the page
  const debugInfo = {
    sessionId,
    phrasesCount: gameSession.phrases?.length || 0,
    firstFewPhrases: gameSession.phrases?.slice(0, 3) || [],
    phrasesStructure: gameSession.phrases?.map(p => ({ text: p.text, hasText: !!p.text })) || []
  };

  return (
    <div className="game-room">
      {/* DEBUG INFO */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px', border: '1px solid #ccc' }}>
        <h3>🔍 DEBUG INFO:</h3>
        <p><strong>Session ID:</strong> {sessionId}</p>
        <p><strong>Phrases Count:</strong> {debugInfo.phrasesCount}</p>
        <p><strong>First Few Phrases:</strong> {JSON.stringify(debugInfo.firstFewPhrases)}</p>
        <p><strong>Phrases Structure:</strong> {JSON.stringify(debugInfo.phrasesStructure)}</p>
      </div>
      
      <div className="game-header">
        <h1>🎯 Bingo Game</h1>
        <p>Click on phrases as they're called out!</p>
        {hasWon && <p className="win-message">🎉 Congratulations! You won!</p>}
        
        {/* Connection Status Indicator */}
        <div className="connection-status">
          {connectionStatus === 'checking' && (
            <p className="status-checking">🔄 Checking connection...</p>
          )}
          {connectionStatus === 'connected' && (
            <p className="status-connected">✅ Connected to server</p>
          )}
          {connectionStatus === 'disconnected' && (
            <p className="status-disconnected">⚠️ Offline mode - using local storage</p>
          )}
        </div>
      </div>
      
      <div className="game-board-container">
        <BingoBoard
          cells={memoizedBoard}
          onCellClick={(index) => {
            void handleCellClick(index);
          }}
          disabled={hasWon}
          loadingMessage="Setting up your bingo board..."
        />
      </div>

      <div className="game-controls">
        <button 
          className="new-game-btn"
          onClick={handleNewGame}
        >
          🔄 New Game
        </button>
        <button 
          className="back-btn"
          onClick={() => window.location.href = '/create'}
        >
          ← Back to Create
        </button>
      </div>

      {showCelebration && (
        <BingoCelebration
          isVisible={showCelebration}
          winnerName={currentUser?.displayName || 'Anonymous'}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
};

export default SimpleGameRoom;
