import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Target,
  BarChart3,
  FlaskConical,
  Brain,
  Settings,
  Shield,
  Key,
  Activity,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'games',
    label: 'Games',
    path: '/games',
    icon: Gamepad2,
  },
  {
    id: 'players',
    label: 'Players',
    path: '/players',
    icon: Users,
  },
  {
    id: 'player-analytics',
    label: 'Player Analytics',
    path: '/players/analytics',
    icon: BarChart3,
    badge: 'Pro',
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    path: '/recommendations',
    icon: Target,
  },
  {
    id: 'recommendations-dashboard',
    label: 'Rec Dashboard',
    path: '/recommendations/dashboard',
    icon: BarChart3,
    badge: 'Live',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    id: 'ab-testing',
    label: 'A/B Testing',
    path: '/ab-testing',
    icon: FlaskConical,
    badge: 'Beta',
  },
  {
    id: 'ab-testing-management',
    label: 'AB Management',
    path: '/ab-testing/management',
    icon: Settings,
    badge: 'Pro',
  },
  {
    id: 'models',
    label: 'ML Models',
    path: '/models',
    icon: Brain,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  {
    id: 'ui-showcase',
    label: 'UI Showcase',
    path: '/ui-showcase',
    icon: Palette,
    badge: 'New',
  },
  {
    id: 'auth-test',
    label: 'Auth Test',
    path: '/auth-test',
    icon: Shield,
    badge: 'Test',
  },
  {
    id: 'admin-users',
    label: 'User Management',
    path: '/admin/users',
    icon: Shield,
  },
  {
    id: 'admin-roles',
    label: 'Role Management',
    path: '/admin/roles',
    icon: Shield,
  },
  {
    id: 'admin-permissions',
    label: 'Permissions',
    path: '/admin/permissions',
    icon: Key,
  },
  {
    id: 'admin-activity',
    label: 'User Activity',
    path: '/admin/activity',
    icon: Activity,
  },
]

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore()
  const location = useLocation()

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-30',
        'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900',
        'border-r border-primary-500/20 shadow-xl shadow-primary-500/10',
        'backdrop-blur-sm',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo and toggle */}
      <div className="flex items-center justify-between p-4 border-b border-primary-500/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5" />
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2 relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-sm">GA</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              GAIming
            </span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-primary-500/10 transition-all duration-200 relative z-10 group"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-400 shadow-lg shadow-primary-500/10 border border-primary-500/30'
                  : 'text-gray-300 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-purple-500/10 hover:text-white hover:shadow-md hover:shadow-primary-500/5'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-all duration-200',
                isActive ? 'text-primary-400 drop-shadow-lg' : 'group-hover:text-primary-400'
              )} />
              
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow-lg shadow-primary-500/25 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed sidebar */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl shadow-primary-500/20 border border-primary-500/20">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-primary-500 to-purple-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-purple-500/5">
          <div className="text-xs text-gray-400 text-center">
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent font-medium">
              GAIming v1.0.0
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
