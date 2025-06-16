/**
 * Line Chart Component
 * Reusable line chart for analytics data
 */

import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface LineChartProps {
  data: Array<Record<string, any>>
  lines: Array<{
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  formatTooltip?: (value: any, name: string) => [string, string]
  formatXAxis?: (value: any) => string
  formatYAxis?: (value: any) => string
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
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
    if (typeof value === 'string' && value.includes('-')) {
      // Format date strings
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return value
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
        
        <XAxis 
          dataKey={xAxisKey}
          tickFormatter={formatXAxis || defaultAxisFormatter}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        
        <YAxis 
          tickFormatter={formatYAxis}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        
        <Tooltip
          formatter={formatTooltip || defaultTooltipFormatter}
          labelFormatter={formatXAxis || defaultAxisFormatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        {showLegend && <Legend />}
        
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export default LineChart
