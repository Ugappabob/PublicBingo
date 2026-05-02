import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/UserProfile.css';

interface GameHistory {
  id: string;
  date: Date;
  templateId: string;
  templateName: string;
  moves: number;
  won: boolean;
  timeToComplete: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
}

interface UserProfileData {
  displayName: string;
  bio: string;
  avatarColor: string;
  totalGames: number;
  totalWins: number;
  averageMoves: number;
  bestTime: number;
  achievements: Achievement[];
  favoriteTemplates: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first Bingo game',
    icon: '🏆',
    unlockedAt: null
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a game in under 10 moves',
    icon: '⚡',
    unlockedAt: null
  },
  {
    id: 'veteran',
    name: 'Bingo Veteran',
    description: 'Play 50 games',
    icon: '🎮',
    unlockedAt: null
  },
  {
    id: 'champion',
    name: 'Bingo Champion',
    description: 'Win 25 games',
    icon: '👑',
    unlockedAt: null
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Play games with 10 different templates',
    icon: '🦋',
    unlockedAt: null
  }
];

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadGameHistory();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser!.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          displayName: userData.displayName || 'Anonymous',
          bio: userData.bio || '',
          avatarColor: userData.avatarColor || '#0084ff',
          totalGames: userData.totalGames || 0,
          totalWins: userData.totalWins || 0,
          averageMoves: userData.averageMoves || 0,
          bestTime: userData.bestTime || 0,
          achievements: ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlockedAt: userData.achievements?.[achievement.id] || null
          })),
          favoriteTemplates: userData.favoriteTemplates || []
        });
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error loading profile:', err);
    }
  };

  const loadGameHistory = async () => {
    try {
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', currentUser!.uid),
        orderBy('date', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(gamesQuery);
      const history: GameHistory[] = [];

      for (const gameDoc of querySnapshot.docs) {
        const data = gameDoc.data();
        const templateDoc = await getDoc(doc(db, 'templates', data.templateId));
        const templateData = templateDoc.data();
        
        history.push({
          id: gameDoc.id,
          date: data.date.toDate(),
          templateId: data.templateId,
          templateName: templateData?.name || 'Unknown Template',
          moves: data.moves,
          won: data.won,
          timeToComplete: data.timeToComplete
        });
      }

      setGameHistory(history);
    } catch (err) {
      console.error('Error loading game history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: profile.displayName,
        bio: profile.bio,
        avatarColor: profile.avatarColor
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  if (loading) return <div className="loading">Loading profile data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div className="error-message">Profile not found</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div 
          className="avatar"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.displayName[0].toUpperCase()}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="edit-profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Avatar Color</label>
              <input
                type="color"
                value={profile.avatarColor}
                onChange={(e) => setProfile({ ...profile, avatarColor: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{profile.displayName}</h2>
            <p className="bio">{profile.bio || 'No bio yet'}</p>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Games Played</h3>
          <p>{profile.totalGames}</p>
        </div>
        <div className="stat-card">
          <h3>Total Wins</h3>
          <p>{profile.totalWins}</p>
        </div>
        <div className="stat-card">
          <h3>Win Rate</h3>
          <p>{profile.totalGames ? ((profile.totalWins / profile.totalGames) * 100).toFixed(1) + '%' : '0%'}</p>
        </div>
        <div className="stat-card">
          <h3>Best Time</h3>
          <p>{profile.bestTime} moves</p>
        </div>
      </div>

      <div className="achievements-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          {profile.achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
              title={achievement.unlockedAt ? `Unlocked on ${achievement.unlockedAt.toLocaleDateString()}` : 'Locked'}
            >
              <span className="achievement-icon">{achievement.icon}</span>
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="game-history-section">
        <h3>Recent Games</h3>
        <div className="game-history">
          {gameHistory.map((game) => (
            <div key={game.id} className={`game-card ${game.won ? 'won' : 'lost'}`}>
              <div className="game-card-header">
                <h4>{game.templateName}</h4>
                <span className="game-result">{game.won ? 'Victory' : 'Defeat'}</span>
              </div>
              <div className="game-card-stats">
                <span>Moves: {game.moves}</span>
                <span>Time: {game.timeToComplete}s</span>
                <span className="game-date">{game.date.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 