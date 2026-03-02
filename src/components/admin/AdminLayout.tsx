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
  ChevronUp,
  ChevronDown,
  ScanLine,
  ClipboardCheck,
  FileText,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  label: string
  path?: string
  icon: React.ElementType
  children?: {
    label: string
    path: string
    icon?: React.ElementType
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
      { label: 'Registrar Asistencia', path: '/admin/asistencia/registrar', icon: ClipboardCheck },
      { label: 'Plantillas de Certificado', path: '/admin/asistencia/plantillas', icon: FileText }
    ]
  },
  { label: 'Reportes', path: '/admin/reportes', icon: DollarSign }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ahora ocupa toda la altura */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
        transition-[width] duration-200 ease-linear
        overflow-visible flex flex-col
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-12' : 'w-64'}
        flex-shrink-0
      `}
      >
        {/* Logo y Título del Sidebar */}
        <div className="flex flex-col gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={16} className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎟️</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
                  SistemaTickets
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">365soft</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-auto px-2 py-2 group-data-[collapsible=icon]:overflow-hidden">
          {navItems.map((item) => {
            const isActive = isItemActive(item)
            const hasChildren = item.children && item.children.length > 0
            const Icon = item.icon
            const isDropdownOpen = openDropdown === item.label

            return (
              <div key={item.label || item.path} className="relative">
                {hasChildren ? (
                  // Dropdown Item
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        sidebarCollapsed ? 'justify-center size-8!' : 'justify-between'
                      }`}
                    >
                      <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-2'} min-w-0 flex-1`}>
                        <Icon className="h-4 w-4 flex-shrink-0 text-gray-700 dark:text-gray-300" />
                        {!sidebarCollapsed && (
                          <span className="truncate text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown className={`h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`} />
                      )}
                    </button>

                    {/* Dropdown Submenu */}
                    {isDropdownOpen && item.children && (
                      <div>
                        {!sidebarCollapsed ? (
                          // Dropdown normal dentro del sidebar
                          <div>
                            {item.children.map((child) => {
                              const isChildActive = location.pathname.startsWith(child.path)
                              const ChildIcon = child.icon
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => {
                                    setSidebarOpen(false)
                                  }}
                                  className={`flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm font-medium transition-colors ml-4 ${
                                    isChildActive
                                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {ChildIcon && <ChildIcon className="h-4 w-4 flex-shrink-0" />}
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              )
                            })}
                          </div>
                        ) : (
                          // Segunda columna de iconos cuando está colapsado
                          <div className="absolute left-12 top-0 w-12 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col py-2">
                            {item.children.map((child) => {
                              const isChildActive = location.pathname.startsWith(child.path)
                              const ChildIcon = child.icon
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => {
                                    setOpenDropdown(null)
                                  }}
                                  title={child.label}
                                  className={`flex justify-center items-center p-2 transition-all ${
                                    isChildActive
                                      ? 'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-blue-600'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <ChildIcon className={`h-4 w-4 flex-shrink-0 ${
                                    isChildActive
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`} />
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Link Item
                  <Link
                    to={item.path!}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-blue-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${sidebarCollapsed ? 'justify-center size-8!' : ''}`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className={`truncate font-medium tracking-wide ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Ver Sitio y User Menu - Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-2">
          {/* Ver Sitio */}
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? 'Ver Sitio' : undefined}
            className={`flex items-center gap-2 overflow-hidden rounded-md p-2 text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 mb-2 ${
              sidebarCollapsed ? 'justify-center size-8!' : ''
            }`}
          >
            <Home className="h-4 w-4 flex-shrink-0 text-gray-700 dark:text-gray-300" />
            {!sidebarCollapsed && (
              <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                Ver Sitio
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={sidebarCollapsed ? user?.nombre : undefined}
              className={`group flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                sidebarCollapsed ? 'justify-center size-8!' : ''
              }`}
            >
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-white text-xs">{user?.nombre?.[0] || 'A'}</span>
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.nombre}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">ADMIN</p>
                  </div>
                  <ChevronUp className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden ${
                sidebarCollapsed ? 'absolute bottom-full left-full ml-2 mb-0' : 'absolute bottom-full left-0 right-0 mb-2'
              }`}>
                <Link
                  to="/admin/configuracion"
                  onClick={() => {
                    setUserMenuOpen(false)
                    setSidebarOpen(false)
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  <Settings className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium tracking-wide truncate">Configuración</span>
                </Link>

                <Link
                  to="/admin/accesos"
                  onClick={() => {
                    setUserMenuOpen(false)
                    setSidebarOpen(false)
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  <Shield className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium tracking-wide truncate">Accesos</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                  <span className="font-medium tracking-wide truncate">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Ahora ocupa todo el ancho sin header arriba */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
        {/* Botón menú móvil y minimizar */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Botón minimizar sidebar (desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
