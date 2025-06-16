import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartData[];
  bars: {
    dataKey: string;
    fill: string;
    name?: string;
    stackId?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any, name: string) => [string, string];
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisKey = 'name',
  formatXAxis,
  formatYAxis,
  formatTooltip,
  className = '',
  layout = 'vertical',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data} 
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
          )}
          <XAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? xAxisKey : undefined}
            tickFormatter={formatXAxis}
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'horizontal' ? xAxisKey : undefined}
            tickFormatter={formatYAxis}
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          {showTooltip && (
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
                color: 'var(--tooltip-text)',
              }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{
                color: 'var(--legend-text)',
              }}
            />
          )}
          {bars.map((bar, _index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name || bar.dataKey}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
