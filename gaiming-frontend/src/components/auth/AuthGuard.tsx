import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles. If false, user needs ANY
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  fallbackComponent,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, hasPermission, hasRole, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission));

    if (!hasRequiredPermissions) {
      if (fallbackComponent) {
        return <>{fallbackComponent}</>;
      }

      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Required permissions:</p>
              <ul className="list-disc list-inside mt-1">
                {requiredPermissions.map(permission => (
                  <li key={permission} className="flex items-center justify-center">
                    <Lock className="h-3 w-3 mr-1" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check roles if required
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));

    if (!hasRequiredRoles) {
      if (fallbackComponent) {
        return <>{fallbackComponent}</>;
      }

      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Insufficient Role
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your current role doesn't have access to this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Your role: <span className="font-medium">{user?.role}</span></p>
              <p className="mt-1">Required roles:</p>
              <ul className="list-disc list-inside mt-1">
                {requiredRoles.map(role => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required permissions/roles
  return <>{children}</>;
};

export default AuthGuard;

// Convenience components for common use cases
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['Admin']}>{children}</AuthGuard>
);

export const ManagerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['Admin', 'Manager']}>{children}</AuthGuard>
);

export const AnalyticsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredPermissions={['analytics.view']}>{children}</AuthGuard>
);

export const PlayersGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredPermissions={['players.view']}>{children}</AuthGuard>
);

export const ModelsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredPermissions={['models.view']}>{children}</AuthGuard>
);

// Higher-order component for wrapping pages
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  authConfig?: Omit<AuthGuardProps, 'children'>
) => {
  return (props: P) => (
    <AuthGuard {...authConfig}>
      <Component {...props} />
    </AuthGuard>
  );
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { hasPermission, hasRole, user } = useAuthStore();

  return {
    hasPermission,
    hasRole,
    user,
    canViewPlayers: hasPermission('players.view') || user?.role === 'Admin',
    canManagePlayers: hasPermission('players.manage') || user?.role === 'Admin',
    canExportPlayers: hasPermission('players.export') || user?.role === 'Admin',
    canViewAnalytics: hasPermission('analytics.view') || user?.role === 'Admin',
    canExportAnalytics: hasPermission('analytics.export') || user?.role === 'Admin',
    canViewModels: hasPermission('models.view') || user?.role === 'Admin',
    canManageModels: hasPermission('models.manage') || user?.role === 'Admin',
    canDeployModels: hasPermission('models.deploy') || user?.role === 'Admin',
    canExportModels: hasPermission('models.export') || user?.role === 'Admin',
    isAdmin: user?.role === 'Admin',
    isManager: user?.role === 'Manager',
  };
};
