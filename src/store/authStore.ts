// src/store/authStore.ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
  nombre: string
  agencia?: string
  rol: 'USUARIO' | 'ADMIN'
}

interface RegisterData {
  nombre: string
  email: string
  password: string
  confirmPassword?: string
  agencia?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  setAuth: (user: User, token: string) => void
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkIsAdmin: () => boolean
}

// Credenciales de admin
const ADMIN_EMAIL = 'administrador@gmail.com'
const ADMIN_PASSWORD = 'superadmin'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: JSON.parse(localStorage.getItem('user') || '{}')?.rol === 'ADMIN',

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.rol === 'ADMIN'
    })
  },

  login: async (email: string, password: string) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar si es admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        nombre: 'Administrador',
        rol: 'ADMIN'
      }
      const token = 'admin-token-' + Date.now()
      get().setAuth(adminUser, token)
      return
    }

    // Login normal (simulado)
    if (email && password.length >= 6) {
      const normalUser: User = {
        id: 'user-' + Date.now(),
        email,
        nombre: email.split('@')[0],
        rol: 'USUARIO'
      }
      const token = 'user-token-' + Date.now()
      get().setAuth(normalUser, token)
      return
    }

    throw new Error('Credenciales inválidas')
  },

  register: async (data: RegisterData) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))

    if (data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    // Crear usuario normal (no se puede registrar como admin)
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      nombre: data.nombre,
      agencia: data.agencia,
      rol: 'USUARIO'
    }
    const token = 'user-token-' + Date.now()
    get().setAuth(newUser, token)
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false
    })
  },

  checkIsAdmin: () => {
    const { user } = get()
    return user?.rol === 'ADMIN'
  }
}))
