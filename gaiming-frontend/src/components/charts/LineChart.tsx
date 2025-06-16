import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  lines: {
    dataKey: string;
    stroke: string;
    name?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
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
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisKey = 'name',
  formatXAxis,
  formatYAxis,
  formatTooltip,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis
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
          {lines.map((line, _index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              name={line.name || line.dataKey}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
