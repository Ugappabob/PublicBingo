import { websocketService } from '../services/websocket';
import { GameEvent, PlayerEvent, ChatEvent } from '../types/events.d';
import { Player, ChatMessage } from '../types/types';

// Mock the socket.io-client Manager
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false
  };

  return {
    io: jest.fn(() => mockSocket),
    Manager: jest.fn(() => ({
      socket: jest.fn(() => mockSocket)
    }))
  };
});

// Define the mock socket type
interface MockSocket {
  on: jest.Mock;
  emit: jest.Mock;
  connect: typeof jest.fn;
  disconnect: typeof jest.fn;
  connected: boolean;
}

// Define the mock call type
type MockCall<T> = [string, (event: T) => void];

describe('WebSocket Service Tests', () => {
  const mockRoomId = 'test-room';
  const mockToken = 'test-token';

  let gameHandler: ((event: GameEvent) => void) | null = null;
  let playerHandler: ((event: PlayerEvent) => void) | null = null;
  let chatHandler: ((event: ChatEvent) => void) | null = null;

  beforeEach(() => {
    // Reset the service before each test
    websocketService.disconnect();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    if (gameHandler) websocketService.off('game', gameHandler);
    if (playerHandler) websocketService.off('player', playerHandler);
    if (chatHandler) websocketService.off('chat', chatHandler);
    
    // Reset handlers
    gameHandler = null;
    playerHandler = null;
    chatHandler = null;
    
    // Disconnect the socket
    websocketService.disconnect();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('should connect to WebSocket server', () => {
    // Arrange
    const connectSpy = jest.spyOn(websocketService, 'connect');
    
    // Act
    websocketService.connect(mockRoomId, mockToken);
    
    // Assert
    expect(connectSpy).toHaveBeenCalledWith(mockRoomId, mockToken);
  });

  test('should handle game events', async () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    
    const gameEvent: GameEvent = {
      type: 'game_start',
      timestamp: Date.now(),
      payload: {
        status: 'started',
        currentTurn: 'player1'
      }
    };

    // Act & Assert
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Game event test timed out'));
      }, 5000);

      const handler = (event: GameEvent) => {
        try {
          expect(event).toEqual(gameEvent);
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      gameHandler = handler;
      websocketService.on('game', gameHandler);
      
      // Simulate receiving a game event from the server
      const socket = (websocketService as any).socket as MockSocket;
      if (socket) {
        // Directly call the event handler
        const gameEventHandlers = (socket.on.mock.calls as MockCall<GameEvent>[])
          .filter(call => call[0] === 'gameEvent')
          .map(call => call[1]);
        
        if (gameEventHandlers.length > 0) {
          gameEventHandlers[0](gameEvent);
        } else {
          clearTimeout(timeout);
          reject(new Error('No game event handler found'));
        }
      } else {
        clearTimeout(timeout);
        reject(new Error('Socket not initialized'));
      }
    });
  });

  test('should handle player events', async () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    
    const mockPlayer: Player = {
      id: 'player1',
      name: 'Test Player',
      board: [],
      hasWon: false,
      isOnline: true,
      isReady: false,
      lastActive: Date.now(),
      joinedAt: Date.now()
    };

    const playerEvent: PlayerEvent = {
      type: 'player_join',
      timestamp: Date.now(),
      payload: {
        player: mockPlayer
      }
    };

    // Act & Assert
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Player event test timed out'));
      }, 5000);

      const handler = (event: PlayerEvent) => {
        try {
          expect(event).toEqual(playerEvent);
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      playerHandler = handler;
      websocketService.on('player', playerHandler);
      
      // Simulate receiving a player event from the server
      const socket = (websocketService as any).socket as MockSocket;
      if (socket) {
        // Directly call the event handler
        const playerEventHandlers = (socket.on.mock.calls as MockCall<PlayerEvent>[])
          .filter(call => call[0] === 'playerEvent')
          .map(call => call[1]);
        
        if (playerEventHandlers.length > 0) {
          playerEventHandlers[0](playerEvent);
        } else {
          clearTimeout(timeout);
          reject(new Error('No player event handler found'));
        }
      } else {
        clearTimeout(timeout);
        reject(new Error('Socket not initialized'));
      }
    });
  });

  test('should handle chat events', async () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    
    const mockMessage: ChatMessage = {
      id: 'msg1',
      userId: 'player1',
      userName: 'Test Player',
      text: 'Hello, world!',
      timestamp: Date.now()
    };

    const chatEvent: ChatEvent = {
      type: 'chat_message',
      timestamp: Date.now(),
      payload: {
        message: mockMessage
      }
    };

    // Act & Assert
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Chat event test timed out'));
      }, 5000);

      const handler = (event: ChatEvent) => {
        try {
          expect(event).toEqual(chatEvent);
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      chatHandler = handler;
      websocketService.on('chat', chatHandler);
      
      // Simulate receiving a chat event from the server
      const socket = (websocketService as any).socket as MockSocket;
      if (socket) {
        // Directly call the event handler
        const chatEventHandlers = (socket.on.mock.calls as MockCall<ChatEvent>[])
          .filter(call => call[0] === 'chatEvent')
          .map(call => call[1]);
        
        if (chatEventHandlers.length > 0) {
          chatEventHandlers[0](chatEvent);
        } else {
          clearTimeout(timeout);
          reject(new Error('No chat event handler found'));
        }
      } else {
        clearTimeout(timeout);
        reject(new Error('Socket not initialized'));
      }
    });
  });

  test('should handle room operations', () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    
    // Act & Assert
    expect(() => websocketService.joinRoom(mockRoomId)).not.toThrow();
    expect(() => websocketService.leaveRoom()).not.toThrow();
    expect(() => websocketService.ready()).not.toThrow();
    expect(() => websocketService.startGame(mockRoomId)).not.toThrow();
  });

  test('should handle connection state changes', () => {
    // Arrange
    const initialState = websocketService.getConnectionState();
    
    // Act
    websocketService.connect(mockRoomId, mockToken);
    const connectingState = websocketService.getConnectionState();
    
    // Assert
    expect(initialState).toBe('disconnected');
    expect(connectingState).toBe('connecting');
  });

  test('should handle disconnection', () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    
    // Act
    websocketService.disconnect();
    
    // Assert
    expect(websocketService.getConnectionState()).toBe('disconnected');
    expect(websocketService.isConnected()).toBe(false);
  });

  test('should emit custom events', () => {
    // Arrange
    websocketService.connect(mockRoomId, mockToken);
    const mockEmit = jest.spyOn((websocketService as any).socket, 'emit');
    
    // Act
    websocketService.emit('createTemplate', { 
      template: { 
        name: 'Test Template',
        description: 'Test Description',
        phrases: ['Phrase 1', 'Phrase 2'],
        userId: 'test-user-id',
        updatedAt: new Date(),
        isTemplate: true,
        isPublic: true,
        favoriteCount: 0,
        favoritedBy: [],
        tags: [],
        createdBy: 'test-user-id',
        sharedWith: [],
        shareLink: '',
        settings: {
          maxPlayers: 4,
          duration: 3600,
          maxChatMessages: 100,
          maxChatMessageRate: 1,
          isPrivate: false,
          password: '',
          phraseList: 'test-phrase-list',
          boardSize: 5,
          winCondition: 'line',
          allowGuestPlayers: true,
          autoStart: false,
          autoStartCount: 2,
          autoEnd: false,
          autoEndTime: 3600,
          allowChat: true,
          allowPrivateChat: false,
          allowSpectators: true
        }
      }, 
      templateId: 'test-id' 
    });
    
    websocketService.emit('updateTemplate', { 
      templateId: 'test-id', 
      template: { name: 'Updated Template' } 
    });
    
    websocketService.emit('deleteTemplate', { templateId: 'test-id' });
    
    websocketService.emit('createGame', { 
      settings: { 
        maxPlayers: 4,
        duration: 3600,
        maxChatMessages: 100,
        maxChatMessageRate: 1,
        isPrivate: false,
        password: '',
        phraseList: 'test-phrase-list',
        boardSize: 5,
        winCondition: 'line',
        allowGuestPlayers: true,
        autoStart: false,
        autoStartCount: 2,
        autoEnd: false,
        autoEndTime: 3600,
        allowChat: true,
        allowPrivateChat: false,
        allowSpectators: true
      }, 
      gameId: 'test-game-id' 
    });
    
    // Assert
    expect(mockEmit).toHaveBeenCalledWith('createTemplate', expect.any(Object));
    expect(mockEmit).toHaveBeenCalledWith('updateTemplate', { templateId: 'test-id', template: { name: 'Updated Template' } });
    expect(mockEmit).toHaveBeenCalledWith('deleteTemplate', { templateId: 'test-id' });
    expect(mockEmit).toHaveBeenCalledWith('createGame', expect.any(Object));
  });
}); 