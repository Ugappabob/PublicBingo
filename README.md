# PublicBingo 🎯

A real-time multiplayer bingo web application built with React, TypeScript, and Firebase. Play bingo with friends and family online with no account required!

## ✨ Features

### 🎮 Core Gameplay
- **Real-time Multiplayer Bingo**: Play with friends in real-time
- **Guest Mode**: Start playing immediately without creating an account
- **Unique Board Generation**: Each player gets a unique bingo board
- **Win Detection**: Automatic detection of bingo wins with celebrations
- **Game State Management**: Robust game state synchronization

### 💬 Social Features
- **In-Game Chat**: Real-time chat with other players
- **Leaderboard**: Track player progress and rankings
- **Game Progress Tracking**: Real-time statistics and progress indicators
- **Player Status**: See who's online and their progress

### 🎨 User Experience
- **Beautiful UI**: Modern, responsive design with animations
- **Bingo Celebrations**: TV-quality cartoon character celebrations
- **Progress Indicators**: Visual feedback for game progress
- **Mobile Responsive**: Works perfectly on all devices

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Firebase Integration**: Real-time database and authentication
- **WebSocket Support**: Real-time communication
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Performance Optimized**: Lazy loading and efficient rendering

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (optional, for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PublicBingo.git
   cd PublicBingo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Firebase Setup (Optional)

For full functionality including real-time chat and multiplayer features:

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Configure Firebase**
   - Copy your Firebase config to `src/firebase/config.ts`
   - Enable Authentication and Firestore

3. **Deploy Firestore rules**
   ```bash
   npm run deploy-rules
   ```

## 🎯 How to Play

### Quick Start (Guest Mode)
1. Visit the website
2. Click "Play as Guest"
3. Enter a display name
4. Create or join a game
5. Start playing!

### Creating a Game
1. Sign in or play as guest
2. Click "Create Game"
3. Add phrases (minimum 24 for a 5x5 board)
4. Share the game code with friends
5. Start the game when ready

### Joining a Game
1. Get a game code from the host
2. Click "Join Game"
3. Enter the game code
4. Wait for the host to start

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── BingoBoard.tsx
│   │   ├── Chat.tsx
│   │   ├── Leaderboard.tsx
│   │   └── GameProgress.tsx
│   ├── game/            # Game-specific components
│   │   ├── GameRoom.tsx
│   │   └── GameChat.tsx
│   └── admin/           # Admin components
├── contexts/            # React contexts
├── services/            # API and service layer
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # CSS styles
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run deploy-rules` - Deploy Firestore rules

### Key Technologies

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Firebase (Firestore, Authentication)
- **Real-time**: WebSocket (Socket.IO)
- **Build Tools**: Webpack, Babel
- **Testing**: Jest, React Testing Library

## 🎨 Customization

### Themes
The application uses CSS custom properties for easy theming. Modify the root variables in `src/styles/App.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #f44336;
}
```

### Game Settings
Customize game behavior by modifying the game settings in `src/services/game.ts`:

```typescript
const defaultGameSettings = {
  maxPlayers: 20,
  maxPhrases: 100,
  allowChat: true,
  allowPrivateChat: false,
  // ... more settings
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for the backend infrastructure
- React team for the amazing framework
- The bingo community for inspiration and feedback

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/PublicBingo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Bingo Playing! 🎉** 
