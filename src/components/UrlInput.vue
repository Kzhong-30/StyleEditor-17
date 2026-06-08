<script setup lang="ts">
import { ref } from 'vue';
import { Search, Loader2 } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'analyze', url: string): void;
}>();

const url = ref('');
const isLoading = ref(false);
const error = ref('');

function validateUrl(input: string): boolean {
  if (!input.trim()) {
    error.value = '请输入网址';
    return false;
  }
  try {
    new URL(input.startsWith('http') ? input : `https://${input}`);
    error.value = '';
    return true;
  } catch {
    error.value = '请输入有效的网址';
    return false;
  }
}

async function handleAnalyze() {
  if (!validateUrl(url.value)) return;

  isLoading.value = true;
  const targetUrl = url.value.startsWith('http') ? url.value : `https://${url.value}`;

  await new Promise(resolve => setTimeout(resolve, 1500));

  emit('analyze', targetUrl);
  isLoading.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleAnalyze();
  }
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto">
    <div class="relative">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50"></div>
      <div class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
        <div class="flex items-center gap-3">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              v-model="url"
              type="text"
              placeholder="输入网址，例如：example.com"
              class="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-mono text-sm"
              :class="{ 'border-red-500/50': error }"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
          <button
            @click="handleAnalyze"
            :disabled="isLoading"
            class="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span v-else>开始分析</span>
          </button>
        </div>
        <div v-if="error" class="mt-2 pl-4 text-red-400 text-sm">
          {{ error }}
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <span class="text-slate-500 text-sm">示例：</span>
      <button
        v-for="example in ['example.com', 'github.com', 'stackoverflow.com']"
        :key="example"
        @click="url = example"
        class="px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
      >
        {{ example }}
      </button>
    </div>
  </div>
</template>
