import * as echarts from 'echarts/core';
import { BarChart, LineChart, GaugeChart, CustomChart, RadarChart } from 'echarts/charts';
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
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  CanvasRenderer
]);

export default echarts;
export type ECharts = ReturnType<typeof echarts.init>;

export interface TooltipDataParam {
  name: string;
  value: number | number[];
  data?: unknown;
  dataIndex: number;
  seriesIndex: number;
  marker: string;
  axisValueLabel: string;
  axisType: string;
  axisId: string;
  axisIndex: number;
  seriesName: string;
  seriesType: string;
  color: string;
  borderColor: string;
  $vars: string[];
}
