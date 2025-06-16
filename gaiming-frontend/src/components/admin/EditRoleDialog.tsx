import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { userManagementApi, Permission, Role } from '@/services/userManagementApi'

const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isActive: z.boolean(),
  permissionIds: z.array(z.string()).optional(),
})

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
  onSuccess: () => void
}

export function EditRoleDialog({ open, onOpenChange, role, onSuccess }: EditRoleDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
      permissionIds: [],
    },
  })

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: userManagementApi.getPermissions,
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: any) => userManagementApi.updateRole(role.roleId, data),
    onSuccess: () => {
      toast.success('Role updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role')
    },
  })

  // Initialize selected permissions when permissions data is loaded
  useEffect(() => {
    if (permissions.length > 0 && role.permissions.length > 0) {
      const rolePermissionIds = role.permissions.map(p => p.permissionId)
      setSelectedPermissions(rolePermissionIds)
    }
  }, [permissions, role.permissions])

  // Reset form when role changes
  useEffect(() => {
    form.reset({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
    })
  }, [role, form])

  const onSubmit = (data: UpdateRoleFormData) => {
    updateRoleMutation.mutate({
      ...data,
      permissionIds: selectedPermissions,
    })
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role information and permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Content Manager" 
                        disabled={role.isSystemRole}
                        {...field} 
                      />
                    </FormControl>
                    {role.isSystemRole && (
                      <FormDescription>
                        System role names cannot be changed
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this role is for..."
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Role</FormLabel>
                      <FormDescription>
                        When disabled, users with this role will lose its permissions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={role.isSystemRole}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissions</h3>
              <FormDescription>
                Select the permissions to assign to this role
              </FormDescription>
              
              {permissionsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{resource}</h4>
                        <Badge variant="outline" className="text-xs">
                          {resourcePermissions.length} permissions
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                        {resourcePermissions.map((permission) => (
                          <div key={permission.permissionId} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.permissionId}
                              checked={selectedPermissions.includes(permission.permissionId)}
                              onCheckedChange={() => handlePermissionToggle(permission.permissionId)}
                              disabled={role.isSystemRole}
                            />
                            <label
                              htmlFor={permission.permissionId}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span>{permission.action}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {permission.action}
                                </Badge>
                              </div>
                              {permission.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </div>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Role Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Role ID:</span> {role.roleId}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {role.isSystemRole ? 'System Role' : 'Custom Role'}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(role.createdDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Modified:</span> {role.modifiedDate ? new Date(role.modifiedDate).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
