// src/store/authStore.ts
import { create } from 'zustand'
import api from '@/services/api'

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

//Validacion del usuario
const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null

    const parsed = JSON.parse(storedUser)

    // Validar estructura mínima
    if (
      typeof parsed.id === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.rol === 'string'
    ) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const user = getStoredUser()
  const token = localStorage.getItem('token')

  return {
    user,
    token,
    isAuthenticated: !!(user && token),
    isAdmin: !!(user && user.rol === 'ADMIN'),

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
      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, usuario } = response.data

        const user: User = {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          agencia: usuario.agencia,
          rol: usuario.rol
        }

        get().setAuth(user, token)
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Credenciales inválidas')
      }
    },

    register: async (data: RegisterData) => {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      const newUser: User = {
        id: 'user-' + Date.now(),
        email: data.email,
        nombre: data.nombre,
        agencia: data.agencia,
        rol: 'USUARIO'
      }

      get().setAuth(newUser, 'user-token-' + Date.now())
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
      return get().user?.rol === 'ADMIN'
    }
  }
})
