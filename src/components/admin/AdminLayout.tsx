import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Settings,
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
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg">🎟️</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">365soft</h1>
              <p className="text-xs text-slate-400">Panel Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

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
                    ? 'bg-primary text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-slate-700">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span className="font-medium">Volver al Sitio</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="font-bold">{user?.nombre?.[0] || 'A'}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{user?.nombre}</p>
                <p className="text-xs text-slate-400">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              <Link to="/admin/dashboard" className="text-primary hover:underline">
                Admin
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-medium">
                {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Panel'}
              </span>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
