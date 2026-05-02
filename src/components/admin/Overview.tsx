import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  activeGames: number;
  totalPlayers: number;
  activeTemplates: number;
  todayGames: number;
  averageGameDuration: number;
  completionRate: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  primary?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'create-game',
    title: 'Create Game',
    description: 'Start a new bingo game session',
    icon: '🎮',
    path: '/admin/games/create',
    primary: true
  },
  {
    id: 'create-template',
    title: 'Create Template',
    description: 'Create a new game template',
    icon: '📋',
    path: '/admin/templates/create'
  },
  {
    id: 'manage-users',
    title: 'Manage Users',
    description: 'View and manage user accounts',
    icon: '👥',
    path: '/admin/users'
  },
  {
    id: 'view-reports',
    title: 'View Reports',
    description: 'Access game statistics and reports',
    icon: '📊',
    path: '/admin/monitoring'
  }
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeGames: 0,
    totalPlayers: 0,
    activeTemplates: 0,
    todayGames: 0,
    averageGameDuration: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Implement stats fetching from Firebase
      // For now, using mock data
      setStats({
        activeGames: 12,
        totalPlayers: 156,
        activeTemplates: 8,
        todayGames: 24,
        averageGameDuration: 15, // minutes
        completionRate: 85 // percentage
      });
      setError(null);
    } catch (error) {
      setError('Failed to load dashboard statistics');
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  if (loading) {
    return <div className="overview-loading">Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="overview-error">{error}</div>;
  }

  return (
    <div className="overview-dashboard">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon active-games">🎮</div>
          <div className="stat-content">
            <h3>Active Games</h3>
            <div className="stat-value">{stats.activeGames}</div>
            <div className="stat-label">Currently in progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total-players">👥</div>
          <div className="stat-content">
            <h3>Total Players</h3>
            <div className="stat-value">{stats.totalPlayers}</div>
            <div className="stat-label">Across all games</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon templates">📋</div>
          <div className="stat-content">
            <h3>Active Templates</h3>
            <div className="stat-value">{stats.activeTemplates}</div>
            <div className="stat-label">Available for games</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today-games">📅</div>
          <div className="stat-content">
            <h3>Today's Games</h3>
            <div className="stat-value">{stats.todayGames}</div>
            <div className="stat-label">Games played today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon duration">⏱️</div>
          <div className="stat-content">
            <h3>Average Duration</h3>
            <div className="stat-value">{formatDuration(stats.averageGameDuration)}</div>
            <div className="stat-label">Per game session</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completion">✅</div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Games completed</div>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {QUICK_ACTIONS.map(action => (
            <div
              key={action.id}
              className={`action-card ${action.primary ? 'primary' : ''}`}
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}; 