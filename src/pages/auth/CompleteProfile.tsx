import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, User, Building } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { cn } from '@/utils/cn'

// Lista de agencias disponibles
const AGENCIAS = [
  '2526 ALFA FORZA',
  '2527 ALFA DIAMOND',
  '2528 ALFA PRO',
  '2529 ALFA HABITAT',
  '2530 ALFA ÉLITE',
  '2531 ALFA FUTURO',
  '2532 ALFA GRAND CONTINENTAL',
  '2533 ALFA LUX',
  '2534 ALFA PREMIER',
  '2535 ALFA LINK',
  '2536 ALFA NYSSA',
  '2537 ALFA CAPITAL',
  '2538 ALFA MAX',
  '2539 ALFA MASTER',
  '2540 ALFA GRAND CENTRAL',
  '2541 ALFA GRAND SKY',
  '2546 ALFA TOP',
  '2547 ALFA PLUS',
  '2548 ALFA NOVA',
  '2549 ALFA NEXUS',
  '2550 ALFA DUO',
  '2551 ALFA PRIME',
  '2552 ALFA RESIDENCE',
  '2553 ALFA GOLDEN',
  '2554 ALFA EMPORIO',
  '2555 ALFA GRAND HORIZONTE',
  '2556 ALFA GLOBAL',
  '2557 ALFA VIP INVERSIONES',
  '2559 ALFA BLUE AVENUE',
  '2560 ALFA SMART',
  '2561 ALFA HOME',
  '2562 ALFA NEW LIFE',
  '2563 ALFA TITANIUM',
  '2564 ALFA RED',
  '2565 ALFA CLICK',
  '2605 ALFA ULTRA',
  '2606 ALFA CITY',
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    telefono: '',
    agencia: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Obtener token de la URL y verificar usuario
    const token = searchParams.get('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    // Decodificar el JWT para obtener la información del usuario
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      const decoded = JSON.parse(jsonPayload)

      // Guardar token y usuario en el store
      const user = {
        id: decoded.id,
        email: decoded.email,
        nombre: decoded.nombre || '',
        apellido: decoded.apellido || '',
        agencia: decoded.agencia || '',
        rol: decoded.rol
      }

      // Guardar en localStorage y store
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setAuth(user, token)

      // Precargar nombre en el formulario
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || ''
      }))

      setInitializing(false)
    } catch (error) {
      console.error('Error decoding token:', error)
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate, setAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validaciones
    const newErrors: { [key: string]: string } = {}

    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.apellido || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido es requerido'
    }

    if (!formData.ci || formData.ci.trim().length < 6) {
      newErrors.ci = 'El CI es requerido (ej: CB 12345678)'
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{8}$/.test(formData.telefono.replace(/\s/g, '').replace(/\+591/, ''))) {
      newErrors.telefono = 'Ingresa 8 dígitos (ej: 70123456)'
    }

    if (!formData.agencia) {
      newErrors.agencia = 'Debes seleccionar una agencia'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // Agregar +591 automáticamente si no está presente
      let telefonoCompleto = formData.telefono.trim()
      if (telefonoCompleto && !telefonoCompleto.startsWith('+591')) {
        telefonoCompleto = '+591 ' + telefonoCompleto
      }

      const response = await api.post('/auth/complete-profile', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        ci: formData.ci.trim(),
        telefono: telefonoCompleto,
        agencia: formData.agencia
      })

      const { token, usuario } = response.data

      // Actualizar usuario en store y localStorage
      const updatedUser = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        agencia: usuario.agencia,
        rol: usuario.rol
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setAuth(updatedUser, token)

      // Redirigir a home
      navigate('/', { replace: true })
    } catch (error: any) {
      setErrors({
        form: error.response?.data?.message || 'Error al completar perfil'
      })
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
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
                Completa tu perfil
              </h1>
              <p className="text-gray-600 mt-2">
                Necesitamos algunos datos adicionales
              </p>
            </div>

            {/* User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Mail size={18} className="text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">
                  Autenticado con Google
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                icon={<User size={18} />}
                required
              />

              <Input
                label="Cédula de Identidad (CI)"
                type="text"
                value={formData.ci}
                onChange={(e) =>
                  setFormData({ ...formData, ci: e.target.value.toUpperCase() })
                }
                error={errors.ci}
                placeholder="Ej: CB 12345678 o TJ 12345678"
                icon={<User size={18} />}
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                error={errors.telefono}
                placeholder="Ingrese su teléfono"
                icon={<Phone size={18} />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Agencia <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Building size={18} />
                  </div>
                  <select
                    value={formData.agencia}
                    onChange={(e) =>
                      setFormData({ ...formData, agencia: e.target.value })
                    }
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg border appearance-none',
                      'bg-background text-foreground',
                      'border-input',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      'transition-all duration-200 pl-10',
                      errors.agencia && 'border-destructive focus:ring-destructive'
                    )}
                    required
                  >
                    <option value="">Selecciona una agencia</option>
                    {AGENCIAS.map((agencia) => (
                      <option key={agencia} value={agencia}>
                        {agencia}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.agencia && (
                  <p className="mt-1 text-sm text-destructive">{errors.agencia}</p>
                )}
              </div>

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
                {loading ? 'Guardando...' : 'Completar perfil'}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-gray-500">
              Estos datos son necesarios para gestionar tus compras
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
