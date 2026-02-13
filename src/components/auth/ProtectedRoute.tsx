import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const location = useLocation()

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />
  }

  // Si está autenticado pero no es admin, redirigir a home
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
