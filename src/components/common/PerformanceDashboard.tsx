import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '../../utils/performance';
import LoadingSpinner from './LoadingSpinner';
import '../../styles/components/PerformanceDashboard.css';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

interface MetricData {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isVisible = false, 
  onClose 
}) => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const performanceMonitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const allMetrics = performanceMonitor.getMetrics();
      const componentMetrics = allMetrics.components || {};
      
      const metricData: MetricData[] = [
        {
          name: 'Total Components',
          value: Object.keys(componentMetrics).length,
          unit: '',
          trend: 'stable',
          color: '#007bff'
        },
        {
          name: 'Avg Load Time',
          value: calculateAverageLoadTime(componentMetrics),
          unit: 'ms',
          trend: 'stable',
          color: '#28a745'
        },
        {
          name: 'Memory Usage',
          value: getMemoryUsage(),
          unit: 'MB',
          trend: 'stable',
          color: '#ffc107'
        },
        {
          name: 'Slow Renders',
          value: countSlowRenders(componentMetrics),
          unit: '',
          trend: 'stable',
          color: '#dc3545'
        }
      ];

      setMetrics(metricData);
    };

    updateMetrics();

    if (autoRefresh) {
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible, autoRefresh, performanceMonitor]);

  const calculateAverageLoadTime = (componentMetrics: any): number => {
    const loadTimes = Object.values(componentMetrics)
      .map((metric: any) => metric.loadTime)
      .filter((time: number) => time > 0);
    
    if (loadTimes.length === 0) return 0;
    return Math.round(loadTimes.reduce((sum: number, time: number) => sum + time, 0) / loadTimes.length);
  };

  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  };

  const countSlowRenders = (componentMetrics: any): number => {
    return Object.values(componentMetrics)
      .filter((metric: any) => metric.loadTime > 100)
      .length;
  };

  const handleExportMetrics = () => {
    const allMetrics = performanceMonitor.getMetrics();
    const dataStr = JSON.stringify(allMetrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearMetrics = () => {
    // This would clear the metrics in the performance monitor
    console.log('Clearing performance metrics...');
  };

  if (!isVisible) return null;

  return (
    <div className={`performance-dashboard ${isExpanded ? 'expanded' : ''}`}>
      <div className="dashboard-header">
        <h3>📊 Performance Dashboard</h3>
        <div className="dashboard-controls">
          <button
            className="control-button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? '⏸️' : '▶️'}
          </button>
          <button
            className="control-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '📉' : '📈'}
          </button>
          <button
            className="control-button"
            onClick={handleExportMetrics}
            title="Export metrics"
          >
            💾
          </button>
          <button
            className="control-button"
            onClick={handleClearMetrics}
            title="Clear metrics"
          >
            🗑️
          </button>
          {onClose && (
            <button
              className="control-button close-button"
              onClick={onClose}
              title="Close dashboard"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {metrics.length === 0 ? (
          <LoadingSpinner size="small" text="Loading metrics..." />
        ) : (
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-trend">{metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}</span>
                </div>
                <div className="metric-value" style={{ color: metric.color }}>
                  {metric.value.toLocaleString()}
                  <span className="metric-unit">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="detailed-metrics">
            <h4>Component Performance</h4>
            <div className="component-list">
              {Object.entries(performanceMonitor.getMetrics().components || {}).map(([name, data]: [string, any]) => (
                <div key={name} className="component-metric">
                  <span className="component-name">{name}</span>
                  <span className="component-load-time">{data.loadTime?.toFixed(2)}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <small>
          Last updated: {new Date().toLocaleTimeString()}
          {autoRefresh && ' (Auto-refreshing)'}
        </small>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
