import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Target, Filter } from 'lucide-react';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, players: 1200, sessions: 8500 },
  { month: 'Feb', revenue: 52000, players: 1350, sessions: 9200 },
  { month: 'Mar', revenue: 48000, players: 1280, sessions: 8800 },
  { month: 'Apr', revenue: 61000, players: 1450, sessions: 10200 },
  { month: 'May', revenue: 58000, players: 1380, sessions: 9800 },
  { month: 'Jun', revenue: 67000, players: 1520, sessions: 11000 },
  { month: 'Jul', revenue: 72000, players: 1680, sessions: 12500 },
  { month: 'Aug', revenue: 69000, players: 1590, sessions: 11800 },
  { month: 'Sep', revenue: 75000, players: 1720, sessions: 13200 },
  { month: 'Oct', revenue: 78000, players: 1850, sessions: 14000 },
  { month: 'Nov', revenue: 82000, players: 1920, sessions: 14800 },
  { month: 'Dec', revenue: 89000, players: 2100, sessions: 16200 }
];

const gameTypeData = [
  { name: 'Slots', value: 65, revenue: 450000, color: '#8884d8' },
  { name: 'Table Games', value: 20, revenue: 180000, color: '#82ca9d' },
  { name: 'Live Casino', value: 10, revenue: 120000, color: '#ffc658' },
  { name: 'Progressive', value: 5, revenue: 80000, color: '#ff7300' }
];

const providerPerformanceData = [
  { provider: 'NetEnt', games: 156, revenue: 456789, players: 23456, rtp: 96.2, score: 8.7 },
  { provider: 'Microgaming', games: 234, revenue: 398765, players: 19876, rtp: 95.8, score: 8.4 },
  { provider: 'Play\'n GO', games: 189, revenue: 345678, players: 18765, rtp: 96.1, score: 8.1 },
  { provider: 'Pragmatic', games: 145, revenue: 298765, players: 16543, rtp: 95.9, score: 7.9 },
  { provider: 'Evolution', games: 67, revenue: 234567, players: 12345, rtp: 97.1, score: 8.9 }
];

const playerBehaviorData = [
  { hour: '00:00', players: 120, sessions: 85, avgBet: 2.5 },
  { hour: '02:00', players: 95, sessions: 68, avgBet: 3.2 },
  { hour: '04:00', players: 75, sessions: 52, avgBet: 2.8 },
  { hour: '06:00', players: 110, sessions: 78, avgBet: 2.1 },
  { hour: '08:00', players: 180, sessions: 125, avgBet: 1.8 },
  { hour: '10:00', players: 220, sessions: 165, avgBet: 2.2 },
  { hour: '12:00', players: 280, sessions: 210, avgBet: 2.6 },
  { hour: '14:00', players: 320, sessions: 245, avgBet: 2.9 },
  { hour: '16:00', players: 380, sessions: 290, avgBet: 3.1 },
  { hour: '18:00', players: 450, sessions: 350, avgBet: 3.5 },
  { hour: '20:00', players: 520, sessions: 420, avgBet: 4.2 },
  { hour: '22:00', players: 480, sessions: 385, avgBet: 3.8 }
];

const gamePerformanceRadar = [
  { metric: 'Revenue', value: 85, fullMark: 100 },
  { metric: 'Players', value: 78, fullMark: 100 },
  { metric: 'Retention', value: 92, fullMark: 100 },
  { metric: 'RTP', value: 88, fullMark: 100 },
  { metric: 'Popularity', value: 76, fullMark: 100 },
  { metric: 'Engagement', value: 82, fullMark: 100 }
];

interface GameAnalyticsChartsProps {
  gameId?: number;
  timeRange?: string;
}

const GameAnalyticsCharts: React.FC<GameAnalyticsChartsProps> = ({ gameId, timeRange = '30d' }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {[
            { id: 'revenue', label: 'Revenue Trends', icon: DollarSign },
            { id: 'players', label: 'Player Analytics', icon: Users },
            { id: 'performance', label: 'Game Performance', icon: Target },
            { id: 'behavior', label: 'Player Behavior', icon: TrendingUp }
          ].map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === chart.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {chart.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Revenue Trends Chart */}
      {activeChart === 'revenue' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Player Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="players"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Players"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Player Analytics */}
      {activeChart === 'players' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Type Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gameTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gameTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Behavior by Hour</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerBehaviorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="players"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Active Players"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Game Performance */}
      {activeChart === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Performance Radar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={gamePerformanceRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Player Behavior */}
      {activeChart === 'behavior' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Engagement vs Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={providerPerformanceData}>
                <CartesianGrid />
                <XAxis dataKey="players" name="Players" />
                <YAxis dataKey="revenue" name="Revenue" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900">{data.provider}</p>
                          <p className="text-sm text-gray-600">Players: {data.players.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Revenue: ${data.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Games: {data.games}</p>
                          <p className="text-sm text-gray-600">Score: {data.score}/10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Providers" dataKey="revenue" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">$789,456</p>
              <p className="text-blue-100 text-sm">+12.5% vs last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Players</p>
              <p className="text-2xl font-bold">23,456</p>
              <p className="text-green-100 text-sm">+8.3% vs last month</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg RTP</p>
              <p className="text-2xl font-bold">96.2%</p>
              <p className="text-purple-100 text-sm">Within target range</p>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Engagement</p>
              <p className="text-2xl font-bold">87.5%</p>
              <p className="text-orange-100 text-sm">+5.2% vs last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalyticsCharts;
