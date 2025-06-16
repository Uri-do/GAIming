import React from 'react'
import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/lib/utils'

const Layout: React.FC = () => {
  const { sidebarCollapsed } = useThemeStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
