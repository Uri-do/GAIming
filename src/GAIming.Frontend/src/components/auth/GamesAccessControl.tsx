import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { 
  useCanManageGames, 
  useCanViewGames, 
  useCanExportGames, 
  useCanImportGames,
  useCanAccessGameAnalytics,
  useCanManageGameRecommendations,
  useCanViewPlayerData,
  useAuth
} from '@/hooks/useAuth';

interface GamesAccessControlProps {
  children: React.ReactNode;
  permission: 'view' | 'manage' | 'export' | 'import' | 'analytics' | 'recommendations' | 'players';
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const GamesAccessControl: React.FC<GamesAccessControlProps> = ({ 
  children, 
  permission, 
  fallback,
  showFallback = true 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Permission hooks
  const canView = useCanViewGames();
  const canManage = useCanManageGames();
  const canExport = useCanExportGames();
  const canImport = useCanImportGames();
  const canAccessAnalytics = useCanAccessGameAnalytics();
  const canManageRecommendations = useCanManageGameRecommendations();
  const canViewPlayerData = useCanViewPlayerData();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return showFallback ? (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access games management features.</p>
        </div>
      </div>
    ) : null;
  }

  // Check specific permissions
  let hasPermission = false;
  
  switch (permission) {
    case 'view':
      hasPermission = canView;
      break;
    case 'manage':
      hasPermission = canManage;
      break;
    case 'export':
      hasPermission = canExport;
      break;
    case 'import':
      hasPermission = canImport;
      break;
    case 'analytics':
      hasPermission = canAccessAnalytics;
      break;
    case 'recommendations':
      hasPermission = canManageRecommendations;
      break;
    case 'players':
      hasPermission = canViewPlayerData;
      break;
    default:
      hasPermission = false;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return showFallback ? (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-red-700">You don't have permission to access this feature.</p>
          <p className="text-sm text-red-600 mt-2">
            Required permission: <code className="bg-red-100 px-2 py-1 rounded">{permission}</code>
          </p>
        </div>
      </div>
    ) : null;
  }

  return <>{children}</>;
};

// Specific permission components for easier use
export const ViewGamesAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="view" />
);

export const ManageGamesAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="manage" />
);

export const ExportGamesAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="export" />
);

export const ImportGamesAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="import" />
);

export const AnalyticsAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="analytics" />
);

export const RecommendationsAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="recommendations" />
);

export const PlayerDataAccess: React.FC<Omit<GamesAccessControlProps, 'permission'>> = (props) => (
  <GamesAccessControl {...props} permission="players" />
);

// Permission indicator component
interface PermissionIndicatorProps {
  permission: string;
  hasPermission: boolean;
  className?: string;
}

export const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({ 
  permission, 
  hasPermission, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {hasPermission ? (
        <Shield className="w-4 h-4 text-green-500" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm ${hasPermission ? 'text-green-700' : 'text-red-700'}`}>
        {permission}
      </span>
    </div>
  );
};

// User permissions summary component
export const UserPermissionsSummary: React.FC = () => {
  const { user } = useAuth();
  const canView = useCanViewGames();
  const canManage = useCanManageGames();
  const canExport = useCanExportGames();
  const canImport = useCanImportGames();
  const canAccessAnalytics = useCanAccessGameAnalytics();
  const canManageRecommendations = useCanManageGameRecommendations();
  const canViewPlayerData = useCanViewPlayerData();

  if (!user) return null;

  const permissions = [
    { name: 'View Games', hasPermission: canView },
    { name: 'Manage Games', hasPermission: canManage },
    { name: 'Export Data', hasPermission: canExport },
    { name: 'Import Data', hasPermission: canImport },
    { name: 'Analytics', hasPermission: canAccessAnalytics },
    { name: 'Recommendations', hasPermission: canManageRecommendations },
    { name: 'Player Data', hasPermission: canViewPlayerData },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
      <div className="space-y-2">
        {permissions.map((perm) => (
          <PermissionIndicator
            key={perm.name}
            permission={perm.name}
            hasPermission={perm.hasPermission}
          />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>User:</strong> {user.name || user.email}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Roles:</strong> {user.roles?.join(', ') || 'None'}
        </p>
      </div>
    </div>
  );
};

export default GamesAccessControl;
