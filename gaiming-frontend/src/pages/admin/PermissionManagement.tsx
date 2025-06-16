import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Key, 
  Search, 
  Filter,
  Shield,
  Users,
  Settings,
  Database,
  BarChart3,
  FileText
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { userManagementApi, Permission } from '@/services/userManagementApi'

const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Users: Users,
  Roles: Shield,
  Permissions: Key,
  Analytics: BarChart3,
  Reports: FileText,
  Recommendations: Database,
  System: Settings,
}

const actionColors: Record<string, string> = {
  Read: 'bg-blue-100 text-blue-800',
  Write: 'bg-green-100 text-green-800',
  Delete: 'bg-red-100 text-red-800',
  Admin: 'bg-purple-100 text-purple-800',
}

export function PermissionManagement() {
  const [search, setSearch] = useState('')
  const [resourceFilter, setResourceFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')

  // Fetch permissions
  const { data: permissions = [], isLoading, error } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: userManagementApi.getPermissions,
  })

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(search.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(search.toLowerCase()) ||
                         permission.resource.toLowerCase().includes(search.toLowerCase())
    
    const matchesResource = !resourceFilter || permission.resource === resourceFilter
    const matchesAction = !actionFilter || permission.action === actionFilter
    
    return matchesSearch && matchesResource && matchesAction
  })

  // Get unique resources and actions for filters
  const resources = [...new Set(permissions.map(p => p.resource))].sort()
  const actions = [...new Set(permissions.map(p => p.action))].sort()

  // Group permissions by resource
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Key className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading permissions</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600">View and understand system permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Permissions</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter(p => p.resource === 'System').length}
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
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Resources</option>
                {resources.map(resource => (
                  <option key={resource} value={resource}>{resource}</option>
                ))}
              </select>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions by Resource */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
            const ResourceIcon = resourceIcons[resource] || Key
            
            return (
              <Card key={resource}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ResourceIcon className="h-5 w-5" />
                    {resource}
                    <Badge variant="outline" className="ml-auto">
                      {resourcePermissions.length} permissions
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Permissions for {resource.toLowerCase()} management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permission ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourcePermissions.map((permission) => (
                        <TableRow key={permission.permissionId}>
                          <TableCell>
                            <div className="font-medium">{permission.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${actionColors[permission.action] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {permission.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md text-sm text-gray-600">
                              {permission.description || 'No description available'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {permission.permissionId.slice(0, 8)}...
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
          <CardDescription>
            Overview of permissions by action type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map(action => {
              const count = permissions.filter(p => p.action === action).length
              return (
                <div key={action} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{action} Permissions</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
