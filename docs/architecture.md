# Public Bingo - Architecture Documentation

## Project Structure

```
PublicBingo/                # Root directory
├── docs/                  # Project documentation
│   ├── architecture.md    # This file - Architecture documentation
│   └── lessons_learned.md # Development insights and lessons
├── public/               # Static files
│   ├── index.html        # HTML entry point
│   ├── favicon.ico       # Site favicon
│   └── manifest.json     # PWA manifest
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── admin/            # Admin components
│   │   │   ├── CreateGame.tsx    # Game creation interface
│   │   │   ├── Dashboard.tsx     # Admin dashboard
│   │   │   └── GameTemplates.tsx # Template management
│   │   ├── common/          # Shared components
│   │   │   ├── BingoBoard.tsx    # Bingo board component
│   │   │   ├── Chat.tsx          # Chat component
│   │   │   ├── NotificationCenter.tsx # Notifications UI
│   │   │   ├── PhraseInput.tsx   # Phrase input component
│   │   │   ├── PhraseList.tsx    # Phrase list component
│   │   │   ├── PhraseListLibrary.tsx # Phrase library
│   │   │   ├── TemplateLibrary.tsx # Template library
│   │   │   └── UserProfile.tsx   # User profile component
│   │   ├── game/           # Game-specific components
│   │   │   ├── GameBoard.tsx     # Game board component
│   │   │   ├── GameChat.tsx      # Game chat component
│   │   │   ├── GamePage.tsx      # Game page component
│   │   │   ├── GameRoom.tsx      # Game room component
│   │   │   ├── GameSetup.tsx     # Game setup component
│   │   │   └── Leaderboard.tsx   # Leaderboard component
│   │   └── userauth/       # Authentication components
│   │       ├── GuestSignIn.tsx   # Guest sign-in
│   │       ├── SignIn.tsx        # User sign-in
│   │       └── SignUp.tsx        # User registration
│   ├── contexts/         # React context providers
│   │   ├── AuthContext.tsx       # Authentication context
│   │   ├── GameContext.tsx       # Game state context
│   │   ├── GameContext.d.ts      # Game context types
│   │   ├── NotificationContext.tsx # Notification context
│   │   └── NotificationContext.d.ts # Notification context types
│   ├── types/           # TypeScript type definitions
│   │   ├── types.d.ts        # Core game type interfaces
│   │   ├── errors.d.ts       # Error handling types
│   │   ├── events.d.ts       # WebSocket event types
│   │   └── admin.d.ts        # Admin-specific types
│   ├── firebase/         # Firebase configuration and utilities
│   │   ├── admin.ts          # Admin SDK setup
│   │   └── config.ts         # Firebase configuration
│   ├── hooks/            # Custom React hooks
│   │   ├── useGameStats.ts   # Game statistics hook
│   │   └── useWebSocket.ts   # WebSocket connection hook
│   ├── utils/           # Helper functions and utilities
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── game.ts          # Game helper functions
│   │   ├── boardGenerator.ts # Board generation utilities
│   │   ├── gameLogic.ts     # Game logic utilities
│   │   ├── roomCleanup.ts   # Room cleanup utilities
│   │   ├── validation.ts    # Input validation utilities
│   │   ├── constants.d.ts   # Game constants and limits
│   │   ├── helpers.d.ts     # Helper function types
│   │   ├── utils.d.ts       # Utility function types
│   │   └── validation.d.ts  # Input validation types
│   ├── services/         # Service layer
│   │   ├── websocket.ts     # WebSocket service
│   │   ├── adminService.ts  # Admin service
│   │   ├── game.ts          # Game service
│   │   └── template.ts      # Template service
│   ├── styles/          # CSS and styling files
│   │   ├── components/      # Component-specific styles
│   │   │   ├── Chat.css         # Chat component styles
│   │   │   ├── GameBoard.css    # Game board styles
│   │   │   ├── GamePage.css     # Game page styles
│   │   │   ├── Leaderboard.css  # Leaderboard styles
│   │   │   ├── NotificationCenter.css # Notification styles
│   │   │   ├── PhraseInput.css  # Phrase input styles
│   │   │   └── UserProfile.css  # User profile styles
│   │   └── global/         # Global styles
│   ├── tests/           # Test files
│   │   ├── setup.ts         # Test setup
│   │   └── websocket.test.ts # WebSocket tests
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # Application entry point
│   ├── firebase.ts      # Firebase initialization
│   ├── auth.ts          # Authentication utilities
│   ├── .env            # Environment variables
│   └── .env.example    # Environment template
├── admin-scripts/       # Administrative tools and scripts
│   └── service-account.json # Firebase service account (gitignored)
├── scripts/            # Build and deployment scripts
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .gitignore         # Git ignore rules
├── README.md          # Project overview and setup instructions
└── firestore.rules    # Firestore security rules
```

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router
- **Real-time Communication**: WebSocket (Socket.io)

### Backend
- **Platform**: Firebase
- **Services**:
  - Authentication
  - Firestore (Database)
  - Cloud Functions (if needed)
  - Hosting

### Development Tools
- **Language**: TypeScript
- **Package Manager**: npm/yarn
- **Build Tool**: Create React App with custom webpack configuration
- **Version Control**: Git
- **Development Server**: Webpack Dev Server with custom middleware

### Middleware Configuration
- **CORS Handling**: Configured for development environment
- **WebSocket Proxy**: Socket.IO integration for real-time features
- **Error Handling**: Comprehensive middleware error management
- **Development Routes**: Custom endpoints for development testing
- **Security Headers**: Configured for enhanced security
- **Compression**: Enabled for better performance

## Architecture Overview

### Component Architecture
The application follows a component-based architecture with:
- Presentational Components (UI)
- Container Components (Logic)
- Custom Hooks (Reusable Logic)
- Context Providers (State Management)
- Service Layer (API Communication)

### Data Flow
1. User actions trigger component events
2. Events are handled by container components or hooks
3. Data updates are processed through services
4. Real-time updates are pushed to all connected clients via WebSocket

### Authentication Flow
1. Users can authenticate via:
   - Guest access (temporary session)
   - Email/Password
   - (Future) OAuth providers
2. Admin users have additional privileges managed through custom claims

### Game State Management
1. Game state is stored in Firestore
2. Real-time updates use WebSocket connections
3. Client-side state managed through React Context
4. Game logic separated from UI components
5. WebSocket service handles real-time communication

## Security

### Firebase Security Rules
- Public read access for game data
- Write access restricted by user role
- Admin operations protected
- User data access controlled by ownership

### Admin Privileges Management
- Admin privileges managed through Firebase custom claims
- Custom claims set using Firebase Admin SDK
- Admin scripts for setting and checking admin status
- Environment variables used for secure admin operations
- Admin status verified before allowing privileged operations

### Environment Variables
- Sensitive configuration in .env files
- Public variables prefixed with REACT_APP_
- Admin credentials managed securely
- Service account details in environment variables

## Deployment

### Development
- Local development server
- Firebase emulators for testing
- Environment-specific configurations

### Production
- Firebase Hosting
- Automated deployments (planned)
- Environment variable management
- Performance monitoring

### Deployment Scripts
The project includes two deployment scripts:

1. **Bash Script (deploy.sh)**
   ```bash
   #!/bin/bash
   
   # Exit on error
   set -e
   
   echo "🚀 Starting deployment process..."
   
   # Install dependencies
   echo "📦 Installing dependencies..."
   npm install
   
   # Run linting
   echo "🔍 Running linting..."
   npm run lint
   
   # Run tests
   echo "🧪 Running tests..."
   npm test
   
   # Build for production
   echo "🏗️ Building for production..."
   npm run build:prod
   
   # Deploy to Firebase
   echo "🚀 Deploying to Firebase..."
   firebase deploy
   
   echo "✅ Deployment completed successfully!" 
   ```

2. **PowerShell Script (deploy.ps1)**
   ```powershell
   # PowerShell deployment script
   
   Write-Host "🚀 Starting deployment process..." -ForegroundColor Green
   
   # Install dependencies
   Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
   npm install
   
   # Run linting
   Write-Host "🔍 Running linting..." -ForegroundColor Cyan
   npm run lint
   
   # Run tests
   Write-Host "🧪 Running tests..." -ForegroundColor Cyan
   npm test
   
   # Build for production
   Write-Host "🏗️ Building for production..." -ForegroundColor Cyan
   npm run build:prod
   
   # Deploy to Firebase
   Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Cyan
   firebase deploy
   
   Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green 
   ```

### Environment Configuration
The project uses environment-specific configuration files:

1. **Development Environment (.env)**
   - Contains development-specific settings
   - Not committed to version control
   - Referenced in .env.example

2. **Production Environment (.env.production)**
   ```
   # Firebase Web Configuration (values from Firebase Console → Project settings)
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   REACT_APP_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com

   # WebSocket Configuration
   REACT_APP_WEBSOCKET_URL=wss://your-websocket-host.example.com
   REACT_APP_WS_HOST=your-websocket-host.example.com
   REACT_APP_WS_PATH=/ws
   REACT_APP_WS_PORT=443

   # Admin User Configuration (optional scripts only — never commit real passwords)
   REACT_APP_ADMIN_EMAIL=your-admin@example.com
   REACT_APP_ADMIN_NAME=Admin
   ```

3. **Environment Template (.env.example)**
   - Provides a template for setting up new environments
   - Includes all required variables without actual values
   - Used as a reference for developers

### Deployment Process
1. **Pre-deployment Checks**
   - Code linting
   - Unit and integration tests
   - Type checking

2. **Build Process**
   - Production build with optimized assets
   - Environment variable injection
   - Source map generation for debugging

3. **Firebase Deployment**
   - Hosting configuration
   - Firestore rules deployment
   - Security rules verification

4. **Post-deployment Verification**
   - Smoke tests
   - Performance monitoring
   - Error tracking setup

## Future Considerations

### Scalability
- Implement caching strategies
- Optimize real-time connections
- Consider implementing WebSocket fallback
- Add offline support

### Monitoring
- Add error tracking
- Implement performance monitoring
- Set up usage analytics
- Monitor real-time connection health

### Testing
- Unit tests for components
- Integration tests for game logic
- End-to-end testing
- Performance testing for real-time features

## Updates Log

### May 2025
- Initial architecture documentation
- Added component structure
- Documented security rules
- Added deployment strategy
- Updated project structure with complete file listing
- Implemented WebSocket service for real-time communication
- Added type-safe event handling system
- Created custom WebSocket hook for reusable functionality
- Implemented admin service with dashboard statistics and game reports
- Enhanced type system with comprehensive admin types
- Implemented real-time game state management
- Added game start logic with validation
- Created AuthContext for Firebase authentication
- Updated Firebase configuration and initialization
- Added validation utilities for game settings
- Consolidated context files and type definitions
- Fixed module resolution issues
- Updated GameRoom component to align with type definitions
- Enhanced Player type with online status and activity tracking
- Implemented comprehensive WebSocket testing suite
- Added Jest configuration for React component testing
- Created mock implementations for WebSocket and Firebase services
- Improved type safety in WebSocket event handling
- Added proper error handling for WebSocket connections
- Implemented player status tracking and synchronization
- Enhanced game state management with real-time updates
- Added comprehensive test coverage for WebSocket events
- Improved type definitions for game entities and events

### June 2025
- Optimized type system by removing unnecessary type annotations
- Enhanced WebSocket service with improved type safety
- Refined template service implementation with cleaner code
- Improved error handling in WebSocket connections
- Enhanced type definitions for game events and templates
- Streamlined service layer with better type inference
- Added comprehensive documentation for type system improvements

### July 2025
- Fixed interface implementation issues in GameSettings objects ✅
- Updated template handling in CreateGame component ✅
- Fixed WebSocket test objects to include all required properties ✅
- Cleaned up unused imports from components ✅
- Improved code readability and maintainability ✅
- Updated documentation with lessons learned from type system improvements ✅
- Added recommendations for automated type checking and import cleanup ✅
- Enhanced development server configuration with custom middleware ✅
- Added WebSocket proxy configuration with improved error handling ✅
- Implemented security headers and compression for better performance ✅
- Added development-specific routes and debugging capabilities ✅

### August 2025
- Consolidated BingoCell interface definitions between types.ts and types.d.ts ✅
- Made position property optional in BingoCell interface ✅
- Updated isValidBingoCell function to handle optional position property ✅
- Fixed PhraseList interface inconsistencies across the codebase ✅
- Updated NewPhraseList interface to match PhraseList requirements ✅
- Fixed handleCreateList, handleUpdateList, and handleCopyList functions ✅
- Removed updatedAt property from handleUpdateList function ✅
- Improved type safety in GameRoom component's handleCellClick function ✅
- Enhanced error handling for undefined properties with optional chaining ✅
- Updated documentation to reflect type system improvements ✅

### September 2025
- Implemented Card Generation System with unique board generation ✅
- Enhanced boardGenerator.ts with functions for generating unique boards ✅
- Added validation utilities for ensuring board uniqueness ✅
- Updated GameRoom component to use unique board generation ✅
- Added comprehensive tests for board generation functionality ✅
- Fixed Jest configuration for proper test environment setup ✅
- Added board hashing for efficient uniqueness comparison ✅
- Implemented retry mechanism for generating unique boards ✅
- Added handling for edge cases like insufficient phrases ✅
- Updated documentation with Card Generation System details ✅

### October 2025
- Implemented Card Generation System with unique board generation ✅
- Enhanced boardGenerator.ts with functions for generating unique boards ✅
- Added validation utilities for ensuring board uniqueness ✅
- Updated GameRoom component to use unique board generation ✅
- Added comprehensive tests for board generation functionality ✅
- Fixed Jest configuration for proper test environment setup ✅
- Added board hashing for efficient uniqueness comparison ✅
- Implemented retry mechanism for generating unique boards ✅
- Added handling for edge cases like insufficient phrases ✅
- Updated documentation with Card Generation System details ✅
- Enhanced Game Board UI with improved loading states and animations ✅
- Added visual feedback for real-time updates with updating overlay ✅
- Implemented cell highlighting for recently updated cells ✅
- Enhanced win message with animations and improved styling ✅
- Added error message component with slide-in animation ✅
- Improved responsive design for different screen sizes ✅
- Added comprehensive animations for better user experience ✅
- Updated GameBoard component to handle loading and error states ✅
- Enhanced CSS with modern styling and transitions ✅

### November 2025
- Fixed type safety issues in WebSocket service ✅
- Corrected event handler property access for ReconnectEvent ✅
- Improved error handling for WebSocket connections ✅
- Enhanced reconnection logic with proper event handling ✅
- Added lessons learned about event payload structure and type safety ✅
- Updated documentation with WebSocket service improvements ✅
- Enhanced core gameplay experience with improved game state management ✅
- Implemented proper game state synchronization across all clients ✅
- Added game start/end logic with validation ✅
- Created game pause/resume functionality ✅
- Implemented proper turn management ✅
- Improved cell click handling with better feedback ✅
- Added visual indicators for valid/invalid moves ✅
- Implemented proper win detection with animations ✅
- Added game progress indicators ✅
- Updated event type definitions to match actual event data structure ✅
- Ensured consistent event naming conventions across the codebase ✅
- Added proper validation for event payloads ✅
- Improved type safety in event handlers ✅
- Enhanced error handling for WebSocket connections ✅
- Updated architecture documentation to reflect recent changes ✅
- Implemented monitoring dashboard for real-time system insights ✅
- Added performance metrics tracking and visualization ✅
- Created log viewer with filtering and search capabilities ✅
- Implemented WebSocket connection status monitoring ✅
- Added game statistics tracking and reporting ✅
- Enhanced error tracking and reporting system ✅
- Created admin-specific monitoring views ✅
- Implemented real-time data visualization for game metrics ✅

### December 2025
- Implemented monitoring dashboard for real-time system insights ✅
- Added performance metrics tracking and visualization ✅
- Created log viewer with filtering and search capabilities ✅
- Implemented WebSocket connection status monitoring ✅
- Added game statistics tracking and reporting ✅
- Enhanced error tracking and reporting system ✅
- Created admin-specific monitoring views ✅
- Implemented real-time data visualization for game metrics ✅
- Added memory usage tracking with alerts ✅
- Implemented CPU usage monitoring with visualization ✅
- Created active connections counter with trends ✅
- Added average response time measurement ✅
- Implemented structured logging with levels ✅
- Created log search functionality with filters ✅
- Added log retention policies with cleanup ✅
- Implemented log export capabilities ✅
- Created error boundary components ✅
- Added structured error logging with context ✅
- Implemented error reporting system with alerts ✅
- Created error recovery strategies ✅
- Added WebSocket message rate monitoring ✅
- Implemented WebSocket latency measurement ✅
- Created reconnection attempt tracking ✅
- Added connection health visualization ✅
- Implemented admin-specific dashboards ✅
- Created user activity monitoring views ✅
- Added game statistics reports with trends ✅
- Implemented system health indicators ✅
- Created performance trend analysis ✅
- Implemented event validation system with type-safe validation ✅
- Created EventValidatorImpl class for centralized event validation ✅
- Added support for registering event-specific validators ✅
- Implemented validation result types with detailed error messages ✅
- Enhanced WebSocket service with event validation integration ✅

_Last Updated: December 2025_ 

## Type System

### Core Types
- **Game Types**: Basic interfaces for game entities (BingoCell, Player, GameRoom, etc.)
- **Event Types**: WebSocket communication types for real-time updates
- **Error Types**: Structured error handling with custom error classes
- **Context Types**: Type definitions for React context providers
- **Admin Types**: Admin-specific interfaces for dashboard and reports
- **Validation Types**: Input validation function types for game settings
- **User Types**: Enhanced user interfaces with admin capabilities and authentication states
- **Event Validation Types**: Type-safe event validation system with validation results and validators

### Type Architecture
1. **Base Types** (`types.ts`)
   - Core game entities and interfaces
   - Shared types across the application
   - Component prop types
   - Player status tracking (isOnline, isReady, lastActive, joinedAt)
   - Enhanced User and AdminUser interfaces with proper type safety
   - Template and PhraseList interfaces with comprehensive properties
   - Complete GameSettings interface with all required properties

2. **Event Types** (`events.d.ts`)
   - WebSocket event interfaces
   - Game state update events
   - Player action events
   - Admin-specific events
   - Type-safe event handling system
   - Comprehensive event payload definitions
   - Properly typed event handlers for all WebSocket events
   - Event validation interfaces and types
   - Event validator function types
   - Event validation result types

3. **Error Types** (`errors.d.ts`)
   - Custom error classes for different scenarios
   - Authentication errors
   - Game state errors
   - WebSocket connection errors
   - Validation errors

4. **Context Types**
   - AuthContext types with proper user state management
   - GameContext types for game state
   - NotificationContext types for system messages
   - Type-safe context providers and consumers

5. **Admin Types** (`admin.d.ts`)
   - Admin user interface
   - Dashboard statistics
   - Game management interfaces
   - Template management types
   - Admin-specific validation types

### Type Safety Improvements
- Strict type checking for all components
- Proper interface segregation
- Generic type constraints
- Union types for flexible state management
- Discriminated unions for event handling
- Type guards for runtime type checking
- Proper null and undefined handling
- Immutable state types
- Readonly properties where appropriate
- Leveraging TypeScript's type inference for cleaner code
- Removing redundant type annotations where TypeScript can infer types
- Ensuring all interface implementations include all required properties
- Using nullish coalescing operator (`??`) for providing default values

### Authentication Types
- Enhanced User interface with admin capabilities
- Proper type definitions for authentication states
- Type-safe authentication context
- Secure admin user management
- Guest user type definitions
- Authentication error handling types

### Service Layer
1. **WebSocket Service** (`websocket.ts`)
   - Manages real-time communication
   - Type-safe event emission and handling
   - Connection state management
   - Error handling for connection issues
   - Player status tracking and synchronization
   - Comprehensive test coverage
   - Enhanced type safety with generic event handlers
   - Improved error handling with detailed error types
   - Complete test objects with all required properties

2. **Event Validation Service** (`eventValidator.ts`)
   - Validates WebSocket events and their payloads
   - Provides type-safe validation results
   - Allows registration of event-specific validators
   - Implements singleton pattern for global access
   - Integrates with the event type system
   - Ensures event payload structure compliance
   - Provides detailed validation error messages
   - Supports runtime event validation

3. **Admin Service** (`adminService.ts`)
   - Handles admin-specific API calls
   - Dashboard statistics retrieval
   - Game report generation
   - Template management
   - Error handling with type-safe responses
   - Monitoring dashboard data retrieval
   - Performance metrics collection
   - Log aggregation and filtering

4. **Authentication Service** (`auth.ts`)
   - Firebase authentication integration
   - User session management
   - Protected route handling
   - Admin role verification

5. **Game Service** (`game.ts`)
   - Game state management
   - Game creation and configuration
   - Game template handling
   - Error handling for game operations
   - Game statistics tracking
   - Performance monitoring integration

6. **Template Service** (`template.ts`)
   - Template management
   - Template creation and editing
   - Template sharing functionality
   - Error handling for template operations
   - Optimized with cleaner type annotations
   - Leveraging TypeScript's type inference
   - Proper handling of default values with nullish coalescing

7. **Monitoring Service** (`monitoring.ts`)
   - System performance tracking
   - Error logging and reporting
   - WebSocket connection monitoring
   - Game statistics collection
   - Real-time data visualization
   - Log aggregation and filtering
   - Alert threshold management
   - Admin-specific monitoring views

### WebSocket Implementation
- **Connection State Management**: Properly tracking and handling WebSocket connection states improves user experience
- **Error Handling**: Comprehensive error handling with detailed error types helps with debugging and recovery
- **Event Type Safety**: Using strongly typed events ensures consistency between client and server
- **Reconnection Logic**: Implementing robust reconnection logic with exponential backoff improves reliability
- **Test Data Completeness**: Ensure test objects include all required properties from their respective interfaces
- **Event Payload Structure**: Always check the complete structure of event types, especially for nested properties
- **Type Safety in Event Handlers**: Ensure event handlers correctly access properties according to the defined type structure
- **ReconnectEvent Handling**: The ReconnectEvent type has a nested structure where attemptNumber is inside the payload property
- **Event Type Definitions**: Keep event type definitions in sync with actual event data structure to prevent type errors
- **Event Type Consistency**: Ensure event types used in code match those defined in the type system to prevent runtime errors
- **Event Payload Validation**: Validate event payloads against their expected structure to prevent runtime errors
- **Event Naming Conventions**: Use consistent naming conventions for events to improve code readability and maintainability
- **Event Validation System**: Implement a centralized event validation system to ensure type safety and payload structure compliance

### Real-time Architecture
1. **WebSocket Integration**
   - Socket.io client implementation with custom proxy middleware
   - Environment-based WebSocket URL configuration
   - Configurable WebSocket host, path, and port
   - Development-specific WebSocket debugging routes
   - Enhanced error handling and logging
   - Automatic reconnection with configurable options
   - Progress tracking for WebSocket operations
   - Connection state management with detailed status reporting
   - Type-safe event handling with proper payload structure validation
   - Consistent event naming conventions for improved maintainability
   - Real-time connection status monitoring
   - Performance metrics collection for WebSocket operations

2. **Game State Management**
   - Real-time game state updates
   - Player synchronization
   - Game start/end handling
   - Error recovery mechanisms
   - Player status tracking (online/offline, ready state)
   - Turn management with proper event handling
   - Game state synchronization across all clients
   - Proper handling of turn timeouts and transitions
   - Game statistics tracking and reporting
   - Performance monitoring integration

3. **Custom Hooks**
   - `useWebSocket` for real-time functionality
   - `useAuth` for authentication state
   - `useGameStats` for game statistics
   - `useMonitoring` for system monitoring data

4. **Monitoring System**
   - Real-time performance metrics tracking
   - Error logging and reporting
   - WebSocket connection status monitoring
   - Game statistics visualization
   - Log aggregation and filtering
   - Alert threshold management
   - Admin-specific monitoring views
   - Data visualization components
   - Historical data analysis
   - System health indicators

_Last Updated: December 2025_ 