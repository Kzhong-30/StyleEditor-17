<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import echarts, { type ECharts } from '../utils/echarts';
import { TrendingUp, Clock, Activity, Monitor, Zap } from 'lucide-vue-next';
import type { PerformanceScore, WebVitals, MetricKey } from '../types/performance';
import { getMetricShortName, getMetricName, formatMetricValue } from '../utils/scoreCalculator';
import { useChartAnimation } from '../composables/useChartAnimation';

const props = defineProps<{
  score: PerformanceScore | null;
  webVitals: WebVitals | null;
}>();

const radarChartRef = ref<HTMLDivElement | null>(null);
let radarChart: ECharts | null = null;
const { animatedValue: animatedScore, animateTo: animateScore } = useChartAnimation(1500);

const overallScoreColor = computed(() => {
  if (!props.score) return '#64748b';
  if (props.score.overall >= 90) return '#10B981';
  if (props.score.overall >= 50) return '#F59E0B';
  return '#EF4444';
});

const overallScoreLabel = computed(() => {
  if (!props.score) return '';
  if (props.score.overall >= 90) return '优秀';
  if (props.score.overall >= 50) return '良好';
  return '较差';
});

const metricIcons: Record<MetricKey, typeof TrendingUp> = {
  fcp: Clock,
  lcp: Monitor,
  cls: Activity,
  fid: Zap,
  tbt: TrendingUp
};

function getLabelColor(label: string): string {
  switch (label) {
    case 'good': return 'text-emerald-400';
    case 'needs-improvement': return 'text-amber-400';
    case 'poor': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

function getBarColor(label: string): string {
  switch (label) {
    case 'good': return 'bg-emerald-500';
    case 'needs-improvement': return 'bg-amber-500';
    case 'poor': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
}

function initRadarChart() {
  if (!radarChartRef.value) return;

  radarChart = echarts.init(radarChartRef.value);
  updateRadarChart();
}

function updateRadarChart() {
  if (!radarChart || !props.score || !props.webVitals) return;

  const indicators = [
    { name: 'FCP', max: 100 },
    { name: 'LCP', max: 100 },
    { name: 'CLS', max: 100 },
    { name: 'FID', max: 100 },
    { name: 'TBT', max: 100 }
  ];

  const values = [
    props.score.fcp.score,
    props.score.lcp.score,
    props.score.cls.score,
    props.score.fid.score,
    props.score.tbt.score
  ];

  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 500
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(71, 85, 105, 0.5)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(30, 41, 59, 0.3)', 'rgba(30, 41, 59, 0.5)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(71, 85, 105, 0.5)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: '性能评分',
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.6)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#3B82F6',
          width: 2
        },
        itemStyle: {
          color: '#3B82F6'
        }
      }],
      animationDuration: 1000,
      animationEasing: 'quarticOut'
    }]
  };

  radarChart.setOption(option);
}

function handleResize() {
  radarChart?.resize();
}

watch(() => props.score, (newScore) => {
  if (newScore) {
    animateScore(newScore.overall);
  }
  updateRadarChart();
}, { deep: true });

onMounted(() => {
  initRadarChart();
  if (props.score) {
    animateScore(props.score.overall);
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  radarChart?.dispose();
});
</script>

<template>
  <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
    <h3 class="text-lg font-semibold text-white mb-6">性能评分</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="flex flex-col items-center">
        <div class="relative w-48 h-48 mb-4">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(71, 85, 105, 0.3)"
              stroke-width="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              :stroke="overallScoreColor"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="251.2"
              :stroke-dashoffset="251.2 - (animatedScore / 100) * 251.2"
              class="transition-all duration-1000"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-5xl font-bold" :style="{ color: overallScoreColor }">
              {{ animatedScore }}
            </span>
            <span class="text-sm" :style="{ color: overallScoreColor }">
              {{ overallScoreLabel }}
            </span>
          </div>
        </div>
        <div class="text-slate-400 text-sm">综合性能得分</div>
      </div>

      <div>
        <div ref="radarChartRef" class="w-full h-56"></div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div
        v-for="key in (['fcp', 'lcp', 'cls', 'fid', 'tbt'] as const)"
        :key="key"
        class="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <div class="p-1.5 rounded-lg bg-slate-800">
            <component :is="metricIcons[key]" class="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div class="text-xs text-slate-400">{{ getMetricShortName(key) }}</div>
            <div class="text-xs text-slate-500">{{ getMetricName(key) }}</div>
          </div>
        </div>
        <div class="flex items-baseline gap-2 mb-2">
          <span class="text-xl font-bold text-white font-mono">
            {{ webVitals ? formatMetricValue(key, webVitals[key]) : '-' }}
          </span>
          <span v-if="score" :class="getLabelColor(score[key].label)" class="text-xs">
            {{ score[key].label === 'good' ? '优秀' : score[key].label === 'needs-improvement' ? '待改进' : '较差' }}
          </span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            v-if="score"
            class="h-full rounded-full transition-all duration-1000"
            :class="getBarColor(score[key].label)"
            :style="{ width: `${score[key].score}%` }"
          ></div>
        </div>
        <div class="mt-1 text-right text-xs text-slate-500">
          {{ score ? score[key].score : 0 }} / 100
        </div>
      </div>
    </div>
  </div>
</template>
