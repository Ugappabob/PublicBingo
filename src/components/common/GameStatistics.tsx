import React, { useState, useEffect } from 'react';
import '../../styles/components/GameStatistics.css';

interface GameStatisticsProps {
  isVisible: boolean;
  onClose: () => void;
  gameData: {
    gameId: string;
    startTime: number;
    endTime?: number;
    totalPlayers: number;
    phrasesCalled: string[];
    playerStats: {
      [uid: string]: {
        displayName: string;
        markedCells: string[];
        hasWon: boolean;
        joinTime: number;
        lastActive: number;
      };
    };
  };
}

interface GameMetrics {
  duration: number;
  phrasesPerMinute: number;
  averageMarkedPerPlayer: number;
  winRate: number;
  mostActivePlayer: string;
  fastestWin: number;
  totalMarks: number;
}

interface PlayerPerformance {
  uid: string;
  displayName: string;
  marksCount: number;
  winTime?: number;
  activityRate: number;
  efficiency: number;
}

const GameStatistics: React.FC<GameStatisticsProps> = ({ 
  isVisible, 
  onClose, 
  gameData 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'timeline' | 'charts'>('overview');
  const [metrics, setMetrics] = useState<GameMetrics | null>(null);
  const [playerPerformance, setPlayerPerformance] = useState<PlayerPerformance[]>([]);

  useEffect(() => {
    if (gameData) {
      calculateMetrics();
      calculatePlayerPerformance();
    }
  }, [gameData]);

  const calculateMetrics = () => {
    const duration = (gameData.endTime || Date.now()) - gameData.startTime;
    const phrasesPerMinute = duration > 0 ? (gameData.phrasesCalled.length / duration) * 60000 : 0;
    
    const totalMarks = Object.values(gameData.playerStats).reduce(
      (sum, player) => sum + player.markedCells.length, 
      0
    );
    
    const averageMarkedPerPlayer = gameData.totalPlayers > 0 
      ? totalMarks / gameData.totalPlayers 
      : 0;
    
    const winners = Object.values(gameData.playerStats).filter(p => p.hasWon);
    const winRate = gameData.totalPlayers > 0 
      ? (winners.length / gameData.totalPlayers) * 100 
      : 0;
    
    const mostActivePlayer = Object.entries(gameData.playerStats)
      .sort(([, a], [, b]) => b.markedCells.length - a.markedCells.length)[0]?.[1].displayName || 'None';
    
    const fastestWin = winners.length > 0 
      ? Math.min(...winners.map(w => w.lastActive - gameData.startTime))
      : 0;

    setMetrics({
      duration,
      phrasesPerMinute,
      averageMarkedPerPlayer,
      winRate,
      mostActivePlayer,
      fastestWin,
      totalMarks
    });
  };

  const calculatePlayerPerformance = () => {
    const performance: PlayerPerformance[] = Object.entries(gameData.playerStats).map(([uid, player]) => {
      const activityDuration = player.lastActive - player.joinTime;
      const totalGameDuration = (gameData.endTime || Date.now()) - gameData.startTime;
      const activityRate = totalGameDuration > 0 ? (activityDuration / totalGameDuration) * 100 : 0;
      
      const efficiency = gameData.phrasesCalled.length > 0 
        ? (player.markedCells.length / gameData.phrasesCalled.length) * 100 
        : 0;
      
      const winTime = player.hasWon ? player.lastActive - gameData.startTime : undefined;
      
      return {
        uid,
        displayName: player.displayName,
        marksCount: player.markedCells.length,
        winTime,
        activityRate,
        efficiency
      };
    });

    performance.sort((a, b) => b.marksCount - a.marksCount);
    setPlayerPerformance(performance);
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getPerformanceColor = (efficiency: number): string => {
    if (efficiency >= 80) return '#4CAF50';
    if (efficiency >= 60) return '#FF9800';
    if (efficiency >= 40) return '#2196F3';
    return '#9E9E9E';
  };

  const renderOverview = () => (
    <div className="stats-section">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">{formatDuration(metrics?.duration || 0)}</div>
            <div className="metric-label">Game Duration</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.phrasesPerMinute.toFixed(1) || 0}</div>
            <div className="metric-label">Phrases/Minute</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{gameData.totalPlayers}</div>
            <div className="metric-label">Total Players</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.totalMarks || 0}</div>
            <div className="metric-label">Total Marks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.winRate.toFixed(1) || 0}%</div>
            <div className="metric-label">Win Rate</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-value">{formatDuration(metrics?.fastestWin || 0)}</div>
            <div className="metric-label">Fastest Win</div>
          </div>
        </div>
      </div>

      <div className="highlight-section">
        <h3>🏅 Highlights</h3>
        <div className="highlights-list">
          <div className="highlight-item">
            <span className="highlight-icon">👑</span>
            <span className="highlight-text">
              <strong>Most Active Player:</strong> {metrics?.mostActivePlayer}
            </span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">📈</span>
            <span className="highlight-text">
              <strong>Average Marks per Player:</strong> {metrics?.averageMarkedPerPlayer.toFixed(1) || 0}
            </span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🎲</span>
            <span className="highlight-text">
              <strong>Total Phrases Called:</strong> {gameData.phrasesCalled.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="stats-section">
      <div className="players-table">
        <div className="table-header">
          <div className="header-cell">Rank</div>
          <div className="header-cell">Player</div>
          <div className="header-cell">Marks</div>
          <div className="header-cell">Efficiency</div>
          <div className="header-cell">Activity</div>
          <div className="header-cell">Win Time</div>
        </div>
        
        {playerPerformance.map((player, index) => (
          <div key={player.uid} className="table-row">
            <div className="table-cell rank-cell">
              {index + 1}
              {index < 3 && <span className="medal">🥇🥈🥉</span>}
            </div>
            <div className="table-cell name-cell">
              {player.displayName}
              {player.winTime && <span className="winner-badge">🏆</span>}
            </div>
            <div className="table-cell">{player.marksCount}</div>
            <div className="table-cell">
              <div className="efficiency-bar">
                <div 
                  className="efficiency-fill"
                  style={{ 
                    width: `${player.efficiency}%`,
                    backgroundColor: getPerformanceColor(player.efficiency)
                  }}
                />
                <span className="efficiency-text">{player.efficiency.toFixed(1)}%</span>
              </div>
            </div>
            <div className="table-cell">{player.activityRate.toFixed(1)}%</div>
            <div className="table-cell">
              {player.winTime ? formatDuration(player.winTime) : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="stats-section">
      <div className="timeline-container">
        <h3>📅 Game Timeline</h3>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker start"></div>
            <div className="timeline-content">
              <div className="timeline-time">{new Date(gameData.startTime).toLocaleTimeString()}</div>
              <div className="timeline-title">Game Started</div>
              <div className="timeline-description">
                {gameData.totalPlayers} players joined the game
              </div>
            </div>
          </div>

          {gameData.phrasesCalled.length > 0 && (
            <div className="timeline-item">
              <div className="timeline-marker phrase"></div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {new Date(gameData.startTime + (metrics?.duration || 0) / 2).toLocaleTimeString()}
                </div>
                <div className="timeline-title">First Phrase Called</div>
                <div className="timeline-description">
                  "{gameData.phrasesCalled[0]}" was the first phrase called
                </div>
              </div>
            </div>
          )}

          {Object.values(gameData.playerStats).filter(p => p.hasWon).map((winner, index) => (
            <div key={winner.displayName} className="timeline-item">
              <div className="timeline-marker win"></div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {new Date(winner.lastActive).toLocaleTimeString()}
                </div>
                <div className="timeline-title">BINGO! 🎉</div>
                <div className="timeline-description">
                  {winner.displayName} won the game!
                </div>
              </div>
            </div>
          ))}

          {gameData.endTime && (
            <div className="timeline-item">
              <div className="timeline-marker end"></div>
              <div className="timeline-content">
                <div className="timeline-time">{new Date(gameData.endTime).toLocaleTimeString()}</div>
                <div className="timeline-title">Game Ended</div>
                <div className="timeline-description">
                  Game completed after {formatDuration(metrics?.duration || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="stats-section">
      <div className="charts-container">
        <h3>📊 Performance Charts</h3>
        <div className="charts-grid">
          <div className="chart-card">
            <h4>Player Performance</h4>
            <div className="chart-placeholder">
              <span className="chart-icon">📈</span>
              <p>Performance chart would be displayed here</p>
            </div>
          </div>
          
          <div className="chart-card">
            <h4>Activity Timeline</h4>
            <div className="chart-placeholder">
              <span className="chart-icon">⏰</span>
              <p>Activity timeline would be displayed here</p>
            </div>
          </div>
          
          <div className="chart-card">
            <h4>Win Distribution</h4>
            <div className="chart-placeholder">
              <span className="chart-icon">🎯</span>
              <p>Win distribution chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="game-statistics-overlay">
      <div className="game-statistics-modal">
        <div className="statistics-header">
          <h2 className="statistics-title">📊 Game Statistics</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <div className="statistics-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            👥 Players
          </button>
          <button
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📅 Timeline
          </button>
          <button
            className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            📊 Charts
          </button>
        </div>

        <div className="statistics-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'players' && renderPlayers()}
          {activeTab === 'timeline' && renderTimeline()}
          {activeTab === 'charts' && renderCharts()}
        </div>

        <div className="statistics-footer">
          <button onClick={onClose} className="close-stats-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameStatistics;
