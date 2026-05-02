// Validation functions for game settings and user inputs

/**
 * Validates a phrase for a bingo game
 * @param phrase The phrase to validate
 * @returns True if the phrase is valid, false otherwise
 */
export function validatePhrase(phrase: string): boolean {
  if (!phrase) return false;
  return phrase.length >= 3 && phrase.length <= 50;
}

/**
 * Validates a phrase list name
 * @param name The name to validate
 * @returns True if the name is valid, false otherwise
 */
export function validatePhraseListName(name: string): boolean {
  if (!name) return false;
  return name.length >= 3 && name.length <= 30;
}

/**
 * Validates a player name
 * @param name The name to validate
 * @returns True if the name is valid, false otherwise
 */
export function validatePlayerName(name: string): boolean {
  if (!name) return false;
  return name.length >= 2 && name.length <= 20;
}

/**
 * Validates the maximum number of players for a room
 * @param maxPlayers The maximum number of players
 * @returns True if the value is valid, false otherwise
 */
export function validateRoomMaxPlayers(maxPlayers: number): boolean {
  return maxPlayers >= 2 && maxPlayers <= 20;
}

/**
 * Validates the duration of a game room
 * @param duration The duration in minutes
 * @returns True if the duration is valid, false otherwise
 */
export function validateRoomDuration(duration: number): boolean {
  return duration >= 5 && duration <= 120;
}

/**
 * Validates a room password
 * @param password The password to validate
 * @returns True if the password is valid, false otherwise
 */
export function validateRoomPassword(password: string): boolean {
  if (!password) return true; // Empty password is allowed (public room)
  return password.length >= 4 && password.length <= 20;
}

/**
 * Validates the maximum number of chat messages in a room
 * @param maxMessages The maximum number of messages
 * @returns True if the value is valid, false otherwise
 */
export function validateRoomMaxChatMessages(maxMessages: number): boolean {
  return maxMessages >= 50 && maxMessages <= 1000;
}

/**
 * Validates the maximum chat message rate in a room
 * @param rate The rate in messages per minute
 * @returns True if the rate is valid, false otherwise
 */
export function validateRoomMaxChatMessageRate(rate: number): boolean {
  return rate >= 1 && rate <= 60;
}

/**
 * Validates the penalty duration for chat violations
 * @param duration The duration in minutes
 * @returns True if the duration is valid, false otherwise
 */
export function validateRoomChatPenaltyDuration(duration: number): boolean {
  return duration >= 1 && duration <= 60;
}

/**
 * Validates the maximum number of chat violations before a penalty
 * @param count The maximum number of violations
 * @returns True if the count is valid, false otherwise
 */
export function validateRoomChatPenaltyCount(count: number): boolean {
  return count >= 1 && count <= 10;
}

/**
 * Validates the maximum number of chat violations before a ban
 * @param count The maximum number of violations
 * @returns True if the count is valid, false otherwise
 */
export function validateRoomChatBanCount(count: number): boolean {
  return count >= 1 && count <= 10;
}

/**
 * Validates the duration of a chat ban
 * @param duration The duration in minutes
 * @returns True if the duration is valid, false otherwise
 */
export function validateRoomChatBanDuration(duration: number): boolean {
  return duration >= 5 && duration <= 1440; // Up to 24 hours
} 