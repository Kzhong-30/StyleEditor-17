<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import echarts, { type ECharts, type TooltipItemDataParam } from '../utils/echarts';
import type { NavigationTiming, ResourceItem, ResourceType } from '../types/performance';

interface NavWaterfallItem {
  name: string;
  startTime: number;
  duration: number;
  type: 'navigation';
}

interface ResourceWaterfallItem {
  name: string;
  startTime: number;
  duration: number;
  type: ResourceType;
  fullName: string;
  size: number;
  statusCode: number;
}

type WaterfallItem = NavWaterfallItem | ResourceWaterfallItem;

const props = defineProps<{
  navigationTiming: NavigationTiming | null;
  resources: ResourceItem[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chart: ECharts | null = null;

const typeColors: Record<string, string> = {
  navigation: '#3B82F6',
  css: '#EC4899',
  js: '#F59E0B',
  image: '#10B981',
  font: '#8B5CF6',
  xhr: '#06B6D4'
};

const typeNames: Record<string, string> = {
  navigation: '文档',
  css: 'CSS',
  js: 'JavaScript',
  image: '图片',
  font: '字体',
  xhr: 'XHR/Fetch'
};

function initChart() {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chart || !props.navigationTiming) return;

  const navItems: NavWaterfallItem[] = [
    { name: 'DNS 查询', startTime: 0, duration: props.navigationTiming.dnsLookup, type: 'navigation' },
    { name: 'TCP 连接', startTime: props.navigationTiming.dnsLookup, duration: props.navigationTiming.tcpConnect, type: 'navigation' },
    { name: 'SSL 握手', startTime: props.navigationTiming.dnsLookup + props.navigationTiming.tcpConnect, duration: props.navigationTiming.sslHandshake, type: 'navigation' },
    { name: 'TTFB', startTime: props.navigationTiming.dnsLookup + props.navigationTiming.tcpConnect + props.navigationTiming.sslHandshake, duration: props.navigationTiming.ttfb, type: 'navigation' },
    { name: 'DOM 解析', startTime: props.navigationTiming.dnsLookup + props.navigationTiming.tcpConnect + props.navigationTiming.sslHandshake + props.navigationTiming.ttfb, duration: props.navigationTiming.domParse, type: 'navigation' }
  ];

  const resourceItems: ResourceWaterfallItem[] = props.resources.map(r => ({
    name: r.name.length > 30 ? '...' + r.name.slice(-27) : r.name,
    startTime: r.startTime,
    duration: r.duration,
    type: r.type,
    fullName: r.name,
    size: r.size,
    statusCode: r.statusCode
  }));

  const allItems = [...navItems, ...resourceItems];
  const maxEndTime = Math.max(...allItems.map(item => item.startTime + item.duration));

  const yAxisData = allItems.map(item => item.name);
  const data = allItems.map((item, index) => [
    item.startTime,
    index,
    item.duration,
    item.type
  ]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(71, 85, 105, 0.5)',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: TooltipItemDataParam) => {
        const item: WaterfallItem = allItems[params.dataIndex];
        if (!item) return '';
        const typeInfo = typeNames[item.type] || item.type;
        const isResource = (i: WaterfallItem): i is ResourceWaterfallItem => i.type !== 'navigation';
        const sizeInfo = isResource(item) ? `<br/>大小: ${formatBytes(item.size)}` : '';
        const statusInfo = isResource(item) ? `<br/>状态码: ${item.statusCode}` : '';
        const displayName = isResource(item) ? item.fullName : item.name;
        return `
          <div style="font-weight: 600; margin-bottom: 8px;">${displayName}</div>
          <div>类型: ${typeInfo}</div>
          <div>开始: ${item.startTime.toFixed(0)}ms</div>
          <div>耗时: ${item.duration.toFixed(0)}ms${sizeInfo}${statusInfo}</div>
        `;
      }
    },
    grid: {
      left: 120,
      right: 40,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'value',
      max: maxEndTime + 100,
      axisLabel: {
        color: '#94a3b8',
        formatter: '{value}ms'
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.5)' } }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        color: '#e2e8f0',
        fontSize: 11,
        width: 110,
        overflow: 'truncate'
      },
      axisLine: { show: false },
      splitLine: { show: false }
    },
    series: [{
      type: 'custom',
      renderItem: (params, api) => {
        const categoryIndex = api.value(1) as number;
        const start = api.coord([api.value(0), categoryIndex]);
        const end = api.coord([(api.value(0) as number) + (api.value(2) as number), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;
        const type = api.value(3) as string;
        const color = typeColors[type] || '#64748b';

        return {
          type: 'rect',
          shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: Math.max(end[0] - start[0], 2),
            height: height
          },
          style: {
            fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: color },
              { offset: 1, color: color + '80' }
            ]),
            stroke: color,
            lineWidth: 1,
            borderRadius: 3
          }
        };
      },
      encode: {
        x: [0, 2],
        y: 1
      },
      data: data,
      animationDuration: 800,
      animationEasing: 'quarticOut'
    }]
  };

  chart.setOption(option);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleResize() {
  chart?.resize();
}

watch(() => [props.navigationTiming, props.resources], () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
});
</script>

<template>
  <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-white">加载时间瀑布图</h3>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="(color, type) in typeColors"
          :key="type"
          class="flex items-center gap-2"
        >
          <div
            class="w-3 h-3 rounded"
            :style="{ backgroundColor: color }"
          ></div>
          <span class="text-xs text-slate-400">{{ typeNames[type] }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="w-full h-96"></div>
  </div>
</template>
