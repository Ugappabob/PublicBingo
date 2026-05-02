import React, { useState } from 'react';
import { AuthService } from '../services/authService';

const authService = new AuthService();

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await authService.register(email, password, '');
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up');
    }
  };

  return (
    <div className="auth-form">
      <h3>Sign Up</h3>
      <div className="input-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={error && !email ? 'error' : ''}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={error && !password ? 'error' : ''}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className={error && !confirmPassword ? 'error' : ''}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default SignUp; 