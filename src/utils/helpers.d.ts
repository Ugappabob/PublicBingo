// This file is here to satisfy TypeScript module resolution.
export function generateBoard(phrases: string[]): BingoCell[];
export function checkWin(board: BingoCell[]): boolean;
export function shuffleArray<T>(array: T[]): T[];
export function formatDate(date: Date): string;
export function formatTime(date: Date): string;
export function formatDateTime(date: Date): string;
export function truncateText(text: string, maxLength: number): string;
export function generateShareLink(phraseListId: string): string;
export function copyToClipboard(text: string): Promise<void>;
export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
export function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void; 