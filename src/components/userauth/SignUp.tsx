import React, { useState, FormEvent } from 'react';
import { AuthService } from '../../services/authService';
import { AuthError } from '../../types/errors';

interface SignUpFormState {
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  isSubmitting: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUp: React.FC = () => {
  const [formState, setFormState] = useState<SignUpFormState>({
    email: '',
    password: '',
    confirmPassword: '',
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
    } else if (formState.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formState.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }

    if (!formState.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSignUp = async (e: FormEvent) => {
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
      await authService.register(formState.email, formState.password, '');
      // Clear form on success
      setFormState({
        email: '',
        password: '',
        confirmPassword: '',
        error: '',
        isSubmitting: false
      });
    } catch (error) {
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : 'An unexpected error occurred during sign up';
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
    <form onSubmit={handleSignUp} className="auth-form">
      <h3>Sign Up</h3>
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
          autoComplete="new-password"
          minLength={6}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          className={formState.error ? 'error' : ''}
          disabled={formState.isSubmitting}
          aria-label="Confirm password"
          required
          autoComplete="new-password"
          minLength={6}
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
        {formState.isSubmitting ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUp; 