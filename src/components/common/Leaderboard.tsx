import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Leaderboard.css';

interface Player {
  displayName: string;
  markedCells: string[];
  hasWon: boolean;
  lastActive?: string;
  joinTime?: string;
}

interface LeaderboardProps {
  players: { [uid: string]: Player };
  gameId: string;
  showStats?: boolean;
  maxPlayers?: number;
}

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  markedCount: number;
  hasWon: boolean;
  rank: number;
  joinTime: string;
  isCurrentUser: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  players, 
  gameId, 
  showStats = true, 
  maxPlayers = 10 
}) => {
  const { currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'marked' | 'joinTime' | 'wins'>('marked');
  const [showCurrentUserOnly, setShowCurrentUserOnly] = useState(false);

  useEffect(() => {
    const processPlayers = () => {
      const entries: LeaderboardEntry[] = Object.entries(players).map(([uid, player]) => ({
        uid,
        displayName: player.displayName,
        markedCount: player.markedCells.length,
        hasWon: player.hasWon,
        rank: 0, // Will be calculated after sorting
        joinTime: player.joinTime || player.lastActive || new Date().toISOString(),
        isCurrentUser: currentUser?.uid === uid
      }));

      // Sort entries based on current sort criteria
      entries.sort((a, b) => {
        switch (sortBy) {
          case 'marked':
            return b.markedCount - a.markedCount;
          case 'joinTime':
            return new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime();
          case 'wins':
            return (b.hasWon ? 1 : 0) - (a.hasWon ? 1 : 0);
          default:
            return 0;
        }
      });

      // Assign ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Filter if showing current user only
      const filteredEntries = showCurrentUserOnly 
        ? entries.filter(entry => entry.isCurrentUser)
        : entries.slice(0, maxPlayers);

      setLeaderboardData(filteredEntries);
    };

    processPlayers();
  }, [players, sortBy, showCurrentUserOnly, maxPlayers, currentUser?.uid]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getPlayerStatus = (entry: LeaderboardEntry) => {
    if (entry.hasWon) return 'winner';
    if (entry.isCurrentUser) return 'current-user';
    return 'normal';
  };

  const formatJoinTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3 className="leaderboard-title">🏆 Leaderboard</h3>
        <div className="leaderboard-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'marked' | 'joinTime' | 'wins')}
            className="sort-select"
          >
            <option value="marked">By Progress</option>
            <option value="joinTime">By Join Time</option>
            <option value="wins">By Wins</option>
          </select>
          <button
            onClick={() => setShowCurrentUserOnly(!showCurrentUserOnly)}
            className={`filter-button ${showCurrentUserOnly ? 'active' : ''}`}
          >
            {showCurrentUserOnly ? 'Show All' : 'Show Me Only'}
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        {leaderboardData.length === 0 ? (
          <div className="no-players">
            <p>No players yet. Be the first to join!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboardData.map((entry) => (
              <div 
                key={entry.uid} 
                className={`leaderboard-entry ${getPlayerStatus(entry)}`}
              >
                <div className="rank-info">
                  <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                  <span className="player-name">
                    {entry.displayName}
                    {entry.isCurrentUser && <span className="current-user-indicator"> (You)</span>}
                  </span>
                </div>
                
                <div className="player-stats">
                  <span className="marked-count">
                    {entry.markedCount} marked
                  </span>
                  {entry.hasWon && (
                    <span className="winner-badge">🎉 Winner!</span>
                  )}
                  <span className="join-time">
                    Joined: {formatJoinTime(entry.joinTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStats && (
        <div className="leaderboard-stats">
          <div className="stat-item">
            <span className="stat-label">Total Players:</span>
            <span className="stat-value">{Object.keys(players).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Winners:</span>
            <span className="stat-value">
              {Object.values(players).filter(p => p.hasWon).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Progress:</span>
            <span className="stat-value">
              {Object.values(players).length > 0 
                ? Math.round(Object.values(players).reduce((sum, p) => sum + p.markedCells.length, 0) / Object.values(players).length)
                : 0
              } cells
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
