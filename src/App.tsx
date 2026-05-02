import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import './styles/App.css';

// Lazy load all major components for better performance
const CreateGame = lazy(() => {
  console.log('Loading CreateGame component...');
  return import('./pages/GameCreation');
});
const GameRoom = lazy(() => {
  console.log('🚨 LOADING GAMEROOM - About to load SimpleGameRoom component...');
  console.log('🚨 ROUTE MATCH - /game/:sessionId route is loading SimpleGameRoom');
  return import('./components/SimpleGameRoom');
});
const GameChat = lazy(() => import('./components/game/GameChat'));
const Leaderboard = lazy(() => import('./components/common/Leaderboard'));
const GameProgress = lazy(() => import('./components/common/GameProgress'));
const GameInstructions = lazy(() => import('./components/common/GameInstructions'));
const GameSettings = lazy(() => import('./components/common/GameSettings'));
const GameStatistics = lazy(() => import('./components/common/GameStatistics'));
const BingoCelebration = lazy(() => import('./components/BingoCelebration'));
const UsageStatsDashboard = lazy(() => import('./components/admin/UsageStatsDashboard'));
const ProductionAnalyticsDashboard = lazy(() => import('./components/admin/ProductionAnalyticsDashboard'));

function App() {
  // Debug current URL
  useEffect(() => {
    console.log('🚨 APP COMPONENT LOADED - Main App component is running');
    console.log('🚨 CURRENT URL:', window.location.href);
    console.log('🚨 CURRENT PATHNAME:', window.location.pathname);
    console.log('🚨 APP COMPONENT LOADED!');
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <nav className="navigation">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/guest">Play as Guest</Link>
            </li>
            <li>
              <Link to="/join">Join Game</Link>
            </li>
            <li>
              <Link to="/create">Create Game</Link>
            </li>
            <li>
              <Link to="/admin/stats">📊 Admin Stats</Link>
            </li>
            <li>
              <Link to="/admin/analytics">🚀 Production Analytics</Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Suspense fallback={<LoadingSpinner size="large" text="Loading PublicBingo..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guest" element={<GuestSignIn />} />
              <Route path="/join" element={<JoinGame />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/lists" element={<PhraseListManager />} />
              <Route path="/create" element={<CreateGame />} />
              <Route path="/create/:sessionId" element={<CreateGame />} />
              <Route path="/game/:sessionId" element={<GameRoom />} />
              <Route path="/admin/stats" element={<UsageStatsDashboard />} />
              <Route path="/admin/analytics" element={<ProductionAnalyticsDashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

// Home component that checks for guest session
const Home = () => {
  const [guestUser, setGuestUser] = useState<any>(null);

  // Check for guest session on component mount and listen for changes
  useEffect(() => {
    const checkGuestSession = () => {
      const guestData = localStorage.getItem('guestUser');
      if (guestData) {
        try {
          setGuestUser(JSON.parse(guestData));
        } catch (err) {
          console.error('Error parsing guest data:', err);
        }
      } else {
        setGuestUser(null);
      }
    };

    // Check initially
    checkGuestSession();

    // Listen for storage changes (when guest signs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'guestUser') {
        checkGuestSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when window regains focus (in case localStorage was modified in another tab)
    const handleFocus = () => {
      checkGuestSession();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('guestUser');
    setGuestUser(null);
  };

  // If guest is signed in, show different content
  if (guestUser) {
    return (
      <div className="home-container">
        <div className="home-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '30px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div>
              <h1>🎯 Welcome back, {guestUser.displayName}!</h1>
              <p style={{ color: '#666', margin: 0 }}>
                You're signed in as a guest. Ready to play some bingo?
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
          
          <div className="guest-actions">
            <h2>What would you like to do?</h2>
            <div className="action-buttons" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/create" className="action-button primary" style={{ 
                padding: '15px 25px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold'
              }}>
                🎲 Create New Game
              </Link>
              <Link to="/join" className="action-button secondary" style={{ 
                padding: '15px 25px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold'
              }}>
                🎯 Join Game
              </Link>
            </div>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
              <h3>Quick Start Options:</h3>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                <li><strong>Create Game:</strong> Start a new bingo game and invite friends</li>
                <li><strong>Join Game:</strong> Enter a game ID to join an existing game</li>
                <li><strong>Quick Join:</strong> Join a random public game</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default home page for non-guests
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>🎯 Welcome to Public Bingo!</h1>
        <p className="home-description">
          Create and join bingo games with friends and family. 
          No account required to play!
        </p>
        
        <div className="guest-actions">
          <h2>Ready to Play?</h2>
          <div className="action-buttons">
            <Link to="/guest" className="action-button primary">
              🎮 Play as Guest
            </Link>
            <Link to="/join" className="action-button secondary">
              🎯 Join Game
            </Link>
            <Link to="/signin" className="action-button secondary">
              🔐 Sign In
            </Link>
            <Link to="/signup" className="action-button secondary">
              📝 Create Account
            </Link>
          </div>
          <div className="guest-benefits">
            <h3>Why Play as Guest?</h3>
            <ul>
              <li>✅ No account required</li>
              <li>✅ Start playing immediately</li>
              <li>✅ Join any game with a link</li>
              <li>✅ Real-time multiplayer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Working Guest Sign In
const GuestSignIn = () => {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGuestSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    // Store guest info in localStorage
    localStorage.setItem('guestUser', JSON.stringify({
      displayName: displayName.trim(),
      isGuest: true,
      joinedAt: new Date().toISOString()
    }));

    // Redirect to home page
    navigate('/', { replace: true });
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '500px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2>🎮 Play as Guest</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Enter a display name to start playing immediately. No account required!
      </p>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleGuestSignIn} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Display Name: *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            placeholder="Enter your display name"
            required
          />
        </div>
        
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          🎮 Start Playing as Guest
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

// Working Join Game
const JoinGame = () => {
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user is authenticated or has guest data
      const guestUser = localStorage.getItem('guestUser');
      if (!guestUser) {
        // Auto-create a guest user for testing
        const autoGuestData = {
          displayName: 'Test Player',
          isGuest: true,
          joinedAt: new Date().toISOString()
        };
        localStorage.setItem('guestUser', JSON.stringify(autoGuestData));
        console.log('Auto-created guest user for testing:', autoGuestData);
      }

      // For now, we'll just navigate to the game room
      // In a real implementation, you'd validate the game exists
      navigate(`/game/${gameId.trim()}`);
    } catch (err) {
      setError('Failed to join game. Please check the game ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJoin = () => {
    // Generate a random game ID for demo purposes
    const randomGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(randomGameId);
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '500px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2>🎯 Join Game</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Enter a game ID to join an existing bingo game.
      </p>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleJoinGame} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Game ID: *
          </label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            placeholder="Enter game ID (e.g., ABC123)"
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Joining...' : '🎯 Join Game'}
          </button>
          
          <button
            type="button"
            onClick={handleQuickJoin}
            style={{
              padding: '12px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🎲 Quick Join
          </button>
        </div>
      </form>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        textAlign: 'left'
      }}>
        <h4>How to join a game:</h4>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Get a game ID from the host</li>
          <li>Enter the game ID above</li>
          <li>Click "Join Game" to enter the room</li>
          <li>Wait for the host to start the game</li>
        </ol>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          <strong>Demo:</strong> Click "Quick Join" to generate a random game ID for testing.
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#28a745' }}>
          <strong>Note:</strong> A test guest user will be automatically created for demo purposes.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

const SignIn = () => (
  <div style={{ padding: '20px' }}>
    <h2>🔐 Sign In</h2>
    <p>Sign in functionality coming soon!</p>
    <Link to="/">← Back to Home</Link>
  </div>
);

const SignUp = () => (
  <div style={{ padding: '20px' }}>
    <h2>📝 Create Account</h2>
    <p>Sign up functionality coming soon!</p>
    <Link to="/">← Back to Home</Link>
  </div>
);

// Firebase-integrated PhraseListManager with error handling
const PhraseListManager = () => {
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPhrases, setNewListPhrases] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  // Helper function to ensure createdAt is a Date object
  const ensureDate = (dateValue: any): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    if (dateValue && dateValue.toDate) {
      return dateValue.toDate();
    }
    return new Date();
  };

  // Check if Firebase is available
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const { db } = await import('./firebase/index');
        setFirebaseAvailable(true);
        loadSavedLists();
      } catch (err) {
        console.warn('Firebase not available, using local storage:', err);
        setFirebaseAvailable(false);
        setLoading(false);
        // Load from localStorage as fallback
        const localLists = localStorage.getItem('phraseLists');
        if (localLists) {
          const parsedLists = JSON.parse(localLists);
          // Convert createdAt strings back to Date objects
          const listsWithDates = parsedLists.map((list: any) => ({
            ...list,
            createdAt: ensureDate(list.createdAt)
          }));
          setSavedLists(listsWithDates);
        }
      }
    };
    checkFirebase();
  }, []);

  // Load saved lists from Firebase or localStorage
  const loadSavedLists = async () => {
    if (!firebaseAvailable) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { db } = await import('./firebase/index');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const listsRef = collection(db, 'phraseLists');
      const q = query(listsRef, where('userId', '==', 'guest'));
      const querySnapshot = await getDocs(q);
      
      const lists: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lists.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          phrases: data.phrases || [],
          createdAt: ensureDate(data.createdAt),
          timesUsed: data.timesUsed || 0
        });
      });

      setSavedLists(lists);
    } catch (err) {
      console.error('Error loading saved lists:', err);
      setError('Failed to load saved phrase lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListName.trim() || !newListPhrases.trim()) {
      setError('Please provide a name and phrases for your list');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const phrases = newListPhrases
        .split('\n')
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 0);

      if (phrases.length < 24) {
        setError('You need at least 24 phrases for a bingo game');
        return;
      }

      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        description: newListDescription.trim(),
        phrases: phrases,
        createdAt: new Date(),
        timesUsed: 0
      };

      if (firebaseAvailable) {
        // Save to Firebase
        try {
          const { db } = await import('./firebase/index');
          const { collection, addDoc } = await import('firebase/firestore');
          
          const listData = {
            ...newList,
            userId: 'guest',
            isTemplate: false,
            isPublic: false,
            favoriteCount: 0,
            favoritedBy: [],
            tags: [],
            createdBy: 'guest',
            sharedWith: []
          };

          await addDoc(collection(db, 'phraseLists'), listData);
          await loadSavedLists();
        } catch (firebaseErr) {
          console.error('Firebase save failed, falling back to localStorage:', firebaseErr);
          // Fallback to localStorage
          const updatedLists = [...savedLists, newList];
          setSavedLists(updatedLists);
          localStorage.setItem('phraseLists', JSON.stringify(updatedLists));
        }
      } else {
        // Save to localStorage
        const updatedLists = [...savedLists, newList];
        setSavedLists(updatedLists);
        localStorage.setItem('phraseLists', JSON.stringify(updatedLists));
      }
      
      // Reset form
      setNewListName('');
      setNewListDescription('');
      setNewListPhrases('');
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Error creating phrase list:', err);
      setError('Failed to create phrase list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this phrase list? This action cannot be undone.')) {
      return;
    }

    try {
      if (firebaseAvailable) {
        // Delete from Firebase
        try {
          const { db } = await import('./firebase/index');
          const { deleteDoc, doc } = await import('firebase/firestore');
          
          await deleteDoc(doc(db, 'phraseLists', listId));
          await loadSavedLists();
        } catch (firebaseErr) {
          console.error('Firebase delete failed, falling back to localStorage:', firebaseErr);
          // Fallback to localStorage
          const updatedLists = savedLists.filter(list => list.id !== listId);
          setSavedLists(updatedLists);
          localStorage.setItem('phraseLists', JSON.stringify(updatedLists));
        }
      } else {
        // Delete from localStorage
        const updatedLists = savedLists.filter(list => list.id !== listId);
        setSavedLists(updatedLists);
        localStorage.setItem('phraseLists', JSON.stringify(updatedLists));
      }
    } catch (err) {
      console.error('Error deleting phrase list:', err);
      setError('Failed to delete phrase list');
    }
  };

  return (
    <div className="phrase-list-manager" style={{ padding: '20px' }}>
      <div className="manager-header">
        <h1>📝 My Phrase Lists</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '12px', 
            padding: '4px 8px', 
            backgroundColor: firebaseAvailable ? '#d4edda' : '#fff3cd',
            color: firebaseAvailable ? '#155724' : '#856404',
            borderRadius: '4px',
            border: `1px solid ${firebaseAvailable ? '#c3e6cb' : '#ffeaa7'}`
          }}>
            {firebaseAvailable ? '🔥 Firebase Connected' : '💾 Local Storage'}
          </span>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create New List'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Create New Phrase List</h3>
          <form onSubmit={handleCreateList}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                List Name: *
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter list name"
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Description:
              </label>
              <input
                type="text"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter description (optional)"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Phrases (one per line, minimum 24): *
              </label>
              <textarea
                value={newListPhrases}
                onChange={(e) => setNewListPhrases(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  padding: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
                placeholder="Enter phrases, one per line..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '10px 20px',
                backgroundColor: creating ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: creating ? 'not-allowed' : 'pointer'
              }}
            >
              {creating ? 'Creating...' : 'Save List'}
            </button>
          </form>
        </div>
      )}

      <div className="saved-lists">
        <h3>Your Lists ({savedLists.length})</h3>
        {loading ? (
          <p>Loading your lists...</p>
        ) : savedLists.length === 0 ? (
          <p>No phrase lists created yet. Create your first list above!</p>
        ) : (
          <div>
            {savedLists.map((list) => (
              <div 
                key={list.id}
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  marginBottom: '10px',
                  borderRadius: '5px'
                }}
              >
                <h4>{list.name}</h4>
                {list.description && <p>{list.description}</p>}
                <p><strong>Phrases:</strong> {list.phrases.length}</p>
                <p><strong>Created:</strong> {ensureDate(list.createdAt).toLocaleDateString()}</p>
                <p><strong>Times Used:</strong> {list.timesUsed}</p>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default App; 