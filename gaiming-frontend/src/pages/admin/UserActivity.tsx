import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Activity, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { userManagementApi } from '@/services/userManagementApi'

interface UserActivity {
  id: string
  userId: string
  username: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  success: boolean
  details?: string
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  login: User,
  logout: User,
  create: CheckCircle,
  update: Activity,
  delete: XCircle,
  view: Activity,
  error: AlertTriangle,
}

const getDeviceIcon = (userAgent: string) => {
  if (userAgent.toLowerCase().includes('mobile')) {
    return Smartphone
  }
  return Monitor
}

export function UserActivity() {
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('7')

  // Mock data - replace with actual API call
  const { data: activities = [], isLoading, error } = useQuery<UserActivity[]>({
    queryKey: ['user-activity', userFilter, actionFilter, dateRange],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [
        {
          id: '1',
          userId: 'user-1',
          username: 'admin',
          action: 'login',
          resource: 'Authentication',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          success: true,
        },
        {
          id: '2',
          userId: 'user-1',
          username: 'admin',
          action: 'create',
          resource: 'User',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          success: true,
          details: 'Created user: john.doe',
        },
        {
          id: '3',
          userId: 'user-2',
          username: 'john.doe',
          action: 'login',
          resource: 'Authentication',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          success: false,
          details: 'Invalid password',
        },
      ]
    },
  })

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.username.toLowerCase().includes(search.toLowerCase()) ||
                         activity.action.toLowerCase().includes(search.toLowerCase()) ||
                         activity.resource.toLowerCase().includes(search.toLowerCase())
    
    const matchesUser = !userFilter || activity.userId === userFilter
    const matchesAction = !actionFilter || activity.action === actionFilter
    
    return matchesSearch && matchesUser && matchesAction
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading activity</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Activity</h1>
          <p className="text-gray-600">Monitor user actions and system events</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.success).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => !a.success).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(activities.map(a => a.userId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24h</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {filteredActivities.length} activities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => {
                  const ActionIcon = activityIcons[activity.action] || Activity
                  const DeviceIcon = getDeviceIcon(activity.userAgent)
                  
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{activity.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActionIcon className="h-4 w-4 text-blue-600" />
                          <span className="capitalize">{activity.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>{activity.resource}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{formatTimeAgo(activity.timestamp)}</div>
                            <div className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{activity.ipAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {activity.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.success ? "default" : "destructive"}>
                          {activity.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {activity.details || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
