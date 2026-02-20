import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Eventos', path: '/admin/eventos', icon: Calendar },
  { label: 'Usuarios', path: '/admin/usuarios', icon: Users },
  { label: 'Reportes', path: '/admin/reportes', icon: DollarSign },
  { label: 'Accesos', path: '/admin/accesos', icon: Shield },
  { label: 'Configuración', path: '/admin/configuracion', icon: Settings }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header - Fijo en la parte superior */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-2"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-xl">🎟️</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">SistemaTickets 365soft</h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            </div>
          </div>

          {/* Page Title - Desktop */}
          <div className="hidden md:block flex-1 ml-8">
            <h2 className="text-lg font-semibold text-gray-700">
              {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Panel'}
            </h2>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-sm">{user?.nombre?.[0] || 'A'}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Container para Sidebar y Contenido */}
      <div className="flex flex-1">
        {/* Sidebar Overlay Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Debajo del header */}
        <aside
          className={`
          fixed lg:sticky top-0 lg:top-0 left-0 z-50 lg:z-0 h-[calc(100vh-64px)] lg:h-auto w-64
          bg-white border-r border-gray-200 shadow-lg lg:shadow-none
          transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex-shrink-0
        `}
        >
          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              const Icon = item.icon

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Volver al Sitio</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
