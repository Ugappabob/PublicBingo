import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

const GuestSignIn = () => {
    const navigate = useNavigate();
    const { signInAsGuest } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onGuestSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await signInAsGuest(displayName);
            navigate('/');
        } catch (error: any) {
            setError(error.message || 'Failed to sign in as guest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Play as Guest</h2>
            <p className="guest-description">
                Join a game without creating an account. Just enter your name and start playing!
            </p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={onGuestSignIn} className="auth-form">
                <div className="form-group">
                    <label htmlFor="displayName">Your Name</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        placeholder="Enter your name"
                        minLength={2}
                        maxLength={20}
                    />
                </div>

                <button 
                    type="submit" 
                    className="auth-button guest-button"
                    disabled={loading || !displayName.trim()}
                >
                    {loading ? 'Signing In...' : 'Play as Guest'}
                </button>

                <div className="auth-links">
                    <p className="auth-link">
                        Have an account? <Link to="/signin">Sign In</Link>
                    </p>
                    <p className="auth-link">
                        Need an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default GuestSignIn; 