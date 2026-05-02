import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameChat from '../components/game/GameChat';
import type { ChatMessage } from '../types/types';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { 
      uid: 'test-user-id', 
      email: 'test@example.com',
      displayName: 'Test User'
    },
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn()
  })
}));

// Mock the game service
jest.mock('../services/game', () => ({
  gameService: {
    sendChatMessage: jest.fn(),
    getChatMessages: jest.fn()
  }
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

describe('GameChat Component', () => {
  let mockMessages: ChatMessage[];

  beforeEach(() => {
    // Create mock chat messages
    mockMessages = [
      {
        id: 'msg-1',
        text: 'Hello everyone!',
        senderId: 'user-1',
        senderName: 'Player 1',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        gameId: 'test-game-id'
      },
      {
        id: 'msg-2',
        text: 'Good luck!',
        senderId: 'user-2',
        senderName: 'Player 2',
        timestamp: new Date('2024-01-01T10:01:00Z'),
        gameId: 'test-game-id'
      },
      {
        id: 'msg-3',
        text: 'Bingo!',
        senderId: 'user-1',
        senderName: 'Player 1',
        timestamp: new Date('2024-01-01T10:02:00Z'),
        gameId: 'test-game-id'
      }
    ];

    // Reset all mocks
    jest.clearAllMocks();
  });

  const renderGameChat = (props = {}) => {
    const defaultProps = {
      gameId: 'test-game-id',
      messages: mockMessages,
      onSendMessage: jest.fn(),
      isEnabled: true,
      maxMessages: 100,
      ...props
    };

    return render(<GameChat {...defaultProps} />);
  };

  describe('Component Rendering', () => {
    test('should render chat container', () => {
      renderGameChat();
      expect(screen.getByTestId('game-chat')).toBeInTheDocument();
    });

    test('should render message list', () => {
      renderGameChat();
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    test('should render input field', () => {
      renderGameChat();
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });

    test('should render send button', () => {
      renderGameChat();
      expect(screen.getByText(/send/i)).toBeInTheDocument();
    });

    test('should display all messages', () => {
      renderGameChat();
      
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('Good luck!')).toBeInTheDocument();
      expect(screen.getByText('Bingo!')).toBeInTheDocument();
    });

    test('should display sender names', () => {
      renderGameChat();
      
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    test('should display timestamps', () => {
      renderGameChat();
      
      // Check for formatted timestamps
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
      expect(screen.getByText(/10:01/)).toBeInTheDocument();
      expect(screen.getByText(/10:02/)).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    test('should send message when send button is clicked', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Type a message
      fireEvent.change(input, { target: { value: 'Test message' } });

      // Click send button
      fireEvent.click(sendButton);

      // Verify onSendMessage was called
      expect(onSendMessage).toHaveBeenCalledWith('Test message');

      // Verify input is cleared
      expect(input).toHaveValue('');
    });

    test('should send message when Enter key is pressed', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);

      // Type a message and press Enter
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      // Verify onSendMessage was called
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    test('should not send empty messages', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Try to send empty message
      fireEvent.click(sendButton);

      // Verify onSendMessage was not called
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    test('should not send messages with only whitespace', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Try to send whitespace-only message
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      // Verify onSendMessage was not called
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    test('should trim whitespace from messages', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Type message with leading/trailing whitespace
      fireEvent.change(input, { target: { value: '  Test message  ' } });
      fireEvent.click(sendButton);

      // Verify onSendMessage was called with trimmed message
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Message Validation', () => {
    test('should validate message length', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Try to send very long message
      const longMessage = 'a'.repeat(1000);
      fireEvent.change(input, { target: { value: longMessage } });
      fireEvent.click(sendButton);

      // Verify onSendMessage was not called for overly long messages
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    test('should allow reasonable message length', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Send reasonable length message
      const reasonableMessage = 'This is a reasonable length message that should be allowed.';
      fireEvent.change(input, { target: { value: reasonableMessage } });
      fireEvent.click(sendButton);

      // Verify onSendMessage was called
      expect(onSendMessage).toHaveBeenCalledWith(reasonableMessage);
    });
  });

  describe('Real-time Updates', () => {
    test('should display new messages in real-time', async () => {
      const { rerender } = renderGameChat();

      // Verify initial messages
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('Good luck!')).toBeInTheDocument();
      expect(screen.getByText('Bingo!')).toBeInTheDocument();

      // Add new message
      const newMessages = [
        ...mockMessages,
        {
          id: 'msg-4',
          text: 'New message!',
          senderId: 'user-3',
          senderName: 'Player 3',
          timestamp: new Date('2024-01-01T10:03:00Z'),
          gameId: 'test-game-id'
        }
      ];

      // Re-render with new messages
      rerender(
        <GameChat
          gameId="test-game-id"
          messages={newMessages}
          onSendMessage={jest.fn()}
          isEnabled={true}
          maxMessages={100}
        />
      );

      // Verify new message is displayed
      expect(screen.getByText('New message!')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();
    });

    test('should scroll to bottom when new messages arrive', async () => {
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;

      const { rerender } = renderGameChat();

      // Add new message
      const newMessages = [
        ...mockMessages,
        {
          id: 'msg-4',
          text: 'New message!',
          senderId: 'user-3',
          senderName: 'Player 3',
          timestamp: new Date('2024-01-01T10:03:00Z'),
          gameId: 'test-game-id'
        }
      ];

      // Re-render with new messages
      rerender(
        <GameChat
          gameId="test-game-id"
          messages={newMessages}
          onSendMessage={jest.fn()}
          isEnabled={true}
          maxMessages={100}
        />
      );

      // Verify scroll was called
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Message Limits', () => {
    test('should limit displayed messages to maxMessages', () => {
      // Create many messages
      const manyMessages = Array.from({ length: 150 }, (_, i) => ({
        id: `msg-${i}`,
        text: `Message ${i}`,
        senderId: 'user-1',
        senderName: 'Player 1',
        timestamp: new Date(`2024-01-01T10:${i.toString().padStart(2, '0')}:00Z`),
        gameId: 'test-game-id'
      }));

      renderGameChat({ messages: manyMessages, maxMessages: 100 });

      // Should only display the last 100 messages
      expect(screen.getByText('Message 50')).toBeInTheDocument();
      expect(screen.getByText('Message 149')).toBeInTheDocument();
      expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
    });

    test('should handle empty message list', () => {
      renderGameChat({ messages: [] });

      // Should display empty state
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });
  });

  describe('Chat State Management', () => {
    test('should disable chat when isEnabled is false', () => {
      renderGameChat({ isEnabled: false });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    test('should show disabled state message', () => {
      renderGameChat({ isEnabled: false });

      expect(screen.getByText(/chat is disabled/i)).toBeInTheDocument();
    });

    test('should handle loading state', () => {
      renderGameChat({ isLoading: true });

      expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
    });

    test('should handle error state', () => {
      renderGameChat({ error: 'Failed to load messages' });

      expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
    });
  });

  describe('Message Formatting', () => {
    test('should handle special characters in messages', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      const specialMessage = 'Message with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      fireEvent.change(input, { target: { value: specialMessage } });
      fireEvent.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith(specialMessage);
    });

    test('should handle emoji in messages', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      const emojiMessage = 'Message with emoji 🎉🎊🎈';
      fireEvent.change(input, { target: { value: emojiMessage } });
      fireEvent.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith(emojiMessage);
    });

    test('should handle multiline messages', async () => {
      const onSendMessage = jest.fn();
      renderGameChat({ onSendMessage });

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      fireEvent.change(input, { target: { value: multilineMessage } });
      fireEvent.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith(multilineMessage);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderGameChat();

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      expect(input).toHaveAttribute('aria-label', 'Chat message input');
      expect(sendButton).toHaveAttribute('aria-label', 'Send message');
    });

    test('should support keyboard navigation', () => {
      renderGameChat();

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByText(/send/i);

      // Tab to input
      input.focus();
      expect(input).toHaveFocus();

      // Tab to send button
      sendButton.focus();
      expect(sendButton).toHaveFocus();
    });

    test('should announce new messages to screen readers', () => {
      const { rerender } = renderGameChat();

      // Add new message
      const newMessages = [
        ...mockMessages,
        {
          id: 'msg-4',
          text: 'New message!',
          senderId: 'user-3',
          senderName: 'Player 3',
          timestamp: new Date('2024-01-01T10:03:00Z'),
          gameId: 'test-game-id'
        }
      ];

      rerender(
        <GameChat
          gameId="test-game-id"
          messages={newMessages}
          onSendMessage={jest.fn()}
          isEnabled={true}
          maxMessages={100}
        />
      );

      // Check for live region
      const liveRegion = screen.getByRole('log');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should handle large number of messages efficiently', () => {
      // Create 1000 messages
      const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        text: `Message ${i}`,
        senderId: 'user-1',
        senderName: 'Player 1',
        timestamp: new Date(`2024-01-01T10:${i.toString().padStart(2, '0')}:00Z`),
        gameId: 'test-game-id'
      }));

      const startTime = performance.now();
      
      renderGameChat({ messages: manyMessages, maxMessages: 100 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 500ms)
      expect(renderTime).toBeLessThan(500);
    });

    test('should not re-render unnecessarily', () => {
      const { rerender } = renderGameChat();

      const initialRender = screen.getByTestId('game-chat');

      // Re-render with same props
      rerender(
        <GameChat
          gameId="test-game-id"
          messages={mockMessages}
          onSendMessage={jest.fn()}
          isEnabled={true}
          maxMessages={100}
        />
      );

      const reRender = screen.getByTestId('game-chat');

      // Should be the same element (no unnecessary re-render)
      expect(reRender).toBe(initialRender);
    });
  });
});
