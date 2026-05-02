const path = require('path');
const webpackDevConfig = require('./config/webpack.dev');

module.exports = function override(config, env) {
  // Add any webpack config overrides here
  if (env === 'development') {
    config = {
      ...config,
      devServer: {
        ...config.devServer,
        ...webpackDevConfig.devServer
      }
    };
  }

  return config;
}; 