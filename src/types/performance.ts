export interface NavigationTiming {
  dnsLookup: number;
  tcpConnect: number;
  sslHandshake: number;
  ttfb: number;
  domParse: number;
  resourceLoad: number;
  domContentLoaded: number;
  loadEvent: number;
}

export type ResourceType = 'image' | 'js' | 'css' | 'font' | 'xhr';

export interface ResourceItem {
  id: string;
  url: string;
  name: string;
  type: ResourceType;
  size: number;
  duration: number;
  startTime: number;
  endTime: number;
  statusCode: number;
  initiatorType: string;
}

export interface WebVitals {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  tbt: number;
}

export type MetricKey = keyof WebVitals;

export interface MetricScore {
  value: number;
  score: number;
  label: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceScore {
  overall: number;
  fcp: MetricScore;
  lcp: MetricScore;
  cls: MetricScore;
  fid: MetricScore;
  tbt: MetricScore;
}

export type SuggestionCategory = 'images' | 'javascript' | 'css' | 'network' | 'rendering';
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: SuggestionPriority;
  category: SuggestionCategory;
  impact: string;
  savings?: string;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  navigationTiming: NavigationTiming;
  resources: ResourceItem[];
  webVitals: WebVitals;
  score: PerformanceScore;
  suggestions: OptimizationSuggestion[];
}

export interface WaterfallItem {
  name: string;
  startTime: number;
  duration: number;
  type: ResourceType | 'navigation';
  color: string;
}
