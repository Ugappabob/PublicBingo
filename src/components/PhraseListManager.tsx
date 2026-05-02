import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/index';
import { useAuth } from '../contexts/AuthContext';
import '../styles/App.css';

interface SavedPhraseList {
  id: string;
  name: string;
  description: string;
  phrases: string[];
  createdAt: Date;
  timesUsed: number;
}

const PhraseListManager = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [savedLists, setSavedLists] = useState<SavedPhraseList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPhrases, setNewListPhrases] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSavedLists();
    }
  }, [currentUser]);

  const loadSavedLists = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const listsRef = collection(db, 'phraseLists');
      const q = query(listsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const lists: SavedPhraseList[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lists.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          phrases: data.phrases || [],
          createdAt: data.createdAt?.toDate() || new Date(),
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
    if (!currentUser) return;

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

      const listData = {
        name: newListName.trim(),
        description: newListDescription.trim(),
        phrases: phrases,
        userId: currentUser.uid,
        createdAt: new Date(),
        timesUsed: 0,
        isTemplate: false,
        isPublic: false,
        favoriteCount: 0,
        favoritedBy: [],
        tags: [],
        createdBy: currentUser.uid,
        sharedWith: []
      };

      await addDoc(collection(db, 'phraseLists'), listData);
      
      // Reset form
      setNewListName('');
      setNewListDescription('');
      setNewListPhrases('');
      setShowCreateForm(false);
      
      // Reload lists
      await loadSavedLists();
      
    } catch (err) {
      console.error('Error creating phrase list:', err);
      setError('Failed to create phrase list');
    } finally {
      setCreating(false);
    }
  };

  const handleUseList = (list: SavedPhraseList) => {
    // Navigate to create game with the selected list
    navigate('/create', { 
      state: { 
        selectedPhraseList: {
          name: list.name,
          phrases: list.phrases
        }
      }
    });
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this phrase list? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'phraseLists', listId));
      await loadSavedLists();
    } catch (err) {
      console.error('Error deleting phrase list:', err);
      setError('Failed to delete phrase list');
    }
  };

  const handleEditList = async (list: SavedPhraseList) => {
    // For now, we'll just update the usage count
    try {
      await updateDoc(doc(db, 'phraseLists', list.id), {
        timesUsed: list.timesUsed + 1
      });
      await loadSavedLists();
    } catch (err) {
      console.error('Error updating phrase list:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="phrase-list-manager">
        <div className="auth-required">
          <h2>Sign In Required</h2>
          <p>You need to sign in to save and manage phrase lists.</p>
          <button onClick={() => navigate('/signin')} className="signin-button">
            🔐 Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="phrase-list-manager">
      <div className="manager-header">
        <h1>📝 My Phrase Lists</h1>
        <p>Save and manage your favorite phrase lists for quick game creation.</p>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-list-button"
        >
          {showCreateForm ? '✕ Cancel' : '➕ Create New List'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-list-form">
          <h3>Create New Phrase List</h3>
          <form onSubmit={handleCreateList}>
            <div className="form-group">
              <label htmlFor="listName">List Name</label>
              <input
                id="listName"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Movie Quotes, Office Phrases"
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="listDescription">Description (Optional)</label>
              <input
                id="listDescription"
                type="text"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Brief description of your phrase list"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="listPhrases">Phrases (One per line, minimum 24)</label>
              <textarea
                id="listPhrases"
                value={newListPhrases}
                onChange={(e) => setNewListPhrases(e.target.value)}
                placeholder="Enter your phrases here, one per line..."
                required
                rows={15}
                className="phrases-textarea"
              />
              <div className="phrase-count">
                {newListPhrases.split('\n').filter(p => p.trim().length > 0).length} phrases
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={creating || !newListName.trim() || !newListPhrases.trim()}
              >
                {creating ? 'Saving...' : '💾 Save List'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading your phrase lists...</p>
        </div>
      ) : savedLists.length === 0 ? (
        <div className="empty-state">
          <h3>No Saved Lists Yet</h3>
          <p>Create your first phrase list to get started!</p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-first-list-button"
          >
            ➕ Create Your First List
          </button>
        </div>
      ) : (
        <div className="saved-lists">
          <h3>Your Saved Lists ({savedLists.length})</h3>
          <div className="lists-grid">
            {savedLists.map((list) => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h4>{list.name}</h4>
                  <div className="list-actions">
                    <button 
                      onClick={() => handleUseList(list)}
                      className="use-list-button"
                      title="Use this list to create a game"
                    >
                      🎮 Use
                    </button>
                    <button 
                      onClick={() => handleDeleteList(list.id)}
                      className="delete-list-button"
                      title="Delete this list"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {list.description && (
                  <p className="list-description">{list.description}</p>
                )}
                
                <div className="list-stats">
                  <span>📝 {list.phrases.length} phrases</span>
                  <span>🎯 Used {list.timesUsed} times</span>
                  <span>📅 Created {list.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhraseListManager; 