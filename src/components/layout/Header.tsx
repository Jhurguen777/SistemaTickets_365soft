import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, LogOut } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  onOpenModal: (modalType: string) => void
}

const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuthStore()

  const navItems = [
    { label: 'CÓMO COMPRAR', action: () => onOpenModal('howToBuy') },
    { label: 'ATENCIÓN AL CLIENTE', to: '/atencion_cliente' },
    { label: 'PREGUNTAS FRECUENTES', action: () => onOpenModal('faq') },
    { label: 'PUNTOS DE VENTA', action: () => onOpenModal('storeLocations') }
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
          >
            <img
              src="/logo.png"
              alt="SistemaTickets 365soft"
              className="h-10 md:h-12"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, index) => (
              item.to ? (
                <Link
                  key={index}
                  to={item.to}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {/* Login/User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      Panel Admin
                    </Link>
                    <span className="text-gray-400">|</span>
                  </>
                )}
                <Link
                  to="/mis-compras"
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Mis Compras
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-semibold">
                  {user.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="hidden md:inline-flex"
              >
                ACCEDER
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                item.to ? (
                  <Link
                    key={index}
                    to={item.to}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={() => {
                      item.action()
                      setMobileMenuOpen(false)
                    }}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase text-left"
                  >
                    {item.label}
                  </button>
                )
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    to="/mis-compras"
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Compras
                  </Link>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-sm font-semibold">{user.nombre}</span>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/login'
                    setMobileMenuOpen(false)
                  }}
                  className="w-full"
                >
                  ACCEDER
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
