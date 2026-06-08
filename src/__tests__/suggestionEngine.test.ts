import { describe, it, expect } from 'vitest';
import { generateSuggestions } from '../../src/utils/suggestionEngine';
import type { WebVitals, ResourceItem, NavigationTiming } from '../../src/types/performance';

const goodWebVitals: WebVitals = { fcp: 800, lcp: 1200, cls: 0.05, fid: 50, tbt: 100 };
const badWebVitals: WebVitals = { fcp: 5000, lcp: 8000, cls: 0.5, fid: 500, tbt: 1200 };

const mockResources: ResourceItem[] = [
  {
    id: '1', url: 'https://example.com/img/hero.jpg', name: 'hero.jpg',
    type: 'image', size: 1500000, duration: 580, startTime: 400, endTime: 980,
    statusCode: 200, initiatorType: 'img'
  },
  {
    id: '2', url: 'https://example.com/js/vendor.js', name: 'vendor.js',
    type: 'js', size: 892000, duration: 450, startTime: 250, endTime: 700,
    statusCode: 200, initiatorType: 'script'
  },
  {
    id: '3', url: 'https://example.com/css/main.css', name: 'main.css',
    type: 'css', size: 50000, duration: 180, startTime: 200, endTime: 380,
    statusCode: 200, initiatorType: 'link'
  }
];

const mockTiming: NavigationTiming = {
  dnsLookup: 45, tcpConnect: 120, sslHandshake: 85, ttfb: 280,
  domParse: 450, resourceLoad: 1200, domContentLoaded: 850, loadEvent: 1800
};

describe('generateSuggestions', () => {
  it('should return empty array for perfect web vitals with no resources', () => {
    const result = generateSuggestions(goodWebVitals, [], null);
    expect(result).toEqual([]);
  });

  it('should return suggestions for bad web vitals', () => {
    const result = generateSuggestions(badWebVitals, [], null);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(s => s.id === 'fcp-optimize')).toBe(true);
    expect(result.some(s => s.id === 'lcp-optimize')).toBe(true);
    expect(result.some(s => s.id === 'cls-optimize')).toBe(true);
    expect(result.some(s => s.id === 'fid-optimize')).toBe(true);
    expect(result.some(s => s.id === 'tbt-optimize')).toBe(true);
  });

  it('should suggest image optimization for large images', () => {
    const result = generateSuggestions(goodWebVitals, mockResources, null);
    expect(result.some(s => s.id === 'image-optimize')).toBe(true);
  });

  it('should suggest JS optimization for large scripts', () => {
    const result = generateSuggestions(goodWebVitals, mockResources, null);
    expect(result.some(s => s.id === 'js-optimize')).toBe(true);
  });

  it('should suggest caching when resources exist', () => {
    const result = generateSuggestions(goodWebVitals, mockResources, null);
    expect(result.some(s => s.id === 'cache-optimize')).toBe(true);
  });

  it('should suggest DNS optimization when DNS is slow', () => {
    const slowDnsTiming: NavigationTiming = {
      ...mockTiming, dnsLookup: 200
    };
    const result = generateSuggestions(goodWebVitals, mockResources, slowDnsTiming);
    expect(result.some(s => s.id === 'dns-optimize')).toBe(true);
  });

  it('should not suggest DNS optimization when DNS is fast', () => {
    const result = generateSuggestions(goodWebVitals, mockResources, mockTiming);
    expect(result.some(s => s.id === 'dns-optimize')).toBe(false);
  });

  it('should sort suggestions by priority then category', () => {
    const result = generateSuggestions(badWebVitals, mockResources, mockTiming);
    for (let i = 1; i < result.length; i++) {
      const prevPriority = result[i - 1].priority;
      const currPriority = result[i].priority;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      expect(priorityOrder[prevPriority]).toBeLessThanOrEqual(priorityOrder[currPriority]);
    }
  });

  it('should return no caching suggestion for few resources', () => {
    const fewResources: ResourceItem[] = [
      { id: '1', url: 'https://example.com/img/icon.svg', name: 'icon.svg',
        type: 'image', size: 1000, duration: 50, startTime: 0, endTime: 50,
        statusCode: 200, initiatorType: 'img' }
    ];
    const result = generateSuggestions(goodWebVitals, fewResources, null);
    expect(result.some(s => s.id === 'cache-optimize')).toBe(false);
  });
});
