import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Users, ChevronDown, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import adminService from '@/services/adminService'
import purchasesService from '@/services/purchasesService'
import { paymentServiceV2 } from '@/services/paymentServiceV2'
import api from '@/services/api'
import QRPaymentModal from '@/components/modals/QRPaymentModal'

interface CheckoutSeat { id: string; row: string; number: number; price: number }

interface CheckoutState {
  state?: {
    eventId: string
    reservaId: string
    seats: CheckoutSeat[]
    tiempoExpiracion?: string
  }
}

interface FormData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  documento: string
  oficina: string
  otraOficina: boolean
  otraOficinaNombre: string
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
  const { eventId, reservaId, seats } = location.state || {
    eventId: '',
    reservaId: '',
    seats: [],
    tiempoExpiracion: ''
  }

  console.log('📍 Datos recibidos en Checkout:', { eventId, reservaId, seats, locationState: location.state })

  const [event, setEvent] = useState<any>(null)

  const [attendees, setAttendees] = useState<FormData[]>(
    seats.map(() => ({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      oficina: '',
      otraOficina: false,
      otraOficinaNombre: ''
    }))
  )
  const [completedAttendees, setCompletedAttendees] = useState<Set<number>>(new Set())
  const [expandedAttendee, setExpandedAttendee] = useState<number>(0)

  const [paymentData, setPaymentData] = useState<PaymentData>({ medioPago: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentQRData, setCurrentQRData] = useState<any>(null)
  const [currentPurchaseId, setCurrentPurchaseId] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<'PENDIENTE' | 'PROCESANDO' | 'PAGADO' | 'FALLIDO' | 'EXPIRADO'>('PENDIENTE')

  const [isExpired, setIsExpired] = useState(false)
  const [asientosLiberados, setAsientosLiberados] = useState(false)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  const oficinas = [
    { codigo: '2526', nombre: 'ALFA FORZA' }, { codigo: '2527', nombre: 'ALFA DIAMOND' },
    { codigo: '2528', nombre: 'ALFA PRO' }, { codigo: '2529', nombre: 'ALFA HABITAT' },
    { codigo: '2530', nombre: 'ALFA ÉLITE' }, { codigo: '2531', nombre: 'ALFA FUTURO' },
    { codigo: '2532', nombre: 'ALFA GRAND CONTINENTAL' }, { codigo: '2533', nombre: 'ALFA LUX' },
    { codigo: '2534', nombre: 'ALFA PREMIER' }, { codigo: '2535', nombre: 'ALFA LINK' },
    { codigo: '2536', nombre: 'ALFA NYSSA' }, { codigo: '2537', nombre: 'ALFA CAPITAL' },
    { codigo: '2538', nombre: 'ALFA MAX' }, { codigo: '2539', nombre: 'ALFA MASTER' },
    { codigo: '2540', nombre: 'ALFA GRAND CENTRAL' }, { codigo: '2541', nombre: 'ALFA GRAND SKY' },
    { codigo: '2546', nombre: 'ALFA TOP' }, { codigo: '2547', nombre: 'ALFA PLUS' },
    { codigo: '2548', nombre: 'ALFA NOVA' }, { codigo: '2549', nombre: 'ALFA NEXUS' },
    { codigo: '2550', nombre: 'ALFA DUO' }, { codigo: '2551', nombre: 'ALFA PRIME' },
    { codigo: '2552', nombre: 'ALFA RESIDENCE' }, { codigo: '2553', nombre: 'ALFA GOLDEN' },
    { codigo: '2554', nombre: 'ALFA EMPORIO' }, { codigo: '2555', nombre: 'ALFA GRAND HORIZONTE' },
    { codigo: '2556', nombre: 'ALFA GLOBAL' }, { codigo: '2557', nombre: 'ALFA VIP INVERSIONES' },
    { codigo: '2559', nombre: 'ALFA BLUE AVENUE' }, { codigo: '2560', nombre: 'ALFA SMART' },
    { codigo: '2561', nombre: 'ALFA HOME' }, { codigo: '2562', nombre: 'ALFA NEW LIFE' },
    { codigo: '2563', nombre: 'ALFA TITANIUM' }, { codigo: '2564', nombre: 'ALFA RED' },
    { codigo: '2565', nombre: 'ALFA CLICK' }, { codigo: '2605', nombre: 'ALFA ULTRA' },
    { codigo: '2606', nombre: 'ALFA CITY' }
  ]

  // Función para liberar asientos al salir/cancelar
  const liberarAsientos = async () => {
    if (!reservaId || !eventId) return
    if (asientosLiberados) {
      console.log('⚠️ Asientos ya liberados, evitando duplicación')
      return
    }

    try {
      await api.post('/asientos/liberar-varios', {
        asientosIds: seats.map(s => s.id),
        eventoId: eventId
      })
      setAsientosLiberados(true)
      console.log('✅ Asientos liberados al salir del checkout')
    } catch (error) {
      console.error('⚠️ Error liberando asientos:', error)
      // Continuar aunque falle - el TTL de Redis eventualmente expirará
    }
  }

  // Limpiar polling y asientos al desmontar o salir
  useEffect(() => {
    // Solo limpiar el polling al desmontar, NO liberar asientos automáticamente
    const cleanup = () => {
      // Detener polling
      const polling = (window as any).paymentPolling
      if (polling && polling.detener) {
        polling.detener()
      }
    }

    return cleanup
  }, [])

  useEffect(() => {
    setAttendees(seats.map(() => ({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      oficina: '',
      otraOficina: false,
      otraOficinaNombre: ''
    })))
    setCompletedAttendees(new Set())
    setExpandedAttendee(0)
  }, [seats.length])

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0)

  useEffect(() => { if (eventId) loadEvent() }, [eventId])

  const loadEvent = async () => {
    try {
      const eventData = await adminService.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Error loading event:', error)
    }
  }

  const validateAttendeeField = (attendeeIndex: number, name: string, value: string): string | null => {
    const trimmedValue = value.trim()
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!trimmedValue || trimmedValue.length < 2) return `El ${name} debe tener al menos 2 letras`
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedValue)) return `El ${name} solo puede contener letras`
        return null
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El email no es válido'
        return null
      case 'telefono':
        if (!value || !/^\d+$/.test(value)) return 'El teléfono solo debe contener números'
        return null
      case 'documento':
        if (value && (value.length < 5 || !/^\d+$/.test(value))) return 'El documento debe tener al menos 5 dígitos y solo números'
        return null
      case 'oficina': {
        const attendee = attendees[attendeeIndex]
        if (attendee?.otraOficina) {
          if (!attendee.otraOficinaNombre || attendee.otraOficinaNombre.trim().length < 3) {
            return 'Debes ingresar el nombre de tu oficina Alfa'
          }
        } else if (!value) {
          return 'Debes seleccionar una oficina Alfa'
        }
        return null
      }
      case 'otraOficinaNombre':
        if (value && value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres'
        return null
      default:
        return null
    }
  }

  const validateAttendee = (attendeeIndex: number): boolean => {
    const attendee = attendees[attendeeIndex]
    const newErrors: FormErrors = {}
    Object.keys(attendee).forEach((key) => {
      const val = attendee[key as keyof FormData]
      const error = validateAttendeeField(attendeeIndex, key, String(val))
      if (error) newErrors[`${attendeeIndex}_${key}`] = error
    })
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleAttendeeChange = (attendeeIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value

    setAttendees((prev) => {
      const newAttendees = [...prev]
      const updated: FormData = { ...newAttendees[attendeeIndex], [name]: value }
      if (name === 'otraOficina' && value === true) updated.oficina = ''
      if (name === 'otraOficina' && value === false) updated.otraOficinaNombre = ''
      newAttendees[attendeeIndex] = updated
      return newAttendees
    })

    const errorKey = `${attendeeIndex}_${name}`
    if (errors[errorKey]) setErrors((prev) => { const n = { ...prev }; delete n[errorKey]; return n })
  }

  const handleSaveAttendee = (attendeeIndex: number) => {
    if (validateAttendee(attendeeIndex)) {
      setCompletedAttendees((prev) => new Set([...prev, attendeeIndex]))
      if (attendeeIndex < seats.length - 1) setTimeout(() => setExpandedAttendee(attendeeIndex + 1), 300)
      else setTimeout(() => setExpandedAttendee(-1), 300)
    }
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const validatePayment = (): boolean => {
    const newErrors: FormErrors = {}
    if (!paymentData.medioPago) newErrors['medioPago'] = 'Debes seleccionar un medio de pago'
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleCancel = async () => {
    if (confirm('¿Estás seguro de cancelar la compra? Los asientos seleccionados serán liberados.')) {
      // Detener polling
      const polling = (window as any).paymentPolling
      if (polling && polling.detener) {
        polling.detener()
      }

      // Liberar asientos
      await liberarAsientos()

      navigate(-1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar automáticamente todos los asistentes
    let allAttendeesValid = true
    const newErrors: FormErrors = {}

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i]
      Object.keys(attendee).forEach((key) => {
        const val = attendee[key as keyof FormData]
        const error = validateAttendeeField(i, key, String(val))
        if (error) {
          newErrors[`${i}_${key}`] = error
          allAttendeesValid = false
        }
      })
    }

    setErrors(newErrors)

    if (!allAttendeesValid) {
      // Expandir el primer asistente con errores
      const firstErrorIndex = Object.keys(newErrors)[0]?.split('_')[0]
      if (firstErrorIndex !== undefined) {
        setExpandedAttendee(parseInt(firstErrorIndex))
      }
      alert('Por favor completa los datos de todos los asistentes antes de continuar')
      return
    }

    if (!validatePayment()) {
      alert('Por favor selecciona un método de pago antes de continuar')
      return
    }
    if (!termsAccepted) {
      alert('Debes aceptar los términos y condiciones para continuar')
      return
    }
    if (!event) { alert('Error al cargar los datos del evento'); return }
    if (!reservaId) { alert('No hay reserva activa. Por favor selecciona tus asientos nuevamente.'); return }
    if (paymentData.medioPago !== 'qr') { alert('Actualmente solo aceptamos pagos con QR'); return }

    setProcessing(true)
    setPaymentStatus('PENDIENTE')
    try {
      // Paso 1: Iniciar el pago con QR (los asientos ya están reservados)
      const requestData = {
        eventoId: eventId,
        asientoId: seats[0]?.id, // Para compatibilidad, enviar el primer asiento
        asientosIds: seats.map(s => s.id),
        monto: totalPrice
      }
      console.log('📤 Enviando datos de pago:', requestData)

      const pagoResponse = await paymentServiceV2.iniciarPagoQR(requestData)
      console.log('📥 Respuesta del pago:', pagoResponse)

      if (!pagoResponse.success || !pagoResponse.qrPago) {
        throw new Error(pagoResponse.error || 'Error al iniciar el pago')
      }

      const qrPagoId = pagoResponse.qrPago.id

      // Configurar los datos del QR para mostrar en el modal
      const qrImageData = pagoResponse.qrPago.imagenQr
      console.log('📷 Preparando datos del QR:', {
        qrImageDataLength: qrImageData?.length,
        qrImageDataPreview: qrImageData?.substring(0, 50) + '...',
        pagoResponseKeys: Object.keys(pagoResponse),
        hasQrPago: !!pagoResponse.qrPago
      })

      setCurrentQRData({
        qrData: qrImageData,
        qrUrl: qrImageData,
        imagenQr: qrImageData,
        moneda: pagoResponse.qrPago.moneda,
        monto: pagoResponse.qrPago.monto,
        tiempoExpiracion: pagoResponse.qrPago.fechaVencimiento,
        compraId: qrPagoId
      })
      setCurrentPurchaseId(qrPagoId)
      setShowQRModal(true)

      // Paso 2: Iniciar el polling para verificar el pago
      console.log('🔄 Iniciando polling con ID:', qrPagoId)
      const polling = paymentServiceV2.iniciarPollingPago(
        qrPagoId,
        (resultado) => {
          setPaymentStatus(resultado.estado)

          // Si el pago fue exitoso
          if (resultado.estado === 'PAGADO') {
            handlePaymentSuccess(reservaId!, resultado.datos?.transaccionId)
          } else if (resultado.estado === 'FALLIDO') {
            handlePaymentFailed(resultado.datos?.mensaje)
          } else if (resultado.estado === 'EXPIRADO') {
            handlePaymentExpired()
          }
        }
      )

      polling.iniciar()

      // Guardar el polling en el componente para poder detenerlo
      ;(window as any).paymentPolling = polling
    } catch (error: any) {
      console.error('Error en el proceso de pago:', error)
      alert(`Error: ${error.message || 'Hubo un error al procesar tu compra.'}`)
      setPaymentStatus('FALLIDO')
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = (_compraId: string, _transaccionId?: string) => {
    setShowQRModal(false)
    // Detener polling
    const polling = (window as any).paymentPolling
    if (polling && polling.detener) {
      polling.detener()
    }

    // NO liberar los asientos - el backend ya los marcó como VENDIDO
    setAsientosLiberados(true)

    const purchase = purchasesService.createPurchase({
      eventoId: eventId,
      eventoTitulo: event.title,
      eventoImagen: event.image,
      eventoFecha: event.date,
      eventoHora: event.time,
      eventoUbicacion: event.location,
      eventoDireccion: event.address,
      asientos: seats.map((seat, index) => ({
        fila: seat.row, numero: seat.number,
        nombre: `${attendees[index].nombre} ${attendees[index].apellido}`.trim(),
        email: attendees[index].email, ci: attendees[index].documento, sector: 'General'
      })),
      monto: totalPrice
    })
    navigate('/compra-exitosa', {
      state: {
        purchaseId: purchase.id,
        eventData: event,
        attendeeData: { asientos: purchase.asientos, total: totalPrice }
      }
    })
  }

  const handlePaymentFailed = async (mensaje?: string) => {
    setShowQRModal(false)

    // Detener polling
    const polling = (window as any).paymentPolling
    if (polling && polling.detener) {
      polling.detener()
    }

    // Liberar asientos cuando el pago falla
    await liberarAsientos()

    alert(mensaje || 'El pago falló. Por favor intenta nuevamente.')
  }

  const handlePaymentExpired = async () => {
    setShowQRModal(false)

    // Detener polling
    const polling = (window as any).paymentPolling
    if (polling && polling.detener) {
      polling.detener()
    }

    // Liberar asientos cuando el tiempo expira
    await liberarAsientos()

    alert('El tiempo para el pago ha expirado. Por favor selecciona tus asientos nuevamente.')
    navigate(-1)
  }

  // Wrapper para QRPaymentModal que no acepta parámetros
  const handleModalPaymentSuccess = () => {
    // El polling maneja la actualización del estado
    setShowQRModal(false)
  }

  if (!seats || seats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full mx-auto">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-600 mb-4">No hay asientos seleccionados</p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              <X size={14} className="mr-1.5" />
              Cancelar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="mr-1 sm:mr-2" />
              Volver
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-3xl font-bold">Finalizar compra</h1>
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="sm:hidden flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold"
            >
              <span>Bs {totalPrice.toFixed(2)}</span>
              <ChevronDown size={14} className={`transition-transform ${showMobileSummary ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {showMobileSummary && (
        <div className="sm:hidden bg-white border-b px-4 py-4 shadow-sm">
          {event && <p className="font-semibold text-sm mb-2">{event.title}</p>}
          <div className="space-y-1 mb-3">
            {seats.map((seat) => (
              <div key={seat.id} className="flex justify-between text-sm text-gray-600">
                <span>Fila {seat.row} - Asiento {seat.number}</span>
                <span>Bs {seat.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-sm">
            <span>Total</span>
            <span className="text-primary">Bs {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 flex items-center">
                  <Users className="mr-2 text-primary" size={20} />
                  Datos de los asistentes
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {seats.map((seat, index) => {
                    const isCompleted = completedAttendees.has(index)
                    const isExpanded = expandedAttendee === index
                    const attendee = attendees[index]
                    return (
                      <Card
                        key={seat.id}
                        className={`transition-all duration-300 ${isCompleted ? 'border-green-500 bg-green-50' : ''}`}
                      >
                        <CardContent className="p-0">
                          <button
                            type="button"
                            onClick={() => setExpandedAttendee(isExpanded ? -1 : index)}
                            className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {isCompleted
                                ? <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0"><Check size={14} /></div>
                                : <div className="w-7 h-7 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">{index + 1}</div>
                              }
                              <div className="text-left">
                                <p className="font-semibold text-sm sm:text-base">
                                  Asistente {index + 1}{isCompleted && ' - Completado'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Fila {seat.row} - Asiento {seat.number}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2 border-t">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">

                                <Input label="Nombre" name="nombre" value={attendee.nombre}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_nombre`]} placeholder="Tu nombre" required />

                                <Input label="Apellido" name="apellido" value={attendee.apellido}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_apellido`]} placeholder="Tu apellido" required />

                                <Input label="Email (opcional)" name="email" type="email" value={attendee.email}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_email`]} placeholder="tu@email.com" />

                                <Input label="Teléfono" name="telefono" type="tel" value={attendee.telefono}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_telefono`]} placeholder="Tu número de teléfono" required />

                                <Input label="Documento de identidad (opcional)" name="documento" value={attendee.documento}
                                  onChange={(e) => handleAttendeeChange(index, e)}
                                  error={errors[`${index}_documento`]} placeholder="Número de documento" />

                                <div>
                                  <label className="block text-sm font-semibold mb-1.5">
                                    Oficina Alfa <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    name="oficina"
                                    value={attendee.oficina}
                                    onChange={(e) => handleAttendeeChange(index, e)}
                                    disabled={attendee.otraOficina}
                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all ${
                                      errors[`${index}_oficina`] ? 'border-red-500' : 'border-gray-300'
                                    } ${attendee.otraOficina ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                                    required={!attendee.otraOficina}
                                  >
                                    <option value="">Selecciona tu oficina Alfa</option>
                                    {oficinas.map((o) => (
                                      <option key={o.codigo} value={o.codigo}>
                                        {o.codigo} - {o.nombre}
                                      </option>
                                    ))}
                                  </select>
                                  {errors[`${index}_oficina`] && (
                                    <p className="mt-1 text-xs text-red-500">{errors[`${index}_oficina`]}</p>
                                  )}
                                </div>

                                <div className="flex items-center sm:mt-6">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      name="otraOficina"
                                      checked={attendee.otraOficina}
                                      onChange={(e) => handleAttendeeChange(index, e)}
                                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">
                                      Pertenezco a otra oficina Alfa (no listada)
                                    </span>
                                  </label>
                                </div>

                                {attendee.otraOficina && (
                                  <div className="sm:col-span-2">
                                    <Input
                                      label="Nombre de tu oficina Alfa"
                                      name="otraOficinaNombre"
                                      value={attendee.otraOficinaNombre}
                                      onChange={(e) => handleAttendeeChange(index, e)}
                                      error={errors[`${index}_otraOficinaNombre`]}
                                      placeholder="Ej: Alfa Central"
                                      required
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="mt-4">
                                <Button type="button" onClick={() => handleSaveAttendee(index)} className="w-full sm:w-auto">
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

              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-xl font-bold mb-4 sm:mb-6">Método de pago</h2>
                  <label className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentData.medioPago === 'qr' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input type="radio" name="medioPago" value="qr" checked={paymentData.medioPago === 'qr'} onChange={handlePaymentChange} className="mr-3" />
                    <span className="text-xl mr-2">📱</span>
                    <span className="font-semibold text-sm sm:text-base">Pago QR - Banco MC4</span>
                  </label>
                  {paymentData.medioPago === 'qr' && (
                    <div className="mt-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800 font-semibold mb-2">ℹ️ ¿Cómo pagar?</p>
                      <ol className="text-xs sm:text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Confirma tu compra</li>
                        <li>Escanea el código QR que aparecerá</li>
                        <li>Paga desde tu app bancaria (Banco MC4)</li>
                        <li>¡Listo! Recibirás confirmación</li>
                      </ol>
                    </div>
                  )}
                  {errors.medioPago && <p className="mt-2 text-sm text-destructive">{errors.medioPago}</p>}
                </CardContent>
              </Card>

              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Acepto los{' '}
                      <button type="button" className="text-primary hover:underline font-semibold">términos y condiciones</button>
                      {' '}y la{' '}
                      <button type="button" className="text-primary hover:underline font-semibold">política de privacidad</button>.
                      {' '}Entiendo que una vez realizada la compra no hay cambios ni devoluciones.
                    </span>
                  </label>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" disabled={processing || !termsAccepted} className="w-full text-sm sm:text-base">
                {processing ? 'Procesando...' : 'Confirmar compra'}
              </Button>
            </form>
          </div>

          <div className="hidden sm:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Resumen del pedido</h3>

                <div className="mb-6 pb-6 border-b">
                  {event ? (
                    <>
                      <p className="font-semibold text-lg">{event.title}</p>
                      <p className="text-sm text-gray-600">General</p>
                      <p className="text-sm text-gray-600">
                        {event.date && new Date(event.date).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })} - {event.time || '20:00'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                    </>
                  )}
                </div>

                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold mb-3">Asientos seleccionados:</h4>
                  <div className="space-y-2">
                    {seats.map((seat, index) => (
                      <div key={seat.id} className="flex justify-between items-center text-sm">
                        <span>Asiento {index + 1}: Fila {seat.row} - {seat.number}</span>
                        <span className="font-semibold">Bs {seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Bs {totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tarifa de servicio</span><span>Bs 0.00</span></div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t">
                    <span>Total</span>
                    <span className="text-primary">Bs {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-semibold mb-1">🔒 Compra segura</p>
                  <p className="text-xs text-green-700">Tus datos están protegidos con encriptación SSL de 256 bits</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <QRPaymentModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={currentQRData}
        _purchaseId={currentPurchaseId}
        _onPaymentSuccess={handleModalPaymentSuccess}
        _onPaymentFailed={handlePaymentFailed}
        paymentStatus={paymentStatus}
      />
    </div>
  )
}
