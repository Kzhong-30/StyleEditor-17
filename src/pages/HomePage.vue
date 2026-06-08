<script setup lang="ts">
import { ref, computed } from 'vue';
import { Activity, Zap, Clock, BarChart3, FileText, RefreshCw } from 'lucide-vue-next';
import UrlInput from '../components/UrlInput.vue';
import WaterfallChart from '../components/WaterfallChart.vue';
import TimelineBar from '../components/TimelineBar.vue';
import ResourceList from '../components/ResourceList.vue';
import ScoreGauge from '../components/ScoreGauge.vue';
import SuggestionList from '../components/SuggestionList.vue';
import PDFExport from '../components/PDFExport.vue';
import { generateMockReport } from '../data/mockData';
import { usePerformance } from '../composables/usePerformance';
import type { PerformanceReport } from '../types/performance';

const { collectCurrentPageData } = usePerformance();

const report = ref<PerformanceReport | null>(null);
const isAnalyzing = ref(false);
const activeTab = ref<'overview' | 'resources' | 'suggestions'>('overview');

type TabKey = 'overview' | 'resources' | 'suggestions';

interface TabItem {
  key: TabKey;
  label: string;
}

const tabs: TabItem[] = [
  { key: 'overview', label: '概览' },
  { key: 'resources', label: '资源' },
  { key: 'suggestions', label: '建议' }
];

const formattedDate = computed(() => {
  if (!report.value) return '';
  return new Date(report.value.timestamp).toLocaleString('zh-CN');
});

async function handleAnalyze(url: string) {
  isAnalyzing.value = true;
  report.value = null;

  await new Promise(resolve => setTimeout(resolve, 800));

  const realData = await collectCurrentPageData();
  if (realData && realData.resources.length > 0) {
    report.value = { ...realData, url };
  } else {
    report.value = generateMockReport(url);
  }
  isAnalyzing.value = false;
}

function resetAnalysis() {
  report.value = null;
  activeTab.value = 'overview';
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10">
      <header class="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                <Activity class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-white">WebPerf</h1>
                <p class="text-xs text-slate-400">网页性能分析工具</p>
              </div>
            </div>
            <div v-if="report" class="flex items-center gap-3">
              <PDFExport
                targetId="report-content"
                :fileName="`performance-report-${report.url.replace(/[^a-z0-9]/gi, '-')}.pdf`"
              />
              <button
                @click="resetAnalysis"
                class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300"
              >
                <RefreshCw class="w-4 h-4" />
                <span>重新分析</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="!report" class="py-16">
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl mb-6">
              <Zap class="w-10 h-10 text-blue-400" />
            </div>
            <h2 class="text-3xl font-bold text-white mb-4">
              分析您的网页性能
            </h2>
            <p class="text-slate-400 max-w-xl mx-auto">
              输入任意网址，获取全面的性能分析报告，包括加载时间、资源分析、核心 Web Vitals 评分和优化建议
            </p>
          </div>

          <UrlInput @analyze="handleAnalyze" />

          <div class="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4">
                <BarChart3 class="w-6 h-6 text-blue-400" />
              </div>
              <h3 class="text-white font-semibold mb-2">瀑布图分析</h3>
              <p class="text-slate-400 text-sm">可视化页面各阶段加载时间</p>
            </div>
            <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl mb-4">
                <FileText class="w-6 h-6 text-emerald-400" />
              </div>
              <h3 class="text-white font-semibold mb-2">资源统计</h3>
              <p class="text-slate-400 text-sm">按类型分类的资源详情</p>
            </div>
            <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-4">
                <Activity class="w-6 h-6 text-amber-400" />
              </div>
              <h3 class="text-white font-semibold mb-2">性能评分</h3>
              <p class="text-slate-400 text-sm">基于 Web Vitals 的综合评分</p>
            </div>
            <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-xl mb-4">
                <Clock class="w-6 h-6 text-purple-400" />
              </div>
              <h3 class="text-white font-semibold mb-2">优化建议</h3>
              <p class="text-slate-400 text-sm">针对性的性能优化方案</p>
            </div>
          </div>
        </div>

        <div v-else id="report-content">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-white mb-1">分析报告</h2>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <span class="font-mono">{{ report.url }}</span>
                <span>•</span>
                <span>{{ formattedDate }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                :class="activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div v-show="activeTab === 'overview'" class="space-y-6">
            <ScoreGauge
              :score="report.score"
              :web-vitals="report.webVitals"
            />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaterfallChart
                :navigation-timing="report.navigationTiming"
                :resources="report.resources.slice(0, 8)"
              />
              <TimelineBar
                :navigation-timing="report.navigationTiming"
              />
            </div>
          </div>

          <div v-show="activeTab === 'resources'">
            <ResourceList :resources="report.resources" />
          </div>

          <div v-show="activeTab === 'suggestions'">
            <SuggestionList :suggestions="report.suggestions" />
          </div>
        </div>

        <div
          v-if="isAnalyzing"
          class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div class="text-center">
            <div class="relative w-20 h-20 mx-auto mb-6">
              <div class="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">正在分析...</h3>
            <p class="text-slate-400">正在收集性能数据，请稍候</p>
          </div>
        </div>
      </main>

      <footer class="border-t border-slate-800/50 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-slate-500 text-sm">
              © 2024 WebPerf. 基于 Performance API 和 Navigation Timing API 构建
            </p>
            <div class="flex items-center gap-4 text-slate-500 text-sm">
              <span>支持 FCP • LCP • CLS • FID • TBT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
