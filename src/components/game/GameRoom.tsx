import React, { useEffect, useState } from 'react';
import { GameBoard } from './GameBoard';
import { gameService } from '../../services/game';
import { useAuth } from '../../contexts/AuthContext';
import type { GameRoom, Player, BingoCell } from '../../types/types';
import { generateUniquePlayerBoard } from '../../utils/boardGenerator';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/index';

interface GameRoomProps {
  gameId: string;
}

export const GameRoomComponent: React.FC<GameRoomProps> = ({ gameId }) => {
  const { currentUser } = useAuth();
  const [game, setGame] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedCell, setLastUpdatedCell] = useState<{row: number, col: number} | null>(null);

  // Function to fetch the latest game state
  const fetchGameState = async () => {
    try {
      const gameState = await gameService.getGameState(gameId);
      if (gameState) {
        setGame(gameState);
      }
    } catch (err) {
      console.error('Failed to fetch game state:', err);
    }
  };

  // Set up polling for game state updates
  useEffect(() => {
    if (!gameId) return;
    
    // Initial fetch
    fetchGameState();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchGameState, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [gameId]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!gameId) {
          throw new Error('Game ID is required');
        }

        // Get initial game state
        const gameState = await gameService.getGameState(gameId);
        if (!gameState) {
          throw new Error('Game not found');
        }

        // If user is not already a player, add them
        if (currentUser && !gameState.players[currentUser.uid]) {
          const existingBoards = Object.values(gameState.players)
            .map((p) => p.board)
            .filter((b): b is BingoCell[] => Array.isArray(b) && b.length > 0);
          const newPlayer: Player = {
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            board: generateUniquePlayerBoard(gameState.phrases, existingBoards),
            hasWon: false,
            isOnline: true,
            isReady: false,
            lastActive: Date.now()
          };

          // Update game state with new player
          const updatedGame: GameRoom = {
            ...gameState,
            players: {
              ...gameState.players,
              [currentUser.uid]: newPlayer
            }
          };

          // Join the game with password if it's a private game
          await gameService.joinGame(gameId, gameState.isPrivate ? gameState.password : undefined);
          
          // Update the game state in Firestore
          await gameService.updateGameState(gameId, {
            players: updatedGame.players
          });
          
          setGame(updatedGame);
        } else {
          setGame(gameState);
        }
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError('Failed to join game');
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, [gameId, currentUser]);

  const handleCellClick = async (row: number, col: number) => {
    if (!game || !currentUser) return;

    try {
      setIsUpdating(true);
      setLastUpdatedCell({ row, col });
      
      const player = game.players[currentUser.uid];
      if (!player) return;

      // Convert 1D array index to 2D board position
      const boardSize = 5;
      const index = row * boardSize + col;
      const newBoard = [...player.board];
      
      if (index >= 0 && index < newBoard.length) {
        newBoard[index] = {
          ...newBoard[index],
          marked: !newBoard[index].marked,
          markedBy: currentUser.uid,
          markedAt: Date.now()
        };
      }

      // Update the player's board in the game state
      const updatedPlayers = {
        ...game.players,
        [currentUser.uid]: {
          ...player,
          board: newBoard
        }
      };

      // Update the game state in Firestore
      await gameService.updateGameState(gameId, {
        players: updatedPlayers
      });
      
      // Update local state
      setGame(prevGame => {
        if (!prevGame) return null;
        return {
          ...prevGame,
          players: updatedPlayers
        };
      });
      
      // Check for win condition
      checkWinCondition(newBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cell');
    } finally {
      setIsUpdating(false);
    }
  };

  const checkWinCondition = (board: BingoCell[]) => {
    // Simple win condition check - can be expanded for more complex patterns
    const rows = Array(5).fill(0).map((_, i) => board.slice(i * 5, (i + 1) * 5));
    const cols = Array(5).fill(0).map((_, i) => [board[i], board[i + 5], board[i + 10], board[i + 15], board[i + 20]]);
    const diagonals = [
      [board[0], board[6], board[12], board[18], board[24]], // Top-left to bottom-right
      [board[4], board[8], board[12], board[16], board[20]]  // Top-right to bottom-left
    ];
    
    // Check rows, columns, and diagonals
    const hasWon = [...rows, ...cols, ...diagonals].some(line => 
      line.every(cell => cell.marked)
    );
    
    if (hasWon && currentUser) {
      // Update player's hasWon status
      const updatedPlayers = {
        ...game!.players,
        [currentUser.uid]: {
          ...game!.players[currentUser.uid],
          hasWon: true
        }
      };
      
      // Update game status to finished
      gameService.updateGameState(gameId, {
        status: 'finished',
        winner: currentUser.displayName || 'Anonymous',
        winnerId: currentUser.uid,
        gameEndedAt: Date.now(),
        players: updatedPlayers
      });
    }
  };

  if (loading) {
    return <div className="loading-container">Loading game...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!game) {
    return <div className="error-container">Game not found</div>;
  }

  const currentPlayer = currentUser ? game.players[currentUser.uid] : null;
  if (!currentPlayer) {
    return <div className="error-container">Player not found in game</div>;
  }

  // Convert 1D array to 2D array for the board
  const boardSize = 5;
  const board2D: BingoCell[][] = Array(boardSize)
    .fill(null)
    .map((_, row) =>
      currentPlayer.board.slice(row * boardSize, (row + 1) * boardSize)
    );

  return (
    <div className="game-room">
      <h2>{game.name}</h2>
      <div className="game-status">
        <p>Status: {game.status}</p>
        {game.status === 'finished' && game.winner && (
          <p className="winner-message">Winner: {game.winner}</p>
        )}
      </div>
      <GameBoard
        cells={board2D}
        onCellClick={handleCellClick}
        isUpdating={isUpdating}
        loadingMessage={loading ? 'Loading game...' : undefined}
        errorMessage={error || undefined}
      />
    </div>
  );
}; 