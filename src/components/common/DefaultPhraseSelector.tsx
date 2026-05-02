import React, { useState, useEffect } from 'react';
import { defaultPhraseLists, PhraseList } from '../../data/defaultPhraseLists';
import { publicPhraseListService, UserContribution } from '../../services/publicPhraseListService';
import { usageTrackingService } from '../../services/usageTrackingService';
import '../../styles/DefaultPhraseSelector.css';

interface DefaultPhraseSelectorProps {
  onPhraseListSelect: (phrases: string[]) => void;
  selectedPhrases: string[];
  refreshTrigger?: number;
}

const DefaultPhraseSelector: React.FC<DefaultPhraseSelectorProps> = ({
  onPhraseListSelect,
  selectedPhrases,
  refreshTrigger
}) => {
  console.log('DefaultPhraseSelector component loaded!');
  
  const [selectedList, setSelectedList] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [allLists, setAllLists] = useState<(PhraseList | UserContribution)[]>([]);

  // Load all available lists (default + user contributions)
  useEffect(() => {
    const loadLists = async () => {
      try {
        console.log('🔄 DefaultPhraseSelector: Starting to load lists...');
        console.log('🔄 DefaultPhraseSelector: Service available:', !!publicPhraseListService);
        
        const availableLists = await publicPhraseListService.getAllAvailableLists();
        console.log('📋 DefaultPhraseSelector: Got', availableLists.length, 'lists from service');
        console.log('📋 DefaultPhraseSelector: List names:', availableLists.map(list => list.name));
        
        setAllLists(availableLists);
        console.log('✅ DefaultPhraseSelector: Lists set in state');
        
        // Debug: Check user contributions specifically
        const userContributions = await publicPhraseListService.getUserContributions();
        console.log('👤 DefaultPhraseSelector: User contributions:', userContributions.length, 'contributions');
        console.log('👤 DefaultPhraseSelector: User contributions details:', userContributions);
      } catch (error: unknown) {
        console.error('❌ DefaultPhraseSelector: Error loading phrase lists:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('❌ DefaultPhraseSelector: Error details:', err.message);
        console.error('❌ DefaultPhraseSelector: Error stack:', err.stack);
      }
    };

    loadLists();
  }, [refreshTrigger]);

  // Debug logging
  console.log('DefaultPhraseSelector rendered with', allLists.length, 'lists');
  console.log('All lists:', allLists);
  console.log('List names:', allLists.map(l => l.name));
  console.log('User contributions:', allLists.filter(l => l.id.startsWith('user-')));

  const handleListSelect = (listId: string) => {
    console.log('List clicked!');
    console.log(`Clicked on listId: ${listId}`);
    
    console.log('=== CLICK DETECTED ===');
    console.log('Clicked on listId:', listId);
    console.log('All available lists:', allLists.map(l => ({ id: l.id, name: l.name })));
    
    setSelectedList(listId);
    const list = allLists.find(l => l.id === listId);
    console.log('=== PHRASE LIST SELECTION DEBUG ===');
    console.log('Selected listId:', listId);
    console.log('Found list:', list);
    console.log('List phrases:', list?.phrases);
    console.log('List phrases length:', list?.phrases?.length);
    console.log('First few phrases:', list?.phrases?.slice(0, 3));
    
    if (list) {
      // Track usage of this specific list
      const isUserContribution = 'contributorName' in list;
      usageTrackingService.recordListUsage(
        listId,
        list.name,
        isUserContribution ? 'user-contributed' : 'default',
        isUserContribution ? (list as UserContribution).contributorName : undefined,
        isUserContribution ? (list as UserContribution).category : undefined
      );
      
      console.log('Calling onPhraseListSelect with:', list.phrases);
      onPhraseListSelect(list.phrases);
      setShowPreview(true);
    } else {
      console.error('List not found for ID:', listId);
    }
  };

  const handleAddToList = (listId: string) => {
    const list = allLists.find(l => l.id === listId);
    if (list) {
      // Add phrases that aren't already selected
      const newPhrases = list.phrases.filter(phrase => 
        !selectedPhrases.includes(phrase)
      );
      onPhraseListSelect([...selectedPhrases, ...newPhrases]);
    }
  };

  const handleClearAll = () => {
    onPhraseListSelect([]);
    setSelectedList('');
    setShowPreview(false);
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        const success = await publicPhraseListService.deleteUserContribution(listId);
        if (success) {
          // Refresh the lists to show the updated list
          const updatedLists = await publicPhraseListService.getAllAvailableLists();
          setAllLists(updatedLists);
          console.log('List deleted successfully');
        } else {
          console.error('Failed to delete list');
          console.error('Failed to delete the list. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting list:', error);
        console.error('Failed to delete the list. Please try again.');
      }
    }
  };

  return (
    <div className="default-phrase-selector">
      <h3 className="selector-title">
        🎯 Choose from Public Phrase Lists
      </h3>
      <p className="selector-subtitle">
        These lists are available to everyone - no account required! Select one or mix phrases from multiple lists.
      </p>
      
      {/* VISUAL DEBUG INFO */}
      <div style={{ background: '#ffffcc', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '2px solid orange' }}>
        <h4>🔍 PHRASE SELECTOR DEBUG:</h4>
        <p><strong>Total lists loaded:</strong> {allLists.length}</p>
        <p><strong>List names:</strong> {allLists.map(l => l.name).join(', ')}</p>
        <p><strong>User contributions (by ID):</strong> {allLists.filter(l => l.id.startsWith('user-')).length}</p>
        <p><strong>User contributions (by contributorName):</strong> {allLists.filter(l => 'contributorName' in l).length}</p>
        <p><strong>User contribution names (by ID):</strong> {allLists.filter(l => l.id.startsWith('user-')).map(l => l.name).join(', ')}</p>
        <p><strong>User contribution names (by contributorName):</strong> {allLists.filter(l => 'contributorName' in l).map(l => l.name).join(', ')}</p>
        <p><strong>Selected list:</strong> {selectedList || 'none'}</p>
        <p><strong>Spinst list structure:</strong> {JSON.stringify(allLists.find(l => l.name === 'Spinst'), null, 2)}</p>
      </div>
      
      <div className="phrase-lists-grid">
        {allLists.map((list) => {
          const isUserContribution = 'contributorName' in list;
          return (
            <div 
              key={list.id} 
              className={`phrase-list-card ${selectedList === list.id ? 'selected' : ''} ${isUserContribution ? 'user-contribution' : ''}`}
              onClick={() => handleListSelect(list.id)}
            >
              <div className="list-header">
                <span className="list-icon">{isUserContribution ? '👤' : list.icon}</span>
                <h4 className="list-name">{list.name}</h4>
                {isUserContribution && (
                  <span className="user-badge approved">
                    User Contribution
                  </span>
                )}
              </div>
              <p className="list-description">{list.description}</p>
              <div className="list-stats">
                <span className="phrase-count">{list.phrases.length} phrases</span>
                <span className="list-category">{list.category}</span>
                {isUserContribution && (
                  <span className="contributor">by {list.contributorName}</span>
                )}
              </div>
              <div className="list-actions">
                <button 
                  className="btn-select"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleListSelect(list.id);
                  }}
                >
                  Select All
                </button>
                <button 
                  className="btn-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToList(list.id);
                  }}
                >
                  Add to List
                </button>
                {isUserContribution && (
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    title="Delete this list"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPhrases.length > 0 && (
        <div className="selected-phrases-summary">
          <div className="summary-header">
            <h4>📝 Selected Phrases ({selectedPhrases.length})</h4>
            <button 
              className="btn-clear"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
          
          {showPreview && selectedPhrases.length <= 10 && (
            <div className="phrases-preview">
              {selectedPhrases.map((phrase, index) => (
                <span key={index} className="phrase-tag">
                  {phrase}
                </span>
              ))}
            </div>
          )}
          
          {selectedPhrases.length > 10 && (
            <div className="phrases-preview">
              {selectedPhrases.slice(0, 10).map((phrase, index) => (
                <span key={index} className="phrase-tag">
                  {phrase}
                </span>
              ))}
              <span className="phrase-tag more-indicator">
                +{selectedPhrases.length - 10} more...
              </span>
            </div>
          )}
        </div>
      )}

      <div className="selector-tips">
        <p>💡 <strong>Tip:</strong> You can select a default list and then add custom phrases, or mix phrases from multiple lists!</p>
      </div>
    </div>
  );
};

export default DefaultPhraseSelector;
