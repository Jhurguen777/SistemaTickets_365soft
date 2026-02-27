import React, { useState, useRef, useEffect } from 'react'
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
  ChevronUp,
  ChevronDown,
  User,
  ScanLine
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/contexts/ThemeContext'

interface NavItem {
  label: string
  path?: string
  icon: React.ElementType
  children?: {
    label: string
    path: string
  }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Eventos', path: '/admin/eventos', icon: Calendar },
  { label: 'Usuarios', path: '/admin/usuarios', icon: Users },
  {
    label: 'Asistencia',
    icon: ScanLine,
    children: [
      { label: 'Registrar Asistencia', path: '/admin/asistencia/registrar' },
      { label: 'Plantillas de Certificado', path: '/admin/asistencia/plantillas' }
    ]
  },
  { label: 'Reportes', path: '/admin/reportes', icon: DollarSign }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.path) {
      return location.pathname.startsWith(item.path)
    }
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.path))
    }
    return false
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Top Header - Fijo en la parte superior */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
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
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">SistemaTickets 365soft</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Panel de Administración</p>
              </div>
            </div>
          </div>

          {/* Page Title - Desktop */}
          <div className="hidden md:block flex-1 ml-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {(() => {
                for (const item of navItems) {
                  if (item.path && location.pathname.startsWith(item.path)) {
                    return item.label
                  }
                  if (item.children) {
                    const child = item.children.find(c => location.pathname.startsWith(c.path))
                    if (child) return child.label
                  }
                }
                return 'Panel'
              })()}
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
          fixed lg:sticky top-0 lg:top-0 left-0 z-50 lg:z-0 h-[calc(100vh-64px)] lg:h-auto w-56
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg lg:shadow-none
          transition-transform duration-300 ease-in-out
          overflow-y-auto flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex-shrink-0
        `}
        >
          {/* Navigation */}
          <nav className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-6">
              {navItems.map((item, index) => {
                const isActive = isItemActive(item)
                const hasChildren = item.children && item.children.length > 0
                const Icon = item.icon
                const isDropdownOpen = openDropdown === item.label

                return (
                  <div key={item.label || item.path} className="border-b border-gray-300">
                    {hasChildren ? (
                        // Dropdown Item
                        <div>
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className="w-full flex items-center justify-between px-4 py-3 transition-all hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} className="text-gray-700" />
                              <span className="text-xs font-bold tracking-wide text-gray-700">
                                {item.label.toUpperCase()}
                              </span>
                            </div>
                            <ChevronDown size={14} className="text-gray-700 transition-transform" style={{
                              transform: isDropdownOpen ? 'rotate(180deg)' : 'none'
                            }} />
                          </button>

                          {/* Dropdown Submenu */}
                          {isDropdownOpen && item.children && (
                            <div className="border-t border-gray-300">
                              {item.children.map((child) => {
                                const isChildActive = location.pathname.startsWith(child.path)
                                return (
                                  <Link
                                    key={child.path}
                                    to={child.path}
                                    onClick={() => {
                                      setSidebarOpen(false)
                                    }}
                                    className="block px-10 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-300 last:border-b-0"
                                  >
                                    {child.label}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular Link Item
                        <Link
                          to={item.path!}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-gray-50"
                        >
                          <Icon size={16} className="text-gray-700" />
                          <span className="text-xs font-bold tracking-wide text-gray-700">
                            {item.label.toUpperCase()}
                          </span>
                        </Link>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Ver Sitio - Justo arriba del usuario */}
            <div className="border-t border-gray-300 px-3 py-3">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 transition-all hover:bg-gray-50"
              >
                <Home size={16} className="text-gray-700" />
                <span className="text-xs font-bold tracking-wide text-gray-700">
                  VER SITIO
                </span>
              </Link>
            </div>

            {/* User Menu Dropdown - Bottom (pegado al footer) */}
            <div className="border-t border-b border-gray-200 dark:border-gray-700" ref={userMenuRef}>
              <div className="relative px-3 py-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="group w-full flex items-center gap-3 px-4 py-2 -mx-3 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white text-xs">{user?.nombre?.[0] || 'A'}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{user?.nombre}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">ADMIN</p>
                  </div>
                  <ChevronUp size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <Link
                      to="/admin/configuracion"
                      onClick={() => {
                        setUserMenuOpen(false)
                        setSidebarOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                      <Settings size={14} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium tracking-wide">CONFIGURACIÓN</span>
                    </Link>

                    <Link
                      to="/admin/accesos"
                      onClick={() => {
                        setUserMenuOpen(false)
                        setSidebarOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                      <Shield size={14} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium tracking-wide">ACCESOS</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <LogOut size={14} className="text-red-500 dark:text-red-400" />
                      <span className="font-medium tracking-wide">CERRAR SESIÓN</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
