/**
 * Pie Chart Component
 * Reusable pie chart for analytics data
 */

import React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showLegend?: boolean
  showLabels?: boolean
  innerRadius?: number
  outerRadius?: number
  formatTooltip?: (value: any, name: string) => [string, string]
  colors?: string[]
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 80,
  formatTooltip,
  colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
}) => {
  const defaultTooltipFormatter = (value: any, name: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const percentage = ((value / total) * 100).toFixed(1)
    return [`${value.toLocaleString()} (${percentage}%)`, name]
  }

  const renderLabel = (entry: any) => {
    if (!showLabels) return null
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const percentage = ((entry.value / total) * 100).toFixed(1)
    return `${percentage}%`
  }

  // Assign colors to data
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length]
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        
        <Tooltip
          formatter={formatTooltip || defaultTooltipFormatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        {showLegend && (
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export default PieChart
