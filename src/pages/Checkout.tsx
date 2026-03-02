import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CreditCard, Users, ChevronDown, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import adminService from '@/services/adminService'
import purchasesService from '@/services/purchasesService'
import paymentService from '@/services/paymentService'
import QRPaymentModal from '@/components/modals/QRPaymentModal'

interface CheckoutSeat { id: string; row: string; number: number; price: number }
interface CheckoutState {
  state?: { eventId: string; sectorId: string; seats: CheckoutSeat[] }
}
interface FormData { nombre: string; apellido: string; email: string; telefono: string; documento: string; oficina: string }
interface BillingData { ciudad: string; direccion: string; codigoPostal: string }
interface PaymentData { medioPago: string }
interface FormErrors { [key: string]: string }
interface NormalizedEvent { id: string; title: string; image: string; date: string; time: string; location: string; address: string; price: number; [key: string]: any }

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation() as CheckoutState
  const { } = useAuthStore()
  const { eventId, sectorId, seats } = location.state || { eventId: '', sectorId: '', seats: [] }

  const [event, setEvent] = useState<NormalizedEvent | null>(null)
  const [attendees, setAttendees] = useState<FormData[]>(seats.map(() => ({ nombre: '', apellido: '', email: '', telefono: '', documento: '', oficina: '' })))
  const [completedAttendees, setCompletedAttendees] = useState<Set<number>>(new Set())
  const [expandedAttendee, setExpandedAttendee] = useState<number>(0)
  const [billingData, setBillingData] = useState<BillingData>({ ciudad: '', direccion: '', codigoPostal: '' })
  const [paymentData, setPaymentData] = useState<PaymentData>({ medioPago: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentQRData, setCurrentQRData] = useState<any>(null)
  const [currentPurchaseId, setCurrentPurchaseId] = useState<string>('')
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

  useEffect(() => {
    setAttendees(seats.map(() => ({ nombre: '', apellido: '', email: '', telefono: '', documento: '', oficina: '' })))
    setCompletedAttendees(new Set())
    setExpandedAttendee(0)
  }, [seats.length])

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0)

  useEffect(() => { if (eventId) loadEvent() }, [eventId])

  const loadEvent = async () => {
    try {
      const rawEvent = await adminService.getEventById(eventId) as any
      setEvent({
        ...rawEvent,
        id: String(rawEvent.id || eventId),
        title: rawEvent.titulo || rawEvent.title || 'Evento',
        image: rawEvent.imagenUrl || rawEvent.image || '/media/banners/default.jpg',
        date: rawEvent.fecha || rawEvent.date || '',
        time: rawEvent.hora || rawEvent.time || '',
        location: rawEvent.ubicacion || rawEvent.location || '',
        address: rawEvent.direccion || rawEvent.address || '',
        price: rawEvent.precio || rawEvent.price || 0,
      })
    } catch (error) { console.error('Error loading event:', error) }
  }

  const formatEventDate = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const formatted = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      return timeStr ? `${formatted} - ${timeStr}` : formatted
    } catch { return dateStr }
  }

  const validateAttendeeField = (_i: number, name: string, value: string): string | null => {
    switch (name) {
      case 'nombre': case 'apellido':
        if (!value || value.length < 3) return `El ${name} debe tener al menos 3 letras`
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return `El ${name} solo puede contener letras`
        return null
      case 'email': if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El email no es válido'; return null
      case 'telefono': if (!value || !/^\d+$/.test(value)) return 'Solo números'; return null
      case 'documento': if (!value || value.length < 5 || !/^\d+$/.test(value)) return 'Mínimo 5 dígitos'; return null
      case 'oficina': if (!value) return 'Selecciona una oficina'; return null
      default: return null
    }
  }

  const validateAttendee = (idx: number): boolean => {
    const attendee = attendees[idx]
    const newErrors: FormErrors = {}
    Object.keys(attendee).forEach((key) => {
      const error = validateAttendeeField(idx, key, attendee[key as keyof FormData])
      if (error) newErrors[`${idx}_${key}`] = error
    })
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleAttendeeChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAttendees((prev) => { const n = [...prev]; n[idx] = { ...n[idx], [name]: value }; return n })
    const key = `${idx}_${name}`
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleSaveAttendee = (idx: number) => {
    if (validateAttendee(idx)) {
      setCompletedAttendees((prev) => new Set([...prev, idx]))
      if (idx < seats.length - 1) setTimeout(() => setExpandedAttendee(idx + 1), 300)
      else setTimeout(() => setExpandedAttendee(-1), 300)
    }
  }

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBillingData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const validateBillingAndPayment = (): boolean => {
    const newErrors: FormErrors = {}
    if (!billingData.ciudad) newErrors['ciudad'] = 'La ciudad es requerida'
    if (!billingData.direccion) newErrors['direccion'] = 'La dirección es requerida'
    if (!billingData.codigoPostal) newErrors['codigoPostal'] = 'El código postal es requerido'
    if (!paymentData.medioPago) newErrors['medioPago'] = 'Debes seleccionar un medio de pago'
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (completedAttendees.size !== seats.length) { alert('Completa los datos de todos los asistentes'); return }
    if (!validateBillingAndPayment()) { alert('Corrige los errores antes de continuar'); return }
    if (!termsAccepted) { alert('Acepta los términos y condiciones'); return }
    if (!event) { alert('Error al cargar los datos del evento'); return }
    if (paymentData.medioPago !== 'qr') { alert('Actualmente solo aceptamos pagos con QR'); return }

    setProcessing(true)
    try {
      const firstSeat = seats[0]
      const response = await paymentService.iniciarPagoQR({ asientoId: firstSeat.id, eventoId: eventId })
      if (!response.success) throw new Error(response.message || 'Error al iniciar el pago')
      setCurrentQRData({
        id: response.qrPago.id,
        alias: response.qrPago.alias,
        monto: response.compra.monto,
        moneda: response.compra.moneda,
        imagenQr: response.qrPago.imagenQr,
        fechaVencimiento: response.qrPago.fechaVencimiento,
        detalleGlosa: `Ticket: ${event.title} - Asiento: ${firstSeat.row}${firstSeat.number}`
      })
      setCurrentPurchaseId(response.compra.id)
      setShowQRModal(true)
    } catch (error: any) {
      alert(`Error: ${error.message || 'Hubo un error al procesar tu compra.'}`)
    } finally { setProcessing(false) }
  }

  const handlePaymentSuccess = () => {
    setShowQRModal(false)
    const purchase = purchasesService.createPurchase({
      eventoId: eventId, eventoTitulo: event!.title, eventoImagen: event!.image,
      eventoFecha: event!.date, eventoHora: event!.time, eventoUbicacion: event!.location,
      eventoDireccion: event!.address,
      asientos: seats.map((seat, index) => ({
        fila: seat.row, numero: seat.number,
        nombre: `${attendees[index].nombre} ${attendees[index].apellido}`.trim(),
        email: attendees[index].email, ci: attendees[index].documento, sector: sectorId || 'General'
      })),
      monto: totalPrice
    })
    navigate('/compra-exitosa', { state: { purchaseId: purchase.id, eventData: event, attendeeData: { asientos: purchase.asientos, total: totalPrice } } })
  }

  const handlePaymentFailed = () => { setShowQRModal(false); alert('El pago falló o expiró. Por favor intenta nuevamente.') }

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
      {/* Header */}
      <div className="bg-primary text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-white/80 hover:text-white mb-2 sm:mb-4 font-semibold transition-colors text-sm sm:text-base">
            <ArrowLeft size={18} className="mr-1 sm:mr-2" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-3xl font-bold">Finalizar compra</h1>
            {/* Resumen móvil toggle */}
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

      {/* Resumen colapsable en móvil */}
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

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>

              {/* Asistentes */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 flex items-center">
                  <Users className="mr-2 text-primary" size={18} />
                  Datos de los asistentes
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {seats.map((seat, index) => {
                    const isCompleted = completedAttendees.has(index)
                    const isExpanded = expandedAttendee === index
                    const attendee = attendees[index]
                    return (
                      <Card key={seat.id} className={`transition-all duration-300 ${isCompleted ? 'border-green-500 bg-green-50' : ''}`}>
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
                                  Asistente {index + 1}{isCompleted && ' ✓'}
                                </p>
                                <p className="text-xs text-gray-500">Fila {seat.row} - Asiento {seat.number}</p>
                              </div>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2 border-t">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
                                <Input label="Nombre" name="nombre" value={attendee.nombre} onChange={(e) => handleAttendeeChange(index, e)} error={errors[`${index}_nombre`]} placeholder="Tu nombre" required />
                                <Input label="Apellido" name="apellido" value={attendee.apellido} onChange={(e) => handleAttendeeChange(index, e)} error={errors[`${index}_apellido`]} placeholder="Tu apellido" required />
                                <Input label="Email" name="email" type="email" value={attendee.email} onChange={(e) => handleAttendeeChange(index, e)} error={errors[`${index}_email`]} placeholder="tu@email.com" required />
                                <Input label="Teléfono" name="telefono" type="tel" value={attendee.telefono} onChange={(e) => handleAttendeeChange(index, e)} error={errors[`${index}_telefono`]} placeholder="Número de teléfono" required />
                                <Input label="Documento" name="documento" value={attendee.documento} onChange={(e) => handleAttendeeChange(index, e)} error={errors[`${index}_documento`]} placeholder="Número de documento" required />
                                <div>
                                  <label className="block text-sm font-semibold mb-1.5">Oficina <span className="text-red-500">*</span></label>
                                  <select name="oficina" value={attendee.oficina} onChange={(e) => handleAttendeeChange(index, e)}
                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm ${errors[`${index}_oficina`] ? 'border-red-500' : 'border-gray-300'}`} required>
                                    <option value="">Selecciona tu oficina</option>
                                    {oficinas.map((o) => <option key={o.codigo} value={o.codigo}>{o.codigo} - {o.nombre}</option>)}
                                  </select>
                                  {errors[`${index}_oficina`] && <p className="mt-1 text-xs text-red-500">{errors[`${index}_oficina`]}</p>}
                                </div>
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

              {/* Facturación */}
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
                    <CreditCard className="mr-2 text-primary" size={18} />
                    Datos de facturación
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <Input label="Ciudad" name="ciudad" value={billingData.ciudad} onChange={handleBillingChange} error={errors.ciudad} placeholder="Tu ciudad" required />
                    <Input label="Dirección" name="direccion" value={billingData.direccion} onChange={handleBillingChange} placeholder="Tu dirección completa" required />
                    <Input label="Código postal" name="codigoPostal" value={billingData.codigoPostal} onChange={handleBillingChange} error={errors.codigoPostal} placeholder="Código postal" required />
                  </div>
                </CardContent>
              </Card>

              {/* Pago */}
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
                  {errors.medioPago && <p className="mt-2 text-sm text-red-500">{errors.medioPago}</p>}
                </CardContent>
              </Card>

              {/* Términos */}
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Acepto los{' '}
                      <button type="button" className="text-primary hover:underline font-semibold">términos y condiciones</button>
                      {' '}y la{' '}
                      <button type="button" className="text-primary hover:underline font-semibold">política de privacidad</button>.
                      {' '}No hay cambios ni devoluciones.
                    </span>
                  </label>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" disabled={processing || !termsAccepted} className="w-full text-sm sm:text-base">
                {processing ? 'Procesando...' : 'Confirmar compra'}
              </Button>
            </form>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden sm:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Resumen del pedido</h3>
                <div className="mb-6 pb-6 border-b">
                  {event ? (
                    <>
                      <p className="font-semibold text-lg">{event.title}</p>
                      <p className="text-sm text-gray-600">{sectorId || 'General'}</p>
                      <p className="text-sm text-gray-600">{formatEventDate(event.date, event.time)}</p>
                      {event.location && <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  )}
                </div>
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold mb-3">Asientos seleccionados:</h4>
                  <div className="space-y-2">
                    {seats.map((seat, index) => (
                      <div key={seat.id} className="flex justify-between text-sm">
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
                  <p className="text-xs text-green-700">Datos protegidos con SSL 256 bits</p>
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
        purchaseId={currentPurchaseId}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
      />
    </div>
  )
}