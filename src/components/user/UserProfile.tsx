import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/index';
import '../../styles/UserProfile.css';

interface UserProfileData {
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

const UserProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfileData);
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (profile?.displayName !== currentUser?.displayName || profile?.photoURL !== currentUser?.photoURL) {
        await updateProfile({
          displayName: profile?.displayName,
          photoURL: profile?.photoURL
        });
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img
          src={profile.photoURL || '/default-avatar.png'}
          alt={profile.displayName}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h3>{profile.displayName}</h3>
          <p>{profile.email}</p>
        </div>
      </div>

      {isEditing ? (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photoURL">Photo URL</label>
            <input
              type="text"
              id="photoURL"
              value={profile.photoURL}
              onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={profile.preferences.theme}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  theme: e.target.value as 'light' | 'dark'
                }
              })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notifications">Notifications</label>
            <input
              type="checkbox"
              id="notifications"
              checked={profile.preferences.notifications}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  notifications: e.target.checked
                }
              })}
            />
          </div>

          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div>
          <div className="profile-bio">
            <h4>Bio</h4>
            <p>{profile.bio}</p>
          </div>

          <div className="profile-preferences">
            <h4>Preferences</h4>
            <p>Theme: {profile.preferences.theme}</p>
            <p>Notifications: {profile.preferences.notifications ? 'Enabled' : 'Disabled'}</p>
          </div>

          <div className="button-group">
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </div>
      )}

      {success && <div className="success">{success}</div>}
    </div>
  );
};

export default UserProfile; 