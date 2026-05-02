import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/GameProgress.css';

interface GameProgressProps {
  totalPhrases: number;
  calledPhrases: string[];
  playerMarkedCount: number;
  totalPlayers: number;
  gameStatus: 'creating' | 'active' | 'completed';
  isPlaying: boolean;
  currentTurn?: string;
  gameStartTime?: number;
  onGameStart?: () => void;
}

interface ProgressStats {
  phrasesCalled: number;
  phrasesRemaining: number;
  progressPercentage: number;
  averageMarkedPerPlayer: number;
  gameDuration: number;
  estimatedTimeRemaining: number;
}

const GameProgress: React.FC<GameProgressProps> = ({
  totalPhrases,
  calledPhrases,
  playerMarkedCount,
  totalPlayers,
  gameStatus,
  isPlaying,
  currentTurn,
  gameStartTime,
  onGameStart
}) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    phrasesCalled: 0,
    phrasesRemaining: 0,
    progressPercentage: 0,
    averageMarkedPerPlayer: 0,
    gameDuration: 0,
    estimatedTimeRemaining: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const calculateStats = () => {
      const phrasesCalled = calledPhrases.length;
      const phrasesRemaining = totalPhrases - phrasesCalled;
      const progressPercentage = totalPhrases > 0 ? (phrasesCalled / totalPhrases) * 100 : 0;
      
      // Calculate game duration
      const gameDuration = gameStartTime ? Date.now() - gameStartTime : 0;
      
      // Estimate time remaining based on current pace
      let estimatedTimeRemaining = 0;
      if (phrasesCalled > 0 && gameDuration > 0) {
        const phrasesPerMinute = (phrasesCalled / gameDuration) * 60000;
        estimatedTimeRemaining = phrasesRemaining / phrasesPerMinute;
      }

      setStats({
        phrasesCalled,
        phrasesRemaining,
        progressPercentage,
        averageMarkedPerPlayer: totalPlayers > 0 ? playerMarkedCount / totalPlayers : 0,
        gameDuration,
        estimatedTimeRemaining
      });
    };

    calculateStats();
    
    // Update stats every second when game is active
    const interval = isPlaying ? setInterval(calculateStats, 1000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [totalPhrases, calledPhrases, playerMarkedCount, totalPlayers, isPlaying, gameStartTime]);

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    if (percentage >= 40) return '#2196F3';
    return '#9E9E9E';
  };

  const getStatusIcon = (): string => {
    switch (gameStatus) {
      case 'creating': return '🔄';
      case 'active': return '🎮';
      case 'completed': return '🏁';
      default: return '⏸️';
    }
  };

  const getStatusText = (): string => {
    switch (gameStatus) {
      case 'creating': return 'Setting up game...';
      case 'active': return 'Game in progress';
      case 'completed': return 'Game completed';
      default: return 'Game paused';
    }
  };

  return (
    <div className="game-progress-container">
      <div className="progress-header">
        <h3 className="progress-title">
          {getStatusIcon()} Game Progress
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="details-toggle"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="progress-main">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${stats.progressPercentage}%`,
                backgroundColor: getProgressColor(stats.progressPercentage)
              }}
            />
          </div>
          <div className="progress-text">
            {stats.phrasesCalled} / {totalPhrases} phrases called
            <span className="progress-percentage">
              ({stats.progressPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="game-status">
          <span className="status-text">{getStatusText()}</span>
          {currentTurn && (
            <span className="current-turn">
              Current turn: {currentTurn === currentUser?.uid ? 'Your turn' : 'Other player'}
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="progress-details">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Phrases Called</div>
                <div className="stat-value">{stats.phrasesCalled}</div>
                <div className="stat-subtitle">{stats.phrasesRemaining} remaining</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Players</div>
                <div className="stat-value">{totalPlayers}</div>
                <div className="stat-subtitle">Active in game</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">Your Progress</div>
                <div className="stat-value">{playerMarkedCount}</div>
                <div className="stat-subtitle">cells marked</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-label">Game Duration</div>
                <div className="stat-value">{formatDuration(stats.gameDuration)}</div>
                {stats.estimatedTimeRemaining > 0 && (
                  <div className="stat-subtitle">
                    ~{formatDuration(stats.estimatedTimeRemaining * 60000)} remaining
                  </div>
                )}
              </div>
            </div>
          </div>

          {gameStatus === 'creating' && totalPhrases >= 24 && (
            <div className="game-ready-alert">
              <div className="alert-content">
                <span className="alert-icon">🎉</span>
                <span className="alert-text">Game is ready to start!</span>
                <button 
                  onClick={onGameStart}
                  className="start-game-btn"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameProgress;
