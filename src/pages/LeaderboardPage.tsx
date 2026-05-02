import React from 'react';
import Leaderboard from '../components/game/Leaderboard';
import '../styles/LeaderboardPage.css';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage; 