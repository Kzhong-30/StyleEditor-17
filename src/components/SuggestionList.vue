<script setup lang="ts">
import { ref } from 'vue';
import {
  ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info,
  Image, Code, FileText, Globe, Monitor
} from 'lucide-vue-next';
import type { OptimizationSuggestion, SuggestionPriority, SuggestionCategory } from '../types/performance';

const props = defineProps<{
  suggestions: OptimizationSuggestion[];
}>();

const expandedItems = ref<Set<string>>(new Set());

const priorityConfig: Record<SuggestionPriority, { icon: any; color: string; bgColor: string; label: string }> = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    label: '高优先级'
  },
  medium: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    label: '中优先级'
  },
  low: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    label: '低优先级'
  }
};

const categoryConfig: Record<SuggestionCategory, { icon: any; color: string; label: string }> = {
  images: {
    icon: Image,
    color: 'text-emerald-400',
    label: '图片优化'
  },
  javascript: {
    icon: Code,
    color: 'text-amber-400',
    label: 'JavaScript'
  },
  css: {
    icon: FileText,
    color: 'text-pink-400',
    label: 'CSS'
  },
  network: {
    icon: Globe,
    color: 'text-cyan-400',
    label: '网络'
  },
  rendering: {
    icon: Monitor,
    color: 'text-purple-400',
    label: '渲染'
  }
};

function toggleExpand(id: string) {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id);
  } else {
    expandedItems.value.add(id);
  }
}

const sortedSuggestions = ref([...props.suggestions].sort((a, b) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
}));

const priorityCounts = {
  high: props.suggestions.filter(s => s.priority === 'high').length,
  medium: props.suggestions.filter(s => s.priority === 'medium').length,
  low: props.suggestions.filter(s => s.priority === 'low').length
};
</script>

<template>
  <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h3 class="text-lg font-semibold text-white">优化建议</h3>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span class="text-sm text-slate-400">高: {{ priorityCounts.high }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span class="text-sm text-slate-400">中: {{ priorityCounts.medium }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span class="text-sm text-slate-400">低: {{ priorityCounts.low }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="suggestion in sortedSuggestions"
        :key="suggestion.id"
        class="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600"
      >
        <button
          @click="toggleExpand(suggestion.id)"
          class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div class="flex items-start gap-4 flex-1">
            <div class="p-2 rounded-lg border" :class="priorityConfig[suggestion.priority].bgColor">
              <component
                :is="priorityConfig[suggestion.priority].icon"
                class="w-5 h-5"
                :class="priorityConfig[suggestion.priority].color"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h4 class="text-white font-medium">{{ suggestion.title }}</h4>
                <span
                  class="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                  :class="priorityConfig[suggestion.priority].bgColor"
                >
                  {{ priorityConfig[suggestion.priority].label }}
                </span>
                <span
                  class="px-2 py-0.5 text-xs rounded-full bg-slate-800 flex items-center gap-1"
                >
                  <component
                    :is="categoryConfig[suggestion.category].icon"
                    class="w-3 h-3"
                    :class="categoryConfig[suggestion.category].color"
                  />
                  <span class="text-slate-400">{{ categoryConfig[suggestion.category].label }}</span>
                </span>
              </div>
              <p class="text-slate-400 text-sm line-clamp-1">
                {{ suggestion.description }}
              </p>
            </div>
          </div>
          <div class="ml-4 flex items-center gap-3">
            <div v-if="suggestion.savings" class="text-right">
              <div class="text-xs text-slate-500">预估节省</div>
              <div class="text-sm font-medium text-emerald-400">{{ suggestion.savings }}</div>
            </div>
            <ChevronDown
              v-if="!expandedItems.has(suggestion.id)"
              class="w-5 h-5 text-slate-400"
            />
            <ChevronUp
              v-else
              class="w-5 h-5 text-slate-400"
            />
          </div>
        </button>

        <div
          v-show="expandedItems.has(suggestion.id)"
          class="px-4 pb-4 pl-16"
        >
          <div class="pt-4 border-t border-slate-700/50">
            <p class="text-slate-300 text-sm leading-relaxed mb-3">
              {{ suggestion.description }}
            </p>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-slate-500">影响范围:</span>
                <span class="text-slate-300">{{ suggestion.impact }}</span>
              </div>
              <div v-if="suggestion.savings" class="flex items-center gap-2">
                <span class="text-slate-500">预估性能提升:</span>
                <span class="text-emerald-400 font-medium">{{ suggestion.savings }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
