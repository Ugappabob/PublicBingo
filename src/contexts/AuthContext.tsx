import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/auth';

// Define the complete AuthContextType interface
export interface AuthContextType {
  currentUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInAsGuest: (displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  error: null,
  signup: async () => {},
  login: async () => {},
  signInAsGuest: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateEmail: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {}
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing guest session on mount
  useEffect(() => {
    console.log('AuthContext v2.0: Initializing authentication...');
    
    // Create a default user immediately to prevent hanging
    const createDefaultUser = (displayName: string = 'Anonymous User', providerId: string = 'anonymous') => {
      // Generate a persistent ID for the guest user
      let persistentId = localStorage.getItem('guestUserId');
      if (!persistentId) {
        persistentId = `${providerId}-${Date.now()}`;
        localStorage.setItem('guestUserId', persistentId);
      }
      
      const defaultGuest: AdminUser = {
        uid: persistentId,
        email: null,
        displayName: displayName,
        isAdmin: false,
        isAnonymous: true,
        emailVerified: false,
        photoURL: null,
        phoneNumber: null,
        providerId: providerId,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      } as AdminUser;
      
      setCurrentUser(defaultGuest);
      console.log('AuthContext: Created user:', displayName, 'with persistent ID:', persistentId);
      return defaultGuest;
    };

    try {
      const guestData = localStorage.getItem('guestUser');
      if (guestData) {
        const guestUser = JSON.parse(guestData);
        console.log('AuthContext: Found existing guest session:', guestUser.displayName);
        createDefaultUser(guestUser.displayName, 'guest');
      } else {
        console.log('AuthContext: No guest session found, creating anonymous user');
        createDefaultUser();
      }
    } catch (err) {
      console.error('AuthContext: Error checking guest session:', err);
      localStorage.removeItem('guestUser');
      console.log('AuthContext: Creating fallback user due to error');
      createDefaultUser('Guest User', 'fallback');
    }
  }, []);

  // Sign in as guest function
  const signInAsGuest = async (displayName: string) => {
    try {
      console.log('AuthContext: Signing in as guest:', displayName);
      
      // Use the same persistent ID logic
      let persistentId = localStorage.getItem('guestUserId');
      if (!persistentId) {
        persistentId = 'guest-' + Date.now();
        localStorage.setItem('guestUserId', persistentId);
      }
      
      const mockUser: AdminUser = {
        uid: persistentId,
        email: null,
        displayName: displayName,
        isAdmin: false,
        isAnonymous: true,
        emailVerified: false,
        photoURL: null,
        phoneNumber: null,
        providerId: 'guest',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      } as AdminUser;
      
      localStorage.setItem('guestUser', JSON.stringify({
        displayName: displayName,
        isGuest: true,
        joinedAt: new Date().toISOString()
      }));
      
      setCurrentUser(mockUser);
      setError(null);
      console.log('AuthContext: Guest sign-in successful with persistent ID:', persistentId);
    } catch (err) {
      console.error('Guest sign in error:', err);
      setError('Failed to sign in as guest. Please try again.');
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('AuthContext: Logging out');
      localStorage.removeItem('guestUser');
      localStorage.removeItem('guestUserId');
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('guestUser');
      localStorage.removeItem('guestUserId');
      setCurrentUser(null);
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    signup: async () => { console.log('Signup not available'); },
    login: async () => { console.log('Login not available'); },
    signInAsGuest,
    logout,
    resetPassword: async () => { console.log('Reset password not available'); },
    updateEmail: async () => { console.log('Update email not available'); },
    updatePassword: async () => { console.log('Update password not available'); },
    updateProfile: async () => { console.log('Update profile not available'); }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 