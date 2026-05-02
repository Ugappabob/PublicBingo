// This file is here to satisfy TypeScript module resolution.
export * from './types';

export interface PhraseList {
  id: string;
  name: string;
  description: string;
  phrases: string[];
  userId: string;
  createdAt: Date;
  isTemplate: boolean;
  isPublic: boolean;
  timesUsed: number;
  favoriteCount: number;
  favoritedBy: string[];
  tags: string[];
  createdBy: string;
  sharedWith: string[];
  shareLink?: string;
}

export interface BingoCell {
  phrase: string;
  marked: boolean;
  markedBy?: string;
  markedAt?: number;
  /**
   * Position of the cell on the board (row, col).
   * This property is optional but recommended for proper board rendering.
   * If not provided, the position will be calculated based on the cell's index in the array.
   */
  position?: {
    row: number;
    col: number;
  };
}

export function isValidBingoCell(cell: any): cell is BingoCell {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    typeof cell.phrase === 'string' &&
    typeof cell.marked === 'boolean' &&
    (cell.position === undefined || (
      typeof cell.position === 'object' &&
      cell.position !== null &&
      typeof cell.position.row === 'number' &&
      typeof cell.position.col === 'number' &&
      cell.position.row >= 0 &&
      cell.position.row < 5 &&
      cell.position.col >= 0 &&
      cell.position.col < 5
    ))
  );
}

export interface GameRoom {
  id: string;
  name: string;
  host: string;
  players: Player[];
  board: BingoCell[];
  chatMessages: ChatMessage[];
  settings: GameSettings;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  lastActive: number;
  createdAt: number;
  updatedAt: number;
}

export interface Player {
  id: string;
  name: string;
  board: BingoCell[];
  hasWon: boolean;
  isOnline: boolean;
  isReady: boolean;
  lastActive: number;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  settings: GameSettings;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
} 