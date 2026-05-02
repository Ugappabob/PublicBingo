import { BingoCell } from '../types/types';

/**
 * Validates if an object is a valid BingoCell
 * @param cell The object to validate
 * @returns True if the object is a valid BingoCell, false otherwise
 */
export function isValidBingoCell(cell: unknown): cell is BingoCell {
  if (!cell || typeof cell !== 'object') return false;
  
  // Type assertion for the cell object
  const cellObj = cell as Record<string, unknown>;
  
  // Check required properties
  if (typeof cellObj.phrase !== 'string') return false;
  if (typeof cellObj.marked !== 'boolean') return false;
  
  // Check optional properties if they exist
  if (cellObj.markedBy !== undefined && typeof cellObj.markedBy !== 'string') return false;
  if (cellObj.markedAt !== undefined && typeof cellObj.markedAt !== 'number') return false;
  
  // Check position if it exists
  if (cellObj.position !== undefined) {
    if (typeof cellObj.position !== 'object' || cellObj.position === null) return false;
    
    const position = cellObj.position as Record<string, unknown>;
    if (typeof position.row !== 'number') return false;
    if (typeof position.col !== 'number') return false;
  }
  
  return true;
}

/**
 * Ensures a BingoCell has a valid position property
 * @param cell The BingoCell to validate
 * @param index The index of the cell in the board array
 * @param boardSize The size of the board (default: 5)
 * @returns A new BingoCell with a valid position property
 */
export function ensureValidPosition(
  cell: BingoCell, 
  index: number, 
  boardSize = 5
): BingoCell {
  // If cell already has a valid position, return it as is
  if (cell.position && 
      typeof cell.position.row === 'number' && 
      typeof cell.position.col === 'number' &&
      cell.position.row >= 0 && 
      cell.position.row < boardSize &&
      cell.position.col >= 0 && 
      cell.position.col < boardSize) {
    return cell;
  }
  
  // Calculate position based on index
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  
  // Return a new cell with the calculated position
  return {
    ...cell,
    position: { row, col }
  };
}

/**
 * Validates an array of BingoCell objects
 * @param cells The array to validate
 * @param boardSize The expected size of the board
 * @returns True if all cells are valid, false otherwise
 */
export function isValidBingoBoard(cells: unknown[], boardSize = 5): boolean {
  if (!Array.isArray(cells) || cells.length !== boardSize * boardSize) {
    return false;
  }
  
  return cells.every((cell, index) => {
    const isValid = isValidBingoCell(cell);
    if (!isValid) {
      console.warn(`Invalid BingoCell at index ${index}:`, cell);
    }
    return isValid;
  });
}

/**
 * Calculates a hash of a board to check for uniqueness
 * @param board The board to hash
 * @returns A string hash of the board
 */
export function calculateBoardHash(board: BingoCell[]): string {
  // Create a string representation of the board's phrases in order
  return board.map(cell => cell.phrase).join('|');
}

/**
 * Checks if a board is unique compared to existing boards
 * @param board The board to check
 * @param existingBoards Array of existing boards to compare against
 * @returns True if the board is unique, false otherwise
 */
export function isUniqueBoard(board: BingoCell[], existingBoards: BingoCell[][]): boolean {
  if (!isValidBingoBoard(board)) {
    console.warn('Invalid board provided to isUniqueBoard');
    return false;
  }
  
  const boardHash = calculateBoardHash(board);
  
  // Check if this board hash already exists
  return !existingBoards.some(existingBoard => 
    calculateBoardHash(existingBoard) === boardHash
  );
}

/**
 * Validates that all boards in a collection are unique
 * @param boards Array of boards to validate
 * @returns True if all boards are unique, false otherwise
 */
export function areBoardsUnique(boards: BingoCell[][]): boolean {
  if (!Array.isArray(boards) || boards.length === 0) {
    return false;
  }
  
  // Check that all boards are valid
  if (!boards.every(board => isValidBingoBoard(board))) {
    return false;
  }
  
  // Check for duplicates
  const hashes = new Set<string>();
  
  for (const board of boards) {
    const hash = calculateBoardHash(board);
    if (hashes.has(hash)) {
      console.warn('Duplicate board found');
      return false;
    }
    hashes.add(hash);
  }
  
  return true;
} 