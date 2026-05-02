import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { Template } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { templateService } from '../../services/templateService';

interface NewTemplate {
  name: string;
  phrases: string[];
}

const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [shareEmail, setShareEmail] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({ name: '', phrases: [] });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');

      const templatesQuery = query(
        collection(db, 'phraseLists'),
        where('isTemplate', '==', true),
        where('isPublic', '==', true)
      );

      const querySnapshot = await getDocs(templatesQuery);
      const templateData: Template[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templateData.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          phrases: data.phrases || [],
          userId: data.userId || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isTemplate: true,
          isPublic: data.isPublic || false,
          timesUsed: data.timesUsed || 0,
          favoriteCount: data.favoriteCount || 0,
          favoritedBy: data.favoritedBy || [],
          tags: data.tags || [],
          createdBy: data.createdBy || '',
          sharedWith: data.sharedWith || [],
          shareLink: data.shareLink || '',
          settings: {
            maxPlayers: data.settings?.maxPlayers || 10,
            duration: data.settings?.duration || 60,
            maxChatMessages: data.settings?.maxChatMessages || 100,
            maxChatMessageRate: data.settings?.maxChatMessageRate || 5,
            phraseList: data.settings?.phraseList || (data.phrases?.join('\n') || ''),
            isPrivate: data.settings?.isPrivate || false,
            password: data.settings?.password || '',
            boardSize: data.settings?.boardSize || 5,
            winCondition: data.settings?.winCondition || 'line',
            allowGuestPlayers: data.settings?.allowGuestPlayers ?? true,
            autoStart: data.settings?.autoStart ?? false,
            autoStartCount: data.settings?.autoStartCount ?? 2,
            autoEnd: data.settings?.autoEnd ?? false,
            autoEndTime: data.settings?.autoEndTime ?? 3600,
            allowChat: data.settings?.allowChat ?? true,
            allowPrivateChat: data.settings?.allowPrivateChat ?? false,
            allowSpectators: data.settings?.allowSpectators ?? true
          }
        });
      });

      setTemplates(templateData);
    } catch (err) {
      setError('Failed to load templates. Please try again later.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleShareTemplate = async (template: Template) => {
    if (!shareEmail.trim() || !template.id) return;

    try {
      const templateRef = doc(db, 'phraseLists', template.id);
      const updatedSharedWith = [...template.sharedWith, shareEmail.trim()];

      await updateDoc(templateRef, {
        sharedWith: updatedSharedWith,
      });

      // Update local state
      setTemplates(templates.map(t => 
        t.id === template.id 
          ? { ...t, sharedWith: updatedSharedWith }
          : t
      ));

      setShareEmail('');
      setShowShareModal(false);
      setError('Template shared successfully!');
    } catch (err) {
      setError('Failed to share template. Please try again.');
      console.error('Error sharing template:', err);
    }
  };

  const generateShareLink = async (template: Template) => {
    try {
      const templateRef = doc(db, 'phraseLists', template.id);
      const shareLink = `${window.location.origin}/templates/shared/${template.id}`;

      await updateDoc(templateRef, {
        shareLink,
      });

      // Update local state
      setTemplates(templates.map(t => 
        t.id === template.id 
          ? { ...t, shareLink }
          : t
      ));

      // Copy link to clipboard
      await navigator.clipboard.writeText(shareLink);
      setError('Share link copied to clipboard!');
    } catch (err) {
      setError('Failed to generate share link. Please try again.');
      console.error('Error generating share link:', err);
    }
  };

  const handleMakePublic = async (template: Template) => {
    try {
      const templateRef = doc(db, 'phraseLists', template.id);
      await updateDoc(templateRef, {
        isPublic: true,
      });

      // Update local state
      setTemplates(templates.map(t => 
        t.id === template.id 
          ? { ...t, isPublic: true }
          : t
      ));

      setError('Template is now public!');
    } catch (err) {
      setError('Failed to make template public. Please try again.');
      console.error('Error updating template visibility:', err);
    }
  };

  const handlePlayTemplate = (template: Template) => {
    navigate(`/game/${template.id}`);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.phrases) {
      setError('Name and phrases are required');
      return;
    }

    try {
      const template: Template = {
        id: uuidv4(),
        name: newTemplate.name,
        description: '',
        phrases: newTemplate.phrases,
        userId: currentUser?.uid || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: true,
        isPublic: false,
        timesUsed: 0,
        favoriteCount: 0,
        favoritedBy: [],
        tags: [],
        createdBy: currentUser?.uid || '',
        sharedWith: [],
        shareLink: '',
        settings: {
          maxPlayers: 10,
          duration: 60,
          maxChatMessages: 100,
          maxChatMessageRate: 5,
          phraseList: newTemplate.phrases.join('\n'),
          isPrivate: false,
          password: '',
          boardSize: 5,
          winCondition: 'line',
          allowGuestPlayers: true,
          autoStart: false,
          autoStartCount: 2,
          autoEnd: false,
          autoEndTime: 3600,
          allowChat: true,
          allowPrivateChat: false,
          allowSpectators: true
        }
      };
      
      await templateService.createTemplate(template);
      setNewTemplate({ name: '', phrases: [] });
      setShowCreateForm(false);
      loadTemplates();
    } catch (error) {
      setError('Failed to create template');
    }
  };

  if (loading) {
    return <div className="loading">Loading templates...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="template-library">
      <div className="template-library-header">
        <h2>Template Library</h2>
        <button
          className="view-mode-toggle"
          onClick={handleViewModeToggle}
        >
          {viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
        </button>
      </div>

      <div className={`template-container ${viewMode}`}>
        {templates.length === 0 ? (
          <div className="no-templates">
            <p>No templates available.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateClick(template)}
            >
              <h3>{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <div className="template-tags">
                {template.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="template-meta">
                <span className="phrase-count">{template.phrases.length} phrases</span>
                <span className="created-date">
                  {template.createdAt.toLocaleDateString()}
                </span>
              </div>
              {currentUser?.uid === template.createdBy && (
                <div className="template-actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTemplate(template);
                  }}>Play</button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                    setSelectedTemplate(template);
                  }}>Share</button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    generateShareLink(template);
                  }}>Generate Link</button>
                  {!template.isPublic && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleMakePublic(template);
                    }}>Make Public</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedTemplate && showShareModal && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h3>Share Template</h3>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
            />
            <div className="share-modal-actions">
              <button onClick={() => handleShareTemplate(selectedTemplate)}>
                Share
              </button>
              <button onClick={() => setShowShareModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && !showShareModal && (
        <div className="template-details">
          <h3>{selectedTemplate.name}</h3>
          <p>{selectedTemplate.description}</p>
          <div className="template-phrases">
            <h4>Phrases:</h4>
            <ul>
              {selectedTemplate.phrases.map((phrase, index) => (
                <li key={index}>{phrase}</li>
              ))}
            </ul>
          </div>
          {selectedTemplate.shareLink && (
            <div className="share-link">
              <p>Share Link:</p>
              <code>{selectedTemplate.shareLink}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary; 