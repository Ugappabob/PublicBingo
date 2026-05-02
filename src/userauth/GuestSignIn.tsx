import React, { useState } from 'react';
import { AuthService } from '../services/authService';

const authService = new AuthService();

const GuestSignIn: React.FC = () => {
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');

  const handleGuestSignIn = async () => {
    if (!guestName.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      const userCredential = await authService.signInAsGuest();
      // Store the guest name in localStorage for persistence
      localStorage.setItem('guestName', guestName);
      setError('');
    } catch (error: unknown) {
      setError('Error signing in as guest: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="guest-signin">
      <div className="input-group">
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Enter your name"
          className={error && !guestName.trim() ? 'error' : ''}
        />
        {error && <div className="error-message">{error}</div>}
      </div>
      <button onClick={handleGuestSignIn}>Continue as Guest</button>
    </div>
  );
};

export default GuestSignIn; 