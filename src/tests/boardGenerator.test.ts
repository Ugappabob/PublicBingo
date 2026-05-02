import { generateBoard, generateMultipleBoards, generateUniquePlayerBoard } from '../utils/boardGenerator';
import { areBoardsUnique, isValidBingoBoard } from '../utils/typeUtils';

describe('Board Generator', () => {
  const testPhrases = [
    'Phrase 1', 'Phrase 2', 'Phrase 3', 'Phrase 4', 'Phrase 5',
    'Phrase 6', 'Phrase 7', 'Phrase 8', 'Phrase 9', 'Phrase 10',
    'Phrase 11', 'Phrase 12', 'Phrase 13', 'Phrase 14', 'Phrase 15',
    'Phrase 16', 'Phrase 17', 'Phrase 18', 'Phrase 19', 'Phrase 20',
    'Phrase 21', 'Phrase 22', 'Phrase 23', 'Phrase 24', 'Phrase 25'
  ];

  test('generateBoard creates a valid board', () => {
    const board = generateBoard(testPhrases);
    
    // Check that the board has the correct structure
    expect(board).toHaveLength(25);
    expect(isValidBingoBoard(board)).toBe(true);
    
    // Check that all cells have the required properties (center is pre-marked)
    board.forEach((cell, index) => {
      expect(cell.phrase).toBeDefined();
      const isCenter = index === 12;
      expect(cell.marked).toBe(isCenter);
      expect(cell.position).toBeDefined();
      expect(cell.position?.row).toBe(Math.floor(index / 5));
      expect(cell.position?.col).toBe(index % 5);
    });
  });

  test('generateMultipleBoards creates unique boards', () => {
    const count = 5;
    const boards = generateMultipleBoards(testPhrases, count);
    
    // Check that we got the requested number of boards
    expect(boards).toHaveLength(count);
    
    // Check that all boards are valid
    boards.forEach(board => {
      expect(isValidBingoBoard(board)).toBe(true);
    });
    
    // Check that all boards are unique
    expect(areBoardsUnique(boards)).toBe(true);
  });

  test('generateUniquePlayerBoard creates a unique board', () => {
    // Create some existing boards
    const existingBoards = [
      generateBoard(testPhrases),
      generateBoard(testPhrases)
    ];
    
    // Generate a new unique board
    const newBoard = generateUniquePlayerBoard(testPhrases, existingBoards);
    
    // Check that the new board is valid
    expect(isValidBingoBoard(newBoard)).toBe(true);
    
    // Check that the new board is unique
    const allBoards = [...existingBoards, newBoard];
    expect(areBoardsUnique(allBoards)).toBe(true);
  });

  test('board generation handles insufficient phrases', () => {
    // Create a list with fewer than 25 phrases
    const insufficientPhrases = testPhrases.slice(0, 10);
    
    // Generate a board
    const board = generateBoard(insufficientPhrases);
    
    // Check that the board has the correct structure
    expect(board).toHaveLength(25);
    
    // Non-center cells after phrases are exhausted should be empty; center stays Free
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        expect(board[i].phrase).toBe('Free');
      } else {
        expect(board[i].phrase).not.toBe('Free');
      }
    }
    const nonCenter = board.filter((_, i) => i !== 12);
    const fromList = nonCenter.filter(c =>
      insufficientPhrases.includes(c.phrase)
    );
    expect(fromList.length).toBeLessThanOrEqual(10);
    expect(nonCenter.every(c => c.phrase === '' || insufficientPhrases.includes(c.phrase))).toBe(true);
  });
}); 