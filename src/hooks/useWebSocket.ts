import { useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocket';
import { GameEvent, PlayerEvent, RoomEvent, BoardEvent, ChatEvent, ErrorEvent } from '../types/events';

type EventType = PlayerEvent | RoomEvent | BoardEvent | ChatEvent | ErrorEvent;

export const useWebSocket = (roomId: string, token: string) => {
  useEffect(() => {
    websocketService.connect(roomId, token);

    return () => {
      websocketService.disconnect();
    };
  }, [roomId, token]);

  const joinRoom = useCallback((password?: string) => {
    websocketService.joinRoom(roomId, password);
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    websocketService.leaveRoom();
  }, []);

  const markCell = useCallback((cellIndex: number) => {
    websocketService.markCell(cellIndex);
  }, []);

  const sendChat = useCallback((content: string) => {
    websocketService.sendChat(content);
  }, []);

  const ready = useCallback(() => {
    websocketService.ready();
  }, []);

  const startGame = useCallback((roomId: string) => {
    websocketService.startGame(roomId);
  }, []);

  const on = useCallback(<T extends EventType>(event: string, handler: (event: T) => void) => {
    websocketService.on(event, handler as (event: GameEvent) => void);
    return () => websocketService.off(event, handler as (event: GameEvent) => void);
  }, []);

  return {
    joinRoom,
    leaveRoom,
    markCell,
    sendChat,
    ready,
    startGame,
    on
  };
}; 