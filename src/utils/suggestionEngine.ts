import type {
  NavigationTiming,
  ResourceItem,
  WebVitals,
  OptimizationSuggestion,
  SuggestionCategory,
  SuggestionPriority
} from '../types/performance';

function classifyPriority(score: number): SuggestionPriority {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function checkFCP(fcp: number): OptimizationSuggestion | null {
  if (fcp <= 1800) return null;
  const priority = classifyPriority(fcp);
  return {
    id: 'fcp-optimize',
    title: '优化首次内容绘制 (FCP)',
    description: fcp > 3000
      ? 'FCP 严重超标。建议减少服务器响应时间、消除阻塞渲染的资源、使用预加载关键资源。'
      : 'FCP 偏高。建议内联关键 CSS、预连接重要第三方域名、优化关键渲染路径。',
    priority,
    category: 'rendering',
    impact: '加快首屏内容可见速度',
    savings: `~${Math.round((fcp - 1800) * 0.6)}ms`
  };
}

function checkLCP(lcp: number): OptimizationSuggestion | null {
  if (lcp <= 2500) return null;
  const priority = classifyPriority(lcp);
  return {
    id: 'lcp-optimize',
    title: '优化最大内容绘制 (LCP)',
    description: lcp > 4000
      ? 'LCP 严重超标。建议优化最大内容元素的加载，预加载 LCP 图片，减少服务端响应时间。'
      : 'LCP 偏高。建议为 LCP 图片添加 fetchpriority="high"，使用 CDN 加速资源分发。',
    priority,
    category: 'images',
    impact: '加速主要内容元素渲染',
    savings: `~${Math.round((lcp - 2500) * 0.5)}ms`
  };
}

function checkCLS(cls: number): OptimizationSuggestion | null {
  if (cls <= 0.1) return null;
  const priority = classifyPriority(cls * 1000);
  return {
    id: 'cls-optimize',
    title: '减少累积布局偏移 (CLS)',
    description: cls > 0.25
      ? 'CLS 严重超标。建议为图片和视频设置明确的宽高属性，避免在视口上方动态插入内容。'
      : 'CLS 偏高。建议使用 CSS aspect-ratio 属性，为广告位预留空间，避免字体导致的布局偏移。',
    priority,
    category: 'rendering',
    impact: '提升视觉稳定性，改善用户体验',
    savings: `~${((cls - 0.1) * 100).toFixed(0)}%`
  };
}

function checkFID(fid: number): OptimizationSuggestion | null {
  if (fid <= 100) return null;
  const priority = classifyPriority(fid);
  return {
    id: 'fid-optimize',
    title: '降低首次输入延迟 (FID)',
    description: fid > 300
      ? 'FID 严重超标。建议拆分长任务、减少 JavaScript 执行时间、使用 Web Worker 处理复杂计算。'
      : 'FID 偏高。建议延迟加载非关键脚本、优化事件监听器、减少主线程阻塞。',
    priority,
    category: 'javascript',
    impact: '提升交互响应速度',
    savings: `~${Math.round((fid - 100) * 0.7)}ms`
  };
}

function checkTBT(tbt: number): OptimizationSuggestion | null {
  if (tbt <= 200) return null;
  const priority = classifyPriority(tbt);
  return {
    id: 'tbt-optimize',
    title: '减少总阻塞时间 (TBT)',
    description: tbt > 600
      ? 'TBT 严重超标。建议代码分割、延迟加载非关键 JavaScript、将长任务拆分为多个短任务。'
      : 'TBT 偏高。建议优化第三方脚本、减少主线程工作、使用 requestIdleCallback。',
    priority,
    category: 'javascript',
    impact: '减少主线程阻塞，提升交互性能',
    savings: `~${Math.round((tbt - 200) * 0.5)}ms`
  };
}

function checkImages(resources: ResourceItem[]): OptimizationSuggestion | null {
  const images = resources.filter(r => r.type === 'image');
  const largeImages = images.filter(r => r.size > 100 * 1024);
  const uncompressedImages = images.filter(r => {
    const ext = r.url.split('.').pop()?.toLowerCase() ?? '';
    return ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
  });

  if (largeImages.length === 0 && uncompressedImages.length === 0) return null;

  const totalSavings = largeImages.reduce((sum, r) => sum + r.size * 0.4, 0);

  return {
    id: 'image-optimize',
    title: '压缩图片资源',
    description: `检测到 ${largeImages.length} 张大图片和 ${uncompressedImages.length} 张未优化格式的图片。使用 WebP/AVIF 格式并压缩可显著减少加载时间。`,
    priority: largeImages.length >= 3 ? 'high' : 'medium',
    category: 'images',
    impact: `可减少约 ${formatBytes(totalSavings)} 的资源大小`,
    savings: `~${Math.round(totalSavings / 1024 / 5)}ms`
  };
}

function checkJavaScript(resources: ResourceItem[]): OptimizationSuggestion | null {
  const jsFiles = resources.filter(r => r.type === 'js');
  const largeJs = jsFiles.filter(r => r.size > 200 * 1024);

  if (largeJs.length === 0) return null;

  const suggestions: string[] = [];
  if (largeJs.some(r => r.size > 500 * 1024)) {
    suggestions.push('检测到超大 JS 文件，强烈建议进行代码分割和 Tree Shaking');
  }
  suggestions.push('建议使用动态 import() 延迟加载非首屏脚本');

  return {
    id: 'js-optimize',
    title: '优化 JavaScript 加载',
    description: suggestions.join('。') + '。',
    priority: largeJs.some(r => r.size > 500 * 1024) ? 'high' : 'medium',
    category: 'javascript',
    impact: '减少首屏 JS 体积和执行时间',
    savings: `~${Math.round(largeJs.reduce((sum, r) => sum + r.size * 0.3, 0) / 1024 / 3)}ms`
  };
}

function checkCaching(resources: ResourceItem[]): OptimizationSuggestion | null {
  if (resources.length < 3) return null;

  return {
    id: 'cache-optimize',
    title: '启用浏览器缓存',
    description: '建议为 CSS、JS、图片等静态资源设置长期缓存策略（Cache-Control、ETag），利用 Service Worker 缓存关键资源。',
    priority: resources.length > 8 ? 'high' : 'medium',
    category: 'network',
    impact: '提升重复访问速度，减少服务器压力',
    savings: `~${Math.round(resources.length * 80)}ms`
  };
}

function checkDNS(timing: NavigationTiming | null): OptimizationSuggestion | null {
  if (!timing || timing.dnsLookup <= 50) return null;

  return {
    id: 'dns-optimize',
    title: '优化 DNS 解析',
    description: `DNS 解析耗时 ${timing.dnsLookup.toFixed(0)}ms。建议使用 dns-prefetch 预解析第三方域名，考虑使用 CDN 减少域名数量。`,
    priority: timing.dnsLookup > 100 ? 'high' : 'medium',
    category: 'network',
    impact: '减少 DNS 查询时间',
    savings: `~${Math.round(timing.dnsLookup * 0.5)}ms`
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const categoryOrder: Record<SuggestionCategory, number> = {
  images: 0,
  javascript: 1,
  css: 2,
  network: 3,
  rendering: 4
};

const priorityOrder: Record<SuggestionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
};

export function generateSuggestions(
  webVitals: WebVitals,
  resources: ResourceItem[],
  navigationTiming: NavigationTiming | null
): OptimizationSuggestion[] {
  const checks: OptimizationSuggestion[] = [];

  const vitalsCheck = [
    checkFCP(webVitals.fcp),
    checkLCP(webVitals.lcp),
    checkCLS(webVitals.cls),
    checkFID(webVitals.fid),
    checkTBT(webVitals.tbt)
  ];

  for (const suggestion of vitalsCheck) {
    if (suggestion) checks.push(suggestion);
  }

  const resourceCheck = [
    checkImages(resources),
    checkJavaScript(resources),
    checkCaching(resources),
    checkDNS(navigationTiming)
  ];

  for (const suggestion of resourceCheck) {
    if (suggestion) checks.push(suggestion);
  }

  return checks.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return categoryOrder[a.category] - categoryOrder[b.category];
  });
}
