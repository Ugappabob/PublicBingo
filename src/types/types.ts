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

export interface Player {
  id: string;
  name: string;
  board: BingoCell[];
  hasWon: boolean;
  isOnline: boolean;
  isReady: boolean;
  lastActive: number;
  joinedAt?: number;
  score?: number;
  gamesPlayed?: number;
  gamesWon?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

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

export interface Template {
  id: string;
  name: string;
  description: string;
  phrases: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isPublic: boolean;
  timesUsed: number;
  favoriteCount: number;
  favoritedBy: string[];
  tags: string[];
  createdBy: string;
  sharedWith: string[];
  shareLink?: string;
  settings: GameSettings;
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  host: Player;
  players: Record<string, Player>;
  phrases: string[];
  status: 'waiting' | 'playing' | 'finished' | 'paused';
  settings: GameSettings;
  createdAt: number;
  lastActive: number;
  winner?: string;
  winnerId?: string;
  gameStartedAt?: number;
  gameEndedAt?: number;
  messages?: ChatMessage[];
  isPrivate: boolean;
  password?: string;
  isPaused?: boolean;
  currentTurn?: string; // Player ID of whose turn it is
  turnOrder?: string[]; // Array of player IDs in turn order
  turnTimeout?: number; // Time in ms for turn timeout
  lastTurnChange?: number; // Timestamp of last turn change
}

export interface BingoBoardProps {
  board: BingoCell[];
  onCellClick: (index: number) => void;
}

export interface GameSettings {
  maxPlayers: number;
  duration: number;
  maxChatMessages: number;
  maxChatMessageRate: number;
  isPrivate: boolean;
  password?: string;
  phraseList: string;
  boardSize: number;
  winCondition: 'line' | 'full';
  allowGuestPlayers: boolean;
  autoStart: boolean;
  autoStartCount: number;
  autoEnd: boolean;
  autoEndTime: number;
  allowChat: boolean;
  allowPrivateChat: boolean;
  allowSpectators: boolean;
}

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  settings: GameSettings;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  timesUsed: number;
  tags: string[];
  phrases: string[];
  isPublic: boolean;
  isDefault: boolean;
  favoriteCount: number;
  favoritedBy: string[];
  sharedWith: string[];
  shareLink?: string;
} 