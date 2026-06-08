<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Image, FileCode, FileText, Type, Globe,
  ArrowUpDown, ChevronDown, ChevronUp, Filter
} from 'lucide-vue-next';
import type { ResourceItem, ResourceType } from '../types/performance';

const props = defineProps<{
  resources: ResourceItem[];
}>();

const sortField = ref<keyof ResourceItem>('startTime');
const sortDirection = ref<'asc' | 'desc'>('asc');
const filterType = ref<ResourceType | 'all'>('all');

const typeIcons: Record<ResourceType, any> = {
  image: Image,
  js: FileCode,
  css: FileText,
  font: Type,
  xhr: Globe
};

const typeColors: Record<ResourceType, string> = {
  image: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  js: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  css: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  font: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  xhr: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

const typeNames: Record<ResourceType, string> = {
  image: '图片',
  js: 'JavaScript',
  css: 'CSS',
  font: '字体',
  xhr: 'XHR/Fetch'
};

const filteredAndSortedResources = computed(() => {
  let result = [...props.resources];

  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value);
  }

  result.sort((a, b) => {
    const aVal = a[sortField.value];
    const bVal = b[sortField.value];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });

  return result;
});

const resourceStats = computed(() => {
  const stats: Record<ResourceType, { count: number; size: number }> = {
    image: { count: 0, size: 0 },
    js: { count: 0, size: 0 },
    css: { count: 0, size: 0 },
    font: { count: 0, size: 0 },
    xhr: { count: 0, size: 0 }
  };

  props.resources.forEach(r => {
    stats[r.type].count++;
    stats[r.type].size += r.size;
  });

  return stats;
});

function toggleSort(field: keyof ResourceItem) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return '...' + url.slice(-maxLength + 3);
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-emerald-400';
  if (code >= 300 && code < 400) return 'text-amber-400';
  return 'text-red-400';
}
</script>

<template>
  <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h3 class="text-lg font-semibold text-white">资源加载列表</h3>
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-slate-400" />
        <div class="flex gap-1">
          <button
            @click="filterType = 'all'"
            class="px-3 py-1.5 text-xs rounded-lg transition-colors"
            :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'"
          >
            全部
          </button>
          <button
            v-for="(name, type) in typeNames"
            :key="type"
            @click="filterType = type as ResourceType"
            class="px-3 py-1.5 text-xs rounded-lg transition-colors"
            :class="filterType === type ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'"
          >
            {{ name }} ({{ resourceStats[type as ResourceType].count }})
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div
        v-for="(stats, type) in resourceStats"
        :key="type"
        class="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <component :is="typeIcons[type as ResourceType]" class="w-4 h-4" :class="typeColors[type as ResourceType].split(' ')[1]" />
          <span class="text-sm text-slate-400">{{ typeNames[type as ResourceType] }}</span>
        </div>
        <div class="text-lg font-semibold text-white">{{ stats.count }}</div>
        <div class="text-xs text-slate-500">{{ formatBytes(stats.size) }}</div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-700/50">
            <th class="pb-3 pr-4 font-medium">资源</th>
            <th class="pb-3 pr-4 font-medium">类型</th>
            <th
              class="pb-3 pr-4 font-medium cursor-pointer hover:text-white transition-colors"
              @click="toggleSort('size')"
            >
              <div class="flex items-center gap-1">
                大小
                <span v-if="sortField === 'size'">
                  <ChevronUp v-if="sortDirection === 'asc'" class="w-4 h-4" />
                  <ChevronDown v-else class="w-4 h-4" />
                </span>
                <ArrowUpDown v-else class="w-4 h-4 opacity-50" />
              </div>
            </th>
            <th
              class="pb-3 pr-4 font-medium cursor-pointer hover:text-white transition-colors"
              @click="toggleSort('duration')"
            >
              <div class="flex items-center gap-1">
                加载时间
                <span v-if="sortField === 'duration'">
                  <ChevronUp v-if="sortDirection === 'asc'" class="w-4 h-4" />
                  <ChevronDown v-else class="w-4 h-4" />
                </span>
                <ArrowUpDown v-else class="w-4 h-4 opacity-50" />
              </div>
            </th>
            <th class="pb-3 font-medium">状态码</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700/30">
          <tr
            v-for="resource in filteredAndSortedResources"
            :key="resource.id"
            class="group hover:bg-slate-700/30 transition-colors"
          >
            <td class="py-3 pr-4">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg border" :class="typeColors[resource.type]">
                  <component :is="typeIcons[resource.type]" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-white font-medium truncate max-w-xs" :title="resource.name">
                    {{ resource.name }}
                  </div>
                  <div class="text-slate-500 text-xs truncate max-w-xs" :title="resource.url">
                    {{ truncateUrl(resource.url) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="py-3 pr-4">
              <span class="px-2 py-1 text-xs rounded" :class="typeColors[resource.type]">
                {{ typeNames[resource.type] }}
              </span>
            </td>
            <td class="py-3 pr-4 text-slate-300 font-mono">
              {{ formatBytes(resource.size) }}
            </td>
            <td class="py-3 pr-4 text-slate-300 font-mono">
              {{ resource.duration.toFixed(0) }}ms
            </td>
            <td class="py-3">
              <span :class="getStatusColor(resource.statusCode)" class="font-mono">
                {{ resource.statusCode }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
