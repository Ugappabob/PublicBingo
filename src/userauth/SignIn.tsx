import React, { useState } from 'react';
import { AuthService } from '../services/authService';

const authService = new AuthService();

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await authService.login(email, password);
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in');
    }
  };

  return (
    <div className="auth-form">
      <h3>Sign In</h3>
      <div className="input-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignIn; 