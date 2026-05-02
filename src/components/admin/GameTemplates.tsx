import React, { useState, useEffect } from 'react';
import { GameTemplate, Template } from '../../types/types';
import { templateService } from '../../services/templateService';

interface GameTemplatesProps {
  onTemplateSelect?: (templateId: string) => void;
}

export const GameTemplates: React.FC<GameTemplatesProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templates = await templateService.getTemplates();
      const gameTemplates: GameTemplate[] = templates.map((template: Template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        settings: {
          maxPlayers: template.settings.maxPlayers || 4,
          duration: template.settings.duration || 3600,
          maxChatMessages: template.settings.maxChatMessages || 100,
          maxChatMessageRate: template.settings.maxChatMessageRate || 1,
          isPrivate: template.settings.isPrivate || false,
          phraseList: template.id,
          boardSize: template.settings.boardSize || 5,
          winCondition: template.settings.winCondition || 'line',
          allowGuestPlayers: template.settings.allowGuestPlayers || true,
          autoStart: template.settings.autoStart || false,
          autoStartCount: template.settings.autoStartCount || 4,
          autoEnd: template.settings.autoEnd || false,
          autoEndTime: template.settings.autoEndTime || 3600,
          allowChat: template.settings.allowChat || true,
          allowPrivateChat: template.settings.allowPrivateChat || false,
          allowSpectators: template.settings.allowSpectators || true
        },
        createdBy: template.createdBy,
        createdAt: template.createdAt.getTime(),
        updatedAt: template.updatedAt?.getTime() || template.createdAt.getTime(),
        timesUsed: template.timesUsed || 0,
        tags: template.tags || [],
        phrases: template.phrases,
        isPublic: template.isPublic || true,
        isDefault: false,
        favoriteCount: template.favoriteCount || 0,
        favoritedBy: template.favoritedBy || [],
        sharedWith: template.sharedWith || [],
        shareLink: template.shareLink
      }));
      setTemplates(gameTemplates);
      setError(null);
    } catch (error) {
      setError('Failed to load templates');
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect?.(templateId);
  };

  if (loading) {
    return <div>Loading templates...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="game-templates">
      <h3>Game Templates</h3>
      {templates.length === 0 ? (
        <p>No templates available</p>
      ) : (
        <div className="template-list">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-item ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <div className="template-meta">
                <span>Players: {template.settings.maxPlayers}</span>
                <span>Duration: {template.settings.duration}s</span>
                <span>Board Size: {template.settings.boardSize}x{template.settings.boardSize}</span>
                <span>Win Condition: {template.settings.winCondition}</span>
                {template.settings.isPrivate && <span>Private Game</span>}
                <span>Used: {template.timesUsed} times</span>
                <span>Favorites: {template.favoriteCount}</span>
                {template.isPublic && <span>Public</span>}
              </div>
              <div className="template-tags">
                {template.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 