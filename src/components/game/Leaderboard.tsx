import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, where, limit as queryLimit } from 'firebase/firestore';
import '../../styles/Leaderboard.css';

interface PlayerStats {
  id: string;
  displayName: string;
  totalWins: number;
  gamesPlayed: number;
  averageMoves: number;
  winRate: number;
  bestTime: number;
  lastPlayed: Date;
}

interface LeaderboardProps {
  limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ limit = 100 }) => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('totalWins');
  const [timeFrame, setTimeFrame] = useState<'all' | 'week' | 'month'>('all');
  const [filterBy, setFilterBy] = useState<'all' | 'active'>('all');

  useEffect(() => {
    fetchLeaderboardData();
  }, [sortBy, timeFrame, filterBy]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let leaderboardQuery = query(collection(db, 'users'));
      
      // Apply time frame filter
      if (timeFrame !== 'all') {
        const cutoffDate = new Date();
        if (timeFrame === 'week') {
          cutoffDate.setDate(cutoffDate.getDate() - 7);
        } else if (timeFrame === 'month') {
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        }
        leaderboardQuery = query(leaderboardQuery, where('lastPlayed', '>=', cutoffDate));
      }

      // Apply active players filter
      if (filterBy === 'active') {
        leaderboardQuery = query(leaderboardQuery, where('gamesPlayed', '>', 0));
      }

      // Apply sorting and limit
      leaderboardQuery = query(
        leaderboardQuery,
        orderBy(sortBy, 'desc'),
        queryLimit(limit)
      );

      const querySnapshot = await getDocs(leaderboardQuery);
      const playerData: PlayerStats[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        playerData.push({
          id: doc.id,
          displayName: data.displayName || 'Anonymous',
          totalWins: data.totalWins || 0,
          gamesPlayed: data.gamesPlayed || 0,
          averageMoves: data.averageMoves || 0,
          winRate: data.gamesPlayed ? (data.totalWins / data.gamesPlayed) * 100 : 0,
          bestTime: data.bestTime || 0,
          lastPlayed: data.lastPlayed?.toDate() || new Date(0),
        });
      });

      setPlayers(playerData);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Error fetching leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof PlayerStats)}
          >
            <option value="totalWins">Total Wins</option>
            <option value="winRate">Win Rate</option>
            <option value="gamesPlayed">Games Played</option>
            <option value="averageMoves">Average Moves</option>
            <option value="bestTime">Best Time</option>
          </select>
        </div>

        <div className="control-group">
          <label>Time Frame:</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as 'all' | 'week' | 'month')}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'active')}
          >
            <option value="all">All Players</option>
            <option value="active">Active Players</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading leaderboard data...</div>
      ) : (
        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Wins</th>
                <th>Games</th>
                <th>Win Rate</th>
                <th>Avg. Moves</th>
                <th>Best Time</th>
                <th>Last Played</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                  <td>{index + 1}</td>
                  <td>{player.displayName}</td>
                  <td>{player.totalWins}</td>
                  <td>{player.gamesPlayed}</td>
                  <td>{player.winRate.toFixed(1)}%</td>
                  <td>{player.averageMoves.toFixed(1)}</td>
                  <td>{player.bestTime}</td>
                  <td>{formatDate(player.lastPlayed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 