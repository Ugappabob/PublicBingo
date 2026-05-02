import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import type { LogLevel } from '../../utils/logger';
import '../../styles/components/MonitoringDashboard.css';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  component?: string;
  data?: Record<string, any>;
  error?: Error;
}

const MonitoringDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTraces, setActiveTraces] = useState<string[]>([]);

  // Fetch logs on component mount
  useEffect(() => {
    const fetchLogs = () => {
      const logHistory = logger.getLogHistory();
      setLogs(logHistory);
    };

    fetchLogs();
    
    // Set up interval to refresh logs
    const intervalId = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Filter logs based on selected level and search term
  const filteredLogs = logs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.component && log.component.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesLevel && matchesSearch;
  });

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get log level class
  const getLogLevelClass = (level: LogLevel): string => {
    switch (level) {
      case 'debug':
        return 'log-level-debug';
      case 'info':
        return 'log-level-info';
      case 'warn':
        return 'log-level-warn';
      case 'error':
        return 'log-level-error';
      default:
        return '';
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    logger.clearLogHistory();
    setLogs([]);
  };

  // Toggle expanded view
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`monitoring-dashboard ${isExpanded ? 'expanded' : ''}`}>
      <div className="dashboard-header">
        <h2>Monitoring Dashboard</h2>
        <div className="dashboard-controls">
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            className="log-level-filter"
          >
            <option value="all">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="log-search"
          />
          <button onClick={handleClearLogs} className="clear-logs-btn">
            Clear Logs
          </button>
          <button onClick={handleToggleExpanded} className="toggle-expanded-btn">
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="logs-container">
          <h3>Logs</h3>
          {filteredLogs.length === 0 ? (
            <p className="no-logs">No logs to display</p>
          ) : (
            <div className="logs-list">
              {filteredLogs.map((log, index) => (
                <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
                  <div className="log-header">
                    <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                    <span className="log-level">{log.level.toUpperCase()}</span>
                    {log.component && <span className="log-component">{log.component}</span>}
                  </div>
                  <div className="log-message">{log.message}</div>
                  {log.data && (
                    <div className="log-data">
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  )}
                  {log.error && (
                    <div className="log-error">
                      <div className="error-message">{log.error.message}</div>
                      <div className="error-stack">{log.error.stack}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="performance-container">
          <h3>Performance</h3>
          <div className="performance-metrics">
            <div className="metric-card">
              <h4>Active Traces</h4>
              <div className="metric-value">{activeTraces.length}</div>
            </div>
            <div className="metric-card">
              <h4>Error Rate</h4>
              <div className="metric-value">
                {logs.filter(log => log.level === 'error').length}
              </div>
            </div>
            <div className="metric-card">
              <h4>Total Logs</h4>
              <div className="metric-value">{logs.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard; 