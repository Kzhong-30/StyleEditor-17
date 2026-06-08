import * as echarts from 'echarts/core';
import { BarChart, LineChart, GaugeChart, CustomChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  GaugeChart,
  CustomChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  CanvasRenderer
]);

export default echarts;
export type ECharts = ReturnType<typeof echarts.init>;
