import React, { useState, useEffect } from 'react';
import { logger, LogEntry, LogLevel } from '../../utils/logger';
import '../../styles/components/MonitoringDashboard.css';

interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  averageResponseTime: number;
}

export const MonitoringDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | undefined>();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    averageResponseTime: 0
  });
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe((entry) => {
      setLogs(prevLogs => [...prevLogs, entry]);
    });

    // Initial logs
    setLogs(logger.getLogs(selectedLevel));

    // Cleanup subscription
    return () => unsubscribe();
  }, [selectedLevel]);

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      // In a real application, these would come from your backend
      setMetrics({
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 100),
        averageResponseTime: Math.random() * 1000
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const handleLevelFilter = (level: LogLevel | undefined) => {
    setSelectedLevel(level);
    setLogs(logger.getLogs(level));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h2>Monitoring Dashboard</h2>
        <div className="dashboard-controls">
          <button onClick={() => handleLevelFilter(undefined)}>All</button>
          <button onClick={() => handleLevelFilter('debug')}>Debug</button>
          <button onClick={() => handleLevelFilter('info')}>Info</button>
          <button onClick={() => handleLevelFilter('warn')}>Warn</button>
          <button onClick={() => handleLevelFilter('error')}>Error</button>
          <button onClick={handleClearLogs}>Clear</button>
          <label>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="performance-metrics">
          <div className="metric">
            <h3>Memory Usage</h3>
            <p>{metrics.memoryUsage.toFixed(2)}%</p>
          </div>
          <div className="metric">
            <h3>CPU Usage</h3>
            <p>{metrics.cpuUsage.toFixed(2)}%</p>
          </div>
          <div className="metric">
            <h3>Active Connections</h3>
            <p>{metrics.activeConnections}</p>
          </div>
          <div className="metric">
            <h3>Avg Response Time</h3>
            <p>{metrics.averageResponseTime.toFixed(2)}ms</p>
          </div>
        </div>

        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry log-level-${log.level}`}>
              <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
              <span className="log-level">{log.level.toUpperCase()}</span>
              <span className="log-component">{log.component}</span>
              <span className="log-message">{log.message}</span>
              {log.data && (
                <pre className="log-data">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
              {log.error && (
                <pre className="log-error">
                  {log.error.message}
                  {log.error.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 