import { GameSettings } from './types';

export interface DashboardStats {
  totalGames: number;
  activePlayers: number;
  completedGames: number;
  averageGameDuration: number; // in seconds
  winRate: number; // percentage
  templates: Array<{
    id: string;
    name: string;
    phraseCount: number;
    timesUsed: number;
  }>;
  recentGames: Array<{
    id: string;
    startTime: Date;
    playerCount: number;
    status: 'active' | 'completed' | 'cancelled';
  }>;
}

export interface GameReport {
  gameId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  players: Array<{
    id: string;
    name: string;
    joinTime: Date;
    leaveTime?: Date;
    score: number;
    isWinner: boolean;
  }>;
  events: Array<{
    type: string;
    timestamp: Date;
    playerId?: string;
    data?: Record<string, unknown>;
  }>;
  winner?: {
    playerId: string;
    winningTime: Date;
    boardState: Array<{
      phrase: string;
      marked: boolean;
      position: number;
    }>;
  };
  settings: GameSettings & {
    templateId: string;
    maxPlayers: number;
    gameDuration: number; // in seconds
    winCondition: 'line' | 'blackout';
  };
} 