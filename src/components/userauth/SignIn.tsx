import React, { useState, FormEvent } from 'react';
import { AuthService } from '../../services/authService';
import { AuthError } from '../../types/errors';

interface SignInFormState {
  email: string;
  password: string;
  error: string;
  isSubmitting: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const SignIn: React.FC = () => {
  const [formState, setFormState] = useState<SignInFormState>({
    email: '',
    password: '',
    error: '',
    isSubmitting: false
  });

  const authService = new AuthService();

  const validateForm = (): ValidationErrors | null => {
    const errors: ValidationErrors = {};
    
    if (!formState.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formState.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formState.password) {
      errors.password = 'Password is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors) {
      setFormState(prev => ({
        ...prev,
        error: 'Please correct the form errors'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      await authService.login(formState.email, formState.password);
      // Clear form on success
      setFormState({
        email: '',
        password: '',
        error: '',
        isSubmitting: false
      });
    } catch (error) {
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : 'An unexpected error occurred during sign in';
      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        isSubmitting: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
      error: ''
    }));
  };

  return (
    <form onSubmit={handleSignIn} className="auth-form">
      <h3>Sign In</h3>
      <div className="input-group">
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleInputChange}
          placeholder="Email"
          className={formState.error ? 'error' : ''}
          disabled={formState.isSubmitting}
          aria-label="Email address"
          required
          autoComplete="email"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="password"
          value={formState.password}
          onChange={handleInputChange}
          placeholder="Password"
          className={formState.error ? 'error' : ''}
          disabled={formState.isSubmitting}
          aria-label="Password"
          required
          autoComplete="current-password"
        />
      </div>
      {formState.error && (
        <div className="error-message" role="alert">
          {formState.error}
        </div>
      )}
      <button 
        type="submit" 
        disabled={formState.isSubmitting}
        aria-busy={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default SignIn; 