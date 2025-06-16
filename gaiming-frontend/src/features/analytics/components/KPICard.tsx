/**
 * KPI Card Component
 * Displays key performance indicators with trends
 */

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import type { KPI } from '../types'

interface KPICardProps {
  kpi: KPI
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  showDescription?: boolean
}

const KPICard: React.FC<KPICardProps> = ({
  kpi,
  size = 'md',
  showTrend = true,
  showDescription = false
}) => {
  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
    
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    
    if (unit === 'players' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    
    return value.toLocaleString()
  }

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (kpi.trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityColor = () => {
    switch (kpi.priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      default:
        return 'border-l-blue-500'
    }
  }

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const textSizes = {
    sm: {
      value: 'text-lg',
      name: 'text-sm',
      trend: 'text-xs'
    },
    md: {
      value: 'text-2xl',
      name: 'text-base',
      trend: 'text-sm'
    },
    lg: {
      value: 'text-3xl',
      name: 'text-lg',
      trend: 'text-base'
    }
  }

  const progressPercentage = Math.min((kpi.value / kpi.target) * 100, 100)

  return (
    <Card className={`border-l-4 ${getPriorityColor()}`}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`font-bold text-gray-900 dark:text-white ${textSizes[size].value}`}>
              {formatValue(kpi.value, kpi.unit)}
            </div>
            <div className={`text-gray-600 dark:text-gray-300 font-medium ${textSizes[size].name}`}>
              {kpi.name}
            </div>
            {showDescription && (
              <div className="text-gray-500 text-xs mt-1">
                {kpi.description}
              </div>
            )}
          </div>
          
          {showTrend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`font-medium ${getTrendColor()} ${textSizes[size].trend}`}>
                {Math.abs(kpi.trendPercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Progress bar towards target */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{formatValue(kpi.target, kpi.unit)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage >= 100 
                  ? 'bg-green-500' 
                  : progressPercentage >= 80 
                    ? 'bg-blue-500' 
                    : progressPercentage >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {progressPercentage.toFixed(1)}% of target
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default KPICard
