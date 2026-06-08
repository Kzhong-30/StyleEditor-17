<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import echarts, { type ECharts, type TooltipAxisDataParam } from '../utils/echarts';
import type { NavigationTiming } from '../types/performance';

const props = defineProps<{
  navigationTiming: NavigationTiming | null;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chart: ECharts | null = null;

const phaseNames: Record<keyof NavigationTiming, string> = {
  dnsLookup: 'DNS 查询',
  tcpConnect: 'TCP 连接',
  sslHandshake: 'SSL 握手',
  ttfb: 'TTFB',
  domParse: 'DOM 解析',
  resourceLoad: '资源加载',
  domContentLoaded: 'DOM Ready',
  loadEvent: '页面加载'
};

const phaseColors: Record<keyof NavigationTiming, string> = {
  dnsLookup: '#3B82F6',
  tcpConnect: '#8B5CF6',
  sslHandshake: '#EC4899',
  ttfb: '#F59E0B',
  domParse: '#10B981',
  resourceLoad: '#06B6D4',
  domContentLoaded: '#6366F1',
  loadEvent: '#14B8A6'
};

function initChart() {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chart || !props.navigationTiming) return;

  const keys: (keyof NavigationTiming)[] = [
    'dnsLookup', 'tcpConnect', 'sslHandshake', 'ttfb',
    'domParse', 'resourceLoad', 'domContentLoaded', 'loadEvent'
  ];

  const data = keys.map(key => ({
    name: phaseNames[key],
    value: props.navigationTiming![key],
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: phaseColors[key] },
        { offset: 1, color: phaseColors[key] + '60' }
      ]),
      borderRadius: [0, 6, 6, 0]
    }
  }));

  const total = keys.reduce((sum, key) => sum + props.navigationTiming![key], 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(71, 85, 105, 0.5)',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: TooltipAxisDataParam[]) => {
        const item = params[0];
        const val = typeof item.value === 'number' ? item.value : 0;
        const percentage = ((val / total) * 100).toFixed(1);
        return `
          <div style="font-weight: 600; margin-bottom: 8px;">${item.name}</div>
          <div>耗时: ${val.toFixed(0)}ms</div>
          <div>占比: ${percentage}%</div>
        `;
      }
    },
    grid: {
      left: 100,
      right: 60,
      top: 20,
      bottom: 20
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94a3b8',
        formatter: '{value}ms'
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.5)' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: {
        color: '#e2e8f0',
        fontSize: 12
      },
      axisLine: { show: false },
      splitLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: data,
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        color: '#94a3b8',
        formatter: '{c}ms',
        fontSize: 11
      },
      animationDuration: 800,
      animationEasing: 'quarticOut',
      animationDelay: (idx: number) => idx * 50
    }]
  };

  chart.setOption(option);
}

function handleResize() {
  chart?.resize();
}

watch(() => props.navigationTiming, () => {
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
    <h3 class="text-lg font-semibold text-white mb-6">各阶段耗时</h3>
    <div ref="chartRef" class="w-full h-80"></div>
  </div>
</template>
