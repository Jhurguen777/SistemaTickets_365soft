import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CreditCard, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import adminService from '@/services/adminService'
import purchasesService from '@/services/purchasesService'

interface CheckoutSeat {
  id: string
  row: string
  number: number
  price: number
}

interface CheckoutState {
  state?: {
    eventId: string
    sectorId: string
    seats: CheckoutSeat[]
  }
}

interface FormData {
  // Attendee info
  nombre: string
  apellido: string
  email: string
  telefono: string
  documento: string

  // Billing info
  ciudad: string
  direccion: string
  codigoPostal: string

  // Payment
  medioPago: string
}

interface FormErrors {
  [key: string]: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation() as CheckoutState
  const { user } = useAuthStore()

  const { eventId, sectorId, seats } = location.state || {
    eventId: '',
    sectorId: '',
    seats: []
  }

  const [event, setEvent] = useState<any>(null)

  const [formData, setFormData] = useState<FormData>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: '',
    documento: '',
    ciudad: '',
    direccion: '',
    codigoPostal: '',
    medioPago: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0)

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      const eventData = await adminService.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Error loading event:', error)
    }
  }

  // Validation functions
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value || value.length < 3) {
          return `El ${name} debe tener al menos 3 letras`
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return `El ${name} solo puede contener letras`
        }
        return null

      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'El email no es válido'
        }
        return null

      case 'telefono':
        if (!value || !/^\d{10}$/.test(value)) {
          return 'El teléfono debe tener exactamente 10 dígitos'
        }
        return null

      case 'documento':
        if (!value || value.length < 5 || !/^\d+$/.test(value)) {
          return 'El documento debe tener al menos 5 dígitos y solo números'
        }
        return null

      case 'ciudad':
        if (!value || /[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'La ciudad no puede contener símbolos'
        }
        return null

      case 'codigoPostal':
        if (!value || value.length < 4 || !/^\d+$/.test(value)) {
          return 'El código postal debe tener al menos 4 dígitos y solo números'
        }
        return null

      case 'medioPago':
        if (!value) {
          return 'Debes seleccionar un medio de pago'
        }
        return null

      default:
        return null
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData])
      if (error) {
        newErrors[key] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('Por favor corrige los errores antes de continuar')
      return
    }

    if (!termsAccepted) {
      alert('Debes aceptar los términos y condiciones para continuar')
      return
    }

    if (!event) {
      alert('Error al cargar los datos del evento')
      return
    }

    setProcessing(true)

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Crear compra en localStorage
      const purchase = purchasesService.createPurchase({
        eventoId: eventId,
        eventoTitulo: event.title,
        eventoImagen: event.image,
        eventoFecha: event.date,
        eventoHora: event.time,
        eventoUbicacion: event.location,
        eventoDireccion: event.address,
        asientos: seats.map(seat => ({
          fila: seat.row,
          numero: seat.number,
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          email: formData.email,
          ci: formData.documento,
          sector: sectorId || 'General'
        })),
        monto: totalPrice
      })

      // Navegar a pantalla de éxito
      navigate('/compra-exitosa', {
        state: {
          purchaseId: purchase.id,
          eventData: event,
          attendeeData: {
            asientos: purchase.asientos,
            total: totalPrice
          }
        }
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Hubo un error al procesar tu compra. Por favor intenta nuevamente.')
    } finally {
      setProcessing(false)
    }
  }

  if (!seats || seats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No hay asientos seleccionados</p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-white/80 hover:text-white mb-4 font-semibold transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold">Finalizar compra</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Attendee Information */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Users className="mr-2 text-primary" size={24} />
                    Datos del asistente
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      error={errors.nombre}
                      placeholder="Tu nombre"
                      required
                    />

                    <Input
                      label="Apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      error={errors.apellido}
                      placeholder="Tu apellido"
                      required
                    />

                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      placeholder="tu@email.com"
                      required
                    />

                    <Input
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      error={errors.telefono}
                      placeholder="10 dígitos"
                      required
                    />

                    <Input
                      label="Documento de identidad"
                      name="documento"
                      value={formData.documento}
                      onChange={handleInputChange}
                      error={errors.documento}
                      placeholder="Número de documento"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <CreditCard className="mr-2 text-primary" size={24} />
                    Datos de facturación
                  </h2>

                  <div className="space-y-4">
                    <Input
                      label="Ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      error={errors.ciudad}
                      placeholder="Tu ciudad"
                      required
                    />

                    <Input
                      label="Dirección"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Tu dirección completa"
                      required
                    />

                    <Input
                      label="Código postal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      error={errors.codigoPostal}
                      placeholder="Código postal"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Método de pago</h2>

                  <div className="space-y-3">
                    {[
                      { value: 'visa', label: 'Tarjeta de Crédito Visa', icon: '💳' },
                      { value: 'mastercard', label: 'Tarjeta de Crédito Mastercard', icon: '💳' },
                      { value: 'amex', label: 'Tarjeta American Express', icon: '💳' },
                      { value: 'qr', label: 'QR Simple / BaniPay', icon: '📱' }
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.medioPago === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="medioPago"
                          value={method.value}
                          checked={formData.medioPago === method.value}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-semibold">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {errors.medioPago && (
                    <p className="mt-3 text-sm text-destructive">{errors.medioPago}</p>
                  )}
                </CardContent>
              </Card>

              {/* Terms */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Acepto los{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline font-semibold"
                      >
                        términos y condiciones
                      </button>
                      {' '}y la{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline font-semibold"
                      >
                        política de privacidad
                      </button>
                      . Entiendo que una vez realizada la compra no hay cambios ni devoluciones.
                    </span>
                  </label>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={processing || !termsAccepted}
                className="w-full"
              >
                {processing ? 'Procesando...' : 'Confirmar compra'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Resumen del pedido</h3>

                {/* Event Info */}
                <div className="mb-6 pb-6 border-b">
                  <p className="font-semibold text-lg">Vibra Carnavalera 2026</p>
                  <p className="text-sm text-gray-600">Sector VIP</p>
                  <p className="text-sm text-gray-600">15 de Febrero, 2026 - 20:00</p>
                </div>

                {/* Seats */}
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold mb-3">Asientos seleccionados:</h4>
                  <div className="space-y-2">
                    {seats.map((seat, index) => (
                      <div
                        key={seat.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          Asiento {index + 1}: Fila {seat.row} - {seat.number}
                        </span>
                        <span className="font-semibold">Bs {seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Bs {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tarifa de servicio</span>
                    <span>Bs 0.00</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t">
                    <span>Total</span>
                    <span className="text-primary">Bs {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-semibold mb-1">
                    🔒 Compra segura
                  </p>
                  <p className="text-xs text-green-700">
                    Tus datos están protegidos con encriptación SSL de 256 bits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
