import type {
  NavigationTiming,
  ResourceItem,
  WebVitals,
  PerformanceReport
} from '../types/performance';
import { calculatePerformanceScore } from '../utils/scoreCalculator';
import { generateSuggestions } from '../utils/suggestionEngine';

const mockNavigationTiming: NavigationTiming = {
  dnsLookup: 45,
  tcpConnect: 120,
  sslHandshake: 85,
  ttfb: 280,
  domParse: 450,
  resourceLoad: 1200,
  domContentLoaded: 850,
  loadEvent: 1800
};

const mockResources: ResourceItem[] = [
  {
    id: '1',
    url: 'https://example.com/',
    name: 'Document',
    type: 'xhr',
    size: 45230,
    duration: 525,
    startTime: 0,
    endTime: 525,
    statusCode: 200,
    initiatorType: 'navigation'
  },
  {
    id: '2',
    url: 'https://example.com/css/main.css',
    name: 'main.css',
    type: 'css',
    size: 125400,
    duration: 180,
    startTime: 200,
    endTime: 380,
    statusCode: 200,
    initiatorType: 'link'
  },
  {
    id: '3',
    url: 'https://example.com/js/app.js',
    name: 'app.js',
    type: 'js',
    size: 456000,
    duration: 320,
    startTime: 220,
    endTime: 540,
    statusCode: 200,
    initiatorType: 'script'
  },
  {
    id: '4',
    url: 'https://example.com/js/vendor.js',
    name: 'vendor.js',
    type: 'js',
    size: 892000,
    duration: 450,
    startTime: 250,
    endTime: 700,
    statusCode: 200,
    initiatorType: 'script'
  },
  {
    id: '5',
    url: 'https://example.com/img/hero.jpg',
    name: 'hero.jpg',
    type: 'image',
    size: 1250000,
    duration: 580,
    startTime: 400,
    endTime: 980,
    statusCode: 200,
    initiatorType: 'img'
  },
  {
    id: '6',
    url: 'https://example.com/img/logo.png',
    name: 'logo.png',
    type: 'image',
    size: 45000,
    duration: 120,
    startTime: 420,
    endTime: 540,
    statusCode: 200,
    initiatorType: 'img'
  },
  {
    id: '7',
    url: 'https://example.com/fonts/main.woff2',
    name: 'main.woff2',
    type: 'font',
    size: 78000,
    duration: 200,
    startTime: 450,
    endTime: 650,
    statusCode: 200,
    initiatorType: 'css'
  },
  {
    id: '8',
    url: 'https://example.com/api/data',
    name: 'data',
    type: 'xhr',
    size: 34000,
    duration: 280,
    startTime: 600,
    endTime: 880,
    statusCode: 200,
    initiatorType: 'fetch'
  },
  {
    id: '9',
    url: 'https://example.com/img/banner.png',
    name: 'banner.png',
    type: 'image',
    size: 890000,
    duration: 420,
    startTime: 500,
    endTime: 920,
    statusCode: 200,
    initiatorType: 'css'
  },
  {
    id: '10',
    url: 'https://example.com/js/chunk-1.js',
    name: 'chunk-1.js',
    type: 'js',
    size: 234000,
    duration: 280,
    startTime: 700,
    endTime: 980,
    statusCode: 200,
    initiatorType: 'script'
  },
  {
    id: '11',
    url: 'https://example.com/img/icon-sprite.svg',
    name: 'icon-sprite.svg',
    type: 'image',
    size: 34000,
    duration: 95,
    startTime: 380,
    endTime: 475,
    statusCode: 200,
    initiatorType: 'img'
  },
  {
    id: '12',
    url: 'https://example.com/css/print.css',
    name: 'print.css',
    type: 'css',
    size: 8900,
    duration: 65,
    startTime: 550,
    endTime: 615,
    statusCode: 200,
    initiatorType: 'link'
  }
];

const mockWebVitals: WebVitals = {
  fcp: 2100,
  lcp: 2800,
  cls: 0.12,
  fid: 120,
  tbt: 380
};

export function generateMockReport(url: string): PerformanceReport {
  const navigationTiming = { ...mockNavigationTiming };
  const resources = mockResources.map(r => ({ ...r }));
  const webVitals = { ...mockWebVitals };
  const score = calculatePerformanceScore(webVitals);
  const suggestions = generateSuggestions(webVitals, resources, navigationTiming);

  return {
    url,
    timestamp: Date.now(),
    navigationTiming,
    resources,
    webVitals,
    score,
    suggestions
  };
}
