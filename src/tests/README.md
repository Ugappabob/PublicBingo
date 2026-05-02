# PublicBingo Gameplay Testing Suite

This directory contains comprehensive tests for the PublicBingo gameplay functionality, ensuring the game works correctly across all scenarios and edge cases.

## 🎯 Overview

The gameplay testing suite covers:

- **Game Logic Testing** - Core bingo game mechanics and win conditions
- **Component Testing** - React components and user interactions
- **Integration Testing** - Full game flow from setup to completion
- **Real-time Testing** - WebSocket communication and live updates
- **Performance Testing** - Scalability and optimization validation

## 📁 Test Structure

```
src/tests/
├── README.md                           # This file
├── setup.ts                           # Test setup and mocks
├── runGameplayTests.js                # Test runner script
├── gameLogic.test.ts                  # Core game logic tests
├── boardGenerator.test.ts             # Board generation tests
├── BingoBoard.test.tsx                # Bingo board component tests
├── GameRoom.test.tsx                  # Game room component tests
├── GameChat.test.tsx                  # Chat functionality tests
├── gameIntegration.test.tsx           # Full game flow tests
└── websocket.test.ts                  # Real-time communication tests
```

## 🚀 Quick Start

### Run All Gameplay Tests
```bash
npm run test:gameplay
```

### Run Tests in Watch Mode (Development)
```bash
npm run test:gameplay:watch
```

### Run Specific Test Categories
```bash
# Game logic only
npm run test:gameplay:logic

# Component tests only
npm run test:gameplay:components

# Integration tests only
npm run test:gameplay:integration
```

### Run with Coverage Report
```bash
npm run test:coverage:gameplay
```

## 🧪 Test Categories

### 1. Game Logic Tests (`gameLogic.test.ts`)

Tests the core bingo game mechanics:

- **Win Condition Detection**
  - Horizontal wins (rows)
  - Vertical wins (columns)
  - Diagonal wins (both directions)
  - Full board wins
  - No win scenarios

- **Completed Lines Detection**
  - Single line completion
  - Multiple line completion
  - Line membership validation

- **Edge Cases**
  - Empty boards
  - Invalid cell indices
  - All cells marked
  - Single cell marked

**Example Test:**
```typescript
test('should detect horizontal win (first row)', () => {
  // Mark first row (cells 0-4)
  for (let i = 0; i < 5; i++) {
    testBoard[i].marked = true;
  }
  expect(checkForWin(testBoard)).toBe(true);
});
```

### 2. Board Generator Tests (`boardGenerator.test.ts`)

Tests board creation and validation:

- **Board Generation**
  - Valid board creation
  - Unique board generation
  - Multiple board generation
  - Insufficient phrases handling

- **Board Validation**
  - Structure validation
  - Cell property validation
  - Uniqueness validation

### 3. Component Tests

#### BingoBoard Component (`BingoBoard.test.tsx`)
Tests the main game board component:

- **Rendering**
  - Valid data rendering
  - Incomplete data handling
  - Empty state handling

- **User Interactions**
  - Cell clicking
  - Marked state toggling
  - Visual feedback

- **Accessibility**
  - Keyboard navigation
  - Screen reader support
  - ARIA labels

#### GameRoom Component (`GameRoom.test.tsx`)
Tests the game room functionality:

- **Game Flow**
  - Game initialization
  - Player joining/leaving
  - Game state changes
  - Win detection

- **Real-time Updates**
  - Live game state updates
  - Player action synchronization
  - Error handling

- **Performance**
  - Large player count handling
  - Rapid state updates
  - Memory management

#### GameChat Component (`GameChat.test.tsx`)
Tests real-time chat functionality:

- **Message Handling**
  - Message sending/receiving
  - Input validation
  - Real-time updates

- **Chat Features**
  - Message limits
  - Timestamp display
  - Sender identification

- **State Management**
  - Chat enable/disable
  - Loading states
  - Error handling

### 4. Integration Tests (`gameIntegration.test.tsx`)

Tests complete game scenarios:

- **Full Game Flow**
  - Game setup to completion
  - Multiplayer scenarios
  - Different win conditions

- **Real-time Scenarios**
  - Player joining during game
  - Network disconnections
  - Concurrent actions

- **Error Scenarios**
  - Invalid game data
  - Network failures
  - Concurrent conflicts

### 5. WebSocket Tests (`websocket.test.ts`)

Tests real-time communication:

- **Connection Management**
  - Connection establishment
  - Reconnection handling
  - Connection cleanup

- **Message Handling**
  - Event emission/reception
  - Message validation
  - Error handling

## 📊 Test Coverage

The test suite provides comprehensive coverage for:

- **Functionality**: All game features and edge cases
- **Performance**: Scalability and optimization
- **Reliability**: Error handling and recovery
- **Accessibility**: Screen reader and keyboard support
- **Real-time**: WebSocket communication and live updates

## 🔧 Test Configuration

### Jest Configuration
Tests use the Jest configuration from `jest.config.js` with:
- TypeScript support via `ts-jest`
- DOM environment for React testing
- Mock setup for external dependencies

### Mock Setup (`setup.ts`)
Provides mocks for:
- WebSocket connections
- Firebase services
- Socket.io client
- Environment variables

### Test Utilities
Common test utilities and helpers:
- Mock data generators
- Test component renderers
- Async test helpers
- Performance measurement tools

## 📈 Performance Testing

The test suite includes performance validation:

- **Render Performance**: Component rendering speed
- **Interaction Performance**: User action responsiveness
- **Scalability**: Large player count handling
- **Memory Usage**: Memory leak detection

## 🐛 Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npx jest src/tests/gameLogic.test.ts

# Run specific test
npx jest -t "should detect horizontal win"
```

### Debug Mode
```bash
# Run tests with debug output
npx jest --verbose src/tests/

# Run with coverage and debug
npx jest --coverage --verbose src/tests/
```

### Common Issues

1. **Mock Setup Issues**
   - Ensure all external dependencies are properly mocked
   - Check `setup.ts` for missing mocks

2. **Async Test Failures**
   - Use `waitFor` for async operations
   - Ensure proper cleanup in `afterEach`

3. **Component Test Issues**
   - Mock all required contexts and providers
   - Ensure proper test environment setup

## 📝 Adding New Tests

### Test File Structure
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('should do something specific', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Test Categories
- **Unit Tests**: Individual function/component testing
- **Integration Tests**: Multi-component interaction testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Speed and scalability testing

### Best Practices
1. **Descriptive Test Names**: Clear, specific test descriptions
2. **Arrange-Act-Assert**: Structured test organization
3. **Mock External Dependencies**: Isolate units under test
4. **Test Edge Cases**: Cover error conditions and boundaries
5. **Performance Considerations**: Test with realistic data sizes

## 🚀 Continuous Integration

The test suite is designed for CI/CD integration:

- **Fast Execution**: Tests run quickly for rapid feedback
- **Reliable Results**: Consistent test outcomes
- **Comprehensive Coverage**: All critical paths tested
- **Performance Monitoring**: Track performance regressions

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)
- [WebSocket Testing](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🤝 Contributing

When adding new gameplay features:

1. **Write Tests First**: Follow TDD principles
2. **Cover All Scenarios**: Include edge cases and error conditions
3. **Update Documentation**: Keep this README current
4. **Run Full Suite**: Ensure all tests pass before merging

## 📞 Support

For test-related issues:
1. Check the test output for specific error messages
2. Review the mock setup in `setup.ts`
3. Ensure all dependencies are properly installed
4. Check Jest configuration in `jest.config.js`
