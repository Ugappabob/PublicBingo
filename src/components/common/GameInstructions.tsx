import React, { useState } from 'react';
import '../../styles/components/GameInstructions.css';

interface GameInstructionsProps {
  isVisible: boolean;
  onClose: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'features' | 'tips'>('basics');

  if (!isVisible) return null;

  const instructions = {
    basics: {
      title: '🎯 How to Play Bingo',
      content: [
        {
          icon: '📋',
          title: 'Get Your Board',
          description: 'Each player gets a unique 5x5 bingo board with 25 phrases.'
        },
        {
          icon: '🎲',
          title: 'Listen for Phrases',
          description: 'The host will call out phrases one by one during the game.'
        },
        {
          icon: '✅',
          title: 'Mark Your Board',
          description: 'Click on phrases that match what was called to mark them.'
        },
        {
          icon: '🏆',
          title: 'Get Bingo!',
          description: 'Mark 5 phrases in a row (horizontal, vertical, or diagonal) to win!'
        }
      ]
    },
    features: {
      title: '🚀 Game Features',
      content: [
        {
          icon: '💬',
          title: 'Real-time Chat',
          description: 'Chat with other players during the game using the chat panel.'
        },
        {
          icon: '🏆',
          title: 'Leaderboard',
          description: 'See how you rank against other players in real-time.'
        },
        {
          icon: '📊',
          title: 'Progress Tracking',
          description: 'Monitor game progress and your personal statistics.'
        },
        {
          icon: '🎉',
          title: 'Celebrations',
          description: 'Enjoy animated celebrations when someone wins!'
        }
      ]
    },
    tips: {
      title: '💡 Pro Tips',
      content: [
        {
          icon: '👀',
          title: 'Pay Attention',
          description: 'Listen carefully to each phrase called to avoid missing any.'
        },
        {
          icon: '⚡',
          title: 'Quick Marking',
          description: 'Click quickly to mark phrases as they\'re called.'
        },
        {
          icon: '🎯',
          title: 'Multiple Patterns',
          description: 'Look for multiple possible winning patterns on your board.'
        },
        {
          icon: '🤝',
          title: 'Have Fun!',
          description: 'Remember, it\'s a game - enjoy playing with friends and family!'
        }
      ]
    }
  };

  const currentInstructions = instructions[activeTab];

  return (
    <div className="game-instructions-overlay">
      <div className="game-instructions-modal">
        <div className="instructions-header">
          <h2 className="instructions-title">📖 Game Instructions</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <div className="instructions-tabs">
          <button
            className={`tab-button ${activeTab === 'basics' ? 'active' : ''}`}
            onClick={() => setActiveTab('basics')}
          >
            🎯 Basics
          </button>
          <button
            className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            🚀 Features
          </button>
          <button
            className={`tab-button ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            💡 Tips
          </button>
        </div>

        <div className="instructions-content">
          <h3 className="content-title">{currentInstructions.title}</h3>
          <div className="instructions-list">
            {currentInstructions.content.map((item, index) => (
              <div key={index} className="instruction-item">
                <div className="instruction-icon">{item.icon}</div>
                <div className="instruction-text">
                  <h4 className="instruction-title">{item.title}</h4>
                  <p className="instruction-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="instructions-footer">
          <button onClick={onClose} className="got-it-button">
            Got it! Let's Play! 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameInstructions;
