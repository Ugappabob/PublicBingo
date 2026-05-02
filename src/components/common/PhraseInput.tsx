import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp, db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/PhraseInput.css';

interface Phrase {
  text: string;
  addedBy: string;
  addedByName: string;
  timestamp: Date | string;
}

interface PhraseInputProps {
  onPhrasesComplete: (phrases: string[]) => void;
  minPhrases?: number;
  maxPhrases?: number;
  gameId: string;
  initialPhrases?: string[];
}

const PhraseInput: React.FC<PhraseInputProps> = ({
  onPhrasesComplete,
  minPhrases = 24,
  maxPhrases = 50,
  gameId,
  initialPhrases = []
}) => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { currentUser } = useAuth();
  const phraseInputRef = React.useRef<HTMLInputElement>(null);

  // Debug logging
  console.log('PhraseInput received gameId:', gameId);
  console.log('PhraseInput gameId type:', typeof gameId);

  // Validate gameId
  if (!gameId) {
    console.error('PhraseInput: gameId is required but not provided');
    return (
      <div className="phrase-input-error">
        <h3>Error</h3>
        <p>Game ID is required to load phrases.</p>
      </div>
    );
  }

  // Handle initial phrases and subscribe to real-time updates
  useEffect(() => {
    if (!gameId) {
      console.error('PhraseInput: Cannot subscribe to updates without gameId');
      return;
    }

    // If we have initial phrases, save them to the database first
    if (initialPhrases.length > 0 && !initialized && currentUser) {
      console.log('PhraseInput: Saving initial phrases to database:', initialPhrases);
      
      const saveInitialPhrases = async () => {
        try {
          setIsSubmitting(true);
          
          // Create all phrases at once instead of looping
          const phrasesToAdd = initialPhrases
            .filter(phraseText => phraseText.trim())
            .map(phraseText => ({
              text: phraseText.trim(),
              addedBy: currentUser.uid,
              addedByName: currentUser.displayName || 'Anonymous',
              timestamp: new Date().toISOString()
            }));

          console.log('PhraseInput: Adding phrases in batch:', phrasesToAdd);

          // Add all phrases at once using a single updateDoc call
          await updateDoc(doc(db, 'games', gameId), {
            phrases: phrasesToAdd
          });
          
          setInitialized(true);
          console.log('PhraseInput: Initial phrases saved to database successfully');
          
          // Focus the input field after initialization is complete
          if (phraseInputRef.current) {
            phraseInputRef.current.focus();
          }
        } catch (err) {
          console.error('Error saving initial phrases:', err);
          setError('Failed to save initial phrases');
          // Still mark as initialized so we don't get stuck
          setInitialized(true);
        } finally {
          setIsSubmitting(false);
        }
      };

      saveInitialPhrases();
    }

    console.log('PhraseInput: Setting up listener for gameId:', gameId);

    const unsubscribe = onSnapshot(
      doc(db, 'games', gameId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log('Raw phrases data from Firestore:', data.phrases);
          
          // Convert string timestamps to Date objects
          const phrasesWithDates = (data.phrases || []).map((phrase: any) => {
            console.log('Processing phrase:', phrase);
            console.log('Timestamp type:', typeof phrase.timestamp);
            console.log('Timestamp value:', phrase.timestamp);
            
            return {
              ...phrase,
              timestamp: typeof phrase.timestamp === 'string' 
                ? new Date(phrase.timestamp) 
                : phrase.timestamp
            };
          });
          
          console.log('Processed phrases:', phrasesWithDates);
          setPhrases(phrasesWithDates);
          
          // Notify parent component when we have enough phrases
          if (phrasesWithDates.length >= minPhrases) {
            onPhrasesComplete(phrasesWithDates.map((p: Phrase) => p.text));
          }
        } else {
          console.log('Game document does not exist for gameId:', gameId);
        }
      },
      (error) => {
        console.error('Error listening to phrases:', error);
        setError('Error loading phrases. Please refresh the page.');
      }
    );

    return () => {
      console.log('PhraseInput: Cleaning up listener for gameId:', gameId);
      unsubscribe();
    };
  }, [gameId, minPhrases, onPhrasesComplete, initialPhrases, initialized, currentUser]);



  // Auto-focus the input field when component loads and when ready
  useEffect(() => {
    if (phraseInputRef.current && !isSubmitting) {
      phraseInputRef.current.focus();
    }
  }, [isSubmitting]);

  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedPhrase = currentPhrase.trim();

    if (!trimmedPhrase) {
      setError('Please enter a phrase');
      return;
    }

    if (phrases.some(p => p.text.toLowerCase() === trimmedPhrase.toLowerCase())) {
      setError('This phrase has already been added');
      return;
    }

    if (phrases.length >= maxPhrases) {
      setError(`Maximum ${maxPhrases} phrases allowed`);
      return;
    }

    setIsSubmitting(true);
    try {
      const newPhrase: Phrase = {
        text: trimmedPhrase,
        addedBy: currentUser.uid,
        addedByName: currentUser.displayName || 'Anonymous',
        timestamp: new Date()
      };

      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        phrases: arrayUnion(newPhrase)
      });

      setCurrentPhrase('');
      setError(null);
      
      // Auto-focus the input field for quick consecutive additions
      if (phraseInputRef.current) {
        phraseInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error adding phrase:', error);
      setError('Failed to add phrase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhrase = async (phrase: Phrase) => {
    if (!currentUser) return;
    if (phrase.addedBy !== currentUser.uid) {
      setError('You can only remove your own phrases');
      return;
    }

    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        phrases: arrayRemove(phrase)
      });
    } catch (error) {
      console.error('Error removing phrase:', error);
      setError('Failed to remove phrase. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPhrase(e as any);
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    let date: Date;
    
    // Handle different timestamp formats
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      console.warn('Invalid timestamp format:', timestamp);
      return 'Invalid time';
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid time';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="phrase-input-container">
      <div className="phrase-input-header">
        <h2>Create Your Bingo Phrases</h2>
        <p className="phrase-count">
          {phrases.length} of {minPhrases} required phrases added
          {phrases.length >= minPhrases && ' (✓)'}
        </p>
      </div>

      <form onSubmit={handleAddPhrase} className="phrase-form">
        <div className="input-group">
          <input
            type="text"
            value={currentPhrase}
            onChange={(e) => setCurrentPhrase(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a phrase..."
            className={error ? 'error' : ''}
            maxLength={100}
            disabled={isSubmitting}
            ref={phraseInputRef}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !currentPhrase.trim() || phrases.length >= maxPhrases}
          >
            {isSubmitting ? 'Adding...' : 'Add Phrase'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="phrases-list">
        {phrases.map((phrase, index) => (
          <div key={`${phrase.text}-${index}`} className="phrase-item">
            <span className="phrase-number">{index + 1}.</span>
            <span className="phrase-text">{phrase.text}</span>
            <div className="phrase-meta">
              <span className="added-by" title={`Added by ${phrase.addedByName}`}>
                {phrase.addedByName}
              </span>
              <span className="timestamp" title={
                (() => {
                  try {
                    if (typeof phrase.timestamp === 'string') {
                      const date = new Date(phrase.timestamp);
                      return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleString();
                    } else if (phrase.timestamp instanceof Date) {
                      return phrase.timestamp.toLocaleString();
                    } else {
                      return 'Invalid time';
                    }
                  } catch (error) {
                    console.warn('Error formatting timestamp for title:', error);
                    return 'Invalid time';
                  }
                })()
              }>
                {formatTimestamp(phrase.timestamp)}
              </span>
              {currentUser && phrase.addedBy === currentUser.uid && (
                <button
                  onClick={() => handleRemovePhrase(phrase)}
                  className="remove-phrase"
                  title="Remove phrase"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {phrases.length < minPhrases && (
        <p className="helper-text">
          Add {minPhrases - phrases.length} more phrase{minPhrases - phrases.length !== 1 ? 's' : ''} to create your bingo board
        </p>
      )}
    </div>
  );
};

export default PhraseInput; 