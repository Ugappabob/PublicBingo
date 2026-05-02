import type { BingoCell } from '../types/types';

// Check if a line of cells are all marked
const checkLine = (cells: BingoCell[]): boolean => {
  return cells.every(cell => cell.marked);
};

// Get all possible winning combinations
const getWinningCombinations = (): number[][] => {
  const combinations: number[][] = [];

  // Rows
  for (let i = 0; i < 5; i++) {
    combinations.push([i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4]);
  }

  // Columns
  for (let i = 0; i < 5; i++) {
    combinations.push([i, i + 5, i + 10, i + 15, i + 20]);
  }

  // Diagonals
  combinations.push([0, 6, 12, 18, 24]); // Top-left to bottom-right
  combinations.push([4, 8, 12, 16, 20]); // Top-right to bottom-left

  return combinations;
};

export const checkForWin = (cells: BingoCell[]): boolean => {
  const winningCombinations = getWinningCombinations();
  return winningCombinations.some(combination => checkLine(cells.filter((_, index) => combination.includes(index))));
};

// Get all completed lines
export const getCompletedLines = (cells: BingoCell[]): number[][] => {
  const winningCombinations = getWinningCombinations();
  return winningCombinations.filter(combination => checkLine(cells.filter((_, index) => combination.includes(index))));
};

// Check if specific cells form part of a winning line
export const isPartOfWinningLine = (cells: BingoCell[], cellIndex: number): boolean => {
  const completedLines = getCompletedLines(cells);
  return completedLines.some(line => line.includes(cellIndex));
}; 