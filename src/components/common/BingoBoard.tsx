import React from 'react';
import type { BingoCell } from '../../types/types';
import '../../styles/components/BingoBoard.css';

export interface BingoBoardProps {
  cells: BingoCell[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  /** Extra classes on the grid root (e.g. highlight helpers from GameBoard). */
  className?: string;
}

/**
 * Shared 5×5 bingo grid: phrase cells, marked state, free space styling.
 * Used by SimpleGameRoom, GameBoard, GameSetup, and GamePage.
 */
export const BingoBoard: React.FC<BingoBoardProps> = ({
  cells,
  onCellClick,
  disabled = false,
  loadingMessage = 'Loading board...',
  errorMessage,
  className = '',
}) => {
  if (errorMessage) {
    return (
      <div className={`bingo-board error ${className}`.trim()}>
        <div className="error-message">{errorMessage}</div>
      </div>
    );
  }

  if (!cells || cells.length === 0) {
    return (
      <div className={`bingo-board loading ${className}`.trim()}>
        <div className="loading-spinner" />
        <div className="loading-message">{loadingMessage}</div>
      </div>
    );
  }

  const handleClick = (index: number) => {
    if (disabled) return;
    onCellClick(index);
  };

  const rootClass = ['bingo-board', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {cells.map((cell, index) => {
        const phrase = cell?.phrase ?? '';
        const isFree = phrase === 'Free';
        const marked = Boolean(cell?.marked);
        return (
          <div
            key={index}
            className={`bingo-cell ${marked ? 'marked' : ''} ${isFree ? 'free-space' : ''} ${
              disabled ? 'disabled' : ''
            }`.trim()}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(index);
              }
            }}
            role="gridcell"
            tabIndex={disabled ? -1 : 0}
          >
            <div className="cell-content">{phrase}</div>
            {marked && <div className="cell-marker">✓</div>}
          </div>
        );
      })}
    </div>
  );
};

export default BingoBoard;
