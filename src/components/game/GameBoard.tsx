import React, { useEffect, useState } from 'react';
import { BingoCell } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';
import { BingoBoard } from '../common/BingoBoard';
import '../../styles/components/GameBoard.css';
import { checkForWin } from '../../utils/gameLogic';

interface GameBoardProps {
  cells: BingoCell[][];
  onCellClick: (row: number, col: number) => void;
  loadingMessage?: string;
  errorMessage?: string;
  isUpdating?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cells,
  onCellClick,
  loadingMessage = 'Loading board...',
  errorMessage,
  isUpdating = false
}) => {
  const { currentUser } = useAuth();
  const [hasWon, setHasWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedCell, setLastUpdatedCell] = useState<{row: number, col: number} | null>(null);

  useEffect(() => {
    if (cells && cells.length > 0) {
      setIsLoading(false);
      // Check for win condition
      const hasWinningCombination = checkForWin(cells);
      setHasWon(hasWinningCombination);
    }
  }, [cells]);

  const checkForWin = (board: BingoCell[][]): boolean => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (board[i].every(cell => cell.marked)) return true;
    }

    // Check columns
    for (let j = 0; j < 5; j++) {
      if (board.every(row => row[j].marked)) return true;
    }

    // Check diagonals
    const diagonal1 = board.every((row, i) => row[i].marked);
    const diagonal2 = board.every((row, i) => row[4 - i].marked);

    return diagonal1 || diagonal2;
  };

  // Convert 2D array to 1D array for BingoBoard component
  const flattenedCells = cells.flat();

  // Convert row/col click handler to index-based handler
  const handleCellClick = (index: number) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    setLastUpdatedCell({ row, col });
    onCellClick(row, col);
  };

  return (
    <div className="game-board-container">
      <div className={`game-board-wrapper ${isUpdating ? 'updating' : ''}`}>
        <BingoBoard
          cells={flattenedCells}
          onCellClick={handleCellClick}
          loadingMessage={loadingMessage}
          errorMessage={errorMessage}
          disabled={isUpdating}
          className={lastUpdatedCell ? `highlight-cell-${lastUpdatedCell.row}-${lastUpdatedCell.col}` : ''}
        />
        {isUpdating && (
          <div className="updating-overlay">
            <div className="updating-spinner"></div>
            <div className="updating-message">Updating board...</div>
          </div>
        )}
      </div>
      {hasWon && currentUser && (
        <div className="win-message">
          <h2>BINGO!</h2>
          <p>Congratulations {currentUser.displayName || 'Player'}! You've won!</p>
        </div>
      )}
      {errorMessage && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{errorMessage}</div>
        </div>
      )}
    </div>
  );
}; 