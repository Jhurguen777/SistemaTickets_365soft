import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CreditCard, Users, ChevronDown, Check, Circle } from 'lucide-react'
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
  oficina: string
}

interface BillingData {
  ciudad: string
  direccion: string
  codigoPostal: string
}

interface PaymentData {
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

  // Estado para múltiples asistentes
  const [attendees, setAttendees] = useState<FormData[]>(
    seats.map(() => ({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      oficina: ''
    }))
  )
  const [completedAttendees, setCompletedAttendees] = useState<Set<number>>(new Set())
  const [expandedAttendee, setExpandedAttendee] = useState<number>(0)

  // Datos de facturación (compartidos)
  const [billingData, setBillingData] = useState<BillingData>({
    ciudad: '',
    direccion: '',
    codigoPostal: ''
  })

  // Datos de pago
  const [paymentData, setPaymentData] = useState<PaymentData>({
    medioPago: ''
  })

  const oficinas = [
    { codigo: '2526', nombre: 'ALFA FORZA' },
    { codigo: '2527', nombre: 'ALFA DIAMOND' },
    { codigo: '2528', nombre: 'ALFA PRO' },
    { codigo: '2529', nombre: 'ALFA HABITAT' },
    { codigo: '2530', nombre: 'ALFA ÉLITE' },
    { codigo: '2531', nombre: 'ALFA FUTURO' },
    { codigo: '2532', nombre: 'ALFA GRAND CONTINENTAL' },
    { codigo: '2533', nombre: 'ALFA LUX' },
    { codigo: '2534', nombre: 'ALFA PREMIER' },
    { codigo: '2535', nombre: 'ALFA LINK' },
    { codigo: '2536', nombre: 'ALFA NYSSA' },
    { codigo: '2537', nombre: 'ALFA CAPITAL' },
    { codigo: '2538', nombre: 'ALFA MAX' },
    { codigo: '2539', nombre: 'ALFA MASTER' },
    { codigo: '2540', nombre: 'ALFA GRAND CENTRAL' },
    { codigo: '2541', nombre: 'ALFA GRAND SKY' },
    { codigo: '2546', nombre: 'ALFA TOP' },
    { codigo: '2547', nombre: 'ALFA PLUS' },
    { codigo: '2548', nombre: 'ALFA NOVA' },
    { codigo: '2549', nombre: 'ALFA NEXUS' },
    { codigo: '2550', nombre: 'ALFA DUO' },
    { codigo: '2551', nombre: 'ALFA PRIME' },
    { codigo: '2552', nombre: 'ALFA RESIDENCE' },
    { codigo: '2553', nombre: 'ALFA GOLDEN' },
    { codigo: '2554', nombre: 'ALFA EMPORIO' },
    { codigo: '2555', nombre: 'ALFA GRAND HORIZONTE' },
    { codigo: '2556', nombre: 'ALFA GLOBAL' },
    { codigo: '2557', nombre: 'ALFA VIP INVERSIONES' },
    { codigo: '2559', nombre: 'ALFA BLUE AVENUE' },
    { codigo: '2560', nombre: 'ALFA SMART' },
    { codigo: '2561', nombre: 'ALFA HOME' },
    { codigo: '2562', nombre: 'ALFA NEW LIFE' },
    { codigo: '2563', nombre: 'ALFA TITANIUM' },
    { codigo: '2564', nombre: 'ALFA RED' },
    { codigo: '2565', nombre: 'ALFA CLICK' },
    { codigo: '2605', nombre: 'ALFA ULTRA' },
    { codigo: '2606', nombre: 'ALFA CITY' }
  ]

  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Actualizar attendees cuando cambian los asientos
  useEffect(() => {
    setAttendees(seats.map(() => ({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      oficina: ''
    })))
    setCompletedAttendees(new Set())
    setExpandedAttendee(0)
  }, [seats.length])

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
  const validateAttendeeField = (attendeeIndex: number, name: string, value: string): string | null => {
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
        if (!value || !/^\d+$/.test(value)) {
          return 'El teléfono solo debe contener números'
        }
        return null

      case 'documento':
        if (!value || value.length < 5 || !/^\d+$/.test(value)) {
          return 'El documento debe tener al menos 5 dígitos y solo números'
        }
        return null

      case 'oficina':
        if (!value) {
          return 'Debes seleccionar una oficina'
        }
        return null

      default:
        return null
    }
  }

  const validateAttendee = (attendeeIndex: number): boolean => {
    const attendee = attendees[attendeeIndex]
    const newErrors: FormErrors = {}

    Object.keys(attendee).forEach((key) => {
      const error = validateAttendeeField(attendeeIndex, key, attendee[key as keyof FormData])
      if (error) {
        newErrors[`${attendeeIndex}_${key}`] = error
      }
    })

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleAttendeeChange = (attendeeIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAttendees((prev) => {
      const newAttendees = [...prev]
      newAttendees[attendeeIndex] = {
        ...newAttendees[attendeeIndex],
        [name]: value
      }
      return newAttendees
    })

    // Clear error when user starts typing
    const errorKey = `${attendeeIndex}_${name}`
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleSaveAttendee = (attendeeIndex: number) => {
    if (validateAttendee(attendeeIndex)) {
      // Marcar como completado
      setCompletedAttendees((prev) => new Set([...prev, attendeeIndex]))

      // Cerrar acordeón actual y abrir el siguiente
      if (attendeeIndex < seats.length - 1) {
        setTimeout(() => {
          setExpandedAttendee(attendeeIndex + 1)
        }, 300)
      } else {
        // Si es el último, cerrar y scroll a facturación
        setTimeout(() => {
          setExpandedAttendee(-1)
        }, 300)
      }
    }
  }

  const handleEditAttendee = (attendeeIndex: number) => {
    setExpandedAttendee(attendeeIndex)
  }

  // Validation functions for billing and payment
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
        if (!value || !/^\d+$/.test(value)) {
          return 'El teléfono solo debe contener números'
        }
        return null

      case 'documento':
        if (!value || value.length < 5 || !/^\d+$/.test(value)) {
          return 'El documento debe tener al menos 5 dígitos y solo números'
        }
        return null

      case 'oficina':
        if (!value) {
          return 'Debes seleccionar una oficina'
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

  // Handlers para billing y payment
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBillingData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateBillingAndPayment = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar billing
    if (!billingData.ciudad) {
      newErrors['ciudad'] = 'La ciudad es requerida'
    }
    if (!billingData.direccion) {
      newErrors['direccion'] = 'La dirección es requerida'
    }
    if (!billingData.codigoPostal) {
      newErrors['codigoPostal'] = 'El código postal es requerido'
    }

    // Validar payment
    if (!paymentData.medioPago) {
      newErrors['medioPago'] = 'Debes seleccionar un medio de pago'
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los asistentes estén completados
    if (completedAttendees.size !== seats.length) {
      alert('Por favor completa los datos de todos los asistentes antes de continuar')
      return
    }

    if (!validateBillingAndPayment()) {
      alert('Por favor corrige los errores en facturación y pago antes de continuar')
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

      // Crear compra en localStorage con todos los asistentes
      const purchase = purchasesService.createPurchase({
        eventoId: eventId,
        eventoTitulo: event.title,
        eventoImagen: event.image,
        eventoFecha: event.date,
        eventoHora: event.time,
        eventoUbicacion: event.location,
        eventoDireccion: event.address,
        asientos: seats.map((seat, index) => ({
          fila: seat.row,
          numero: seat.number,
          nombre: `${attendees[index].nombre} ${attendees[index].apellido}`.trim(),
          email: attendees[index].email,
          ci: attendees[index].documento,
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
              {/* Attendee Information - Accordions */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Users className="mr-2 text-primary" size={24} />
                  Datos de los asistentes
                </h2>

                <div className="space-y-4">
                  {seats.map((seat, index) => {
                    const isCompleted = completedAttendees.has(index)
                    const isExpanded = expandedAttendee === index
                    const attendee = attendees[index]

                    return (
                      <Card
                        key={seat.id}
                        className={`transition-all duration-300 ${
                          isCompleted ? 'border-green-500 bg-green-50' : ''
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Accordion Header */}
                          <button
                            type="button"
                            onClick={() => isCompleted ? handleEditAttendee(index) : setExpandedAttendee(isExpanded ? -1 : index)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {isCompleted ? (
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                  <Check size={18} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                                  {index + 1}
                                </div>
                              )}
                              <div className="text-left">
                                <p className="font-semibold">
                                  Asistente {index + 1}
                                  {isCompleted && ' - Completado'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Fila {seat.row} - Asiento {seat.number}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Accordion Content */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6 pt-2 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <Input
                                  label="Nombre"
                                  name="nombre"
                                  value={attendee.nombre}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_nombre`]}
                                  placeholder="Tu nombre"
                                  required
                                />

                                <Input
                                  label="Apellido"
                                  name="apellido"
                                  value={attendee.apellido}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_apellido`]}
                                  placeholder="Tu apellido"
                                  required
                                />

                                <Input
                                  label="Email"
                                  name="email"
                                  type="email"
                                  value={attendee.email}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_email`]}
                                  placeholder="tu@email.com"
                                  required
                                />

                                <Input
                                  label="Teléfono"
                                  name="telefono"
                                  type="tel"
                                  value={attendee.telefono}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_telefono`]}
                                  placeholder="Tu número de teléfono"
                                  required
                                />

                                <Input
                                  label="Documento de identidad"
                                  name="documento"
                                  value={attendee.documento}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_documento`]}
                                  placeholder="Número de documento"
                                  required
                                />

                                <div>
                                  <label className="block text-sm font-semibold mb-2">
                                    Oficina <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    name="oficina"
                                    value={attendee.oficina}
                                    onChange={(e) => handleAttendeeChange(index, e)}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                      errors[`${index}_oficina`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                  >
                                    <option value="">Selecciona tu oficina</option>
                                    {oficinas.map((oficina) => (
                                      <option key={oficina.codigo} value={oficina.codigo}>
                                        {oficina.codigo} - {oficina.nombre}
                                      </option>
                                    ))}
                                  </select>
                                  {errors[`${index}_oficina`] && (
                                    <p className="mt-1 text-sm text-red-500">{errors[`${index}_oficina`]}</p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-6 flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => handleSaveAttendee(index)}
                                  className="w-full md:w-auto"
                                >
                                  {isCompleted ? 'Actualizar' : 'Guardar y continuar'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

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
                      value={billingData.ciudad}
                      onChange={handleBillingChange}
                      error={errors.ciudad}
                      placeholder="Tu ciudad"
                      required
                    />

                    <Input
                      label="Dirección"
                      name="direccion"
                      value={billingData.direccion}
                      onChange={handleBillingChange}
                      placeholder="Tu dirección completa"
                      required
                    />

                    <Input
                      label="Código postal"
                      name="codigoPostal"
                      value={billingData.codigoPostal}
                      onChange={handleBillingChange}
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
                          paymentData.medioPago === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="medioPago"
                          value={method.value}
                          checked={paymentData.medioPago === method.value}
                          onChange={handlePaymentChange}
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
