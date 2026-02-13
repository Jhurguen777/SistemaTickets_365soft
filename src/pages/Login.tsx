import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

interface LoginState {
  state?: {
    redirectTo?: string
    eventData?: any
  }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as LoginState
  const { login, register, isAdmin } = useAuthStore()

  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const newErrors: { [key: string]: string } = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!isLogin) {
      if (!formData.nombre || formData.nombre.length < 3) {
        newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
      }
      if (!formData.apellido || formData.apellido.length < 3) {
        newErrors.apellido = 'El apellido debe tener al menos 3 caracteres'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)

        // Verificar si es admin por el email (isAdmin no se actualiza inmediatamente)
        if (formData.email === 'administrador@gmail.com') {
          navigate('/admin/dashboard', { replace: true })
          return
        }
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido
        })
      }

      // Redirect after successful login/register
      const redirectTo = location.state?.redirectTo || '/'
      navigate(redirectTo, { replace: true })
    } catch (error: any) {
      setErrors({
        form: error.message || 'Error al procesar la solicitud'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>

        <Card>
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎟️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isLogin
                  ? 'Ingresa para comprar tus entradas'
                  : 'Regístrate para comenzar'}
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-gray-700">
                Continuar con Google
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  o continúa con tu email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <Input
                    label="Nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    error={errors.nombre}
                    placeholder="Tu nombre"
                    icon={<User size={18} />}
                    required
                  />

                  <Input
                    label="Apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    error={errors.apellido}
                    placeholder="Tu apellido"
                    required
                  />
                </>
              )}

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                placeholder="tu@email.com"
                icon={<Mail size={18} />}
                required
              />

              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                placeholder="Mínimo 6 caracteres"
                icon={<Lock size={18} />}
                required
              />

              {!isLogin && (
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  error={errors.confirmPassword}
                  placeholder="Repite tu contraseña"
                  icon={<Lock size={18} />}
                  required
                />
              )}

              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.form}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? 'Procesando...'
                  : isLogin
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setErrors({})
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            {/* Terms */}
            <p className="mt-6 text-xs text-center text-gray-500">
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="text-primary hover:underline">
                Términos y condiciones
              </a>{' '}
              y{' '}
              <a href="#" className="text-primary hover:underline">
                Política de privacidad
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
