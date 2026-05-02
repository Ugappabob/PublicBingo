import { checkForWin, getCompletedLines, isPartOfWinningLine } from '../utils/gameLogic';
import type { BingoCell } from '../types/types';

describe('Game Logic', () => {
  let emptyBoard: BingoCell[];
  let testBoard: BingoCell[];

  beforeEach(() => {
    // Create an empty 5x5 board
    emptyBoard = Array(25).fill(null).map((_, index) => ({
      phrase: `Phrase ${index + 1}`,
      marked: false,
      position: {
        row: Math.floor(index / 5),
        col: index % 5
      }
    }));

    // Create a test board with some marked cells
    testBoard = [...emptyBoard];
  });

  describe('Win Condition Detection', () => {
    test('should detect no win on empty board', () => {
      expect(checkForWin(emptyBoard)).toBe(false);
    });

    test('should detect horizontal win (first row)', () => {
      // Mark first row (cells 0-4)
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true;
      }
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should detect horizontal win (middle row)', () => {
      // Mark third row (cells 10-14)
      for (let i = 10; i < 15; i++) {
        testBoard[i].marked = true;
      }
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should detect vertical win (first column)', () => {
      // Mark first column (cells 0, 5, 10, 15, 20)
      testBoard[0].marked = true;
      testBoard[5].marked = true;
      testBoard[10].marked = true;
      testBoard[15].marked = true;
      testBoard[20].marked = true;
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should detect vertical win (middle column)', () => {
      // Mark third column (cells 2, 7, 12, 17, 22)
      testBoard[2].marked = true;
      testBoard[7].marked = true;
      testBoard[12].marked = true;
      testBoard[17].marked = true;
      testBoard[22].marked = true;
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should detect diagonal win (top-left to bottom-right)', () => {
      // Mark diagonal: 0, 6, 12, 18, 24
      testBoard[0].marked = true;
      testBoard[6].marked = true;
      testBoard[12].marked = true;
      testBoard[18].marked = true;
      testBoard[24].marked = true;
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should detect diagonal win (top-right to bottom-left)', () => {
      // Mark diagonal: 4, 8, 12, 16, 20
      testBoard[4].marked = true;
      testBoard[8].marked = true;
      testBoard[12].marked = true;
      testBoard[16].marked = true;
      testBoard[20].marked = true;
      expect(checkForWin(testBoard)).toBe(true);
    });

    test('should not detect win with incomplete line', () => {
      // Mark only 4 cells in first row
      for (let i = 0; i < 4; i++) {
        testBoard[i].marked = true;
      }
      expect(checkForWin(testBoard)).toBe(false);
    });

    test('should not detect win with scattered marked cells', () => {
      // Mark random cells
      testBoard[0].marked = true;
      testBoard[7].marked = true;
      testBoard[13].marked = true;
      testBoard[19].marked = true;
      testBoard[24].marked = true;
      expect(checkForWin(testBoard)).toBe(false);
    });
  });

  describe('Completed Lines Detection', () => {
    test('should return empty array for no completed lines', () => {
      const completedLines = getCompletedLines(emptyBoard);
      expect(completedLines).toEqual([]);
    });

    test('should detect single completed horizontal line', () => {
      // Mark first row
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true;
      }
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 1, 2, 3, 4]);
    });

    test('should detect single completed vertical line', () => {
      // Mark first column
      testBoard[0].marked = true;
      testBoard[5].marked = true;
      testBoard[10].marked = true;
      testBoard[15].marked = true;
      testBoard[20].marked = true;
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 5, 10, 15, 20]);
    });

    test('should detect multiple completed lines', () => {
      // Mark first row and first column
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true; // First row
        testBoard[i * 5].marked = true; // First column
      }
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines).toHaveLength(2);
      expect(completedLines).toContainEqual([0, 1, 2, 3, 4]); // First row
      expect(completedLines).toContainEqual([0, 5, 10, 15, 20]); // First column
    });

    test('should detect diagonal completed line', () => {
      // Mark diagonal from top-left to bottom-right
      testBoard[0].marked = true;
      testBoard[6].marked = true;
      testBoard[12].marked = true;
      testBoard[18].marked = true;
      testBoard[24].marked = true;
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines).toHaveLength(1);
      expect(completedLines[0]).toEqual([0, 6, 12, 18, 24]);
    });
  });

  describe('Winning Line Membership', () => {
    test('should identify cell as part of winning line', () => {
      // Mark first row
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true;
      }
      expect(isPartOfWinningLine(testBoard, 0)).toBe(true);
      expect(isPartOfWinningLine(testBoard, 2)).toBe(true);
      expect(isPartOfWinningLine(testBoard, 4)).toBe(true);
    });

    test('should identify cell as not part of winning line', () => {
      // Mark first row
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true;
      }
      expect(isPartOfWinningLine(testBoard, 5)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 10)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 24)).toBe(false);
    });

    test('should handle cell not in any winning line', () => {
      // Mark random cells (no winning line)
      testBoard[0].marked = true;
      testBoard[7].marked = true;
      testBoard[13].marked = true;
      expect(isPartOfWinningLine(testBoard, 0)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 7)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 13)).toBe(false);
    });

    test('should handle cell in multiple winning lines', () => {
      // Mark first row and first column (cell 0 is in both)
      for (let i = 0; i < 5; i++) {
        testBoard[i].marked = true; // First row
        testBoard[i * 5].marked = true; // First column
      }
      expect(isPartOfWinningLine(testBoard, 0)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle board with all cells marked', () => {
      testBoard.forEach(cell => cell.marked = true);
      expect(checkForWin(testBoard)).toBe(true);
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines.length).toBeGreaterThan(0);
    });

    test('should handle board with only one cell marked', () => {
      testBoard[12].marked = true; // Center cell
      expect(checkForWin(testBoard)).toBe(false);
      const completedLines = getCompletedLines(testBoard);
      expect(completedLines).toEqual([]);
    });

    test('should handle invalid cell index', () => {
      expect(isPartOfWinningLine(testBoard, -1)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 25)).toBe(false);
      expect(isPartOfWinningLine(testBoard, 100)).toBe(false);
    });
  });
});
