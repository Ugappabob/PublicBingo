// Mock WebSocket
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  public readyState = 0;

  constructor(url: string) {
    setTimeout(() => {
      this.readyState = 1;
      this.trigger('open');
    }, 0);
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  send(data: string) {
    const event = JSON.parse(data);
    this.trigger(event.type, event);
  }

  close() {
    this.readyState = 3;
    this.trigger('close');
  }

  private trigger(event: string, data?: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// @ts-ignore
global.WebSocket = MockWebSocket;

// Mock Socket.io
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: false
    })),
    Manager: jest.fn(() => ({
      socket: jest.fn(() => ({
        on: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        connected: false
      }))
    }))
  };
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  push: jest.fn(() => ({ key: 'test-key' }))
}));

// Mock environment variables
process.env.REACT_APP_WEBSOCKET_URL = 'http://localhost:3001';

// Export an empty object to make this file a module
export {}; 