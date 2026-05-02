// Bundle analyzer utility for PublicBingo performance monitoring

export interface BundleMetrics {
  totalSize: number;
  chunkCount: number;
  loadTime: number;
  components: {
    [key: string]: {
      size: number;
      loadTime: number;
      dependencies: string[];
    };
  };
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private metrics: BundleMetrics = {
    totalSize: 0,
    chunkCount: 0,
    loadTime: 0,
    components: {}
  };

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Measure component load time
  measureComponentLoad(componentName: string, importFunc: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    return importFunc().then((module) => {
      const loadTime = performance.now() - startTime;
      
      this.metrics.components[componentName] = {
        size: 0, // Would be calculated from actual bundle analysis
        loadTime,
        dependencies: Object.keys(module.default?.dependencies || {})
      };
      
      console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  }

  // Get bundle metrics
  getMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  // Log bundle analysis report
  logReport(): void {
    console.group('📊 Bundle Analysis Report');
    console.log('Total Components:', Object.keys(this.metrics.components).length);
    console.log('Average Load Time:', this.getAverageLoadTime().toFixed(2) + 'ms');
    console.log('Slowest Component:', this.getSlowestComponent());
    console.log('Fastest Component:', this.getFastestComponent());
    console.groupEnd();
  }

  private getAverageLoadTime(): number {
    const loadTimes = Object.values(this.metrics.components).map(c => c.loadTime);
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  private getSlowestComponent(): string {
    const entries = Object.entries(this.metrics.components);
    if (entries.length === 0) return '';
    let name = entries[0][0];
    let max = entries[0][1].loadTime;
    for (const [n, m] of entries) {
      if (m.loadTime > max) {
        max = m.loadTime;
        name = n;
      }
    }
    return name;
  }

  private getFastestComponent(): string {
    const entries = Object.entries(this.metrics.components);
    if (entries.length === 0) return '';
    let name = entries[0][0];
    let min = entries[0][1].loadTime;
    for (const [n, m] of entries) {
      if (m.loadTime < min) {
        min = m.loadTime;
        name = n;
      }
    }
    return name;
  }
}

// Performance monitoring for lazy-loaded components
export const componentLoader = {
  // Enhanced lazy loading with performance tracking
  lazyLoadWithTracking: <T extends React.ComponentType<any>>(
    componentName: string,
    importFunc: () => Promise<{ default: T }>
  ) => {
    const analyzer = BundleAnalyzer.getInstance();
    
    return React.lazy(() => 
      analyzer.measureComponentLoad(componentName, importFunc)
    );
  },

  // Preload components based on user behavior
  preloadOnInteraction: <T extends React.ComponentType<any>>(
    componentName: string,
    importFunc: () => Promise<{ default: T }>,
    trigger: 'hover' | 'focus' | 'click'
  ) => {
    const analyzer = BundleAnalyzer.getInstance();
    
    return {
      onMouseEnter: trigger === 'hover' ? () => analyzer.measureComponentLoad(componentName, importFunc) : undefined,
      onFocus: trigger === 'focus' ? () => analyzer.measureComponentLoad(componentName, importFunc) : undefined,
      onClick: trigger === 'click' ? () => analyzer.measureComponentLoad(componentName, importFunc) : undefined
    };
  }
};

// Import React for the component loader
import React from 'react';
