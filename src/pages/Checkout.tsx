import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Users, ChevronDown, Check, X, QrCode, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import adminService from '@/services/adminService'
import purchasesService from '@/services/purchasesService'
import { paymentServiceV2 } from '@/services/paymentServiceV2'
import api from '@/services/api'
import QRPaymentModal from '@/components/modals/QRPaymentModal'
import QRSelectModal from '@/components/modals/QRSelectModal'

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

  const rawState = location.state || (() => {
    try {
      const saved = sessionStorage.getItem('checkout_state')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })()

  const { eventId, reservaId, seats } = rawState || {
    eventId: '',
    reservaId: '',
    seats: [],
    tiempoExpiracion: ''
  }

  console.log('📍 Datos recibidos en Checkout:', { eventId, reservaId, seats, locationState: location.state })

  useEffect(() => {
  if (location.state) {
    sessionStorage.setItem('checkout_state', JSON.stringify(location.state))
  }
  }, [])

  const [event, setEvent] = useState<any>(null)

  // ── Claves de sessionStorage ────────────────────────────────────────────────
  const FORM_KEY      = `checkout_form_${eventId}`
  const COMPLETE_KEY  = `checkout_completed_${eventId}`
  const PAYMENT_KEY   = `checkout_payment_${eventId}`

  // Restaurar asistentes guardados o iniciar vacíos
  const [attendees, setAttendees] = useState<FormData[]>(() => {
    try {
      const saved = sessionStorage.getItem(FORM_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as FormData[]
        if (Array.isArray(parsed) && parsed.length === seats.length) return parsed
      }
    } catch {}
    return seats.map(() => ({
      nombre: '', apellido: '', email: '', telefono: '',
      documento: '', oficina: '', otraOficina: false, otraOficinaNombre: ''
    }))
  })

  const [completedAttendees, setCompletedAttendees] = useState<Set<number>>(() => {
    try {
      const saved = sessionStorage.getItem(COMPLETE_KEY)
      if (saved) return new Set<number>(JSON.parse(saved))
    } catch {}
    return new Set<number>()
  })

  const [expandedAttendee, setExpandedAttendee] = useState<number>(() => {
    // Abrir el primer asistente incompleto
    try {
      const saved = sessionStorage.getItem(COMPLETE_KEY)
      if (saved) {
        const completed: number[] = JSON.parse(saved)
        for (let i = 0; i < seats.length; i++) {
          if (!completed.includes(i)) return i
        }
        return -1
      }
    } catch {}
    return 0
  })

  const [paymentData, setPaymentData] = useState<PaymentData>({ medioPago: '' })

  // Estado para reanudar un QR ya generado
  const [resumeQRData, setResumeQRData] = useState<{
    qrPagoId: string; imagenQr: string; monto: number; moneda: string
    fechaVencimiento: string; eventTitle: string
  } | null>(null)

  // Modal de pago exitoso (detectado al volver al checkout después de pagar)
  const [showPaidModal, setShowPaidModal] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showQRSelectModal, setShowQRSelectModal] = useState(false)
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

  // Guardar asistentes en sessionStorage cada vez que cambian
  useEffect(() => {
    if (eventId && attendees.length > 0) {
      sessionStorage.setItem(FORM_KEY, JSON.stringify(attendees))
    }
  }, [attendees])

  // Guardar asistentes completados
  useEffect(() => {
    if (eventId) {
      sessionStorage.setItem(COMPLETE_KEY, JSON.stringify([...completedAttendees]))
    }
  }, [completedAttendees])

  // Guardar método de pago
  useEffect(() => {
    if (eventId) {
      sessionStorage.setItem(PAYMENT_KEY, JSON.stringify(paymentData))
    }
  }, [paymentData])

  // Verificar si hay un QR pendiente reutilizable al montar
  // Si ya fue pagado → mostrar modal de éxito directo
  // Si sigue pendiente → iniciar polling silencioso en background
  useEffect(() => {
    if (!eventId) return
    let silentPolling: { iniciar: () => void; detener: () => void } | null = null

    const checkPendingPayment = async () => {
      try {
        const raw = localStorage.getItem('pending_payment')
        if (!raw) return
        const data = JSON.parse(raw)
        if (data.eventId !== eventId) return

        // Si expiró, limpiar y salir
        const expiry = new Date(data.fechaVencimiento).getTime()
        if (Date.now() > expiry) {
          localStorage.removeItem('pending_payment')
          return
        }

        // Verificar estado real en el backend (Opción A)
        try {
          const resultado = await paymentServiceV2.verificarPago(data.qrPagoId)

          if (resultado.estado === 'PAGADO') {
            // Ya pagado: limpiar y mostrar modal de éxito
            localStorage.removeItem('pending_payment')
            sessionStorage.removeItem(FORM_KEY)
            sessionStorage.removeItem(COMPLETE_KEY)
            sessionStorage.removeItem(PAYMENT_KEY)
            setShowPaidModal(true)
            return
          }

          if (resultado.estado === 'FALLIDO' || resultado.estado === 'EXPIRADO') {
            localStorage.removeItem('pending_payment')
            return
          }
        } catch {
          // Error de red: igual mostrar el QR guardado
        }

        // PENDIENTE: guardar para banner + iniciar polling silencioso (Opción C)
        setResumeQRData(data)

        // Polling silencioso sin abrir el modal
        silentPolling = paymentServiceV2.iniciarPollingPago(
          data.qrPagoId,
          (resultado) => {
            if (resultado.estado === 'PAGADO') {
              localStorage.removeItem('pending_payment')
              sessionStorage.removeItem(FORM_KEY)
              sessionStorage.removeItem(COMPLETE_KEY)
              sessionStorage.removeItem(PAYMENT_KEY)
              silentPolling?.detener()
              setShowPaidModal(true)
            } else if (resultado.estado === 'FALLIDO' || resultado.estado === 'EXPIRADO') {
              localStorage.removeItem('pending_payment')
              setResumeQRData(null)
              silentPolling?.detener()
            }
          },
          15000
        )
        silentPolling.iniciar()
        ;(window as any).silentPolling = silentPolling
      } catch {}
    }

    checkPendingPayment()

    return () => {
      silentPolling?.detener()
    }
  }, [eventId])

  // Limpiar polling al desmontar (NO liberar asientos)
  useEffect(() => {
    return () => {
      const polling = (window as any).paymentPolling
      if (polling?.detener) polling.detener()
    }
  }, [])

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

      sessionStorage.removeItem('checkout_state')
      sessionStorage.removeItem(FORM_KEY)
      sessionStorage.removeItem(COMPLETE_KEY)
      sessionStorage.removeItem(PAYMENT_KEY)
      localStorage.removeItem('pending_payment')
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

      // Guardar pago pendiente en localStorage para recuperarlo si el usuario sale de la página
      const pendingPayloadToSave = {
        qrPagoId,
        imagenQr:        qrImageData,
        monto:           pagoResponse.qrPago.monto,
        moneda:          pagoResponse.qrPago.moneda,
        fechaVencimiento: pagoResponse.qrPago.fechaVencimiento,
        eventTitle:      event?.title ?? event?.titulo ?? '',
        eventId,
        createdAt:       new Date().toISOString()
      }
      localStorage.setItem('pending_payment', JSON.stringify(pendingPayloadToSave))

      // Auto-borrar del localStorage exactamente cuando vence el QR
      const msHastaVencimiento = new Date(pagoResponse.qrPago.fechaVencimiento).getTime() - Date.now()
      if (msHastaVencimiento > 0) {
        setTimeout(() => {
          const current = localStorage.getItem('pending_payment')
          if (current) {
            try {
              const parsed = JSON.parse(current)
              // Solo borrar si es el mismo QR (no uno más nuevo)
              if (parsed.qrPagoId === qrPagoId) {
                localStorage.removeItem('pending_payment')
                console.log('⏰ pending_payment eliminado del localStorage por vencimiento del QR')
              }
            } catch { localStorage.removeItem('pending_payment') }
          }
        }, msHastaVencimiento)
      }
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

    sessionStorage.removeItem('checkout_state')
    sessionStorage.removeItem(FORM_KEY)
    sessionStorage.removeItem(COMPLETE_KEY)
    sessionStorage.removeItem(PAYMENT_KEY)
    localStorage.removeItem('pending_payment')
    // NO liberar los asientos - el backend ya los marcó como VENDIDO
    setAsientosLiberados(true)

    try {
      const raw = localStorage.getItem('ticket_attendee_map')
      const map = raw ? JSON.parse(raw) : {}
      seats.forEach((seat, index) => {
        map[seat.id] = {
          nombre: `${attendees[index].nombre} ${attendees[index].apellido}`.trim(),
          email: attendees[index].email,
          ci: attendees[index].documento,
          telefono: attendees[index].telefono,
          oficina: attendees[index].otraOficina
            ? attendees[index].otraOficinaNombre
            : oficinas.find(o => o.codigo === attendees[index].oficina)?.nombre ?? attendees[index].oficina
        }
      })
      localStorage.setItem('ticket_attendee_map', JSON.stringify(map))
    } catch {}

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

    sessionStorage.removeItem('checkout_state')
    sessionStorage.removeItem(FORM_KEY)
    sessionStorage.removeItem(COMPLETE_KEY)
    sessionStorage.removeItem(PAYMENT_KEY)
    localStorage.removeItem('pending_payment')
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

    sessionStorage.removeItem('checkout_state')
    sessionStorage.removeItem(FORM_KEY)
    sessionStorage.removeItem(COMPLETE_KEY)
    sessionStorage.removeItem(PAYMENT_KEY)
    localStorage.removeItem('pending_payment')
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

  // Reanudar QR guardado sin generar uno nuevo
  const handleResumeQR = () => {
    if (!resumeQRData) return
    setCurrentQRData({
      qrData:          resumeQRData.imagenQr,
      qrUrl:           resumeQRData.imagenQr,
      imagenQr:        resumeQRData.imagenQr,
      moneda:          resumeQRData.moneda,
      monto:           resumeQRData.monto,
      tiempoExpiracion: resumeQRData.fechaVencimiento,
      compraId:        resumeQRData.qrPagoId
    })
    setCurrentPurchaseId(resumeQRData.qrPagoId)
    setPaymentStatus('PENDIENTE')
    setShowQRModal(true)

    // Reanudar polling
    const existingPolling = (window as any).paymentPolling
    if (existingPolling?.detener) existingPolling.detener()

    const polling = paymentServiceV2.iniciarPollingPago(
      resumeQRData.qrPagoId,
      (resultado) => {
        setPaymentStatus(resultado.estado)
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
    ;(window as any).paymentPolling = polling
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

        {/* Banner: reanudar QR pendiente */}
        {resumeQRData && !showQRModal && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <QrCode size={18} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-amber-900 text-sm leading-tight">
                  Ya generaste un QR de pago para este evento
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Vence: {new Date(resumeQRData.fechaVencimiento).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}{resumeQRData.moneda} {resumeQRData.monto?.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResumeQR}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Ver QR
            </button>
          </div>
        )}

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

              <Card className="mb-4 sm:mb-6 overflow-hidden border-primary/20 shadow-lg ring-1 ring-primary/5">
                <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-primary/10">
                  <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Método de pago
                  </h2>
                </div>
                <CardContent className="p-4 sm:p-6">
                  {paymentData.medioPago === 'qr' ? (
                    /* --- Método ya seleccionado --- */
                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-400 bg-green-50">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Seleccionado</span>
                        </div>
                        <p className="font-bold text-sm text-gray-900">Pago QR - Banco MC4</p>
                        <p className="text-xs text-gray-500">Banca Móvil · Transacción segura</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQRSelectModal(true)}
                        className="text-xs text-primary font-bold border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors flex-shrink-0"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    /* --- Sin selección --- */
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowQRSelectModal(true)}
                        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-[.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-base font-extrabold text-primary">Seleccionar método de pago</p>
                            <p className="text-xs text-gray-500 mt-0.5">Toca aquí para elegir cómo pagar</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <ChevronDown className="w-4 h-4 text-white -rotate-90" />
                        </div>
                      </button>
                    </div>
                  )}
                  {errors.medioPago && <p className="mt-3 text-sm text-destructive font-semibold">{errors.medioPago}</p>}
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
                {processing ? 'Procesando...' : 'Generar QR'}
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

      <QRSelectModal
        isOpen={showQRSelectModal}
        onClose={() => setShowQRSelectModal(false)}
        onSelect={(method) => {
          setPaymentData(prev => ({ ...prev, medioPago: method }))
        }}
        selected={paymentData.medioPago}
      />

      {/* Modal: Pago ya completado (detectado al volver al checkout) */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Barra verde superior */}
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />

            <div className="p-8 text-center">
              {/* Ícono animado */}
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={44} className="text-green-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Pago confirmado!
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                Tu pago fue procesado exitosamente.
              </p>
              {event && (
                <p className="text-primary font-semibold text-sm mb-6">
                  {event.title || event.titulo}
                </p>
              )}

              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-green-800 text-sm font-medium">
                  Tus entradas están disponibles en Mis Compras
                </p>
              </div>

              <button
                onClick={() => navigate('/mis-compras')}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Ver mis entradas
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
