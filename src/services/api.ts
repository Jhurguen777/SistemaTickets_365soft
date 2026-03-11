// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || ''

      // ✅ Rutas públicas — nunca redirigir a login
      const esPublica =
        url.includes('/asientos') ||
        url.includes('/eventos')  ||
        url.includes('/auth/google')

      // ✅ Evitar bucle infinito si ya estamos en /login
      const yaEnLogin = window.location.pathname === '/login'

      if (!esPublica && !yaEnLogin) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api