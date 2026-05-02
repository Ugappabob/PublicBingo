import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { templateService } from '../../services/templateService';
import { BingoBoard } from '../common/BingoBoard';
import Chat from '../common/Chat';
import { GameRoom, Template, BingoCell, Player } from '../../types/types';
import '../../styles/GamePage.css';

// Default empty board to use when player board is not available
const createEmptyBoard = (): BingoCell[] => {
  const emptyBoard: BingoCell[] = [];
  for (let i = 0; i < 25; i++) {
    emptyBoard.push({
      phrase: `Cell ${i + 1}`,
      marked: false,
      position: {
        row: Math.floor(i / 5),
        col: i % 5
      }
    });
  }
  return emptyBoard;
};

export const GamePage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const { currentUser } = useAuth();
  const { currentRoom, joinRoom, leaveRoom } = useGame();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningGame, setJoiningGame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerBoard, setPlayerBoard] = useState<BingoCell[]>(createEmptyBoard());
  const [playerExists, setPlayerExists] = useState(false);

  // Load template
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        setError('No template ID provided');
        setLoading(false);
        return;
      }

      try {
        const loadedTemplate = await templateService.getTemplate(templateId);
        if (!loadedTemplate) {
          setError('Template not found');
          setLoading(false);
          return;
        }
        setTemplate(loadedTemplate);
      } catch (err) {
        setError('Failed to load template');
        console.error('Error loading template:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  // Join game room
  useEffect(() => {
    if (!currentUser || !template) return;

    const joinGame = async () => {
      setJoiningGame(true);
      try {
        await joinRoom(template.id);
        setError(null);
      } catch (err) {
        console.error('Error joining game:', err);
        setError('Failed to join game');
      } finally {
        setJoiningGame(false);
      }
    };

    joinGame();

    return () => {
      if (currentRoom) {
        leaveRoom();
      }
    };
  }, [currentUser, template, joinRoom, leaveRoom, currentRoom]);

  // Update playerBoard when currentRoom changes
  useEffect(() => {
    if (!currentRoom || !currentUser) {
      setPlayerBoard(createEmptyBoard());
      setPlayerExists(false);
      return;
    }

    // Check if player exists in the room
    const playerId = currentUser.uid;
    const playerExistsInRoom = playerId in currentRoom.players;
    setPlayerExists(playerExistsInRoom);

    if (!playerExistsInRoom) {
      console.warn('Player not found in room:', playerId);
      setPlayerBoard(createEmptyBoard());
      return;
    }

    const currentPlayer = currentRoom.players[playerId];
    
    // Verify player has a board
    if (!currentPlayer || !currentPlayer.board || !Array.isArray(currentPlayer.board)) {
      console.warn('Player board is missing or invalid');
      setPlayerBoard(createEmptyBoard());
      return;
    }

    // Ensure each cell has the required position property
    const validBoard = currentPlayer.board.map((cell: BingoCell, index: number) => {
      if (!cell) {
        return {
          phrase: `Cell ${index + 1}`,
          marked: false,
          position: {
            row: Math.floor(index / 5),
            col: index % 5
          }
        };
      }
      
      return {
        ...cell,
        phrase: cell.phrase || `Cell ${index + 1}`,
        marked: cell.marked || false,
        position: cell.position && 
                 typeof cell.position.row === 'number' && 
                 typeof cell.position.col === 'number' 
          ? cell.position 
          : { row: Math.floor(index / 5), col: index % 5 }
      };
    });
    
    setPlayerBoard(validBoard);
  }, [currentRoom, currentUser]);

  // Show loading state while template is loading or joining game
  if (loading || joiningGame) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-message">
          {loading ? 'Loading game template...' : 'Joining game room...'}
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Show error if game room or template is not available
  if (!currentRoom || !template) {
    return (
      <div className="error-container">
        <div className="error-message">Game not found</div>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const isGamePlaying = currentRoom.status === 'playing';

  const handleCellClick = (index: number) => {
    if (!playerExists) {
      console.warn('Cannot mark cell: player not in game');
      return;
    }
    
    // Handle cell click
    console.log(`Cell clicked: ${index}`);
  };

  return (
    <div className="game-page">
      <div className="game-board">
        {playerExists ? (
          <BingoBoard
            cells={playerBoard}
            disabled={!isGamePlaying}
            onCellClick={handleCellClick}
          />
        ) : (
          <div className="waiting-message">
            <p>Waiting to join the game...</p>
            <div className="loading-spinner small"></div>
          </div>
        )}
      </div>
      <div className="game-chat">
        <Chat
          gameId={currentRoom.id}
          maxMessages={50}
          messageRateLimit={10}
          systemMessages={true}
        />
      </div>
    </div>
  );
}; 