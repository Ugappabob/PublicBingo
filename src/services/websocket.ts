// Import the socket.io-client library
import { Manager, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  GameEvent,
  PlayerEvent,
  RoomEvent,
  BoardEvent,
  ChatEvent,
  ErrorEvent,
  ConnectionEvent,
  DisconnectEvent,
  ReconnectEvent,
  ConnectionHealthEvent,
  ConnectionStateEvent,
  GamePauseEvent,
  GameTurnEvent,
  GameTurnTimeoutEvent
} from '../types/events';
import { 
  GameError, 
  RoomError, 
  WebSocketError, 
  ConnectionError, 
  ReconnectionError,
  ConnectionTimeoutError,
  ConnectionHealthError
} from '../types/errors';
import { GameRoom } from '../types/types';

// Define Socket type using the event interfaces
type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// Define connection state type
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// Define event handler type with better type safety
type EventHandler<T extends GameEvent> = (_event: T) => void;

// Define connection health status type
type ConnectionHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// Define WebSocket service interface with improved type safety
interface IWebSocketService {
  connect(_roomId: string, _token: string): void;
  disconnect(): void;
  joinRoom(_roomId: string, _password?: string): void;
  leaveRoom(): void;
  markCell(_cellIndex: number): void;
  sendChat(_content: string): void;
  ready(): void;
  startGame(_roomId: string): void;
  on<T extends GameEvent>(_event: string, _handler: EventHandler<T>): void;
  off<T extends GameEvent>(_event: string, _handler: EventHandler<T>): void;
  isConnected(): boolean;
  getSocketId(): string | undefined;
  getConnectionState(): ConnectionState;
  getConnectionHealth(): ConnectionHealthStatus;
  emit<Ev extends keyof ClientToServerEvents>(_event: Ev, ..._args: Parameters<ClientToServerEvents[Ev]>): void;
}

// Connection state persistence key
const CONNECTION_STATE_KEY = 'websocket_connection_state';
const CONNECTION_HEALTH_KEY = 'websocket_connection_health';

class WebSocketService implements IWebSocketService {
  private socket: SocketType | null = null;
  private eventHandlers: Map<string, Set<EventHandler<GameEvent>>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased from 5 to 10
  private reconnectDelay = 1000; // Start with 1 second
  private connectionState: ConnectionState = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;
  private heartbeatTimeout = 30000; // 30 seconds
  private connectionHealth: ConnectionHealthStatus = 'healthy';
  private roomId: string | null = null;
  private token: string | null = null;
  private lastLatency = 0;
  private packetLoss = 0;
  private healthCheckPeriod = 10000; // 10 seconds

  constructor() {
    // Restore connection state from localStorage if available
    this.restoreConnectionState();
    
    // Set up window event listeners for online/offline detection
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private restoreConnectionState() {
    try {
      const savedState = localStorage.getItem(CONNECTION_STATE_KEY);
      if (savedState) {
        this.connectionState = JSON.parse(savedState) as ConnectionState;
      }
      
      const savedHealth = localStorage.getItem(CONNECTION_HEALTH_KEY);
      if (savedHealth) {
        this.connectionHealth = JSON.parse(savedHealth) as ConnectionHealthStatus;
      }
    } catch (error) {
      console.error('Error restoring connection state:', error);
    }
  }

  private saveConnectionState() {
    try {
      localStorage.setItem(CONNECTION_STATE_KEY, JSON.stringify(this.connectionState));
      localStorage.setItem(CONNECTION_HEALTH_KEY, JSON.stringify(this.connectionHealth));
    } catch (error) {
      console.error('Error saving connection state:', error);
    }
  }

  private handleOnline() {
    console.log('Browser is online, attempting to reconnect...');
    if (this.roomId && this.token) {
      this.connect(this.roomId, this.token);
    }
  }

  private handleOffline() {
    console.log('Browser is offline, connection will be lost');
    this.updateConnectionState('disconnected');
    this.updateConnectionHealth('unhealthy');
  }

  connect(roomId: string, token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.roomId = roomId;
    this.token = token;
    this.updateConnectionState('connecting');
    
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001';
    console.log(`Connecting to WebSocket server at ${wsUrl}`);

    try {
      const manager = new Manager(wsUrl, {
        query: { roomId, token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000, // Increased from 5000 to 10000
        timeout: 20000,
        autoConnect: true
      });

      this.socket = manager.socket('/');
      this.setupEventListeners();
      this.startHealthCheck();
    } catch (error) {
      this.handleError(error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.updateConnectionHealth('healthy');
      this.notifyHandlers('connect', { 
        type: 'connect', 
        payload: { socketId: this.socket?.id || '' },
        timestamp: Date.now() 
      });
    });

    this.socket.on('disconnect', (reason: string) => {
      this.updateConnectionState('disconnected');
      this.updateConnectionHealth('unhealthy');
      this.notifyHandlers('disconnect', { 
        type: 'disconnect', 
        payload: { reason }, 
        timestamp: Date.now() 
      });
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.roomId && this.token) {
        this.attemptReconnect();
      }
    });

    this.socket.on('reconnect', (event: ReconnectEvent) => {
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.updateConnectionHealth('healthy');
      this.notifyHandlers('reconnect', event);
      
      // Re-join room if needed
      if (this.roomId) {
        this.joinRoom(this.roomId);
      }
    });

    // Game events
    this.socket.on('playerEvent', (event: PlayerEvent) => {
      this.notifyHandlers('playerEvent', event);
    });

    this.socket.on('roomEvent', (event: RoomEvent) => {
      this.notifyHandlers('roomEvent', event);
    });

    this.socket.on('boardEvent', (event: BoardEvent) => {
      this.notifyHandlers('boardEvent', event);
    });

    this.socket.on('chatEvent', (event: ChatEvent) => {
      this.notifyHandlers('chatEvent', event);
    });

    this.socket.on('errorEvent', (event: ErrorEvent) => {
      this.notifyHandlers('errorEvent', event);
    });

    // Handle room creation through roomEvent
    this.socket.on('roomEvent', (event: RoomEvent) => {
      if (event.type === 'room_create') {
        this.notifyHandlers('roomEvent', event);
      }
    });

    this.socket.on('game_pause', (event: GamePauseEvent) => {
      this.notifyHandlers('game_pause', event);
    });

    this.socket.on('game_turn', (event: GameTurnEvent) => {
      this.notifyHandlers('game_turn', event);
    });

    this.socket.on('game_turn_timeout', (event: GameTurnTimeoutEvent) => {
      this.notifyHandlers('game_turn_timeout', event);
    });
  }

  private attemptReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      this.handleError(new ReconnectionError('Maximum reconnection attempts reached', this.reconnectAttempts));
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState('reconnecting');
    
    // Calculate exponential backoff delay
    const backoffDelay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      10000 // Max 10 seconds
    );
    
    console.log(`Attempting to reconnect in ${backoffDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.roomId && this.token) {
        this.connect(this.roomId, this.token);
      }
    }, backoffDelay);
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, this.healthCheckPeriod);
  }

  private checkConnectionHealth() {
    if (!this.socket || !this.socket.connected) {
      this.updateConnectionHealth('unhealthy');
      return;
    }

    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.lastHeartbeat;
    
    // Measure latency with a simple timeout
    const pingStart = now;
    setTimeout(() => {
      const latency = Date.now() - pingStart;
      this.lastLatency = latency;
      
      // Update health based on latency and time since last heartbeat
      if (timeSinceLastHeartbeat > this.heartbeatTimeout) {
        this.updateConnectionHealth('unhealthy');
      } else if (latency > 1000) { // More than 1 second latency
        this.updateConnectionHealth('degraded');
      } else {
        this.updateConnectionHealth('healthy');
      }
      
      // Emit connection health event
      this.emitConnectionHealthEvent();
    }, 0);
  }

  private emitConnectionHealthEvent() {
    const healthEvent: ConnectionHealthEvent = {
      type: 'connection_health',
      payload: {
        status: this.connectionHealth,
        latency: this.lastLatency,
        packetLoss: this.packetLoss,
        lastHeartbeat: this.lastHeartbeat
      },
      timestamp: Date.now()
    };
    
    this.notifyHandlers('connection_health', healthEvent);
  }

  private updateConnectionState(newState: ConnectionState) {
    const previousState = this.connectionState;
    this.connectionState = newState;
    this.saveConnectionState();
    
    // Emit connection state event
    const stateEvent: ConnectionStateEvent = {
      type: 'connection_state',
      payload: {
        state: newState,
        previousState,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };
    
    this.notifyHandlers('connection_state', stateEvent);
  }

  private updateConnectionHealth(newHealth: ConnectionHealthStatus) {
    this.connectionHealth = newHealth;
    this.saveConnectionState();
  }

  private handleError(error: unknown) {
    console.error('WebSocket error:', error);
    
    let gameError: GameError;
    
    if (error instanceof GameError) {
      gameError = error;
    } else if (error instanceof Error) {
      gameError = new WebSocketError(error.message, error.message);
    } else {
      gameError = new WebSocketError('Unknown WebSocket error', 'Unknown error occurred');
    }
    
    this.notifyHandlers('error', { 
      type: 'error', 
      payload: { 
        error: gameError.message, 
        code: gameError.code, 
        details: gameError.details 
      }, 
      timestamp: Date.now() 
    });
  }

  joinRoom(roomId: string, password?: string) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.emit('joinRoom', roomId, password);
  }

  leaveRoom() {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('leaveRoom');
  }

  markCell(cellIndex: number) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('markCell', cellIndex);
  }

  sendChat(content: string) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('sendChat', content);
  }

  ready() {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('ready');
  }

  startGame(roomId: string) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('startGame', roomId);
  }

  on<T extends GameEvent>(event: string, handler: EventHandler<T>) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler as EventHandler<GameEvent>);
  }

  off<T extends GameEvent>(event: string, handler: EventHandler<T>) {
    this.eventHandlers.get(event)?.delete(handler as EventHandler<GameEvent>);
  }

  private notifyHandlers(event: string, data: GameEvent) {
    this.eventHandlers.get(event)?.forEach((handler: EventHandler<GameEvent>) => {
      try {
        handler(data);
      } catch (error: unknown) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  disconnect() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.updateConnectionState('disconnected');
    this.updateConnectionHealth('unhealthy');
    this.roomId = null;
    this.token = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getConnectionHealth(): ConnectionHealthStatus {
    return this.connectionHealth;
  }

  emit<Ev extends keyof ClientToServerEvents>(event: Ev, ...args: Parameters<ClientToServerEvents[Ev]>): void {
    if (!this.socket?.connected) {
      throw new RoomError(`Cannot emit event ${event}: WebSocket not connected`);
    }
    this.socket.emit(event, ...args);
  }
}

export const websocketService = new WebSocketService(); 