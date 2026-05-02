import React from 'react';
import Chat from '../common/Chat';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/GameChat.css';

interface GameChatProps {
  gameId: string;
  maxMessages?: number;
  messageRateLimit?: number;
  systemMessages?: boolean;
}

const GameChat: React.FC<GameChatProps> = ({ 
  gameId, 
  maxMessages = 50,
  messageRateLimit = 10,
  systemMessages = true
}) => {
  const { currentUser } = useAuth();

  if (!gameId) {
    return <div className="game-chat-error">Chat not available</div>;
  }

  return (
    <div className="game-chat-container">
      <h3 className="game-chat-title">Game Chat</h3>
      <Chat 
        gameId={gameId}
        maxMessages={maxMessages}
        messageRateLimit={messageRateLimit}
        systemMessages={systemMessages}
      />
    </div>
  );
};

export default GameChat; 