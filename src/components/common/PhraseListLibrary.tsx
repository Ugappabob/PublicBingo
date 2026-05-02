import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PhraseList } from '../../types/types';

interface PhraseListLibraryProps {
  userId: string;
}

const PhraseListLibrary: React.FC<PhraseListLibraryProps> = ({ userId }) => {
  const [lists, setLists] = useState<PhraseList[]>([]);
  const [selectedList, setSelectedList] = useState<PhraseList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLists();
  }, [userId]);

  const loadLists = async () => {
    try {
      setLoading(true);
      setError('');

      const listsQuery = query(
        collection(db, 'phraseLists'),
        where('isTemplate', '==', true),
        where('isPublic', '==', true)
      );

      const querySnapshot = await getDocs(listsQuery);
      const loadedLists: PhraseList[] = [];

      querySnapshot.forEach((doc) => {
        loadedLists.push({
          id: doc.id,
          ...doc.data(),
        } as PhraseList);
      });

      setLists(loadedLists);
    } catch (err) {
      setError('Failed to load lists. Please try again later.');
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectList = (list: PhraseList) => {
    setSelectedList(list);
  };

  if (loading) {
    return <div className="loading">Loading lists...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="phrase-list-library">
      <h2>Template Library</h2>
      
      <div className="template-list">
        {lists.length === 0 ? (
          <p>No templates available.</p>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className={`template-item ${selectedList?.id === list.id ? 'selected' : ''}`}
              onClick={() => handleSelectList(list)}
            >
              <h3>{list.name}</h3>
              <p>{list.description}</p>
              <div className="template-tags">
                {list.tags?.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <p className="phrase-count">{list.phrases.length} phrases</p>
            </div>
          ))
        )}
      </div>

      {selectedList && (
        <div className="selected-template">
          <h3>Selected Template: {selectedList.name}</h3>
          <div className="template-phrases">
            <h4>Phrases:</h4>
            <ul>
              {selectedList.phrases.map((phrase, index) => (
                <li key={index}>{phrase}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhraseListLibrary; 