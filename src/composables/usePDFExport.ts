import { ref } from 'vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function usePDFExport() {
  const isExporting = ref(false);

  async function exportToPDF(targetId: string, fileName?: string): Promise<void> {
    if (isExporting.value) return;

    isExporting.value = true;

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error('未找到导出目标元素');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0F172A',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      const pageHeight = imgHeight * ratio;
      let heightLeft = pageHeight;
      let position = imgY;

      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, pageHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, pageHeight);
        heightLeft -= pdfHeight;
      }

      const outputName = fileName || `performance-report-${Date.now()}.pdf`;
      pdf.save(outputName);
    } catch (error) {
      console.error('PDF 导出失败:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  }

  return { isExporting, exportToPDF };
}
