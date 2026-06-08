import type { WebVitals, PerformanceScore, MetricScore } from '../types/performance';

function calculateMetricScore(
  value: number,
  goodThreshold: number,
  poorThreshold: number,
  isLowerBetter: boolean = true
): MetricScore {
  let score: number;
  let label: 'good' | 'needs-improvement' | 'poor';

  if (isLowerBetter) {
    if (value <= 0) {
      score = 0;
      label = 'poor';
    } else if (value <= goodThreshold) {
      const ratio = value / goodThreshold;
      score = 90 + Math.floor((1 - ratio) * 10);
      label = 'good';
    } else if (value <= poorThreshold) {
      const ratio = (value - goodThreshold) / (poorThreshold - goodThreshold);
      score = 50 + Math.floor((1 - ratio) * 39);
      label = 'needs-improvement';
    } else {
      const ratio = Math.min((value - poorThreshold) / poorThreshold, 1);
      score = Math.floor((1 - ratio) * 49);
      label = 'poor';
    }
  } else {
    if (value >= goodThreshold) {
      score = 90 + Math.floor((value - goodThreshold) / (100 - goodThreshold) * 10);
      label = 'good';
    } else if (value >= poorThreshold) {
      const ratio = (value - poorThreshold) / (goodThreshold - poorThreshold);
      score = 50 + Math.floor(ratio * 39);
      label = 'needs-improvement';
    } else {
      score = Math.floor((value / poorThreshold) * 49);
      label = 'poor';
    }
  }

  return {
    value,
    score: Math.max(0, Math.min(100, score)),
    label
  };
}

export function calculatePerformanceScore(webVitals: WebVitals): PerformanceScore {
  const fcp = calculateMetricScore(webVitals.fcp, 1800, 3000);
  const lcp = calculateMetricScore(webVitals.lcp, 2500, 4000);
  const cls = calculateMetricScore(webVitals.cls, 0.1, 0.25);
  const fid = calculateMetricScore(webVitals.fid, 100, 300);
  const tbt = calculateMetricScore(webVitals.tbt, 200, 600);

  const overall = Math.round(
    fcp.score * 0.15 +
    lcp.score * 0.35 +
    cls.score * 0.15 +
    fid.score * 0.15 +
    tbt.score * 0.20
  );

  return {
    overall,
    fcp,
    lcp,
    cls,
    fid,
    tbt
  };
}

export function formatMetricValue(key: keyof WebVitals, value: number): string {
  switch (key) {
    case 'cls':
      return value.toFixed(3);
    case 'fcp':
    case 'lcp':
      return `${(value / 1000).toFixed(2)}s`;
    case 'fid':
    case 'tbt':
      return `${value.toFixed(0)}ms`;
    default:
      return String(value);
  }
}

export function getMetricName(key: keyof WebVitals): string {
  const names: Record<keyof WebVitals, string> = {
    fcp: 'First Contentful Paint',
    lcp: 'Largest Contentful Paint',
    cls: 'Cumulative Layout Shift',
    fid: 'First Input Delay',
    tbt: 'Total Blocking Time'
  };
  return names[key];
}

export function getMetricShortName(key: keyof WebVitals): string {
  const names: Record<keyof WebVitals, string> = {
    fcp: 'FCP',
    lcp: 'LCP',
    cls: 'CLS',
    fid: 'FID',
    tbt: 'TBT'
  };
  return names[key];
}
