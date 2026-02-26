import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AuthSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    // Obtener token de la URL
    const token = searchParams.get('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    try {
      // Decodificar el JWT
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      const decoded = JSON.parse(jsonPayload)

      // Guardar token y usuario
      const user = {
        id: decoded.id,
        email: decoded.email,
        nombre: decoded.nombre || '',
        apellido: decoded.apellido || '',
        agencia: decoded.agencia || '',
        rol: decoded.rol
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setAuth(user, token)

      // Redirigir a home después de 1.5 segundos
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1500)
    } catch (error) {
      console.error('Error decoding token:', error)
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Autenticación exitosa!
        </h1>
        <p className="text-gray-600 mb-8">
          Redirigiendo...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}
