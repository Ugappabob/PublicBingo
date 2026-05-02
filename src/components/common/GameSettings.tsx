import React, { useState, useEffect } from 'react';
import '../../styles/components/GameSettings.css';

interface GameSettingsProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
  currentSettings?: GameSettings;
}

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  animationsEnabled: boolean;
  autoMarkEnabled: boolean;
  showNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 70,
  musicVolume: 50,
  animationsEnabled: true,
  autoMarkEnabled: false,
  showNotifications: true,
  theme: 'auto',
  language: 'en',
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false
  }
};

const GameSettings: React.FC<GameSettingsProps> = ({ 
  isVisible, 
  onClose, 
  onSave, 
  currentSettings = DEFAULT_SETTINGS 
}) => {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'accessibility' | 'gameplay'>('audio');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
    setHasChanges(false);
  }, [currentSettings, isVisible]);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleAccessibilityChange = (key: keyof GameSettings['accessibility'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (!isVisible) return null;

  const renderAudioSettings = () => (
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🔊</span>
          <div className="setting-text">
            <h4>Sound Effects</h4>
            <p>Play sound effects during gameplay</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🎵</span>
          <div className="setting-text">
            <h4>Background Music</h4>
            <p>Play background music during games</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🔊</span>
          <div className="setting-text">
            <h4>Sound Volume</h4>
            <p>Adjust sound effects volume</p>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.soundVolume}
          onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
          className="volume-slider"
          disabled={!settings.soundEnabled}
        />
        <span className="volume-value">{settings.soundVolume}%</span>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🎵</span>
          <div className="setting-text">
            <h4>Music Volume</h4>
            <p>Adjust background music volume</p>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.musicVolume}
          onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
          className="volume-slider"
          disabled={!settings.musicEnabled}
        />
        <span className="volume-value">{settings.musicVolume}%</span>
      </div>
    </div>
  );

  const renderVisualSettings = () => (
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">✨</span>
          <div className="setting-text">
            <h4>Animations</h4>
            <p>Enable visual animations and effects</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🌙</span>
          <div className="setting-text">
            <h4>Theme</h4>
            <p>Choose your preferred color theme</p>
          </div>
        </div>
        <select
          value={settings.theme}
          onChange={(e) => handleSettingChange('theme', e.target.value)}
          className="theme-select"
        >
          <option value="auto">Auto (System)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🔔</span>
          <div className="setting-text">
            <h4>Notifications</h4>
            <p>Show game notifications and alerts</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.showNotifications}
            onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🎨</span>
          <div className="setting-text">
            <h4>High Contrast</h4>
            <p>Increase contrast for better visibility</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.accessibility.highContrast}
            onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">📝</span>
          <div className="setting-text">
            <h4>Large Text</h4>
            <p>Increase text size for better readability</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.accessibility.largeText}
            onChange={(e) => handleAccessibilityChange('largeText', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🚫</span>
          <div className="setting-text">
            <h4>Reduced Motion</h4>
            <p>Reduce animations for motion sensitivity</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.accessibility.reducedMotion}
            onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );

  const renderGameplaySettings = () => (
    <div className="settings-section">
      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">✅</span>
          <div className="setting-text">
            <h4>Auto Mark</h4>
            <p>Automatically mark cells when phrases are called</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.autoMarkEnabled}
            onChange={(e) => handleSettingChange('autoMarkEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-icon">🌍</span>
          <div className="setting-text">
            <h4>Language</h4>
            <p>Choose your preferred language</p>
          </div>
        </div>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          className="language-select"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="game-settings-overlay">
      <div className="game-settings-modal">
        <div className="settings-header">
          <h2 className="settings-title">⚙️ Game Settings</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            🔊 Audio
          </button>
          <button
            className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            ✨ Visual
          </button>
          <button
            className={`tab-button ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            ♿ Accessibility
          </button>
          <button
            className={`tab-button ${activeTab === 'gameplay' ? 'active' : ''}`}
            onClick={() => setActiveTab('gameplay')}
          >
            🎮 Gameplay
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'visual' && renderVisualSettings()}
          {activeTab === 'accessibility' && renderAccessibilitySettings()}
          {activeTab === 'gameplay' && renderGameplaySettings()}
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button">
            Reset to Defaults
          </button>
          <div className="action-buttons">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className={`save-button ${hasChanges ? 'has-changes' : ''}`}
              disabled={!hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
