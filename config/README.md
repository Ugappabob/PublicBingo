# Webpack Configuration

This directory contains the webpack configuration files for the project.

## Files

- `webpack.dev.js`: Development-specific webpack configuration
  - Sets up development server middleware
  - Configures CORS headers
  - Handles WebSocket proxy for Socket.IO
  - Includes development-only routes
  - Configures hot reloading and other development features

## Integration with react-app-rewired

The project uses `react-app-rewired` to customize the Create React App webpack configuration without ejecting. The main configuration is in `config-overrides.js` at the root of the project.

### Development Server Features

- **CORS Support**: Automatically handles CORS headers and preflight requests
- **WebSocket Proxy**: Configured for Socket.IO connections
- **Hot Reloading**: Enabled for rapid development
- **Error Handling**: Custom middleware for better error reporting
- **Development Routes**: Special routes for development testing
- **Security Headers**: Basic security headers configured

### Usage

The development configuration is automatically applied when running:

```bash
npm start
```

### Environment Variables

The following environment variables can be used to customize the development server:

- `REACT_APP_WEBSOCKET_URL`: WebSocket server URL
- `REACT_APP_WS_HOST`: WebSocket hostname (defaults to 'localhost')
- `REACT_APP_WS_PATH`: WebSocket path (defaults to '/ws')
- `REACT_APP_WS_PORT`: WebSocket port (defaults to 3001)

## Adding New Configuration

To add new webpack configuration:

1. Create a new configuration file in this directory
2. Import it in `config-overrides.js`
3. Apply the configuration based on the environment 