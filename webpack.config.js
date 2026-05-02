const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Debug environment variables
console.log('🔍 Webpack Environment Variables Debug:');
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ SET' : '❌ NOT SET');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@types': path.resolve(__dirname, 'src/types'),
      },
      fallback: {
        "crypto": false,
        "stream": false,
        "util": false,
        "buffer": false,
        "process": false,
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        },
        {
          test: /\.m?js$/,
          include: [
            /node_modules\/firebase/,
            /node_modules\/@firebase/
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-modules-commonjs']
            }
          },
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // React and related libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Firebase
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 15,
          },
          // Common components
          common: {
            test: /[\\/]src[\\/]components[\\/]common[\\/]/,
            name: 'common-components',
            chunks: 'all',
            priority: 5,
          },
          // Game components
          game: {
            test: /[\\/]src[\\/]components[\\/]game[\\/]/,
            name: 'game-components',
            chunks: 'all',
            priority: 5,
          },
          // Utils
          utils: {
            test: /[\\/]src[\\/]utils[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 5,
          },
        },
      },
      runtimeChunk: 'single',
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
            },
            mangle: true,
          },
          extractComments: false,
        }),
      ],
    },
    plugins: [
      // Load environment variables
      new webpack.DefinePlugin({
        'process.env': {
          REACT_APP_FIREBASE_API_KEY: JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY),
          REACT_APP_FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
          REACT_APP_FIREBASE_PROJECT_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID),
          REACT_APP_FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
          REACT_APP_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
          REACT_APP_FIREBASE_APP_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID),
          REACT_APP_FIREBASE_MEASUREMENT_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID),
          REACT_APP_FIREBASE_DATABASE_URL: JSON.stringify(process.env.REACT_APP_FIREBASE_DATABASE_URL),
          NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
        }
      }),
      // HTML plugin to inject scripts
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      // Bundle analyzer (only in development or when explicitly enabled)
      ...(env.analyze ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        })
      ] : []),
      // Compression for production
      ...(isProduction ? [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
      ] : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true,
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    stats: {
      chunks: true,
      chunkModules: true,
      modules: false,
      reasons: true,
      moduleTrace: true,
      errorDetails: true,
    },
  };
};
