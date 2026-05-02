import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from './AuthContext';
import type { BingoCell, GameRoom, Player, ChatMessage } from '../types/types';
import { PlayerEvent, RoomEvent, BoardEvent, ChatEvent } from '../types/events';

interface GameContextType {
  currentRoom: GameRoom | null;
  players: Player[];
  board: BingoCell[][];
  chatMessages: ChatMessage[];
  isHost: boolean;
  hasGameStarted: boolean;
  winner: Player | null;
  
  joinRoom: (roomId: string, password?: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  markCell: (row: number, col: number) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  checkWinner: (board: BingoCell[][]) => boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<BingoCell[][]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const { 
    joinRoom: wsJoinRoom, 
    leaveRoom: wsLeaveRoom, 
    markCell: wsMarkCell, 
    sendChat: wsSendChat, 
    ready: wsReady, 
    startGame: wsStartGame,
    on 
  } = useWebSocket(
    currentRoom?.id || '',
    currentUser?.uid || ''
  );

  useEffect(() => {
    if (!currentRoom?.id) return;

    const cleanupPlayer = on<PlayerEvent>('player', (event) => {
      const { player } = event.payload;
      setPlayers(prev => {
        if (event.type === 'player_join') {
          return [...prev, player];
        } else if (event.type === 'player_leave') {
          return prev.filter(p => p.id !== player.id);
        } else if (event.type === 'player_update') {
          return prev.map(p => p.id === player.id ? player : p);
        }
        return prev;
      });
    });

    const cleanupRoom = on<RoomEvent>('room', (event) => {
      const { room } = event.payload;
      setCurrentRoom(room);
      setIsHost(room.hostId === currentUser?.uid);
      setHasGameStarted(room.status === 'playing');
      if (room.status === 'finished' && room.winner) {
        setWinner(players.find(p => p.id === room.winner) || null);
      }
    });

    const cleanupBoard = on<BoardEvent>('board', (event) => {
      const { board: newBoard } = event.payload;
      if (newBoard) {
        // Convert flat array to 2D array
        const board2D: BingoCell[][] = [];
        for (let i = 0; i < 5; i++) {
          board2D[i] = newBoard.slice(i * 5, (i + 1) * 5);
        }
        setBoard(board2D);
      }
    });

    const cleanupChat = on<ChatEvent>('chat', (event) => {
      const { message } = event.payload;
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      cleanupPlayer();
      cleanupRoom();
      cleanupBoard();
      cleanupChat();
    };
  }, [currentRoom?.id, currentUser?.uid, on, players]);

  const joinRoom = async (roomId: string, password?: string) => {
    try {
      await wsJoinRoom(password);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    try {
      await wsLeaveRoom();
      setCurrentRoom(null);
      setPlayers([]);
      setBoard([]);
      setChatMessages([]);
      setIsHost(false);
      setHasGameStarted(false);
      setWinner(null);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  };

  const startGame = async () => {
    if (!isHost) {
      throw new Error('Only the host can start the game');
    }

    if (!currentRoom) {
      throw new Error('No active room');
    }

    if (players.length < 2) {
      throw new Error('Not enough players to start the game');
    }

    // Check if all players are ready
    const allPlayersReady = players.every(player => player.isReady);
    if (!allPlayersReady) {
      throw new Error('Not all players are ready');
    }

    try {
      // Emit a room event to start the game
      // This will be handled by the server to update the room status
      // and generate boards for all players
      wsStartGame(currentRoom.id);
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  };

  const markCell = async (row: number, col: number) => {
    try {
      const cellIndex = row * 5 + col;
      await wsMarkCell(cellIndex);
    } catch (error) {
      console.error('Failed to mark cell:', error);
      throw error;
    }
  };

  const sendChatMessage = async (message: string) => {
    try {
      await wsSendChat(message);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  };

  const checkWinner = (board: BingoCell[][]): boolean => {
    // Implementation will be added when we implement the win condition logic
    return false;
  };

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        players,
        board,
        chatMessages,
        isHost,
        hasGameStarted,
        winner,
        joinRoom,
        leaveRoom,
        startGame,
        markCell,
        sendChatMessage,
        checkWinner
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 