import { BingoCell } from '../types/types';

export function generateBoard(phrases: string[]): BingoCell[] {
  if (!Array.isArray(phrases) || phrases.length === 0) {
    throw new Error('Invalid phrases array provided to generateBoard');
  }

  const shuffledPhrases = [...phrases].sort(() => Math.random() - 0.5);
  const cells: BingoCell[] = [];

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      cells.push({
        phrase: shuffledPhrases[index % shuffledPhrases.length],
        marked: false,
        position: { row, col }
      });
    }
  }

  return cells;
} 