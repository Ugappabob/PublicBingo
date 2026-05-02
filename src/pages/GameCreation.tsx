import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameService } from '../services/gameService';
import { usageTrackingService } from '../services/usageTrackingService';
import { firebaseAnalyticsService } from '../services/firebaseAnalyticsService';
import DefaultPhraseSelector from '../components/common/DefaultPhraseSelector';
import ContributePhraseList from '../components/common/ContributePhraseList';
import { defaultPhraseLists } from '../data/defaultPhraseLists';
import '../styles/GameCreation.css';

const GameCreation: React.FC = () => {
  console.log('GameCreation component loaded!');
  
  const [selectedDefaultPhrases, setSelectedDefaultPhrases] = useState<string[]>([]);
  const [showDefaultSelector, setShowDefaultSelector] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('GameCreation - currentUser:', currentUser);
  console.log('GameCreation - Component is rendering!');
  console.log('GameCreation - showDefaultSelector:', showDefaultSelector);
  console.log('GameCreation - selectedDefaultPhrases:', selectedDefaultPhrases);

  const handleDefaultPhrasesSelect = (phrases: string[]) => {
    console.log('Phrases selected!');
    console.log(`Received ${phrases.length} phrases`);
    console.log(`First few: ${phrases.slice(0, 3).join(', ')}`);
    
    console.log('=== PHRASE SELECTION DEBUG ===');
    console.log('Received phrases:', phrases);
    console.log('Phrases length:', phrases.length);
    console.log('First few phrases:', phrases.slice(0, 5));
    setSelectedDefaultPhrases(phrases);
    console.log('Selected phrases set:', phrases);
  };

  const copyInviteLink = async () => {
    if (createdGameId) {
      const inviteLink = `${window.location.origin}/game/${createdGameId}`;
      try {
        await navigator.clipboard.writeText(inviteLink);
        console.log('Invite link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Fallback: show the link in a prompt
        prompt('Copy this link to invite others:', inviteLink);
      }
    }
  };

  const shareViaWhatsApp = () => {
    if (createdGameId) {
      const inviteLink = `${window.location.origin}/game/${createdGameId}`;
      const message = `🎮 Join my Bingo game! 🎯\n\nPlay bingo with me using this link:\n${inviteLink}\n\nNo account needed - just click and play! 🎉`;
      
      // WhatsApp URL scheme
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const shareViaEmail = () => {
    if (createdGameId) {
      const inviteLink = `${window.location.origin}/game/${createdGameId}`;
      const subject = '🎮 Join my Bingo game!';
      const body = `Hi!\n\nI've created a fun Bingo game and would love for you to join me!\n\nGame link: ${inviteLink}\n\nNo account needed - just click the link and start playing!\n\nHope to see you there! 🎯🎉`;
      
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  const startGame = () => {
    console.log('Start Playing Now clicked!');
    console.log(`Navigating to game: ${createdGameId}`);
    if (createdGameId) {
      navigate(`/game/${createdGameId}`);
    }
  };

  const createNewGame = () => {
    setCreatedGameId(null);
    setShowInviteLink(false);
    setSelectedDefaultPhrases([]);
    setShowDefaultSelector(true);
  };

  const handleCreateGame = async () => {
    console.log('Create Game button clicked!');
    console.log(`Selected phrases: ${selectedDefaultPhrases.length} phrases`);
    console.log(`First few phrases: ${selectedDefaultPhrases.slice(0, 3).join(', ')}`);
    console.log(`Full phrases array: ${JSON.stringify(selectedDefaultPhrases)}`);
    
    if (selectedDefaultPhrases.length === 0) {
      console.log('Please select at least one phrase list before creating a game.');
      return;
    }

    console.log('=== GAME CREATION DEBUG ===');
    console.log('selectedDefaultPhrases:', selectedDefaultPhrases);
    console.log('selectedDefaultPhrases length:', selectedDefaultPhrases.length);
    console.log('First few phrases:', selectedDefaultPhrases.slice(0, 5));

    try {
      // Create a new game session using the game service
      const gameId = await gameService.createGameSession(
        selectedDefaultPhrases,
        currentUser?.uid || 'anonymous',
        currentUser?.displayName || 'Anonymous'
      );
      
      console.log('Game created with ID:', gameId);
      console.log('Game phrases:', selectedDefaultPhrases);
      
      // Track usage of the selected phrase list
      // For now, we'll track it as a single "combined" list usage
      // In the future, we could track individual phrase usage
      const listId = `combined-${Date.now()}`;
      const listName = `Combined List (${selectedDefaultPhrases.length} phrases)`;
      await usageTrackingService.recordListUsage(listId, listName, 'default');
      
          // Record game session analytics
          await firebaseAnalyticsService.recordGameSession(
            gameId,
            selectedDefaultPhrases,
            currentUser?.uid || 'anonymous',
            currentUser?.displayName || 'Anonymous'
          );
      
      // Show invitation link instead of immediately navigating
      setCreatedGameId(gameId);
      setShowInviteLink(true);
    } catch (error) {
      console.error('Error creating game:', error);
      console.error('Failed to create game. Please try again.');
    }
  };

  return (
    <div className="game-creation">
      <div className="game-creation-header">
        <h1>Create New Bingo Game</h1>
        
        {!currentUser && (
          <div className="public-access-notice">
            <h3>🎉 Welcome! You can create and play bingo games without signing up!</h3>
            <p>Choose from our public phrase lists below, or add your own custom phrases. No account required!</p>
          </div>
        )}
      </div>

      {showDefaultSelector && (
        <>
          {console.log('Rendering DefaultPhraseSelector component')}
          <DefaultPhraseSelector
            onPhraseListSelect={handleDefaultPhrasesSelect}
            selectedPhrases={selectedDefaultPhrases}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}

          {/* Contribute your own list */}
          <ContributePhraseList onRefresh={() => {
            // Trigger refresh of the phrase lists
            setRefreshTrigger(prev => prev + 1);
          }} />

      {/* Invitation section - shown after game creation */}
      {showInviteLink && createdGameId && (
        <div className="invitation-section">
          <div className="invitation-success">
            <h2>🎉 Game Created Successfully!</h2>
            <p>Your bingo game is ready. Share the link below to invite others to play!</p>
          </div>
          
          <div className="invite-link-container">
            <h3>📤 Invite Others to Play</h3>
            <div className="invite-link-box">
              <input 
                type="text" 
                value={`${window.location.origin}/game/${createdGameId}`}
                readOnly
                className="invite-link-input"
              />
              <button 
                onClick={copyInviteLink}
                className="copy-link-btn"
              >
                📋 Copy Link
              </button>
            </div>
            
            <div className="share-buttons">
              <h4>📱 Share via:</h4>
              <div className="share-options">
                <button 
                  onClick={shareViaWhatsApp}
                  className="whatsapp-share-btn"
                >
                  💬 WhatsApp
                </button>
                <button 
                  onClick={shareViaEmail}
                  className="email-share-btn"
                >
                  📧 Email
                </button>
              </div>
            </div>
            <p className="invite-instructions">
              Share this link with friends, family, or colleagues. Anyone with the link can join your game!
            </p>
          </div>
          
          <div className="game-actions">
            <button 
              onClick={startGame}
              className="start-game-btn"
            >
              🎮 Start Playing Now
            </button>
            <button 
              onClick={createNewGame}
              className="create-new-btn"
            >
              ➕ Create Another Game
            </button>
          </div>
        </div>
      )}

      {/* Selected phrases summary and create game button */}
      {selectedDefaultPhrases.length > 0 && !showInviteLink && (
        <div className="game-creation-summary">
          <h3>🎯 Ready to Play!</h3>
          <p>You've selected <strong>{selectedDefaultPhrases.length}</strong> phrases for your bingo game.</p>
          <div className="selected-phrases-preview">
            <h4>Selected Phrases Preview:</h4>
            <div className="phrases-grid">
              {selectedDefaultPhrases.slice(0, 12).map((phrase, index) => (
                <span key={index} className="phrase-preview-item">
                  {phrase}
                </span>
              ))}
              {selectedDefaultPhrases.length > 12 && (
                <span className="phrase-preview-item more-phrases">
                  +{selectedDefaultPhrases.length - 12} more...
                </span>
              )}
            </div>
          </div>
          <button 
            className="create-game-btn"
            onClick={() => {
              console.log('Create Game button clicked!');
              handleCreateGame();
            }}
          >
            🎮 Create Bingo Game
          </button>
        </div>
      )}
      
      {/* Debug info */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '2px solid red' }}>
        <h4>🔍 VISUAL DEBUG INFO:</h4>
        <p><strong>showDefaultSelector:</strong> {showDefaultSelector ? 'true' : 'false'}</p>
        <p><strong>selectedDefaultPhrases.length:</strong> {selectedDefaultPhrases.length}</p>
        <p><strong>currentUser:</strong> {currentUser ? 'logged in' : 'anonymous'}</p>
        <p><strong>Available phrase lists:</strong> {defaultPhraseLists.length}</p>
        <p><strong>Component loaded at:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default GameCreation;