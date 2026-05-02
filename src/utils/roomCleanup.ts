import { getDatabase, ref, get, remove, update } from 'firebase/database';
import { app } from '../firebase/index';
import type { GameRoom } from '../types/types';

const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

const rtdb = () => getDatabase(app);

export const cleanupInactiveRooms = async () => {
  const roomsRef = ref(rtdb(), 'rooms');
  const snapshot = await get(roomsRef);
  const rooms = snapshot.val() as Record<string, GameRoom> | null;

  if (!rooms) return;

  const now = Date.now();
  const cleanupPromises = Object.entries(rooms).map(async ([roomId, room]) => {
    const playerCount = Object.keys(room.players || {}).length;
    const timeSinceLastActive = now - room.lastActive;

    // Remove rooms that have been inactive for too long
    if (timeSinceLastActive > INACTIVE_TIMEOUT) {
      await remove(ref(rtdb(), `rooms/${roomId}`));
      return;
    }

    // Remove empty rooms after a shorter timeout
    if (playerCount === 0 && timeSinceLastActive > EMPTY_ROOM_TIMEOUT) {
      await remove(ref(rtdb(), `rooms/${roomId}`));
      return;
    }

    // Clean up disconnected players
    const disconnectedPlayers = Object.entries(room.players || {})
      .filter(([_, player]) => now - player.lastActive > INACTIVE_TIMEOUT)
      .map(([playerId]) => playerId);

    if (disconnectedPlayers.length > 0) {
      const updates: Record<string, null> = {};
      disconnectedPlayers.forEach(playerId => {
        updates[`rooms/${roomId}/players/${playerId}`] = null;
      });
      await update(ref(rtdb()), updates);
    }
  });

  await Promise.all(cleanupPromises);
};

export const updateRoomActivity = async (roomId: string) => {
  const roomRef = ref(rtdb(), `rooms/${roomId}`);
  await update(roomRef, {
    lastActive: Date.now()
  });
}; 