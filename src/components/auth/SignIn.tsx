import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/index';
import '../../styles/Auth.css';

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error: any) {
            setError(error.message || 'Failed to sign in');
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign In</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={onLogin} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email address"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                </div>

                <button type="submit" className="auth-button">
                    Sign In
                </button>

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
                <p className="auth-link">
                    Or <Link to="/guest" className="guest-link-inline">play as guest</Link> without an account
                </p>
            </form>
        </div>
    );
};

export default SignIn; 