import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameChat from '../components/game/GameChat';

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

const chatSpy = jest.fn((_props: { gameId: string }) => (
  <div data-testid="chat-mock">Chat mock</div>
));

jest.mock('../components/common/Chat', () => ({
  __esModule: true,
  default: (props: { gameId: string; maxMessages?: number; messageRateLimit?: number; systemMessages?: boolean }) =>
    chatSpy(props)
}));

describe('GameChat', () => {
  beforeEach(() => {
    chatSpy.mockClear();
  });

  it('renders title and delegates to Chat with gameId', () => {
    render(<GameChat gameId="game-123" />);

    expect(screen.getByText('Game Chat')).toBeInTheDocument();
    expect(screen.getByTestId('chat-mock')).toBeInTheDocument();
    expect(chatSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'game-123',
        maxMessages: 50,
        messageRateLimit: 10,
        systemMessages: true
      })
    );
  });

  it('passes optional props through to Chat', () => {
    render(
      <GameChat
        gameId="g-1"
        maxMessages={20}
        messageRateLimit={5}
        systemMessages={false}
      />
    );

    expect(chatSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'g-1',
        maxMessages: 20,
        messageRateLimit: 5,
        systemMessages: false
      })
    );
  });

  it('shows error when gameId is missing', () => {
    render(<GameChat gameId="" />);

    expect(screen.getByText('Chat not available')).toBeInTheDocument();
    expect(chatSpy).not.toHaveBeenCalled();
  });
});
