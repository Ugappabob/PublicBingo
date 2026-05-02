import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { gameService } from '../../services/game';
import { GameSettings } from '../../types/types';
import { validateRoomMaxPlayers, validateRoomDuration, validateRoomPassword } from '../../utils/validation';
import { templateService } from '../../services/templateService';
import { GameTemplates } from './GameTemplates';

interface CreateGameProps {
  onGameCreated?: (gameId: string) => void;
}

// Extend the Firebase User type to include admin status
interface AdminUser extends User {
  isAdmin?: boolean;
}

export const CreateGame: React.FC<CreateGameProps> = ({ onGameCreated }) => {
  const { currentUser } = useAuth();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxPlayers: 10,
    duration: 3600, // 1 hour in seconds
    maxChatMessages: 100,
    maxChatMessageRate: 5,
    isPrivate: false,
    password: '', // Empty string as default
    phraseList: '', // Empty string as default
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleTemplateSelect = async (templateId: string) => {
    try {
      // For now, we'll just set the template ID without loading the template
      // This will be implemented properly when the template service is complete
      setSelectedTemplateId(templateId);
      setErrors({});
    } catch (error) {
      setErrors({ template: 'Failed to load template' });
    }
  };

  const handlePhraseListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGameSettings(prev => ({
      ...prev,
      phraseList: event.target.value || ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRoomMaxPlayers(gameSettings.maxPlayers)) {
      newErrors.maxPlayers = 'Invalid number of players';
    }

    if (!validateRoomDuration(gameSettings.duration)) {
      newErrors.duration = 'Invalid game duration';
    }

    if (gameSettings.isPrivate && !validateRoomPassword(gameSettings.password || '')) {
      newErrors.password = 'Invalid password';
    }

    if (!gameSettings.phraseList) {
      newErrors.phraseList = 'Phrase list is required';
    }

    if (!gameSettings.boardSize || gameSettings.boardSize < 3 || gameSettings.boardSize > 10) {
      newErrors.boardSize = 'Board size must be between 3 and 10';
    }

    if (!gameSettings.winCondition) {
      newErrors.winCondition = 'Win condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(currentUser as AdminUser)?.isAdmin) {
      setErrors({ submit: 'Only admins can create games' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      let gameId: string;
      if (selectedTemplateId) {
        gameId = await templateService.createGameFromTemplate(selectedTemplateId, gameSettings);
      } else {
        gameId = await gameService.createGame(gameSettings);
      }
      onGameCreated?.(gameId);
    } catch (error) {
      setErrors({ submit: 'Failed to create game' });
    }
  };

  return (
    <div className="create-game-container">
      <h2>Create New Game</h2>
      
      <div className="templates-section">
        <h3>Select Template (Optional)</h3>
        <GameTemplates onTemplateSelect={handleTemplateSelect} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="maxPlayers">Maximum Players</label>
          <input
            type="number"
            id="maxPlayers"
            value={gameSettings.maxPlayers}
            onChange={(e) => setGameSettings({ ...gameSettings, maxPlayers: parseInt(e.target.value) })}
            min={2}
            max={50}
          />
          {errors.maxPlayers && <span className="error">{errors.maxPlayers}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gameDuration">Game Duration (seconds)</label>
          <input
            type="number"
            id="gameDuration"
            value={gameSettings.duration}
            onChange={(e) => setGameSettings({ ...gameSettings, duration: parseInt(e.target.value) })}
            min={60}
            max={3600}
          />
          {errors.duration && <span className="error">{errors.duration}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="isPrivate">Private Game</label>
          <input
            type="checkbox"
            id="isPrivate"
            checked={gameSettings.isPrivate}
            onChange={(e) => setGameSettings({ ...gameSettings, isPrivate: e.target.checked })}
          />
        </div>

        {gameSettings.isPrivate && (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={gameSettings.password}
              onChange={(e) => setGameSettings({ ...gameSettings, password: e.target.value })}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="phraseList">Phrase List</label>
          <select
            id="phraseList"
            value={gameSettings.phraseList}
            onChange={(e) => handlePhraseListChange(e)}
          >
            <option value="">Select a phrase list</option>
            {/* TODO: Add phrase list options */}
          </select>
          {errors.phraseList && <span className="error">{errors.phraseList}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="boardSize">Board Size</label>
          <input
            type="number"
            id="boardSize"
            value={gameSettings.boardSize}
            onChange={(e) => setGameSettings({ ...gameSettings, boardSize: parseInt(e.target.value) })}
            min={3}
            max={10}
          />
          {errors.boardSize && <span className="error">{errors.boardSize}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="winCondition">Win Condition</label>
          <select
            id="winCondition"
            value={gameSettings.winCondition}
            onChange={(e) => setGameSettings({ ...gameSettings, winCondition: e.target.value as 'line' | 'full' })}
          >
            <option value="line">Line</option>
            <option value="full">Full Board</option>
          </select>
          {errors.winCondition && <span className="error">{errors.winCondition}</span>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
        {errors.template && <div className="error-message">{errors.template}</div>}

        <button type="submit" className="submit-button">
          Create Game
        </button>
      </form>
    </div>
  );
}; 