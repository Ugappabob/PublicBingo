import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/index';
import { useAuth } from '../contexts/AuthContext';
import '../styles/App.css';

const JoinGame = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameInfo, setGameInfo] = useState<any>(null);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setGameInfo(null);

    if (!gameCode.trim()) {
      setError('Please enter a game code');
      setLoading(false);
      return;
    }

    try {
      // Check if the game exists
      const gameRef = doc(db, 'games', gameCode.trim());
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        setError('Game not found. Please check the game code and try again.');
        setLoading(false);
        return;
      }

      const gameData = gameDoc.data();
      
      // Check if game is still active
      if (gameData.status === 'completed') {
        setError('This game has already ended.');
        setLoading(false);
        return;
      }

      // Show game info before joining
      setGameInfo({
        id: gameCode.trim(),
        ...gameData
      });
      setLoading(false);

    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please try again.');
      setLoading(false);
    }
  };

  const confirmJoin = () => {
    if (gameInfo) {
      navigate(`/game/${gameInfo.id}`);
    }
  };

  const handleBack = () => {
    setGameInfo(null);
    setGameCode('');
    setError('');
  };

  return (
    <div className="join-game-container">
      <div className="join-game-content">
        <h1>🎮 Join a Game</h1>
        <p className="join-description">
          Enter the game code provided by the host to join an existing game.
        </p>

        {!gameInfo ? (
          <form onSubmit={handleJoinGame} className="join-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="gameCode">Game Code</label>
              <input
                id="gameCode"
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter game code (e.g., ABC123)"
                required
                maxLength={20}
                className="game-code-input"
              />
            </div>

            <button 
              type="submit" 
              className="join-button"
              disabled={loading || !gameCode.trim()}
            >
              {loading ? 'Checking Game...' : 'Join Game'}
            </button>

            <div className="join-help">
              <p>💡 Game codes are usually shared by the host via:</p>
              <ul>
                <li>Direct link</li>
                <li>Text message</li>
                <li>Email invitation</li>
              </ul>
            </div>
          </form>
        ) : (
          <div className="game-confirmation">
            <h2>Game Found!</h2>
            <div className="game-details">
              <p><strong>Game Code:</strong> {gameInfo.id}</p>
              <p><strong>Status:</strong> {gameInfo.status}</p>
              <p><strong>Created by:</strong> {gameInfo.participants?.[gameInfo.createdBy]?.displayName || 'Unknown'}</p>
              <p><strong>Players:</strong> {Object.keys(gameInfo.participants || {}).length}</p>
              <p><strong>Phrases:</strong> {gameInfo.phrases?.length || 0}</p>
            </div>

            <div className="confirmation-actions">
              <button onClick={confirmJoin} className="confirm-join-button">
                🎮 Join Game
              </button>
              <button onClick={handleBack} className="back-button">
                ← Try Different Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGame; 