import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/index';
import type { PhraseList } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';

interface PhraseListSelectorProps {
  onSelectList: (list: PhraseList) => void;
}

const PhraseListSelector: React.FC<PhraseListSelectorProps> = ({ onSelectList }) => {
  const [lists, setLists] = useState<PhraseList[]>([]);
  const { currentUser } = useAuth();

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

  return (
    <div className="phrase-list-selector">
      <h2>Select a Phrase List</h2>
      <div className="phrase-lists">
        {lists.map((list) => (
          <div key={list.id} className="phrase-list" onClick={() => onSelectList(list)}>
            <h3>{list.name}</h3>
            <p>Phrases: {list.phrases.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhraseListSelector; 