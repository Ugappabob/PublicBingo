import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { publicPhraseListService } from '../../services/publicPhraseListService';
import { usageTrackingService } from '../../services/usageTrackingService';
import '../../styles/ContributePhraseList.css';

interface ContributePhraseListProps {
  onContributionSuccess?: () => void;
  onRefresh?: () => void;
}

const ContributePhraseList: React.FC<ContributePhraseListProps> = ({ onContributionSuccess, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phrases: '',
    contributorName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  // Calculate phrase count
  const phraseCount = formData.phrases.split('\n').filter(p => p.trim()).length;

  const categories = [
    'Entertainment',
    'Work',
    'Holiday',
    'Social',
    'Sports',
    'Education',
    'Lifestyle',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.phrases.trim()) {
        throw new Error('Name and phrases are required');
      }

      // Parse phrases
      const phraseList = formData.phrases
        .split('\n')
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 0);

      if (phraseList.length < 24) {
        throw new Error('You need at least 24 phrases for a bingo game');
      }

      if (phraseList.length > 100) {
        throw new Error('Please limit to 100 phrases or fewer');
      }

      // Create the contribution
      const contribution = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category || 'Other',
        phrases: phraseList,
        contributorName: formData.contributorName.trim() || 'Anonymous',
        contributorId: currentUser?.uid || 'guest',
        createdAt: new Date().toISOString(),
        status: 'approved', // Immediately available to all users
        votes: 0,
        timesUsed: 0
      };

      // Store using the service
      const existingContributions = await publicPhraseListService.getUserContributions();
      const updatedContributions = [...existingContributions, contribution];
      localStorage.setItem('userContributions', JSON.stringify(updatedContributions));
      
      // Track the creation of this new list (initial usage count of 0, but it's now available)
      usageTrackingService.recordListUsage(
        contribution.id,
        contribution.name,
        'user-contributed',
        contribution.contributorName,
        contribution.category
      );
      
      // Debug logging
      console.log('Contribution saved:', contribution);
      console.log('All contributions now:', updatedContributions);

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        category: '',
        phrases: '',
        contributorName: ''
      });

      // Call success callback if provided
      if (onContributionSuccess) {
        onContributionSuccess();
      }

      // Call refresh callback to update the lists
      if (onRefresh) {
        onRefresh();
      }

      // Close form after a delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className="contribute-success">
        <h3>🎉 Thank you for your contribution!</h3>
        <p>Your phrase list has been added and is now available to everyone! You can see it in the public lists above.</p>
      </div>
    );
  }

  return (
    <div className="contribute-phrase-list">
      <button 
        className="contribute-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕ Cancel' : '➕ Contribute Your List'}
      </button>

      {isOpen && (
        <div className="contribute-form-container">
          <div className="contribute-form">
            <h3>📝 Contribute a Phrase List</h3>
            <p>Share your own phrase list with the community! Your list will be reviewed before being added to the public collection.</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">List Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 'Office Jargon', 'Movie Quotes'"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your list"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contributorName">Your Name (Optional)</label>
                <input
                  type="text"
                  id="contributorName"
                  name="contributorName"
                  value={formData.contributorName}
                  onChange={handleInputChange}
                  placeholder="How you'd like to be credited"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phrases">Phrases (one per line, 24-100 phrases) *</label>
                <textarea
                  id="phrases"
                  name="phrases"
                  value={formData.phrases}
                  onChange={handleInputChange}
                  placeholder="Enter your phrases, one per line..."
                  rows={10}
                  required
                />
                <div className={`phrase-count ${phraseCount < 24 ? 'insufficient' : phraseCount > 100 ? 'excessive' : 'sufficient'}`}>
                  <div className="phrase-count-main">
                    <span className="count-number">{phraseCount}</span>
                    <span className="count-label">phrases</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(100, (phraseCount / 24) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="phrase-requirements">
                    {phraseCount < 24 && (
                      <span className="requirement unmet">
                        ❌ Need {24 - phraseCount} more phrases (minimum 24)
                      </span>
                    )}
                    {phraseCount >= 24 && phraseCount <= 100 && (
                      <span className="requirement met">
                        ✅ Great! You have enough phrases
                      </span>
                    )}
                    {phraseCount > 100 && (
                      <span className="requirement excessive">
                        ⚠️ Too many phrases (maximum 100)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || phraseCount < 24 || phraseCount > 100}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributePhraseList;
