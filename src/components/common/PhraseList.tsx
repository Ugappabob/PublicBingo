import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/index';
import type { PhraseList } from '../../types/types';
import PhraseListLibrary from './PhraseListLibrary';
import { useAuth } from '../../contexts/AuthContext';

interface NewPhraseList {
  name: string;
  description: string;
  phrases: string[];
  userId: string;
  createdAt: Date;
  isTemplate: boolean;
  isPublic: boolean;
  timesUsed: number;
  favoriteCount: number;
  favoritedBy: string[];
  tags: string[];
  createdBy: string;
  sharedWith: string[];
}

const PhraseListComponent: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // Redirect to sign in if no user
  if (!userId) {
    return (
      <div className="error-message">
        Please sign in to manage your phrase lists.
      </div>
    );
  }

  const [lists, setLists] = useState<PhraseList[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [phrases, setPhrases] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPhraseLists();
  }, []);

  const loadPhraseLists = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'phraseLists'),
      where('createdBy', '==', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const loadedLists: PhraseList[] = [];
    querySnapshot.forEach((doc) => {
      loadedLists.push({ id: doc.id, ...doc.data() } as PhraseList);
    });
    setLists(loadedLists);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newListName.trim() || !phrases.trim()) return;

    try {
      const newList: NewPhraseList = {
        name: newListName.trim(),
        description: description,
        phrases: phrases.split('\n').map(p => p.trim()).filter(p => p),
        userId: currentUser.uid,
        createdAt: new Date(),
        isTemplate: false,
        isPublic: isPublic,
        timesUsed: 0,
        favoriteCount: 0,
        favoritedBy: [],
        tags: [],
        createdBy: currentUser.uid,
        sharedWith: []
      };
      const docRef = await addDoc(collection(db, 'phraseLists'), newList);
      const createdList: PhraseList = {
        id: docRef.id,
        ...newList
      };
      setLists([...lists, createdList]);
      setNewListName('');
      setPhrases('');
    } catch (error) {
      console.error('Error creating phrase list:', error);
    }
  };

  const handleUpdateList = async (list: PhraseList, newName: string, newPhrases: string[]) => {
    if (!currentUser) return;

    const phraseListRef = doc(db, 'phraseLists', list.id);
    const updates: Partial<PhraseList> = {
      name: newName,
      phrases: newPhrases
    };

    try {
      await updateDoc(phraseListRef, updates);
      const updatedLists = lists.map(l => 
        l.id === list.id ? { ...l, name: newName, phrases: newPhrases } : l
      );
      setLists(updatedLists);
    } catch (error) {
      console.error('Error updating phrase list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'phraseLists', listId));
      setLists(lists.filter(l => l.id !== listId));
    } catch (error) {
      console.error('Error deleting phrase list:', error);
    }
  };

  const handleCopyList = async (list: PhraseList) => {
    if (!currentUser) return;

    try {
      const newList: NewPhraseList = {
        name: `${list.name} (Copy)`,
        description: list.description,
        phrases: [...list.phrases],
        userId: currentUser.uid,
        createdAt: new Date(),
        isTemplate: false,
        isPublic: list.isPublic,
        timesUsed: 0,
        favoriteCount: 0,
        favoritedBy: [],
        tags: [...(list.tags || [])],
        createdBy: currentUser.uid,
        sharedWith: []
      };
      const docRef = await addDoc(collection(db, 'phraseLists'), newList);
      const createdList: PhraseList = {
        id: docRef.id,
        ...newList
      };
      setLists([...lists, createdList]);
    } catch (error) {
      console.error('Error copying phrase list:', error);
    }
  };

  return (
    <div className="phrase-list-container">
      <h2>My Phrase Lists</h2>
      
      <form onSubmit={handleCreateList}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="List Name"
          required
        />
        <textarea
          value={phrases}
          onChange={(e) => setPhrases(e.target.value)}
          placeholder="Enter phrases (one per line)"
          required
        />
        <button type="submit">Create List</button>
      </form>

      <div className="phrase-lists">
        {lists.map((list) => (
          <div key={list.id} className="phrase-list">
            <h3>{list.name}</h3>
            <p>Phrases: {list.phrases.length}</p>
            <div className="list-actions">
              <button onClick={() => handleCopyList(list)}>Copy</button>
              <button onClick={() => handleDeleteList(list.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhraseListComponent; 