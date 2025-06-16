import { useState } from 'react'
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
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { userManagementApi, Permission } from '@/services/userManagementApi'

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  permissionIds: z.array(z.string()).optional(),
})

type CreateRoleFormData = z.infer<typeof createRoleSchema>

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateRoleDialog({ open, onOpenChange, onSuccess }: CreateRoleDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  })

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: userManagementApi.getPermissions,
  })

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: any) => userManagementApi.createRole(data),
    onSuccess: () => {
      toast.success('Role created successfully')
      form.reset()
      setSelectedPermissions([])
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role')
    },
  })

  const onSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate({
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
    form.reset()
    setSelectedPermissions([])
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
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions to control user access.
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
                      <Input placeholder="e.g., Content Manager" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for this role
                    </FormDescription>
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
                    <FormDescription>
                      Optional description of the role's purpose
                    </FormDescription>
                    <FormMessage />
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

            {/* Summary */}
            {selectedPermissions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Selected Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPermissions.map((permissionId) => {
                    const permission = permissions.find(p => p.permissionId === permissionId)
                    return permission ? (
                      <Badge key={permissionId} variant="secondary" className="text-xs">
                        {permission.resource}.{permission.action}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
