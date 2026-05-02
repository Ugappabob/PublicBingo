import { Player, GameRoom, ChatMessage, BingoCell, Template } from './types';

export type GameEvent = {
  type: string;
  payload: unknown;
  timestamp: number;
};

export type ConnectionEvent = GameEvent & {
  type: 'connect';
  payload: {
    socketId: string;
  };
};

export type DisconnectEvent = GameEvent & {
  type: 'disconnect';
  payload: {
    reason: string;
  };
};

export type ReconnectEvent = GameEvent & {
  type: 'reconnect';
  payload: {
    attemptNumber: number;
  };
};

export type ConnectionHealthEvent = GameEvent & {
  type: 'connection_health';
  payload: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    packetLoss: number;
    lastHeartbeat: number;
  };
};

export type ConnectionStateEvent = GameEvent & {
  type: 'connection_state';
  payload: {
    state: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
    previousState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
    timestamp: number;
  };
};

export type PlayerEvent = GameEvent & {
  type: 'player_join' | 'player_leave' | 'player_ready' | 'player_update';
  payload: {
    player: Player;
  };
};

export type RoomEvent = GameEvent & {
  type: 'room_create' | 'room_update' | 'room_delete' | 'game_start' | 'game_end';
  payload: {
    room: GameRoom;
  };
};

export type BoardEvent = GameEvent & {
  type: 'board_update' | 'cell_marked' | 'winner';
  payload: {
    board: BingoCell[];
    cellIndex?: number;
    markedBy?: string;
    winner?: string;
  };
};

export type ChatEvent = GameEvent & {
  type: 'chat_message';
  payload: {
    message: ChatMessage;
  };
};

export type ErrorEvent = GameEvent & {
  type: 'error';
  payload: {
    error: string;
    code: string;
    details?: Record<string, unknown>;
  };
};

export interface GamePauseEvent extends GameEvent {
  type: 'game_pause';
  gameId: string;
  isPaused: boolean;
  pausedBy: string;
  timestamp: number;
}

export interface GameTurnEvent extends GameEvent {
  type: 'game_turn';
  gameId: string;
  currentTurn: string;
  previousTurn?: string;
  turnOrder: string[];
  timestamp: number;
}

export interface GameTurnTimeoutEvent extends GameEvent {
  type: 'game_turn_timeout';
  gameId: string;
  timedOutPlayer: string;
  nextTurn: string;
  timestamp: number;
}

export type ServerToClientEvents = {
  // Connection events
  connect: (event: ConnectionEvent) => void;
  connect_error: (error: Error) => void;
  disconnect: (event: DisconnectEvent) => void;
  reconnect: (event: ReconnectEvent) => void;
  reconnect_failed: () => void;
  connection_health: (event: ConnectionHealthEvent) => void;
  connection_state: (event: ConnectionStateEvent) => void;
  
  // Game events
  playerEvent: (event: PlayerEvent) => void;
  roomEvent: (event: RoomEvent) => void;
  boardEvent: (event: BoardEvent) => void;
  chatEvent: (event: ChatEvent) => void;
  errorEvent: (event: ErrorEvent) => void;
  game_pause: (event: GamePauseEvent) => void;
  game_turn: (event: GameTurnEvent) => void;
  game_turn_timeout: (event: GameTurnTimeoutEvent) => void;
};

export type ClientToServerEvents = {
  // Room and game events
  joinRoom: (roomId: string, password?: string) => void;
  leaveRoom: () => void;
  markCell: (cellIndex: number) => void;
  sendChat: (content: string) => void;
  ready: () => void;
  startGame: (roomId: string) => void;
  gameEnd: (data: { gameId: string, winnerId?: string, winnerName?: string }) => void;
  gameStateUpdate: (data: { gameId: string, updates: Partial<GameRoom> }) => void;
  
  // Template events
  createTemplate: (data: { template: Omit<Template, 'id' | 'createdAt' | 'timesUsed'>, templateId: string }) => void;
  updateTemplate: (data: { templateId: string, template: Partial<Template> }) => void;
  deleteTemplate: (data: { templateId: string }) => void;
  
  // Game events
  createGame: (data: { settings: GameRoom['settings'], gameId: string }) => void;
  pause_game: (gameId: string, isPaused: boolean) => void;
  next_turn: (gameId: string) => void;
};

export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  event: GameEvent;
}

export interface EventValidator {
  validateEvent(event: unknown): EventValidationResult;
  validatePayload(eventType: string, payload: unknown): EventValidationResult;
  registerValidator(eventType: string, validator: (payload: unknown) => boolean): void;
}

export type EventValidatorFunction = (payload: unknown) => boolean;

export interface EventValidators {
  [key: string]: EventValidatorFunction;
} 