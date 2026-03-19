import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Redirige a /admin/asistencia/registrar si el tipoRol no tiene acceso a la ruta actual
interface RoleProtectedRouteProps {
  children: React.ReactNode
  blockedRoles?: string[]
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, blockedRoles = [] }) => {
  const { user } = useAuthStore()
  const tipoRol = user?.tipoRol

  if (tipoRol && blockedRoles.includes(tipoRol)) {
    return <Navigate to="/admin/asistencia/registrar" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
