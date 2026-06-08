import { ref } from 'vue';
import type { NavigationTiming, ResourceItem, WebVitals, PerformanceReport } from '../types/performance';
import { calculatePerformanceScore } from '../utils/scoreCalculator';
import { generateSuggestions } from '../utils/suggestionEngine';

interface PerformanceEntryEvent extends PerformanceEntry {
  initiatorType: string;
  transferSize: number;
  responseStatus: number;
  name: string;
  startTime: number;
  duration: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{
    node?: Node;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
  }>;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

function collectNavigationTiming(): NavigationTiming | null {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (navEntries.length === 0) return null;

  const nav = navEntries[0];
  return {
    dnsLookup: Math.max(0, nav.domainLookupEnd - nav.domainLookupStart),
    tcpConnect: Math.max(0, nav.connectEnd - nav.connectStart),
    sslHandshake: nav.secureConnectionStart > 0
      ? Math.max(0, nav.connectEnd - nav.secureConnectionStart)
      : 0,
    ttfb: Math.max(0, nav.responseStart - nav.requestStart),
    domParse: Math.max(0, nav.domComplete - nav.domInteractive),
    resourceLoad: Math.max(0, nav.loadEventStart - nav.domContentLoadedEventEnd),
    domContentLoaded: Math.max(0, nav.domContentLoadedEventEnd - nav.startTime),
    loadEvent: Math.max(0, nav.loadEventEnd - nav.startTime)
  };
}

export function classifyResourceType(initiatorType: string, url: string): ResourceItem['type'] {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'ico'].includes(ext) || initiatorType === 'img') return 'image';
  if (['js', 'mjs'].includes(ext) || initiatorType === 'script') return 'js';
  if (['css'].includes(ext) || initiatorType === 'link') return 'css';
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext) || initiatorType === 'css' && ext === 'woff2') return 'font';
  if (['xmlhttprequest', 'fetch'].includes(initiatorType)) return 'xhr';
  return 'xhr';
}

function collectResources(): ResourceItem[] {
  if (typeof window === 'undefined' || !window.performance) return [];

  const entries = performance.getEntriesByType('resource') as PerformanceEntryEvent[];
  return entries.map((entry, index) => ({
    id: String(index + 1),
    url: entry.name,
    name: entry.name.split('/').pop() ?? entry.name,
    type: classifyResourceType(entry.initiatorType, entry.name),
    size: entry.transferSize ?? 0,
    duration: Math.max(0, entry.duration),
    startTime: Math.max(0, entry.startTime),
    endTime: Math.max(0, entry.startTime + entry.duration),
    statusCode: (entry as PerformanceEntryEvent).responseStatus ?? 200,
    initiatorType: entry.initiatorType
  }));
}

async function observeWebVitals(): Promise<WebVitals> {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return { fcp: 0, lcp: 0, cls: 0, fid: 0, tbt: 0 };
  }

  let fcp = 0;
  let lcp = 0;
  let cls = 0;
  let fid = 0;
  let tbt = 0;

  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (navEntries.length > 0) {
    const nav = navEntries[0];
    fcp = Math.max(0, nav.responseStart + (nav.domInteractive - nav.responseStart) * 0.3);
    lcp = Math.max(0, nav.loadEventEnd * 0.7);
    tbt = Math.max(0, nav.loadEventEnd * 0.15);
  }

  return new Promise((resolve) => {
    const timeLimit = setTimeout(() => {
      resolve({ fcp, lcp, cls, fid, tbt });
    }, 3000);

    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            fcp = Math.max(0, entry.startTime);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcp = Math.max(0, lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shiftEntry = entry as LayoutShiftEntry;
          if (!shiftEntry.hadRecentInput) {
            cls += shiftEntry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      const fidObserver = new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0] as PerformanceEventTiming;
        if (firstEntry) {
          fid = Math.max(0, firstEntry.processingStart - firstEntry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            tbt += entry.duration - 50;
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      clearTimeout(timeLimit);
      resolve({ fcp, lcp, cls, fid, tbt });
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        clearTimeout(timeLimit);
        resolve({ fcp, lcp, cls: Math.round(cls * 1000) / 1000, fid, tbt: Math.round(tbt) });
      }, 500);
    }, { once: true });
  });
}

export function usePerformance() {
  const report = ref<PerformanceReport | null>(null);
  const isAnalyzing = ref(false);

  async function collectCurrentPageData(): Promise<PerformanceReport | null> {
    const navigationTiming = collectNavigationTiming();
    const resources = collectResources();
    const webVitals = await observeWebVitals();
    const score = calculatePerformanceScore(webVitals);
    const suggestions = generateSuggestions(webVitals, resources, navigationTiming);

    return {
      url: window.location.href,
      timestamp: Date.now(),
      navigationTiming: navigationTiming ?? {
        dnsLookup: 0, tcpConnect: 0, sslHandshake: 0, ttfb: 0,
        domParse: 0, resourceLoad: 0, domContentLoaded: 0, loadEvent: 0
      },
      resources,
      webVitals,
      score,
      suggestions
    };
  }

  return {
    report,
    isAnalyzing,
    collectNavigationTiming,
    collectResources,
    observeWebVitals,
    collectCurrentPageData
  };
}
