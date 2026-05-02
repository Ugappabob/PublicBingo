import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import type { PhraseList, BingoCell } from '../../types/types';
import { generateBoard } from '../../utils/boardGenerator';
import { checkForWin } from '../../utils/gameLogic';
import BingoWinCelebration from '../common/BingoWinCelebration';
import { BingoBoard } from '../common/BingoBoard';
import PhraseListSelector from '../common/PhraseListSelector';

interface GameSetupProps {
  onGameStart: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
  const [selectedList, setSelectedList] = useState<PhraseList | null>(null);
  const [board, setBoard] = useState<BingoCell[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [error, setError] = useState<string>('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleListSelect = (list: PhraseList) => {
    if (list.phrases.length < 25) {
      setError('This list needs at least 25 phrases to play bingo.');
      return;
    }

    setSelectedList(list);
    const newBoard = generateBoard(list.phrases);
    setBoard(newBoard);
    setError('');
  };

  const handleCellClick = (index: number) => {
    const newBoard = [...board];
    newBoard[index] = {
      ...newBoard[index],
      marked: !newBoard[index].marked,
      markedBy: currentUser?.uid,
      markedAt: Date.now()
    };
    setBoard(newBoard);

    if (checkForWin(newBoard)) {
      setHasWon(true);
      onGameStart();
    }
  };

  return (
    <div className="game-setup">
      {error && <div className="error-message">{error}</div>}
      {!selectedList ? (
        <PhraseListSelector onSelectList={handleListSelect} />
      ) : (
        <div className="game-board">
          <h2>{selectedList.name}</h2>
          <BingoBoard cells={board} onCellClick={handleCellClick} />
          {hasWon && <BingoWinCelebration />}
          <button onClick={() => setSelectedList(null)}>Change List</button>
        </div>
      )}
    </div>
  );
};

export default GameSetup; 