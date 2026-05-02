import type { BingoCell, GameRoom, Player } from '../types/types';

export function generateBoard(phrases: string[]): BingoCell[][];
export function shuffleArray<T>(array: T[]): T[];
export function formatTimestamp(timestamp: number): string;
export function calculateTimeLeft(endTime: number): number;
export function isPlayerOnline(lastActive: number): boolean;
export function generateRoomCode(): string;
export function checkBingoWin(board: BingoCell[][]): boolean;
export function getPlayerStats(player: Player): {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
}; 