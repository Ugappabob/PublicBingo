import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor } from '../utils/performance';

interface PerformanceMetrics {
  componentLoadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
}

interface UsePerformanceOptions {
  componentName: string;
  trackInteractions?: boolean;
  trackMemory?: boolean;
  logMetrics?: boolean;
}

export const usePerformance = (options: UsePerformanceOptions) => {
  const { componentName, trackInteractions = true, trackMemory = false, logMetrics = false } = options;
  const performanceMonitor = PerformanceMonitor.getInstance();
  const startTime = useRef(performance.now());
  const renderStartTime = useRef(performance.now());
  const metrics = useRef<PerformanceMetrics>({
    componentLoadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0
  });

  // Track component load time
  useEffect(() => {
    const loadTime = performance.now() - startTime.current;
    metrics.current.componentLoadTime = loadTime;
    performanceMonitor.recordMetric(`${componentName}_load`, loadTime);
    
    if (logMetrics) {
      console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, [componentName, performanceMonitor, logMetrics]);

  // Track render time
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    metrics.current.renderTime = renderTime;
    performanceMonitor.recordMetric(`${componentName}_render`, renderTime);
    
    if (logMetrics && renderTime > 16) { // Log slow renders (>16ms)
      console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    renderStartTime.current = performance.now();
  });

  // Track memory usage
  useEffect(() => {
    if (trackMemory && 'memory' in performance) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize;
      metrics.current.memoryUsage = memoryUsage;
      performanceMonitor.recordMetric(`${componentName}_memory`, memoryUsage);
    }
  }, [componentName, trackMemory, performanceMonitor]);

  // Track user interactions
  const trackInteraction = useCallback((interactionName: string, callback: () => void) => {
    return () => {
      if (trackInteractions) {
        const startTime = performance.now();
        callback();
        const interactionTime = performance.now() - startTime;
        metrics.current.interactionTime = interactionTime;
        performanceMonitor.recordMetric(`${componentName}_${interactionName}`, interactionTime);
        
        if (logMetrics && interactionTime > 100) { // Log slow interactions (>100ms)
          console.warn(`⚠️ ${componentName} ${interactionName} took ${interactionTime.toFixed(2)}ms`);
        }
      } else {
        callback();
      }
    };
  }, [componentName, trackInteractions, performanceMonitor, logMetrics]);

  // Track async operations
  const trackAsyncOperation = useCallback(async <T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const operationTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`${componentName}_${operationName}`, operationTime);
      
      if (logMetrics) {
        console.log(`⚡ ${componentName} ${operationName} completed in ${operationTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const operationTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`${componentName}_${operationName}_error`, operationTime);
      
      if (logMetrics) {
        console.error(`❌ ${componentName} ${operationName} failed after ${operationTime.toFixed(2)}ms:`, error);
      }
      
      throw error;
    }
  }, [componentName, performanceMonitor, logMetrics]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metrics.current };
  }, []);

  // Log performance report
  const logReport = useCallback(() => {
    console.group(`📊 Performance Report: ${componentName}`);
    console.log('Component Load Time:', metrics.current.componentLoadTime.toFixed(2) + 'ms');
    console.log('Average Render Time:', performanceMonitor.getAverageMetric(`${componentName}_render`).toFixed(2) + 'ms');
    console.log('Average Interaction Time:', performanceMonitor.getAverageMetric(`${componentName}_interaction`).toFixed(2) + 'ms');
    if (trackMemory) {
      console.log('Memory Usage:', (metrics.current.memoryUsage / 1024 / 1024).toFixed(2) + 'MB');
    }
    console.groupEnd();
  }, [componentName, performanceMonitor, trackMemory]);

  return {
    trackInteraction,
    trackAsyncOperation,
    getMetrics,
    logReport,
    performanceMonitor
  };
};

// Hook for tracking page load performance
export const usePagePerformance = (pageName: string) => {
  const performanceMonitor = PerformanceMonitor.getInstance();
  
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`${pageName}_page_load`, loadTime);
      console.log(`📄 ${pageName} page loaded in ${loadTime.toFixed(2)}ms`);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pageName, performanceMonitor]);

  return {
    performanceMonitor
  };
};

// Hook for tracking network performance
export const useNetworkPerformance = () => {
  const performanceMonitor = PerformanceMonitor.getInstance();
  
  const trackNetworkRequest = useCallback(async <T>(
    requestName: string,
    request: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await request();
      const requestTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`network_${requestName}`, requestTime);
      
      console.log(`🌐 ${requestName} completed in ${requestTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const requestTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`network_${requestName}_error`, requestTime);
      
      console.error(`❌ ${requestName} failed after ${requestTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [performanceMonitor]);

  return {
    trackNetworkRequest,
    performanceMonitor
  };
};
