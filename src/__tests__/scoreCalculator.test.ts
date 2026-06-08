import { describe, it, expect } from 'vitest';
import { calculatePerformanceScore, formatMetricValue, getMetricName, getMetricShortName } from '../../src/utils/scoreCalculator';
import type { WebVitals } from '../../src/types/performance';

describe('calculatePerformanceScore', () => {
  it('should give poor score when all values are 0', () => {
    const webVitals: WebVitals = { fcp: 0, lcp: 0, cls: 0, fid: 0, tbt: 0 };
    const result = calculatePerformanceScore(webVitals);

    expect(result.overall).toBe(0);
    expect(result.fcp.score).toBe(0);
    expect(result.fcp.label).toBe('poor');
    expect(result.lcp.score).toBe(0);
    expect(result.lcp.label).toBe('poor');
  });

  it('should give good scores for excellent values', () => {
    const webVitals: WebVitals = { fcp: 800, lcp: 1200, cls: 0.05, fid: 50, tbt: 100 };
    const result = calculatePerformanceScore(webVitals);

    expect(result.overall).toBeGreaterThan(85);
    expect(result.fcp.label).toBe('good');
    expect(result.lcp.label).toBe('good');
    expect(result.cls.label).toBe('good');
    expect(result.fid.label).toBe('good');
    expect(result.tbt.label).toBe('good');
  });

  it('should give needs-improvement for moderate values', () => {
    const webVitals: WebVitals = { fcp: 2000, lcp: 3000, cls: 0.15, fid: 150, tbt: 350 };
    const result = calculatePerformanceScore(webVitals);

    expect(result.fcp.label).toBe('needs-improvement');
    expect(result.lcp.label).toBe('needs-improvement');
    expect(result.cls.label).toBe('needs-improvement');
    expect(result.fid.label).toBe('needs-improvement');
    expect(result.tbt.label).toBe('needs-improvement');
  });

  it('should give poor scores for bad values', () => {
    const webVitals: WebVitals = { fcp: 5000, lcp: 8000, cls: 0.5, fid: 500, tbt: 1200 };
    const result = calculatePerformanceScore(webVitals);

    expect(result.fcp.label).toBe('poor');
    expect(result.lcp.label).toBe('poor');
    expect(result.cls.label).toBe('poor');
    expect(result.fid.label).toBe('poor');
    expect(result.tbt.label).toBe('poor');
  });

  it('should weight LCP most heavily in overall score', () => {
    const onlyLcpGood: WebVitals = { fcp: 5000, lcp: 1000, cls: 0.5, fid: 500, tbt: 1200 };
    const onlyLcpBad: WebVitals = { fcp: 5000, lcp: 8000, cls: 0.5, fid: 500, tbt: 1200 };

    const goodLcpResult = calculatePerformanceScore(onlyLcpGood);
    const badLcpResult = calculatePerformanceScore(onlyLcpBad);

    expect(goodLcpResult.overall).toBeGreaterThan(badLcpResult.overall);
    const diff = goodLcpResult.overall - badLcpResult.overall;
    expect(diff).toBeGreaterThan(10);
  });

  it('should clamp scores between 0 and 100', () => {
    const webVitals: WebVitals = { fcp: 800, lcp: 1000, cls: 0.01, fid: 10, tbt: 50 };
    const result = calculatePerformanceScore(webVitals);

    expect(result.fcp.score).toBeLessThanOrEqual(100);
    expect(result.fcp.score).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.overall).toBeGreaterThanOrEqual(0);
  });
});

describe('formatMetricValue', () => {
  it('should format FCP in seconds', () => {
    expect(formatMetricValue('fcp', 1800)).toBe('1.80s');
  });

  it('should format LCP in seconds', () => {
    expect(formatMetricValue('lcp', 2500)).toBe('2.50s');
  });

  it('should format CLS as decimal', () => {
    expect(formatMetricValue('cls', 0.1)).toBe('0.100');
  });

  it('should format FID in milliseconds', () => {
    expect(formatMetricValue('fid', 100)).toBe('100ms');
  });

  it('should format TBT in milliseconds', () => {
    expect(formatMetricValue('tbt', 200)).toBe('200ms');
  });
});

describe('getMetricName', () => {
  it('should return full metric names', () => {
    expect(getMetricName('fcp')).toBe('First Contentful Paint');
    expect(getMetricName('lcp')).toBe('Largest Contentful Paint');
    expect(getMetricName('cls')).toBe('Cumulative Layout Shift');
    expect(getMetricName('fid')).toBe('First Input Delay');
    expect(getMetricName('tbt')).toBe('Total Blocking Time');
  });
});

describe('getMetricShortName', () => {
  it('should return short metric names', () => {
    expect(getMetricShortName('fcp')).toBe('FCP');
    expect(getMetricShortName('lcp')).toBe('LCP');
    expect(getMetricShortName('cls')).toBe('CLS');
    expect(getMetricShortName('fid')).toBe('FID');
    expect(getMetricShortName('tbt')).toBe('TBT');
  });
});
