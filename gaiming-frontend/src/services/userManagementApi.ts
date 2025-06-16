import { apiService } from './api'

export interface User {
  id: number
  userId: string
  username: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  department?: string
  title?: string
  isActive: boolean
  emailConfirmed: boolean
  twoFactorEnabled: boolean
  lastLogin?: Date
  createdDate: Date
  modifiedDate?: Date
  roles: string[]
  permissions: string[]
}

export interface Role {
  id: number
  roleId: string
  name: string
  description?: string
  isSystemRole: boolean
  isActive: boolean
  createdDate: Date
  modifiedDate?: Date
  permissions: Permission[]
}

export interface Permission {
  id: number
  permissionId: string
  name: string
  description?: string
  resource: string
  action: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  displayName: string
  firstName: string
  lastName: string
  department?: string
  title?: string
  roleIds?: string[]
}

export interface UpdateUserRequest {
  email: string
  displayName: string
  firstName: string
  lastName: string
  department?: string
  title?: string
  isActive: boolean
  emailConfirmed: boolean
  twoFactorEnabled: boolean
  roleIds?: string[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleRequest {
  name: string
  description?: string
  isActive: boolean
  permissionIds?: string[]
}

export const userManagementApi = {
  // Users
  async getUsers(params: GetUsersParams = {}): Promise<PagedResult<User>> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())

    const response = await apiService.get<PagedResult<User>>(`/Users?${searchParams.toString()}`)
    return response
  },

  async getUser(userId: string): Promise<User> {
    const response = await apiService.get<User>(`/Users/${userId}`)
    return response
  },

  async createUser(request: CreateUserRequest): Promise<User> {
    const response = await apiService.post<User>('/Users', request)
    return response
  },

  async updateUser(userId: string, request: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<User>(`/Users/${userId}`, request)
    return response
  },

  async deleteUser(userId: string): Promise<void> {
    await apiService.delete(`/Users/${userId}`)
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    const response = await apiService.get<Role[]>('/RoleManagement')
    return response
  },

  async getRole(roleId: string): Promise<Role> {
    const response = await apiService.get<Role>(`/RoleManagement/${roleId}`)
    return response
  },

  async createRole(request: CreateRoleRequest): Promise<Role> {
    const response = await apiService.post<Role>('/RoleManagement', request)
    return response
  },

  async updateRole(roleId: string, request: UpdateRoleRequest): Promise<Role> {
    const response = await apiService.put<Role>(`/RoleManagement/${roleId}`, request)
    return response
  },

  async deleteRole(roleId: string): Promise<void> {
    await apiService.delete(`/RoleManagement/${roleId}`)
  },

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    const response = await apiService.get<Permission[]>('/RoleManagement/permissions')
    return response
  },

  // User role management
  async assignRole(userId: string, roleId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/roles/${roleId}`)
  },

  async removeRole(userId: string, roleId: string): Promise<void> {
    await apiService.delete(`/Users/${userId}/roles/${roleId}`)
  },

  // User status management
  async activateUser(userId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/activate`)
  },

  async deactivateUser(userId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/deactivate`)
  },

  async lockUser(userId: string, duration?: number): Promise<void> {
    await apiService.post(`/Users/${userId}/lock`, { duration })
  },

  async unlockUser(userId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/unlock`)
  },

  // Password management
  async resetPassword(userId: string): Promise<{ temporaryPassword: string }> {
    const response = await apiService.post<{ temporaryPassword: string }>(`/Users/${userId}/reset-password`)
    return response
  },

  async forcePasswordChange(userId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/force-password-change`)
  },

  // Bulk operations
  async bulkActivateUsers(userIds: string[]): Promise<void> {
    await apiService.post('/Users/bulk/activate', { userIds })
  },

  async bulkDeactivateUsers(userIds: string[]): Promise<void> {
    await apiService.post('/Users/bulk/deactivate', { userIds })
  },

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await apiService.post('/Users/bulk/delete', { userIds })
  },

  async bulkAssignRole(userIds: string[], roleId: string): Promise<void> {
    await apiService.post('/Users/bulk/assign-role', { userIds, roleId })
  },

  async bulkRemoveRole(userIds: string[], roleId: string): Promise<void> {
    await apiService.post('/Users/bulk/remove-role', { userIds, roleId })
  },

  // Export/Import
  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiService.download(`/Users/export?format=${format}`)
    return new Blob([response])
  },

  async importUsers(file: File): Promise<{ success: number; errors: string[] }> {
    const response = await apiService.upload<{ success: number; errors: string[] }>('/Users/import', file)
    return response
  },

  // Audit and activity
  async getUserActivity(userId: string, days: number = 30): Promise<any[]> {
    const response = await apiService.get<any[]>(`/Users/${userId}/activity?days=${days}`)
    return response
  },

  async getUserSessions(userId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(`/Users/${userId}/sessions`)
    return response
  },

  async terminateUserSessions(userId: string): Promise<void> {
    await apiService.post(`/Users/${userId}/terminate-sessions`)
  }
}
