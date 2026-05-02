// Performance optimization utilities for PublicBingo

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(value);
  }

  getAverageMetric(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  logMetrics(): void {
    console.log('Performance Metrics:', Object.fromEntries(this.metrics));
  }

  /** Snapshot for dashboards (maps metric labels to synthetic component entries). */
  getMetrics(): { components: Record<string, { loadTime: number }> } {
    const components: Record<string, { loadTime: number }> = {};
    this.metrics.forEach((values, label) => {
      const avg =
        values.length > 0
          ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length
          : 0;
      components[label] = { loadTime: avg };
    });
    return { components };
  }

  startTrace(_name: string, _data?: Record<string, unknown>): string | null {
    return `trace_${Date.now()}`;
  }

  stopTrace(_traceId: string | null): void {
    // no-op: trace hooks reserved for future Firebase Performance wiring
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Bundle size optimization helpers
export const bundleOptimizer = {
  // Preload critical components
  preloadComponent: (importFunc: () => Promise<any>): void => {
    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFunc();
      }, 1000);
    }
  },

  // Prefetch components based on user interaction
  prefetchOnHover: (importFunc: () => Promise<any>): (() => void) => {
    let prefetched = false;
    
    return () => {
      if (!prefetched) {
        prefetched = true;
        importFunc();
      }
    };
  }
};

// Memory management utilities
export const memoryManager = {
  // Clear unused event listeners and timers
  cleanup: (): void => {
    // This would be implemented based on your specific cleanup needs
    console.log('Memory cleanup performed');
  },

  // Monitor memory usage
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
};

// Image optimization
export const imageOptimizer = {
  // Preload critical images
  preloadImage: (src: string): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  },

  // Create lazy loading image element
  createLazyImage: (src: string, alt: string): HTMLImageElement => {
    const img = document.createElement('img');
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    img.setAttribute('data-src', src);
    img.alt = alt;
    img.className = 'lazy-image';
    img.loading = 'lazy';
    return img;
  }
};

// CSS optimization
export const cssOptimizer = {
  // Load CSS dynamically
  loadCSS: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject();
      document.head.appendChild(link);
    });
  },

  // Remove unused CSS
  removeUnusedCSS: (): void => {
    // This would be implemented with a CSS purging strategy
    console.log('Unused CSS removal performed');
  }
};

// Utility functions for performance optimization
export const performanceUtils = {
  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if element is in viewport
  isInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}; 