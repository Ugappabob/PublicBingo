import type { BingoCell, GameRoom, Player, ChatMessage } from '../types/types';

export interface GameContextType {
  currentRoom: GameRoom | null;
  players: Player[];
  board: BingoCell[][];
  chatMessages: ChatMessage[];
  isHost: boolean;
  hasGameStarted: boolean;
  winner: Player | null;
  
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  markCell: (row: number, col: number) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  checkWinner: (board: BingoCell[][]) => boolean;
}

declare const GameContext: React.Context<GameContextType>;
export default GameContext; 