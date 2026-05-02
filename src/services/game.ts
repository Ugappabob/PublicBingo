import type { GameRoom, GameSettings, Player } from '../types/types';
import { websocketService } from './websocket';
import { db } from '../firebase/index';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

class GameService {
  async createGame(settings: GameSettings): Promise<string> {
    try {
      // Generate a unique game ID
      const gameId = uuidv4();
      
      // Create a new game document in Firestore
      const gameRef = doc(db, 'games', gameId);
      
      // Create the game room object with default values
      const gameRoom: Omit<GameRoom, 'createdAt' | 'updatedAt'> = {
        id: gameId,
        name: `Game ${gameId.slice(0, 8)}`,
        hostId: '', // This will be set when a host joins
        host: {} as Player, // This will be set when a host joins
        players: {},
        phrases: [], // Will be populated from phraseList
        status: 'waiting',
        settings: {
          ...settings,
          maxPlayers: settings.maxPlayers || 10,
          duration: settings.duration || 300, // 5 minutes default
          boardSize: settings.boardSize || 5,
          winCondition: settings.winCondition || 'line',
          maxChatMessages: settings.maxChatMessages || 100,
          maxChatMessageRate: settings.maxChatMessageRate || 10,
          allowGuestPlayers: settings.allowGuestPlayers || false,
          autoStart: settings.autoStart || false,
          autoStartCount: settings.autoStartCount || 2,
          autoEnd: settings.autoEnd || false,
          autoEndTime: settings.autoEndTime || 3600,
          allowChat: settings.allowChat || true,
          allowPrivateChat: settings.allowPrivateChat || false,
          allowSpectators: settings.allowSpectators || false
        },
        lastActive: Date.now(),
        isPrivate: settings.isPrivate || false,
        password: settings.password || '',
        turnOrder: [],
        currentTurn: '',
        isPaused: false
      };
      
      // Save the game to Firestore with server timestamps
      await setDoc(gameRef, {
        ...gameRoom,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Emit a WebSocket event to notify clients about the new game
      websocketService.emit('createGame', { gameId, settings: gameRoom.settings });
      
      return gameId;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  }

  async joinGame(gameId: string, password?: string): Promise<void> {
    try {
      await websocketService.joinRoom(gameId, password);
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }

  async leaveGame(): Promise<void> {
    try {
      await websocketService.leaveRoom();
    } catch (error) {
      console.error('Failed to leave game:', error);
      throw error;
    }
  }

  async getGameState(gameId: string): Promise<GameRoom | null> {
    try {
      // Get the game document from Firestore
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        console.error('Game not found:', gameId);
        return null;
      }
      
      // Convert Firestore data to GameRoom type
      const gameData = gameDoc.data();
      const gameRoom: GameRoom = {
        id: gameData.id,
        name: gameData.name,
        hostId: gameData.hostId,
        host: gameData.host,
        players: gameData.players || {},
        phrases: gameData.phrases || [],
        status: gameData.status,
        settings: gameData.settings,
        createdAt: gameData.createdAt?.toMillis() || Date.now(),
        lastActive: gameData.lastActive || Date.now(),
        winner: gameData.winner,
        winnerId: gameData.winnerId,
        gameStartedAt: gameData.gameStartedAt,
        gameEndedAt: gameData.gameEndedAt,
        messages: gameData.messages || [],
        isPrivate: gameData.isPrivate || false,
        password: gameData.password
      };
      
      return gameRoom;
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }
  
  async startGame(gameId: string): Promise<void> {
    try {
      // Get the current game state
      const gameState = await this.getGameState(gameId);
      
      if (!gameState) {
        throw new Error('Game not found');
      }
      
      // Validate that the game can be started
      if (gameState.status !== 'waiting') {
        throw new Error('Game is already in progress or finished');
      }
      
      // Check if there are enough players
      const playerCount = Object.keys(gameState.players).length;
      if (playerCount < 2) {
        throw new Error('Not enough players to start the game');
      }
      
      // Check if all players are ready
      const allPlayersReady = Object.values(gameState.players).every(player => player.isReady);
      if (!allPlayersReady) {
        throw new Error('Not all players are ready');
      }
      
      // Update the game state in Firestore
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'playing',
        gameStartedAt: Date.now(),
        lastActive: Date.now(),
        updatedAt: serverTimestamp()
      });
      
      // Emit a WebSocket event to notify clients about the game start
      websocketService.emit('startGame', gameId);
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }
  
  async endGame(gameId: string, winnerId?: string, winnerName?: string): Promise<void> {
    try {
      // Get the current game state
      const gameState = await this.getGameState(gameId);
      
      if (!gameState) {
        throw new Error('Game not found');
      }
      
      // Validate that the game can be ended
      if (gameState.status !== 'playing') {
        throw new Error('Game is not in progress');
      }
      
      // Update the game state in Firestore
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'finished',
        gameEndedAt: Date.now(),
        lastActive: Date.now(),
        updatedAt: serverTimestamp(),
        ...(winnerId && { winnerId, winner: winnerName })
      });
      
      // Emit a WebSocket event to notify clients about the game end
      websocketService.emit('gameEnd', { gameId, winnerId, winnerName });
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  }
  
  async updateGameState(gameId: string, updates: Partial<GameRoom>): Promise<void> {
    try {
      // Update the game state in Firestore
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        ...updates,
        lastActive: Date.now(),
        updatedAt: serverTimestamp()
      });
      
      // Emit a WebSocket event to notify clients about the game state update
      websocketService.emit('gameStateUpdate', { gameId, updates });
    } catch (error) {
      console.error('Failed to update game state:', error);
      throw error;
    }
  }

  async pauseGame(gameId: string, isPaused: boolean): Promise<void> {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        isPaused,
        status: isPaused ? 'paused' : 'active',
        lastUpdated: serverTimestamp()
      });

      websocketService.emit('pause_game', gameId, isPaused);
    } catch (error) {
      console.error('Error pausing game:', error);
      throw error;
    }
  }

  async nextTurn(gameId: string): Promise<void> {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const game = gameDoc.data() as GameRoom;
      if (!game.turnOrder || !game.currentTurn) {
        throw new Error('Game turn order not initialized');
      }

      const currentTurnIndex = game.turnOrder.indexOf(game.currentTurn);
      const nextTurnIndex = (currentTurnIndex + 1) % game.turnOrder.length;
      const nextTurn = game.turnOrder[nextTurnIndex];

      await updateDoc(gameRef, {
        currentTurn: nextTurn,
        lastTurnChange: serverTimestamp()
      });

      websocketService.emit('next_turn', gameId);
    } catch (error) {
      console.error('Error changing turn:', error);
      throw error;
    }
  }

  async handleTurnTimeout(gameId: string): Promise<void> {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const game = gameDoc.data() as GameRoom;
      if (!game.turnOrder || !game.currentTurn) {
        throw new Error('Game turn order not initialized');
      }

      const currentTurnIndex = game.turnOrder.indexOf(game.currentTurn);
      const nextTurnIndex = (currentTurnIndex + 1) % game.turnOrder.length;
      const nextTurn = game.turnOrder[nextTurnIndex];

      await updateDoc(gameRef, {
        currentTurn: nextTurn,
        lastTurnChange: serverTimestamp()
      });

      websocketService.emit('next_turn', gameId);
    } catch (error) {
      console.error('Error handling turn timeout:', error);
      throw error;
    }
  }
}

export const gameService = new GameService(); 