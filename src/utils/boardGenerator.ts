import type { BingoCell } from '../types/types';
import { calculateBoardHash, isUniqueBoard } from './typeUtils';

// Shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate a bingo board from a list of phrases
export const generateBoard = (phrases: string[]): BingoCell[] => {
  console.log('generateBoard called with phrases:', phrases);
  console.log('Phrases length:', phrases.length);
  console.log('First few phrases:', phrases.slice(0, 5));
  
  // We need 24 unique phrases (25 cells - 1 center "Free" cell)
  const shuffledPhrases = shuffleArray(phrases);
  console.log('Shuffled phrases:', shuffledPhrases.slice(0, 5));
  const cells: BingoCell[] = [];
  let phraseIndex = 0;

  for (let i = 0; i < 25; i++) {
    // Center cell (index 12) should always be "Free"
    const isCenterCell = i === 12;
    let phrase: string;
    
    if (isCenterCell) {
      phrase = 'Free';
      console.log('Setting center cell (index 12) to "Free"');
    } else {
      // Use the next phrase from our shuffled list; empty if we ran out
      phrase =
        phraseIndex < shuffledPhrases.length ? shuffledPhrases[phraseIndex] : '';
      phraseIndex++;
    }
    
    cells.push({
      phrase: phrase,
      marked: isCenterCell, // Center cell starts marked
      markedBy: isCenterCell ? 'system' : undefined,
      markedAt: isCenterCell ? Date.now() : undefined, // Use timestamp number instead of ISO string
      position: {
        row: Math.floor(i / 5),
        col: i % 5
      }
    });
  }

  return cells;
};

// Generate multiple unique boards from the same phrase list
export const generateMultipleBoards = (phrases: string[], count: number): BingoCell[][] => {
  const boards: BingoCell[][] = [];
  const maxAttempts = 100; // Prevent infinite loops
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let newBoard: BingoCell[];
    
    // Keep trying until we get a unique board or hit the max attempts
    do {
      newBoard = generateBoard(phrases);
      attempts++;
      
      // If we've tried too many times, just use the last generated board
      if (attempts >= maxAttempts) {
        console.warn(`Could not generate a unique board after ${maxAttempts} attempts. Using last generated board.`);
        break;
      }
    } while (!isUniqueBoard(newBoard, boards));
    
    boards.push(newBoard);
  }
  
  return boards;
};

// Generate a unique board for a player
export const generateUniquePlayerBoard = (phrases: string[], existingBoards: BingoCell[][]): BingoCell[] => {
  const maxAttempts = 100; // Prevent infinite loops
  let attempts = 0;
  let newBoard: BingoCell[];
  
  // Keep trying until we get a unique board or hit the max attempts
  do {
    newBoard = generateBoard(phrases);
    attempts++;
    
    // If we've tried too many times, just use the last generated board
    if (attempts >= maxAttempts) {
      console.warn(`Could not generate a unique board after ${maxAttempts} attempts. Using last generated board.`);
      break;
    }
  } while (!isUniqueBoard(newBoard, existingBoards));
  
  return newBoard;
}; 