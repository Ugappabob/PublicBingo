import React, { useState, FormEvent } from 'react';
import { AuthService } from '../../services/authService';
import { AuthError } from '../../types/errors';

interface GuestSignInState {
  guestName: string;
  error: string;
  isSubmitting: boolean;
}

const GuestSignIn: React.FC = () => {
  const [state, setState] = useState<GuestSignInState>({
    guestName: '',
    error: '',
    isSubmitting: false
  });

  const authService = new AuthService();

  const validateGuestName = (name: string): string | null => {
    if (!name.trim()) return 'Please enter a name';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    if (name.length > 30) return 'Name must be less than 30 characters';
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) return 'Name can only contain letters, numbers, spaces, hyphens and underscores';
    return null;
  };

  const handleGuestSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    const validationError = validateGuestName(state.guestName);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      await authService.signInAsGuest();
      // Store the guest name in localStorage for persistence
      localStorage.setItem('guestName', state.guestName.trim());
    } catch (error) {
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : 'An unexpected error occurred while signing in as guest';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isSubmitting: false 
      }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      guestName: e.target.value,
      error: ''
    }));
  };

  return (
    <form onSubmit={handleGuestSignIn} className="guest-signin">
      <div className="input-group">
        <input
          type="text"
          value={state.guestName}
          onChange={handleNameChange}
          placeholder="Enter your name"
          className={state.error ? 'error' : ''}
          maxLength={30}
          disabled={state.isSubmitting}
          aria-label="Guest name"
          required
        />
        {state.error && (
          <div className="error-message" role="alert">
            {state.error}
          </div>
        )}
      </div>
      <button 
        type="submit" 
        disabled={state.isSubmitting}
        aria-busy={state.isSubmitting}
      >
        {state.isSubmitting ? 'Signing in...' : 'Continue as Guest'}
      </button>
    </form>
  );
};

export default GuestSignIn; 