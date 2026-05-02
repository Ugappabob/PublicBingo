import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FirebaseTest from './FirebaseTest';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>🎯 Welcome to Public Bingo!</h1>
        <p className="home-description">
          Create and join bingo games with friends and family. 
          No account required to play!
        </p>

        {/* Firebase Test Component for debugging */}
        <FirebaseTest />

        {currentUser ? (
          <div className="user-actions">
            <h2>Welcome back, {currentUser.displayName || 'Player'}!</h2>
            {!currentUser.email && (
              <div className="guest-notice">
                <p>🎉 You're playing as a guest</p>
                <p>Create an account to save your games and access more features!</p>
              </div>
            )}
            <div className="action-buttons">
              <Link to="/create" className="action-button primary">
                🎮 Create New Game
              </Link>
              <Link to="/join" className="action-button secondary">
                🎯 Join Game
              </Link>
              <Link to="/lists" className="action-button secondary">
                📝 My Lists
              </Link>
              <Link to="/signup" className="action-button secondary">
                📝 Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="guest-actions">
            <h2>Ready to Play?</h2>
            <div className="action-buttons">
              <Link to="/guest" className="action-button primary">
                🎮 Play as Guest
              </Link>
              <Link to="/join" className="action-button secondary">
                🎯 Join Game
              </Link>
              <Link to="/signin" className="action-button secondary">
                🔐 Sign In
              </Link>
              <Link to="/signup" className="action-button secondary">
                📝 Create Account
              </Link>
            </div>
            <div className="guest-benefits">
              <h3>Why Play as Guest?</h3>
              <ul>
                <li>✅ No account required</li>
                <li>✅ Start playing immediately</li>
                <li>✅ Join any game with a link</li>
                <li>✅ Real-time multiplayer</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 