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
  const { user, logout, isAdmin, isAuthenticated } = useAuthStore()

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-primary text-white shadow-md">
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
                  className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase tracking-wide"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase tracking-wide"
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 transition-colors"
                    >
                      Panel Admin
                    </Link>
                    <span className="text-white/60">|</span>
                  </>
                )}
                <Link
                  to="/mis-compras"
                  className="text-sm font-semibold text-white hover:text-white/90 transition-colors"
                >
                  Mis Compras
                </Link>
                <span className="text-white/60">|</span>
                <span className="text-sm font-semibold text-white">
                  {user?.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-300 hover:text-red-200 font-semibold transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase tracking-wide"
              >
                ACCEDER
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-primary">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                item.to ? (
                  <Link
                    key={index}
                    to={item.to}
                    className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase"
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
                    className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase text-left"
                  >
                    {item.label}
                  </button>
                )
              ))}
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    to="/mis-compras"
                    className="text-sm font-semibold text-white hover:text-white/90 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Compras
                  </Link>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span className="text-sm font-semibold text-white">{user.nombre}</span>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm text-red-300 hover:text-red-200 font-semibold transition-colors"
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
                  className="text-sm font-semibold text-white hover:text-white/90 transition-colors uppercase text-left"
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