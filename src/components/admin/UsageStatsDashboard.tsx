import React, { useState, useEffect } from 'react';
import { usageTrackingService, ListUsageStats } from '../../services/usageTrackingService';
import '../../styles/UsageStatsDashboard.css';

const UsageStatsDashboard: React.FC = () => {
  const [usageStats, setUsageStats] = useState<ListUsageStats[]>([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [statsByCategory, setStatsByCategory] = useState<{ [category: string]: ListUsageStats[] }>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'usage' | 'name' | 'lastUsed'>('usage');
  const [filterType, setFilterType] = useState<'all' | 'default' | 'user-contributed'>('all');

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = () => {
    try {
      setLoading(true);
      const stats = usageTrackingService.getAllUsageStats();
      const total = usageTrackingService.getTotalUsageCount();
      const byCategory = usageTrackingService.getUsageStatsByCategory();
      
      setUsageStats(stats);
      setTotalUsage(total);
      setStatsByCategory(byCategory);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all usage data? This action cannot be undone.')) {
      usageTrackingService.clearAllUsageData();
      loadUsageStats();
    }
  };

  const handleExportData = () => {
    try {
      const data = usageTrackingService.exportUsageData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-stats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      console.error('Failed to export data');
    }
  };

  const getSortedStats = () => {
    let filtered = usageStats;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(stat => stat.listType === filterType);
    }
    
    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'name':
          return a.listName.localeCompare(b.listName);
        case 'lastUsed':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="usage-stats-dashboard">
        <div className="loading-container">
          <h2>Loading Usage Statistics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="usage-stats-dashboard">
      <div className="dashboard-header">
        <h1>📊 Usage Statistics Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={loadUsageStats} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={handleExportData} className="export-btn">
            📥 Export Data
          </button>
          <button onClick={handleClearAllData} className="clear-btn">
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <h3>Total Usage</h3>
          <div className="summary-number">{totalUsage}</div>
        </div>
        <div className="summary-card">
          <h3>Total Lists</h3>
          <div className="summary-number">{usageStats.length}</div>
        </div>
        <div className="summary-card">
          <h3>Default Lists</h3>
          <div className="summary-number">
            {usageStats.filter(s => s.listType === 'default').length}
          </div>
        </div>
        <div className="summary-card">
          <h3>User Lists</h3>
          <div className="summary-number">
            {usageStats.filter(s => s.listType === 'user-contributed').length}
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="filter-controls">
          <label>
            Filter by Type:
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All Lists</option>
              <option value="default">Default Lists</option>
              <option value="user-contributed">User Lists</option>
            </select>
          </label>
        </div>
        
        <div className="sort-controls">
          <label>
            Sort by:
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="usage">Usage Count</option>
              <option value="name">List Name</option>
              <option value="lastUsed">Last Used</option>
            </select>
          </label>
        </div>
      </div>

      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>List Name</th>
              <th>Type</th>
              <th>Usage Count</th>
              <th>Last Used</th>
              <th>Created By</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {getSortedStats().map((stat) => (
              <tr key={stat.listId}>
                <td className="list-name">{stat.listName}</td>
                <td>
                  <span className={`type-badge ${stat.listType}`}>
                    {stat.listType === 'default' ? 'Default' : 'User'}
                  </span>
                </td>
                <td className="usage-count">{stat.usageCount}</td>
                <td className="last-used">{formatDate(stat.lastUsed)}</td>
                <td className="created-by">{stat.createdBy || 'N/A'}</td>
                <td className="category">{stat.category || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(statsByCategory).length > 0 && (
        <div className="category-breakdown">
          <h2>Usage by Category</h2>
          {Object.entries(statsByCategory).map(([category, stats]) => (
            <div key={category} className="category-section">
              <h3>{category} ({stats.length} lists)</h3>
              <div className="category-stats">
                {stats.map(stat => (
                  <div key={stat.listId} className="category-stat-item">
                    <span className="stat-name">{stat.listName}</span>
                    <span className="stat-count">{stat.usageCount} uses</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {usageStats.length === 0 && (
        <div className="no-data">
          <h3>No Usage Data Available</h3>
          <p>Usage statistics will appear here once users start creating games with phrase lists.</p>
        </div>
      )}
    </div>
  );
};

export default UsageStatsDashboard;
