<script setup lang="ts">
import { Download, Loader2, FileText } from 'lucide-vue-next';
import { usePDFExport } from '../composables/usePDFExport';

const props = defineProps<{
  targetId: string;
  fileName?: string;
}>();

const { isExporting, exportToPDF } = usePDFExport();

async function handleClick() {
  try {
    await exportToPDF(props.targetId, props.fileName);
  } catch {
    alert('PDF 导出失败，请重试');
  }
}
</script>

<template>
  <button
    @click="handleClick"
    :disabled="isExporting"
    class="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
  >
    <Loader2 v-if="isExporting" class="w-5 h-5 animate-spin" />
    <FileText v-else class="w-5 h-5" />
    <span>{{ isExporting ? '导出中...' : '导出 PDF' }}</span>
    <Download class="w-4 h-4" />
  </button>
</template>
