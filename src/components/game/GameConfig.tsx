import React, { useState } from 'react';
import '../styles/GameConfig.css';

interface WinningPatterns {
  singleLine: boolean;
  multipleLines: boolean;
  requiredLines?: number;
  fullBoard: boolean;
  customPatterns: {
    L: boolean;
    X: boolean;
    corners: boolean;
  };
}

interface GameConfig {
  boardSize: number;
  centerSpace: {
    enabled: boolean;
    text: string;
  };
  winningPatterns: WinningPatterns;
  timeLimit: number;
  allowFreeSpace: boolean;
}

export interface GameConfiguration {
  // Board Configuration
  boardSize: 3 | 4 | 5;
  centerSpace: 'free' | 'custom' | 'none';
  centerPhrase: string;

  // Winning Conditions
  winningPatterns: WinningPatterns;

  // Team Settings
  teamMode: boolean;
  
  // Visibility Settings
  visibility: {
    showProgress: boolean;
    showMarkedPhrases: boolean;
    showScores: boolean;
    realTimeUpdates: boolean;
  };

  // Scoring & Achievements
  enableLeaderboard: boolean;
  enableAchievements: boolean;
}

interface GameConfigProps {
  onConfigurationComplete: (config: GameConfiguration) => void;
  initialConfig?: Partial<GameConfiguration>;
}

const defaultConfig: GameConfiguration = {
  boardSize: 5,
  centerSpace: 'free',
  centerPhrase: '',
  winningPatterns: {
    singleLine: true,
    multipleLines: false,
    fullBoard: false,
    customPatterns: {
      L: false,
      X: false,
      corners: false
    }
  },
  teamMode: false,
  visibility: {
    showProgress: true,
    showMarkedPhrases: true,
    showScores: true,
    realTimeUpdates: true
  },
  enableLeaderboard: true,
  enableAchievements: true
};

const GameConfig: React.FC<GameConfigProps> = ({
  onConfigurationComplete,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<GameConfiguration>({
    ...defaultConfig,
    ...initialConfig
  });

  const handleBoardSizeChange = (size: 3 | 4 | 5) => {
    setConfig({ ...config, boardSize: size });
  };

  const handleCenterSpaceChange = (type: 'free' | 'custom' | 'none') => {
    setConfig({ ...config, centerSpace: type });
  };

  const handleWinningPatternChange = (
    pattern: keyof GameConfiguration['winningPatterns'],
    value: boolean | number
  ) => {
    setConfig({
      ...config,
      winningPatterns: {
        ...config.winningPatterns,
        [pattern]: value
      }
    });
  };

  const handleCustomPatternChange = (
    pattern: keyof GameConfiguration['winningPatterns']['customPatterns']
  ) => {
    setConfig({
      ...config,
      winningPatterns: {
        ...config.winningPatterns,
        customPatterns: {
          ...config.winningPatterns.customPatterns,
          [pattern]: !config.winningPatterns.customPatterns[pattern]
        }
      }
    });
  };

  const handleVisibilityChange = (
    setting: keyof GameConfiguration['visibility']
  ) => {
    setConfig({
      ...config,
      visibility: {
        ...config.visibility,
        [setting]: !config.visibility[setting]
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigurationComplete(config);
  };

  return (
    <div className="game-config">
      <h2>Game Configuration</h2>
      <form onSubmit={handleSubmit}>
        {/* Board Configuration */}
        <div className="config-section">
          <h3>Board Configuration</h3>
          <div className="board-size-selector">
            <h4>Board Size</h4>
            <div className="size-buttons">
              <button 
                className={config.boardSize === 3 ? 'active' : ''} 
                onClick={() => handleBoardSizeChange(3)}
              >3x3</button>
              <button 
                className={config.boardSize === 4 ? 'active' : ''} 
                onClick={() => handleBoardSizeChange(4)}
              >4x4</button>
              <button 
                className={config.boardSize === 5 ? 'active' : ''} 
                onClick={() => handleBoardSizeChange(5)}
              >5x5</button>
            </div>
          </div>

          <div className="center-space-config">
            <h4>Center Space</h4>
            <select 
              value={config.centerSpace} 
              onChange={(e) => handleCenterSpaceChange(e.target.value as 'free' | 'custom' | 'none')}
            >
              <option value="free">Free Space</option>
              <option value="custom">Custom Text</option>
              <option value="none">No Special Center</option>
            </select>
            {config.centerSpace === 'custom' && (
              <input
                type="text"
                value={config.centerPhrase}
                onChange={(e) => setConfig({ ...config, centerPhrase: e.target.value })}
                placeholder="Enter custom center text"
              />
            )}
          </div>
        </div>

        {/* Winning Conditions */}
        <div className="config-section">
          <h3>Winning Conditions</h3>
          <div className="winning-patterns">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.winningPatterns.singleLine}
                onChange={(e) => handleWinningPatternChange('singleLine', e.target.checked)}
              />
              Single Line (Row, Column, or Diagonal)
            </label>

            <div className="multiple-lines">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.winningPatterns.multipleLines}
                  onChange={(e) => handleWinningPatternChange('multipleLines', e.target.checked)}
                />
                Multiple Lines
              </label>
              {config.winningPatterns.multipleLines && (
                <select
                  value={config.winningPatterns.requiredLines || 2}
                  onChange={(e) => {
                    const updatedConfig = {
                      ...config,
                      winningPatterns: {
                        ...config.winningPatterns,
                        requiredLines: parseInt(e.target.value)
                      }
                    };
                    setConfig(updatedConfig);
                  }}
                >
                  {Array.from({ length: config.boardSize * 2 + 2 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} Lines</option>
                  ))}
                </select>
              )}
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.winningPatterns.fullBoard}
                onChange={(e) => handleWinningPatternChange('fullBoard', e.target.checked)}
              />
              Full Board
            </label>

            <div className="custom-patterns">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.winningPatterns.customPatterns.L}
                  onChange={() => handleCustomPatternChange('L')}
                />
                L-Shape
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.winningPatterns.customPatterns.X}
                  onChange={() => handleCustomPatternChange('X')}
                />
                X-Shape
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.winningPatterns.customPatterns.corners}
                  onChange={() => handleCustomPatternChange('corners')}
                />
                Corners
              </label>
            </div>
          </div>
        </div>

        {/* Team Mode */}
        <div className="config-section">
          <h3>Team Settings</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.teamMode}
              onChange={(e) => setConfig({ ...config, teamMode: e.target.checked })}
            />
            Enable Team Mode
          </label>
        </div>

        {/* Visibility Settings */}
        <div className="config-section">
          <h3>Visibility Settings</h3>
          <div className="visibility-options">
            {Object.entries(config.visibility).map(([key, value]) => (
              <label key={key} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleVisibilityChange(key as keyof GameConfiguration['visibility'])}
                />
                {key === 'showProgress' && 'Show Other Players\' Progress'}
                {key === 'showMarkedPhrases' && 'Show Marked Phrases List'}
                {key === 'showScores' && 'Show Player Scores'}
                {key === 'realTimeUpdates' && 'Enable Real-time Updates'}
              </label>
            ))}
          </div>
        </div>

        {/* Scoring & Achievements */}
        <div className="config-section">
          <h3>Scoring & Achievements</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.enableLeaderboard}
              onChange={(e) => setConfig({ ...config, enableLeaderboard: e.target.checked })}
            />
            Enable Leaderboard
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.enableAchievements}
              onChange={(e) => setConfig({ ...config, enableAchievements: e.target.checked })}
            />
            Enable Achievements
          </label>
        </div>

        <button type="submit" className="save-config">
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default GameConfig; 