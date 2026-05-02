import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { GameRoomComponent } from '../components/game/GameRoom';
import { gameService } from '../services/game';
import type { BingoCell, GameRoom, Player } from '../types/types';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { 
      uid: 'test-user-id', 
      email: 'test@example.com',
      displayName: 'Test User'
    },
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn()
  })
}));

// Mock the game service
jest.mock('../services/game', () => ({
  gameService: {
    getGameState: jest.fn(),
    updateGameState: jest.fn(),
    joinGame: jest.fn(),
    leaveGame: jest.fn(),
    startGame: jest.fn()
  }
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock board generator
jest.mock('../utils/boardGenerator', () => ({
  generateUniquePlayerBoard: jest.fn((phrases) => {
    return Array(25).fill(null).map((_, index) => ({
      phrase: phrases[index] || `Phrase ${index + 1}`,
      marked: false,
      position: {
        row: Math.floor(index / 5),
        col: index % 5
      }
    }));
  })
}));

// TODO: Rewrite against gameService + current GameRoomComponent props/effects (mocks pointed at ../services/game).
describe.skip('GameRoom Component', () => {
  let mockGame: GameRoom;
  let mockPlayer: Player;
  let mockBoard: BingoCell[];

  beforeEach(() => {
    // Create mock board
    mockBoard = Array(25).fill(null).map((_, index) => ({
      phrase: `Phrase ${index + 1}`,
      marked: false,
      position: {
        row: Math.floor(index / 5),
        col: index % 5
      }
    }));

    // Create mock player
    mockPlayer = {
      id: 'test-user-id',
      displayName: 'Test User',
      board: mockBoard,
      hasWon: false,
      lastActive: Date.now(),
      isReady: true,
      isHost: true
    };

    // Create mock game
    mockGame = {
      id: 'test-game-id',
      name: 'Test Game',
      hostId: 'test-user-id',
      host: mockPlayer,
      players: {
        'test-user-id': mockPlayer
      },
      phrases: mockBoard.map(cell => cell.phrase), // Array of strings
      status: 'waiting',
      settings: {
        maxPlayers: 10,
        duration: 300,
        boardSize: 5,
        winCondition: 'line',
        maxChatMessages: 100,
        maxChatMessageRate: 10,
        allowGuestPlayers: false,
        autoStart: false,
        autoStartCount: 2,
        autoEnd: false,
        autoEndTime: 3600,
        allowChat: true,
        allowPrivateChat: false,
        allowSpectators: false
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
      isPrivate: false,
      password: undefined
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default successful mock implementations
    gameService.getGameState.mockResolvedValue(mockGame);
    gameService.updateGameState.mockResolvedValue(undefined);
    gameService.joinGame.mockResolvedValue(undefined);
    gameService.leaveGame.mockResolvedValue(undefined);
    gameService.startGame.mockResolvedValue(undefined);
  });

  const renderGameRoom = (gameId = 'test-game-id') => {
    return render(
      <BrowserRouter>
        <GameRoomComponent gameId={gameId} />
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    test('should render loading state initially', () => {
      renderGameRoom();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('should render game room when game data is loaded', async () => {
      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });
    });

    test('should render error state when game loading fails', async () => {
      // Mock the game service to throw an error
      gameService.getGameState.mockRejectedValue(new Error('Game not found'));

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });
  });

  describe('Game Board Interaction', () => {

    test('should render game board with cells', async () => {
      renderGameRoom();

      await waitFor(() => {
        // Check that all 25 cells are rendered
        for (let i = 1; i <= 25; i++) {
          expect(screen.getByText(`Phrase ${i}`)).toBeInTheDocument();
        }
      });
    });

    test('should handle cell click and mark cell', async () => {
      renderGameRoom();

      await waitFor(() => {
        const firstCell = screen.getByText('Phrase 1');
        expect(firstCell).toBeInTheDocument();
      });

      const firstCell = screen.getByText('Phrase 1');
      
      await act(async () => {
        fireEvent.click(firstCell);
      });

      // Check that the cell is marked (this would depend on your CSS classes)
      expect(firstCell.closest('div')).toHaveClass('marked');
    });

    test('should toggle cell marked state on click', async () => {
      renderGameRoom();

      await waitFor(() => {
        const firstCell = screen.getByText('Phrase 1');
        expect(firstCell).toBeInTheDocument();
      });

      const firstCell = screen.getByText('Phrase 1');
      
      // First click - mark the cell
      await act(async () => {
        fireEvent.click(firstCell);
      });
      expect(firstCell.closest('div')).toHaveClass('marked');

      // Second click - unmark the cell
      await act(async () => {
        fireEvent.click(firstCell);
      });
      expect(firstCell.closest('div')).not.toHaveClass('marked');
    });

    test('should update game state when cell is clicked', async () => {
      renderGameRoom();

      await waitFor(() => {
        const firstCell = screen.getByText('Phrase 1');
        expect(firstCell).toBeInTheDocument();
      });

      const firstCell = screen.getByText('Phrase 1');
      
      await act(async () => {
        fireEvent.click(firstCell);
      });

      // Verify that updateGameState was called
      expect(gameService.updateGameState).toHaveBeenCalledWith(
        'test-game-id',
        expect.objectContaining({
          players: expect.objectContaining({
            'test-user-id': expect.objectContaining({
              board: expect.arrayContaining([
                expect.objectContaining({
                  phrase: 'Phrase 1',
                  marked: true
                })
              ])
            })
          })
        })
      );
    });
  });

  describe('Win Condition Detection', () => {

    test('should detect horizontal win', async () => {
      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Phrase 1')).toBeInTheDocument();
      });

      // Mark first row (cells 0-4)
      const firstRowCells = ['Phrase 1', 'Phrase 2', 'Phrase 3', 'Phrase 4', 'Phrase 5'];
      
      for (const phrase of firstRowCells) {
        const cell = screen.getByText(phrase);
        await act(async () => {
          fireEvent.click(cell);
        });
      }

      // Check for win celebration or win detection
      await waitFor(() => {
        expect(screen.getByText(/bingo/i)).toBeInTheDocument();
      });
    });

    test('should detect vertical win', async () => {
      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Phrase 1')).toBeInTheDocument();
      });

      // Mark first column (cells 0, 5, 10, 15, 20)
      const firstColumnCells = ['Phrase 1', 'Phrase 6', 'Phrase 11', 'Phrase 16', 'Phrase 21'];
      
      for (const phrase of firstColumnCells) {
        const cell = screen.getByText(phrase);
        await act(async () => {
          fireEvent.click(cell);
        });
      }

      // Check for win celebration
      await waitFor(() => {
        expect(screen.getByText(/bingo/i)).toBeInTheDocument();
      });
    });

    test('should detect diagonal win', async () => {
      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Phrase 1')).toBeInTheDocument();
      });

      // Mark diagonal from top-left to bottom-right (cells 0, 6, 12, 18, 24)
      const diagonalCells = ['Phrase 1', 'Phrase 7', 'Phrase 13', 'Phrase 19', 'Phrase 25'];
      
      for (const phrase of diagonalCells) {
        const cell = screen.getByText(phrase);
        await act(async () => {
          fireEvent.click(cell);
        });
      }

      // Check for win celebration
      await waitFor(() => {
        expect(screen.getByText(/bingo/i)).toBeInTheDocument();
      });
    });
  });

  describe('Game State Management', () => {
    test('should handle game status changes', async () => {
      gameService.getGameState.mockResolvedValue({
        ...mockGame,
        status: 'playing'
      });

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText(/game in progress/i)).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });

    test('should handle player joining', async () => {
      gameService.getGameState.mockResolvedValue(mockGame);

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });

    test('should handle player leaving', async () => {
      gameService.getGameState.mockResolvedValue(mockGame);

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Simulate player leaving by updating the game state
      const updatedGame = {
        ...mockGame,
        players: {}
      };

      // This would typically be handled by a real-time listener
      // For testing, we'll simulate the state change
      gameService.getGameState.mockResolvedValue(updatedGame);

      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      gameService.getGameState.mockRejectedValue(new Error('Network error'));

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });

    test('should handle invalid game ID', async () => {
      gameService.getGameState.mockRejectedValue(new Error('Game not found'));

      renderGameRoom('invalid-game-id');

      await waitFor(() => {
        expect(screen.getByText(/game not found/i)).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });

    test('should handle unauthorized access', async () => {
      gameService.getGameState.mockRejectedValue(new Error('Unauthorized'));

      renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });
  });

  describe('Performance and Optimization', () => {
    test('should not re-render unnecessarily', async () => {
      gameService.getGameState.mockResolvedValue(mockGame);

      const { rerender } = renderGameRoom();

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      // Should still show the same content without re-fetching
      expect(screen.getByText('Test Game')).toBeInTheDocument();
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });

    test('should handle large number of players efficiently', async () => {
      // Create a game with many players
      const manyPlayersGame = {
        ...mockGame,
        players: {}
      };

      // Add 50 players
      for (let i = 0; i < 50; i++) {
        manyPlayersGame.players[`player-${i}`] = {
          ...mockPlayer,
          id: `player-${i}`,
          displayName: `Player ${i}`
        };
      }

      gameService.getGameState.mockResolvedValue(manyPlayersGame);

      renderGameRoom();

      await waitFor(() => {
        // Should render without performance issues
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });
      
      // Reset mock to default behavior
      gameService.getGameState.mockResolvedValue(mockGame);
    });
  });
});
