import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp
} from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Chat.css';

// Mock types for development
type Timestamp = any;
type DocumentData = any;
type QueryDocumentSnapshot = any;

interface MessageData {
  text: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
  isSystem?: boolean;
  metadata?: {
    type?: 'join' | 'leave' | 'game_event';
    event?: string;
    [key: string]: unknown;
  };
}

interface Message extends MessageData {
  id: string;
}

interface ChatProps {
  gameId: string;
  maxMessages?: number;
  messageRateLimit?: number; // messages per minute
  systemMessages?: boolean;
}

interface ChatState {
  messages: Message[];
  newMessage: string;
  isSubmitting: boolean;
  error: string;
  lastMessageTime?: number;
}

const DEFAULT_MAX_MESSAGES = 50;
const DEFAULT_RATE_LIMIT = 10; // messages per minute

const Chat: React.FC<ChatProps> = ({ 
  gameId, 
  maxMessages = DEFAULT_MAX_MESSAGES,
  messageRateLimit = DEFAULT_RATE_LIMIT,
  systemMessages = true
}) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    newMessage: '',
    isSubmitting: false,
    error: ''
  });
  
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRateLimitRef = useRef<number[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!gameId) return;

    const messagesRef = collection(db, `games/${gameId}/messages`);
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'asc'), 
      limit(maxMessages)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data() as Omit<MessageData, 'timestamp'> & { timestamp: Timestamp };
        // Only include system messages if enabled
        if (!data.isSystem || systemMessages) {
          newMessages.push({ 
            id: doc.id,
            ...data
          });
        }
      });
      setState(prev => ({ ...prev, messages: newMessages }));
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [gameId, maxMessages, systemMessages]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove messages older than 1 minute
    messageRateLimitRef.current = messageRateLimitRef.current.filter(
      time => time > oneMinuteAgo
    );

    // Check if under rate limit
    return messageRateLimitRef.current.length < messageRateLimit;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!state.newMessage.trim() || !currentUser) {
      return;
    }

    if (!checkRateLimit()) {
      setState(prev => ({
        ...prev,
        error: `Please wait before sending more messages. Limit: ${messageRateLimit} messages per minute.`
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      const messagesRef = collection(db, `games/${gameId}/messages`);
      const messageData: Omit<MessageData, 'timestamp'> = {
        text: state.newMessage.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        isSystem: false
      };

      await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Update rate limit tracking
      messageRateLimitRef.current.push(Date.now());

      setState(prev => ({
        ...prev,
        newMessage: '',
        isSubmitting: false,
        lastMessageTime: Date.now()
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send message. Please try again.',
        isSubmitting: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      newMessage: e.target.value,
      error: ''
    }));
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.isSystem 
                ? 'system-message' 
                : message.userId === currentUser?.uid 
                  ? 'own-message' 
                  : ''
            }`}
          >
            {!message.isSystem && (
              <span className="message-user">{message.userName}</span>
            )}
            <span className="message-text">{message.text}</span>
            {message.metadata && message.metadata.type === 'game_event' && (
              <span className="message-event">{message.metadata.event}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={state.newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className={`message-input ${state.error ? 'error' : ''}`}
          disabled={state.isSubmitting}
          maxLength={500}
          aria-label="Chat message"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={state.isSubmitting || !state.newMessage.trim()}
          aria-busy={state.isSubmitting}
        >
          {state.isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
      {state.error && (
        <div className="error-message" role="alert">
          {state.error}
        </div>
      )}
    </div>
  );
};

export default Chat; 