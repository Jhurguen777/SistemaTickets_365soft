import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, QrCode, Home, X, Ticket as TicketIcon, Clock, AlertCircle, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react'
import QRCode, { QRCodeCanvas } from 'qrcode.react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import purchasesService, { UserPurchase } from '@/services/purchasesService'
import { generateTicketPDF } from '@/services/pdfService'
import api from '@/services/api'
import { comprobantesPagoService } from '@/services/comprobantesPagoService'

const C = {
  azul:    '#233C7A',
  rojo:    '#E0081D',
  amarillo: '#FAB90E',
  gris:    '#F5F5F5',
  negro:   '#212121',
  blanco:  '#FFFFFF',
  naranja: '#F97316',
  verde:   '#10B981',
}

export default function MisCompras() {
  const [purchases, setPurchases] = useState<UserPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null)
  const [selectedEventName, setSelectedEventName] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvedCompra, setApprovedCompra] = useState<any>(null)

  const { user } = useAuthStore()
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'PAGADO' | 'PENDIENTE' | 'RECHAZADO'>('TODOS')

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Leer el filtro de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const estadoParam = params.get('estado')
    if (estadoParam === 'PAGADO' || estadoParam === 'PENDIENTE' || estadoParam === 'RECHAZADO' || estadoParam === 'TODOS') {
      setFiltroEstado(estadoParam as 'TODOS' | 'PAGADO' | 'PENDIENTE' | 'RECHAZADO')
    }
  }, [])

  // Polling para detectar aprobaciones de pagos con efectivo
  useEffect(() => {
    if (!user) return

    const checkPendingApprovals = async () => {
      try {
        // Obtener todas las llaves de localStorage de pagos pendientes
        const pendingKeys = Object.keys(localStorage)
          .filter(key => key.startsWith('pending_cash_payment_'))

        if (pendingKeys.length === 0) return

        const res = await api.get('/compras/mis-compras', { params: { limit: 100 } })
        const compras: any[] = res.data.data ?? []

        // Verificar si alguna de las compras pendientes ahora está aprobada
        for (const key of pendingKeys) {
          try {
            const pendingData = JSON.parse(localStorage.getItem(key) || '{}')
            // Puede tener compraId (single) o compraIds (multiple)
            const { compraId, compraIds, eventId } = pendingData

            // Obtener IDs a verificar
            const idsToCheck = compraIds || (compraId ? [compraId] : [])

            if (idsToCheck.length === 0) continue

            // Verificar cada compra pendiente
            let allApproved = true
            for (const id of idsToCheck) {
              const compra = compras.find((c: any) => c.id === id)
              if (!compra) continue

              if (compra.estadoPago !== 'PAGADO') {
                allApproved = false
                break
              }
            }

            if (allApproved) {
              // ¡Todas aprobadas! Mostrar notificación y limpiar localStorage
              localStorage.removeItem(key)

              // Obtener la primera compra aprobada para mostrar en el modal
              const primeraCompraId = idsToCheck[0]
              const primeraCompra = compras.find((c: any) => c.id === primeraCompraId)

              if (primeraCompra) {
                // Solo mostrar el modal si ya se mostró antes o si es reciente
                const lastShown = localStorage.getItem(`approval_shown_${eventId}`)
                if (!lastShown || Date.now() - parseInt(lastShown) > 60000) {
                  setApprovedCompra(primeraCompra)
                  setShowApprovalModal(true)
                  localStorage.setItem(`approval_shown_${eventId}`, Date.now().toString())

                  // Recargar compras después de mostrar el modal
                  const userPurchases = await purchasesService.getUserPurchases(user)
                  setPurchases(userPurchases)
                }
              }
            }
          } catch (e) {
            console.error('Error processing pending key:', e)
          }
        }
      } catch (error) {
        console.error('Error checking pending approvals:', error)
      }
    }

    // Verificar inmediatamente y luego cada 10 segundos
    checkPendingApprovals()
    pollingRef.current = setInterval(checkPendingApprovals, 10000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user])

  useEffect(() => { if (user) loadPurchases() }, [user])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const userPurchases = await purchasesService.getUserPurchases(user)
      setPurchases(userPurchases)
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecargarComprobantes = () => {
    loadPurchases()
  }

  const obtenerEstadoCompra = async (compraId: string): Promise<string> => {
    try {
      const response = await api.get(`/compras/comprobantes-pago/${compraId}`)
      return response.data.comprobante?.estado || 'DESCONOCIDO'
    } catch (error) {
      console.error('Error al obtener estado:', error)
      return 'DESCONOCIDO'
    }
  }

  const getQrDataUrls = (purchaseId: string, count: number): (string | null)[] => {
    return Array.from({ length: count }, (_, i) => {
      const canvas = document.getElementById(`pdf-qr-${purchaseId}-${i}`) as HTMLCanvasElement
      return canvas ? canvas.toDataURL('image/png') : null
    })
  }

  const formatEventDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  const formatPurchaseDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const downloadSingleTicketPDF = async (purchase: UserPurchase, asiento: UserPurchase['asientos'][0], idx: number) => {
    const key = `${purchase.id}-${idx}`
    setDownloadingId(key)
    try {
      const canvas = document.getElementById(`pdf-qr-${purchase.id}-${idx}`) as HTMLCanvasElement
      const qrDataUrl = canvas ? canvas.toDataURL('image/png') : null
      await generateTicketPDF({
        purchaseId: purchase.id,
        eventName: purchase.eventoTitulo,
        eventDate: purchase.eventoFecha ? formatEventDate(purchase.eventoFecha) : '',
        eventTime: purchase.eventoHora,
        eventDoorsOpen: purchase.eventoDoorsOpen,
        eventLocation: purchase.eventoUbicacion,
        eventAddress: purchase.eventoDireccion,
        eventCategory: purchase.eventoCategoria,
        eventDescription: purchase.eventoDescripcion,
        attendees: [{ nombre: asiento.nombre, asiento: asiento.asiento, sector: asiento.sector, ci: asiento.ci, qrCode: asiento.qrCode }],
        totalPaid: purchase.monto,
        purchaseDate: new Date(purchase.createdAt).toLocaleDateString('es-ES'),
        qrDataUrls: [qrDataUrl],
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const downloadAllPDF = async () => {
    setDownloadingAll(true)
    try {
      for (const purchase of purchases) {
        if (!purchase.asientos || purchase.asientos.length === 0) continue

        const qrDataUrls = getQrDataUrls(purchase.id, purchase.asientos.length)
        await generateTicketPDF({
          purchaseId: purchase.id,
          eventName: purchase.eventoTitulo,
          eventDate: purchase.eventoFecha ? formatEventDate(purchase.eventoFecha) : '',
          eventTime: purchase.eventoHora,
          eventDoorsOpen: purchase.eventoDoorsOpen,
          eventLocation: purchase.eventoUbicacion,
          eventAddress: purchase.eventoDireccion,
          eventCategory: purchase.eventoCategoria,
          eventDescription: purchase.eventoDescripcion,
          attendees: purchase.asientos.map(a => ({ nombre: a.nombre, asiento: a.asiento, sector: a.sector, ci: a.ci, qrCode: a.qrCode })),
          totalPaid: purchase.monto,
          purchaseDate: new Date(purchase.createdAt).toLocaleDateString('es-ES'),
          qrDataUrls,
        })
        await new Promise(r => setTimeout(r, 300))
      }
    } finally {
      setDownloadingAll(false)
    }
  }

  const downloadQR = () => {
    if (!selectedQR) return
    const canvas = document.querySelector('#qr-modal-canvas canvas') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-${selectedAttendee?.nombre?.replace(/\s+/g, '-') ?? 'entrada'}.png`
      link.href = url
      link.click()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full mx-auto">
          <CardContent className="p-6 sm:p-8 text-center">
            <TicketIcon size={40} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Inicia sesión</h2>
            <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">Debes iniciar sesión para ver tus compras</p>
            <Button onClick={() => navigate('/login')}>Iniciar sesión</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F8FA' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${C.azul} transparent transparent transparent` }} />
          <p className="text-gray-600 text-sm">Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>

      {/* QR Modal */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
            style={{ background: C.azul }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  VAS A VER
                </p>
                <p className="font-black uppercase text-white leading-tight" style={{ fontSize: 17 }}>
                  {selectedEventName}
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <X size={18} color="white" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2 text-center">
              <p className="text-xl font-extrabold uppercase text-white tracking-tight">
                {selectedAttendee.nombre}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <div className="flex rounded overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
                  <span className="px-2 py-0.5 text-xs font-black uppercase text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>SEC</span>
                  <span className="px-2 py-0.5 text-xs font-extrabold uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedAttendee.sector || 'GEN'}</span>
                </div>
                <div className="flex rounded overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
                  <span className="px-2 py-0.5 text-xs font-black uppercase text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>N°</span>
                  <span className="px-2 py-0.5 text-xs font-extrabold uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedAttendee.asiento}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center px-5 py-3">
              <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div id="qr-modal-canvas" className="flex justify-center px-5 pb-2">
              <div className="p-3 rounded-2xl bg-white">
                <QRCode
                  value={selectedQR || 'DEMO-QR'}
                  size={210}
                  level="H"
                  includeMargin={false}
                  fgColor={C.negro}
                  bgColor="#fff"
                />
              </div>
            </div>

            <p className="text-xs text-center pb-4 pt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Escanea este código en la entrada del evento
            </p>

            <div className="px-5 pb-6">
              <button
                onClick={downloadQR}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-xl"
                style={{ background: C.azul, color: C.blanco }}
              >
                <Download size={16} />
                Descargar QR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: C.azul }}>Mis Compras</h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Gestiona tus entradas</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
            style={{ borderColor: C.azul, color: C.azul }}
          >
            <Home size={16} />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 pb-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          {[
            { value: 'TODOS', label: 'Todos' },
            { value: 'PAGADO', label: 'Pagados' },
            { value: 'PENDIENTE', label: 'Pendientes' },
            { value: 'RECHAZADO', label: 'Rechazadas' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltroEstado(value as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filtroEstado === value
                  ? 'bg-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <TicketIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2 text-gray-700">Aún no tienes compras</h2>
            <p className="text-gray-500 mb-6 text-sm">Explora nuestros eventos y compra tus primeras entradas</p>
            <Button onClick={() => navigate('/')}>Explorar eventos</Button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Boletos', value: purchases.reduce((s, p) => s + (p.asientos?.length || 0), 0), color: C.azul },
                { label: 'Gastado', value: `Bs ${purchases.reduce((s, p) => s + p.monto, 0).toLocaleString()}`, color: '#16a34a' },
                { label: 'Próximo', value: purchases.length > 0 ? new Date(purchases[0].eventoFecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '-', color: C.negro },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-extrabold text-lg sm:text-2xl" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Descargar todos */}
            <button
              onClick={downloadAllPDF}
              disabled={downloadingAll}
              className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              style={{ background: C.azul, color: C.blanco }}
            >
              <Download size={17} />
              {downloadingAll ? 'Generando PDFs…' : 'Descargar todos los boletos'}
            </button>

            {/* Lista de compras */}
            {purchases
              .filter(p => {
                if (filtroEstado === 'TODOS') return true
                if (filtroEstado === 'PAGADO') return p.estadoPago === 'PAGADO'
                if (filtroEstado === 'PENDIENTE') return p.estadoPago === 'PENDIENTE_APROBACION'
                if (filtroEstado === 'RECHAZADO') return p.estadoPago === 'RECHAZADO'
                return false
              })
              .filter(p => p.asientos && p.asientos.length > 0) // Solo compras con asientos
              .map((purchase) => {
                const esPagoEfectivo = purchase.estadoPago === 'PENDIENTE_APROBACION' || purchase.estadoPago === 'RECHAZADO'
                const estaAprobado = purchase.estadoPago === 'PAGADO'

                return (
                  <div key={purchase.id} className="space-y-4">

                    {/* Banner estado */}
                    {esPagoEfectivo && (
                      <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
                        purchase.estadoPago === 'PENDIENTE_APROBACION' ? 'bg-yellow-50 border-yellow-300' :
                        purchase.estadoPago === 'RECHAZADO' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
                      }`}>
                        {purchase.estadoPago === 'PENDIENTE_APROBACION' ? (
                          <Clock size={24} className="text-yellow-600 flex-shrink-0" />
                        ) : purchase.estadoPago === 'RECHAZADO' ? (
                          <XCircle size={24} className="text-red-600 flex-shrink-0" />
                        ) : (
                          <RefreshCw size={24} className="text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {purchase.estadoPago === 'PENDIENTE_APROBACION' && 'Compra Pendiente de Aprobación'}
                            {purchase.estadoPago === 'RECHAZADO' && 'Compra Rechazada'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {purchase.estadoPago === 'PENDIENTE_APROBACION' && 'Tu comprobante está siendo revisado. Te notificaremos cuando sea aprobado.'}
                            {purchase.estadoPago === 'RECHAZADO' && 'Tu comprobante fue rechazado. Por favor sube uno nuevo.'}
                          </p>
                        </div>
                        {purchase.estadoPago === 'RECHAZADO' && (
                          <button
                            onClick={() => navigate(`/eventos/${purchase.eventoId}/checkout`)}
                            className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
                          >
                            Reintentar compra
                          </button>
                        )}
                      </div>
                    )}

                    {/* Event header - siempre visible */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-black uppercase truncate" style={{ color: C.amarillo, fontSize: 16 }}>
                          {purchase.eventoTitulo}
                        </h2>
                        <p className="text-xs truncate" style={{ color: C.negro }}>
                          {purchase.eventoFecha ? formatEventDate(purchase.eventoFecha) : ''}
                          {purchase.eventoHora ? ` · ${purchase.eventoHora}` : ''}
                          {purchase.eventoUbicacion ? ` · ${purchase.eventoUbicacion}` : ''}
                        </p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: '#6B7280' }}>
                          {purchase.asientos?.length || 0} boleto{(purchase.asientos?.length || 0) > 1 ? 's' : ''} · Bs {purchase.monto.toFixed(2)}
                        </p>
                      </div>
                      {estaAprobado && (
                        <Button variant="outline" size="sm" onClick={handleRecargarComprobantes} className="flex-shrink-0">
                          <RefreshCw size={16} />
                        </Button>
                      )}
                    </div>

                    {/* Ticket cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {purchase.asientos.map((asiento, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <div
                            className="rounded-2xl overflow-hidden flex w-full"
                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.14)' }}
                          >
                            {/* Tira izquierda azul */}
                            <div
                              className="flex-shrink-0 flex flex-col items-center justify-between py-4 px-1.5"
                              style={{ background: C.azul, width: 44 }}
                            >
                              <span
                                className="text-white font-black uppercase select-none"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 11, letterSpacing: '0.18em' }}
                              >
                                ALFA BOLIVIA
                              </span>
                              <img
                                src="/assets/alfa-negativo.png"
                                alt="Alfa Bolivia"
                                style={{ width: 34, height: 'auto', objectFit: 'contain' }}
                              />
                            </div>

                            {/* Cuerpo blanco */}
                            <div className="flex-1 flex flex-col bg-white min-w-0">
                              <div className="px-3 pt-3 pb-2" style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: C.negro }}>
                                  VAS A VER
                                </p>
                                <p className="font-black uppercase leading-tight" style={{ fontSize: 15, color: C.amarillo, wordBreak: 'break-word' }}>
                                  {purchase.eventoTitulo}
                                </p>
                                {purchase.eventoUbicacion && (
                                  <p className="text-xs mt-0.5 truncate" style={{ color: C.negro }}>
                                    {purchase.eventoUbicacion}{purchase.eventoDireccion ? `, ${purchase.eventoDireccion}` : ''}
                                  </p>
                                )}
                              </div>

                              <div className="px-3 py-3 flex gap-3 flex-1">
                                <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2 content-start">
                                  <div className="col-span-2">
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.negro }}>NOMBRE</p>
                                    <p className="text-xs font-semibold uppercase mt-0.5 truncate" style={{ color: C.negro }}>{asiento.nombre || 'Asistente'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.negro }}>FECHA</p>
                                    <p className="text-xs font-semibold uppercase mt-0.5 leading-tight" style={{ color: C.negro }}>
                                      {purchase.eventoFecha ? formatEventDate(purchase.eventoFecha) : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.negro }}>HORA</p>
                                    <p className="text-xs font-semibold uppercase mt-0.5" style={{ color: C.negro }}>{purchase.eventoHora || '—'}</p>
                                  </div>
                                  {purchase.eventoDoorsOpen && (
                                    <div className="col-span-2">
                                      <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.negro }}>APERTURA</p>
                                      <p className="text-xs font-semibold uppercase mt-0.5" style={{ color: C.rojo }}>{purchase.eventoDoorsOpen}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5">
                                  <QRCode
                                    value={asiento.qrCode || 'TICKET'}
                                    size={58}
                                    level="M"
                                    includeMargin={false}
                                    fgColor={C.negro}
                                    bgColor="#ffffff"
                                  />
                                  <button
                                    onClick={() => {
                                      setSelectedQR(asiento.qrCode)
                                      setSelectedAttendee(asiento)
                                      setSelectedEventName(purchase.eventoTitulo)
                                      setShowQRModal(true)
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-full justify-center"
                                    style={{ background: C.negro, color: '#fff' }}
                                  >
                                    <QrCode size={10} />
                                    Ver QR
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
                                <div className="flex rounded overflow-hidden" style={{ border: `2px solid ${C.negro}` }}>
                                  <span className="px-2 py-0.5 text-xs font-black text-white uppercase" style={{ background: C.negro }}>SEC</span>
                                  <span className="px-2 py-0.5 text-xs font-extrabold uppercase bg-white" style={{ color: C.negro }}>{asiento.sector || 'GEN'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Imagen evento derecha */}
                            {purchase.eventoImagen ? (
                              <>
                                <div className="flex-shrink-0 bg-white flex flex-col justify-around py-3" style={{ width: 12 }}>
                                  {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-full self-end" style={{ width: 12, height: 12, background: '#F7F8FA', marginRight: -6 }} />
                                  ))}
                                </div>
                                <div className="flex-shrink-0 relative overflow-hidden" style={{ width: 90 }}>
                                  <img
                                    src={purchase.eventoImagen}
                                    alt="evento"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="flex-shrink-0" style={{ width: 6, background: `linear-gradient(180deg, ${C.amarillo}, ${C.rojo})` }} />
                            )}
                          </div>

                          {/* Descargar boleto individual */}
                          <button
                            onClick={() => downloadSingleTicketPDF(purchase, asiento, idx)}
                            disabled={downloadingId === `${purchase.id}-${idx}`}
                            className="w-full flex items-center justify-center gap-2 font-bold text-xs py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            style={{ background: C.azul, color: C.blanco }}
                          >
                            <Download size={13} />
                            {downloadingId === `${purchase.id}-${idx}` ? 'Generando…' : 'Descargar boleto'}
                          </button>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400">Comprado el {formatPurchaseDate(purchase.createdAt)}</p>
                    <div style={{ height: 1, background: '#E5E7EB' }} />

                  </div>
                )
              })
            }
          </>
        )}
      </div>

      {/* Canvases ocultos para PDF */}
      <div style={{ position: 'absolute', left: -9999, top: -9999, pointerEvents: 'none' }}>
        {purchases.map(purchase =>
          purchase.asientos?.map((asiento, i) => (
            <QRCodeCanvas
              key={`${purchase.id}-${i}`}
              id={`pdf-qr-${purchase.id}-${i}`}
              value={asiento.qrCode || 'TICKET'}
              size={200}
              level="H"
              includeMargin={false}
              fgColor={C.azul}
              bgColor="#ffffff"
            />
          )) || null
        )}
      </div>

      {/* Modal de aprobación de pago en tiempo real */}
      {showApprovalModal && approvedCompra && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    ¡Pago aprobado!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tu comprobante ha sido verificado y aprobado
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TicketIcon size={18} className="text-green-600" />
                  <p className="font-bold text-gray-900">{approvedCompra.eventoTitulo}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {approvedCompra.asientos?.length || 0} boleto{(approvedCompra.asientos?.length || 0) > 1 ? 's' : ''} · Bs {approvedCompra.monto?.toFixed(2) || '0'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setApprovedCompra(null)
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Ver mis boletos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
