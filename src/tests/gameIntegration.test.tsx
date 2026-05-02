import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { onSnapshot } from 'firebase/firestore';
import { GameRoomComponent } from '../components/game/GameRoom';
import { GamePage } from '../components/game/GamePage';
import GameSetup from '../components/game/GameSetup';
import { gameService } from '../services/game';
import { templateService } from '../services/templateService';
import type { BingoCell, GameRoom, Player, Template } from '../types/types';

// Mock all dependencies
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

jest.mock('../contexts/GameContext', () => ({
  useGame: () => ({
    currentRoom: null,
    players: [],
    board: [],
    chatMessages: [],
    isHost: false,
    hasGameStarted: false,
    winner: null,
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    startGame: jest.fn(),
    markCell: jest.fn(),
    sendChatMessage: jest.fn(),
    checkWinner: jest.fn()
  })
}));

jest.mock('../services/game', () => ({
  gameService: {
    getGame: jest.fn(),
    updateGameState: jest.fn(),
    joinGame: jest.fn(),
    leaveGame: jest.fn(),
    createGame: jest.fn()
  }
}));

jest.mock('../services/templateService', () => ({
  templateService: {
    getTemplate: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// TODO: Rewrite integration flow for GameSetup/GamePage/GameRoom + templateService/gameService APIs.
describe.skip('Game Integration Tests', () => {
  let mockTemplate: Template;
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

    // Create mock template
    mockTemplate = {
      id: 'test-template-id',
      name: 'Test Template',
      description: 'A test template for integration testing',
      phrases: mockBoard.map(cell => cell.phrase),
      createdBy: 'test-user-id',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: true,
      sharedWith: [],
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
      }
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
      phrases: mockBoard.map(cell => cell.phrase),
      status: 'waiting',
      settings: mockTemplate.settings,
      createdAt: Date.now(),
      lastActive: Date.now(),
      isPrivate: false
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Complete Game Flow', () => {
    test('should handle complete game flow from setup to completion', async () => {
      // Mock template service
      templateService.getTemplate.mockResolvedValue(mockTemplate);
      
      // Mock game service
      gameService.createGame.mockResolvedValue('test-game-id');
      gameService.getGameState.mockResolvedValue(mockGame);
      gameService.updateGameState.mockResolvedValue(undefined);

      // Render game setup
      render(
        <BrowserRouter>
          <GameSetup templateId="test-template-id" />
        </BrowserRouter>
      );

      // Wait for template to load
      await waitFor(() => {
        expect(screen.getByText('Test Template')).toBeInTheDocument();
      });

      // Start the game
      const startButton = screen.getByText(/start game/i);
      fireEvent.click(startButton);

      // Verify game was created
      expect(gameService.createGame).toHaveBeenCalledWith(
        expect.objectContaining({
          maxPlayers: 10,
          boardSize: 5,
          winCondition: 'line'
        })
      );

      // Wait for game to be created and navigate to game room
      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Verify game board is rendered
      expect(screen.getByText('Phrase 1')).toBeInTheDocument();
      expect(screen.getByText('Phrase 25')).toBeInTheDocument();

      // Mark cells to create a winning line (first row)
      const firstRowCells = ['Phrase 1', 'Phrase 2', 'Phrase 3', 'Phrase 4', 'Phrase 5'];
      
      for (const phrase of firstRowCells) {
        const cell = screen.getByText(phrase);
        await act(async () => {
          fireEvent.click(cell);
        });
      }

      // Verify win condition is detected
      await waitFor(() => {
        expect(screen.getByText(/bingo/i)).toBeInTheDocument();
      });

      // Verify game state was updated
      expect(gameService.updateGameState).toHaveBeenCalledWith(
        'test-game-id',
        expect.objectContaining({
          players: expect.objectContaining({
            'test-user-id': expect.objectContaining({
              hasWon: true
            })
          })
        })
      );
    });

    test('should handle multiplayer game flow', async () => {
      // Create a multiplayer game with multiple players
      const multiplayerGame = {
        ...mockGame,
        players: {
          'player-1': {
            ...mockPlayer,
            id: 'player-1',
            displayName: 'Player 1',
            isHost: true
          },
          'player-2': {
            ...mockPlayer,
            id: 'player-2',
            displayName: 'Player 2',
            isHost: false
          },
          'player-3': {
            ...mockPlayer,
            id: 'player-3',
            displayName: 'Player 3',
            isHost: false
          }
        }
      };

      gameService.getGameState.mockResolvedValue(multiplayerGame);
      gameService.updateGameState.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      // Wait for game to load
      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Verify all players are displayed
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();

      // Simulate player 2 winning
      const player2WinningGame = {
        ...multiplayerGame,
        players: {
          ...multiplayerGame.players,
          'player-2': {
            ...multiplayerGame.players['player-2'],
            hasWon: true
          }
        },
        status: 'finished',
        winner: 'player-2'
      };

      // Update the mock to return the winning game state
      gameService.getGameState.mockResolvedValue(player2WinningGame);

      // Wait for win celebration
      await waitFor(() => {
        expect(screen.getByText(/winner/i)).toBeInTheDocument();
        expect(screen.getByText('Player 2')).toBeInTheDocument();
      });
    });

    test('should handle game with different win conditions', async () => {
      // Create game with "full board" win condition
      const fullBoardGame = {
        ...mockGame,
        settings: {
          ...mockGame.settings,
          winCondition: 'full-board'
        }
      };

      gameService.getGameState.mockResolvedValue(fullBoardGame);
      gameService.updateGameState.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Mark all cells to test full board win condition
      for (let i = 1; i <= 25; i++) {
        const cell = screen.getByText(`Phrase ${i}`);
        await act(async () => {
          fireEvent.click(cell);
        });
      }

      // Verify full board win is detected
      await waitFor(() => {
        expect(screen.getByText(/bingo/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    test('should handle real-time player updates', async () => {
      // Mock onSnapshot to simulate real-time updates
      const mockUnsubscribe = jest.fn();
      
      onSnapshot.mockImplementation((docRef, callback) => {
        // Simulate initial game state
        callback({
          exists: () => true,
          data: () => mockGame
        });
        
        // Simulate real-time update after a delay
        setTimeout(() => {
          const updatedGame = {
            ...mockGame,
            players: {
              ...mockGame.players,
              'new-player': {
                ...mockPlayer,
                id: 'new-player',
                displayName: 'New Player'
              }
            }
          };
          callback({
            exists: () => true,
            data: () => updatedGame
          });
        }, 100);
        
        return mockUnsubscribe;
      });

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      // Wait for initial game state
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Wait for new player to join
      await waitFor(() => {
        expect(screen.getByText('New Player')).toBeInTheDocument();
      }, { timeout: 200 });

      // Verify unsubscribe is called on cleanup
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    test('should handle real-time game state changes', async () => {
      onSnapshot.mockImplementation((docRef, callback) => {
        // Initial state
        callback({
          exists: () => true,
          data: () => ({ ...mockGame, status: 'waiting' })
        });
        
        // Game starts
        setTimeout(() => {
          callback({
            exists: () => true,
            data: () => ({ ...mockGame, status: 'playing' })
          });
        }, 100);
        
        // Game ends
        setTimeout(() => {
          callback({
            exists: () => true,
            data: () => ({ 
              ...mockGame, 
              status: 'finished',
              winner: 'test-user-id'
            })
          });
        }, 200);
        
        return jest.fn();
      });

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      // Wait for initial waiting state
      await waitFor(() => {
        expect(screen.getByText(/waiting/i)).toBeInTheDocument();
      });

      // Wait for game to start
      await waitFor(() => {
        expect(screen.getByText(/playing/i)).toBeInTheDocument();
      }, { timeout: 150 });

      // Wait for game to end
      await waitFor(() => {
        expect(screen.getByText(/finished/i)).toBeInTheDocument();
      }, { timeout: 250 });
    });
  });

  describe('Error Scenarios', () => {
    test('should handle network disconnection during game', async () => {
      gameService.getGameState.mockResolvedValue(mockGame);
      gameService.updateGameState.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Try to mark a cell (should fail due to network error)
      const firstCell = screen.getByText('Phrase 1');
      await act(async () => {
        fireEvent.click(firstCell);
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('should handle concurrent player actions', async () => {
      gameService.getGame.mockResolvedValue(mockGame);
      gameService.updateGameState.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Rapidly click multiple cells
      const cells = ['Phrase 1', 'Phrase 2', 'Phrase 3', 'Phrase 4', 'Phrase 5'];
      
      for (const phrase of cells) {
        const cell = screen.getByText(phrase);
        fireEvent.click(cell);
      }

      // Wait for all updates to complete
      await waitFor(() => {
        expect(gameService.updateGameState).toHaveBeenCalledTimes(5);
      }, { timeout: 1000 });
    });

    test('should handle game with invalid data', async () => {
      // Create game with invalid board data
      const invalidGame = {
        ...mockGame,
        players: {
          'test-user-id': {
            ...mockPlayer,
            board: [] // Empty board
          }
        }
      };

      gameService.getGameState.mockResolvedValue(invalidGame);

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      // Should handle invalid data gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of players efficiently', async () => {
      // Create game with 100 players
      const largeGame = {
        ...mockGame,
        players: {}
      };

      for (let i = 0; i < 100; i++) {
        largeGame.players[`player-${i}`] = {
          ...mockPlayer,
          id: `player-${i}`,
          displayName: `Player ${i}`
        };
      }

      gameService.getGameState.mockResolvedValue(largeGame);

      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    test('should handle rapid state updates efficiently', async () => {
      gameService.getGameState.mockResolvedValue(mockGame);
      gameService.updateGameState.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <GameRoomComponent gameId="test-game-id" />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument();
      });

      // Perform rapid cell clicks
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const cell = screen.getByText(`Phrase ${(i % 25) + 1}`);
        fireEvent.click(cell);
      }

      const endTime = performance.now();
      const clickTime = endTime - startTime;

      // Should handle rapid clicks efficiently (less than 500ms for 50 clicks)
      expect(clickTime).toBeLessThan(500);
    });
  });
});
