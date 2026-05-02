/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array The array to shuffle
 * @returns {Array} A new shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a 5x5 bingo board from a list of phrases
 * @param {Array<string>} phrases List of phrases to use
 * @param {boolean} useCenter Whether to use "FREE" in the center (default: true)
 * @returns {Array<Array<{text: string, marked: boolean}>>} 5x5 2D array of cells
 * @throws {Error} If not enough phrases are provided
 */
export function generateBoard(phrases, useCenter = true) {
  if (!Array.isArray(phrases)) {
    throw new Error('Phrases must be an array');
  }

  const minPhrases = useCenter ? 24 : 25;
  if (phrases.length < minPhrases) {
    throw new Error(`Need at least ${minPhrases} phrases to generate a board`);
  }

  // Shuffle the phrases
  const shuffledPhrases = shuffleArray(phrases);
  
  // Create 5x5 board
  const board = Array(5).fill(null).map(() => Array(5).fill(null));
  let phraseIndex = 0;

  // Fill the board
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // If using center space and we're at the center
      if (useCenter && row === 2 && col === 2) {
        board[row][col] = {
          text: 'FREE',
          marked: true,
          isCenter: true
        };
      } else {
        board[row][col] = {
          text: shuffledPhrases[phraseIndex],
          marked: false,
          isCenter: false
        };
        phraseIndex++;
      }
    }
  }

  return board;
}

/**
 * Checks if a board has a winning combination
 * @param {Array<Array<{text: string, marked: boolean}>>} board The board to check
 * @returns {boolean} Whether the board has a winning combination
 */
export function checkWin(board) {
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (board[row].every(cell => cell.marked)) {
      return true;
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (board.every(row => row[col].marked)) {
      return true;
    }
  }

  // Check diagonals
  const diagonal1 = Array(5).fill().every((_, i) => board[i][i].marked);
  const diagonal2 = Array(5).fill().every((_, i) => board[i][4 - i].marked);

  return diagonal1 || diagonal2;
}

/**
 * Creates a unique identifier for a board configuration
 * @param {Array<Array<{text: string, marked: boolean}>>} board The board to hash
 * @returns {string} A unique identifier for the board
 */
export function getBoardHash(board) {
  return board.flat().map(cell => cell.text).join('|');
} 