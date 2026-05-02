import React, { useState, useEffect } from 'react';
import { firebaseAnalyticsService, FirebaseAnalyticsData, FirebaseUsageStats, FirebaseUserEngagement } from '../../services/firebaseAnalyticsService';
import { usageTrackingService } from '../../services/usageTrackingService';
import '../../styles/ProductionAnalyticsDashboard.css';

const ProductionAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<FirebaseAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time updates
    const unsubscribe = firebaseAnalyticsService.subscribeToAnalytics((data) => {
      setAnalyticsData(data);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await firebaseAnalyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await firebaseAnalyticsService.exportAnalyticsData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      console.error('Failed to export data');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="production-analytics-dashboard">
        <div className="loading-container">
          <h2>Loading Production Analytics...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="production-analytics-dashboard">
        <div className="error-container">
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={loadAnalyticsData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="production-analytics-dashboard">
        <div className="no-data-container">
          <h2>No Analytics Data Available</h2>
          <p>Analytics data will appear here once users start using the application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="production-analytics-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Production Analytics Dashboard</h1>
        <div className="dashboard-actions">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="time-range-selector"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={loadAnalyticsData} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={handleExportData} className="export-btn">
            📥 Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{analyticsData.totalUsers.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">🎮</div>
          <div className="metric-content">
            <h3>Total Sessions</h3>
            <div className="metric-value">{analyticsData.totalSessions.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <h3>Games Completed</h3>
            <div className="metric-value">{analyticsData.totalGamesPlayed.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>Avg Session Duration</h3>
            <div className="metric-value">{formatDuration(analyticsData.averageSessionDuration)}</div>
          </div>
        </div>
      </div>

      {/* Popular Lists */}
      <div className="analytics-section">
        <h2>📊 Most Popular Phrase Lists</h2>
        <div className="popular-lists">
          {analyticsData.mostPopularLists.slice(0, 10).map((list, index) => (
            <div key={list.listId} className="popular-list-item">
              <div className="list-rank">#{index + 1}</div>
              <div className="list-info">
                <div className="list-name">{list.listName}</div>
                <div className="list-meta">
                  <span className={`list-type ${list.listType}`}>
                    {list.listType === 'default' ? 'Default' : 'User'}
                  </span>
                  {list.category && <span className="list-category">{list.category}</span>}
                </div>
              </div>
              <div className="list-stats">
                <div className="usage-count">{list.usageCount.toLocaleString()} uses</div>
                <div className="last-used">
                  Last used: {new Date(list.lastUsed.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement */}
      <div className="analytics-section">
        <h2>👤 User Engagement</h2>
        <div className="user-engagement-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Sessions</th>
                <th>Time Spent</th>
                <th>Favorite Lists</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.userEngagement.slice(0, 20).map((user) => (
                <tr key={user.userId}>
                  <td className="user-name">{user.userName}</td>
                  <td className="user-sessions">{user.totalSessions}</td>
                  <td className="user-time">{formatDuration(user.totalTimeSpent)}</td>
                  <td className="user-favorites">{user.favoriteLists.length}</td>
                  <td className="user-last-active">
                    {new Date(user.lastActive.seconds * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Stats */}
      {analyticsData.dailyStats.length > 0 && (
        <div className="analytics-section">
          <h2>📈 Daily Activity</h2>
          <div className="daily-stats-chart">
            <div className="chart-container">
              {analyticsData.dailyStats.slice(-30).map((day) => (
                <div key={day.date} className="daily-stat-bar">
                  <div className="bar-label">{formatDate(day.date)}</div>
                  <div className="bar-container">
                    <div 
                      className="bar sessions" 
                      style={{ height: `${(day.sessions / Math.max(...analyticsData.dailyStats.map(d => d.sessions))) * 100}%` }}
                      title={`${day.sessions} sessions`}
                    ></div>
                    <div 
                      className="bar games" 
                      style={{ height: `${(day.games / Math.max(...analyticsData.dailyStats.map(d => d.games))) * 100}%` }}
                      title={`${day.games} games`}
                    ></div>
                    <div 
                      className="bar users" 
                      style={{ height: `${(day.users / Math.max(...analyticsData.dailyStats.map(d => d.users))) * 100}%` }}
                      title={`${day.users} users`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color sessions"></div>
                <span>Sessions</span>
              </div>
              <div className="legend-item">
                <div className="legend-color games"></div>
                <span>Games</span>
              </div>
              <div className="legend-item">
                <div className="legend-color users"></div>
                <span>Users</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Status */}
      <div className="analytics-section">
        <h2>🔄 Real-time Status</h2>
        <div className="real-time-status">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>Live Analytics Active</span>
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionAnalyticsDashboard;
