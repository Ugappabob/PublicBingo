import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './contexts/AuthContext';
import './styles/App.css';

console.log('=== MAIN INDEX.TSX LOADING ===');
console.log('Current URL:', window.location.href);
console.log('Current pathname:', window.location.pathname);
console.log('About to create React root...');
console.log('JavaScript is executing! Check console for logs.');

// Auto-migrate user lists in production
import './scripts/autoMigrateUserLists';

console.log('Creating React root...');
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Rendering React app...');
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
console.log('React app rendered!'); 
