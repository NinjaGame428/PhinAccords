// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache = new Map<string, any>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 300
  ): T {
    return ((...args: Parameters<T>) => {
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key)!);
      }
      
      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);
      
      this.debounceTimers.set(key, timer);
    }) as T;
  }

  // Memoize expensive computations
  memoize<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    ttl: number = 300000 // 5 minutes
  ): T {
    return ((...args: Parameters<T>) => {
      const cacheKey = `${key}_${JSON.stringify(args)}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      
      const result = func(...args);
      this.cache.set(cacheKey, {
        value: result,
        timestamp: Date.now()
      });
      
      return result;
    }) as T;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(img);
  }

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // Optimize scroll performance
  optimizeScroll(callback: () => void): () => void {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  // Batch DOM updates
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  // Virtual scrolling for large lists
  createVirtualScroll<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
    let scrollTop = 0;
    
    return {
      getVisibleItems: () => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount, items.length);
        return items.slice(startIndex, endIndex).map((item, index) => ({
          item,
          index: startIndex + index,
          element: renderItem(item, startIndex + index)
        }));
      },
      updateScroll: (newScrollTop: number) => {
        scrollTop = newScrollTop;
      }
    };
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Record<string, number[]> = {};

  static startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  static endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    if (!this.metrics[label]) {
      this.metrics[label] = [];
    }
    this.metrics[label].push(duration);
    
    return duration;
  }

  static getAverageTime(label: string): number {
    const times = this.metrics[label];
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  static getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    Object.keys(this.metrics).forEach(label => {
      result[label] = {
        average: this.getAverageTime(label),
        count: this.metrics[label].length
      };
    });
    
    return result;
  }
}
