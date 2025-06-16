/**
 * Bar Chart Component
 * Reusable bar chart for analytics data
 */

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface BarChartProps {
  data: Array<Record<string, any>>
  bars: Array<{
    dataKey: string
    name: string
    color: string
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  orientation?: 'vertical' | 'horizontal'
  formatTooltip?: (value: any, name: string) => [string, string]
  formatXAxis?: (value: any) => string
  formatYAxis?: (value: any) => string
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  orientation = 'vertical',
  formatTooltip,
  formatXAxis,
  formatYAxis
}) => {
  const defaultTooltipFormatter = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name]
    }
    return [value, name]
  }

  const defaultAxisFormatter = (value: any) => {
    if (typeof value === 'string' && value.length > 10) {
      return value.substring(0, 10) + '...'
    }
    return value
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart 
        data={data} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
        
        <XAxis 
          dataKey={orientation === 'horizontal' ? undefined : xAxisKey}
          type={orientation === 'horizontal' ? 'number' : 'category'}
          tickFormatter={formatXAxis || defaultAxisFormatter}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        
        <YAxis 
          dataKey={orientation === 'horizontal' ? xAxisKey : undefined}
          type={orientation === 'horizontal' ? 'category' : 'number'}
          tickFormatter={formatYAxis || (orientation === 'horizontal' ? defaultAxisFormatter : undefined)}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        
        <Tooltip
          formatter={formatTooltip || defaultTooltipFormatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        {showLegend && <Legend />}
        
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart
