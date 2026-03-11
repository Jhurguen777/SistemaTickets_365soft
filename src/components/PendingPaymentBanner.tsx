import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle2, X, QrCode, ExternalLink } from 'lucide-react'
import { paymentServiceV2 } from '@/services/paymentServiceV2'
import { useAuthStore } from '@/store/authStore'
import socketService from '@/services/socket'
import api from '@/services/api'

interface PendingPaymentData {
  qrPagoId: string
  imagenQr: string
  monto: number
  moneda: string
  fechaVencimiento: string
  eventTitle: string
  eventId: string
  createdAt: string
}

type BannerState = 'checking' | 'pending' | 'paid' | 'hidden'

const HIDDEN_ROUTES = ['/checkout', '/compra-exitosa', '/login', '/admin']

export default function PendingPaymentBanner() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [bannerState, setBannerState] = useState<BannerState>('hidden')
  const [pendingData, setPendingData] = useState<PendingPaymentData | null>(null)
  const pollingRef = useRef<{ detener: () => void } | null>(null)
  const ttlRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Flag para saber si el banner fue descartado visualmente (solo UI, polling sigue)
  const dismissedRef = useRef(false)

  const isHiddenRoute = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))

  const handlePaid = async (data: PendingPaymentData) => {
    localStorage.removeItem('pending_payment')
    pollingRef.current?.detener()
    if (ttlRef.current) clearTimeout(ttlRef.current)

    // Limpiar todos los datos del checkout de sessionStorage
    const eid = data.eventId
    sessionStorage.removeItem('checkout_state')
    sessionStorage.removeItem(`checkout_form_${eid}`)
    sessionStorage.removeItem(`checkout_completed_${eid}`)
    sessionStorage.removeItem(`checkout_payment_${eid}`)
    sessionStorage.removeItem(`checkout_terms_${eid}`)

    setPendingData(data)
    dismissedRef.current = false
    setBannerState('paid')

    // Intentar obtener las compras pagadas para navegar a /compra-exitosa con datos completos
    let navigateToPurchaseSuccess = false
    try {
      const res = await api.get('/compras/mis-compras', { params: { limit: 100 } })
      const compras: any[] = res.data.data ?? []
      const ahora = Date.now()
      const diezMin = 10 * 60 * 1000
      const eventCompras = compras.filter(
        (c: any) =>
          c.eventoId === data.eventId &&
          c.estadoPago === 'PAGADO' &&
          ahora - new Date(c.updatedAt ?? c.createdAt).getTime() < diezMin
      )
      if (eventCompras.length > 0) {
        const first = eventCompras[0]
        const eventData = first.evento ?? null
        const attendeeData = {
          asientos: eventCompras.map((c: any) => ({
            nombre: `${c.nombreAsistente ?? ''} ${c.apellidoAsistente ?? ''}`.trim(),
            asiento: c.asiento
              ? `${c.asiento.fila ?? ''}${c.asiento.numero ?? ''}`
              : c.numeroBoleto ? `N°${c.numeroBoleto}` : 'General',
            sector: c.asiento
              ? (c.asiento.fila?.toLowerCase() === 'general' ? 'General' : `Fila ${c.asiento.fila}`)
              : 'General',
            ci: c.documentoAsistente ?? '',
            email: c.emailAsistente ?? '',
            qrCode: c.qrCode ?? '',
          })),
          total: eventCompras.reduce((sum: number, c: any) => sum + c.monto, 0),
        }
        setTimeout(() => {
          setBannerState('hidden')
          navigate('/compra-exitosa', {
            state: { purchaseId: first.id, eventData, attendeeData }
          })
        }, 2000)
        navigateToPurchaseSuccess = true
      }
    } catch (err) {
      console.error('[Banner] Error obteniendo compras para /compra-exitosa:', err)
    }

    // Fallback: si no se pudo obtener datos de compra, ir a /mis-compras
    if (!navigateToPurchaseSuccess) {
      setTimeout(() => {
        setBannerState('hidden')
        navigate('/mis-compras')
      }, 4000)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || isHiddenRoute) {
      pollingRef.current?.detener()
      setBannerState('hidden')
      return
    }

    const raw = localStorage.getItem('pending_payment')
    if (!raw) { setBannerState('hidden'); return }

    let data: PendingPaymentData
    try { data = JSON.parse(raw) } catch {
      localStorage.removeItem('pending_payment')
      setBannerState('hidden')
      return
    }

    const expiry = new Date(data.fechaVencimiento).getTime()
    if (Date.now() > expiry) {
      localStorage.removeItem('pending_payment')
      setBannerState('hidden')
      return
    }

    setPendingData(data)
    dismissedRef.current = false
    setBannerState('checking')

    // Auto-limpiar cuando vence el QR
    if (ttlRef.current) clearTimeout(ttlRef.current)
    ttlRef.current = setTimeout(() => {
      localStorage.removeItem('pending_payment')
      pollingRef.current?.detener()
      setBannerState('hidden')
    }, expiry - Date.now())

    // Verificación inicial
    paymentServiceV2.verificarPago(data.qrPagoId)
      .then(resultado => {
        if (resultado.estado === 'PAGADO') {
          handlePaid(data)
          return
        }
        if (resultado.estado === 'EXPIRADO' || resultado.estado === 'FALLIDO') {
          localStorage.removeItem('pending_payment')
          setBannerState('hidden')
          return
        }
        // PENDIENTE → mostrar banner + iniciar polling continuo
        if (!dismissedRef.current) setBannerState('pending')
        const polling = paymentServiceV2.iniciarPollingPago(
          data.qrPagoId,
          (res) => {
            if (res.estado === 'PAGADO') handlePaid(data)
            else if (res.estado === 'EXPIRADO' || res.estado === 'FALLIDO') {
              localStorage.removeItem('pending_payment')
              pollingRef.current?.detener()
              setBannerState('hidden')
            }
          },
          15000
        )
        polling.iniciar()
        pollingRef.current = polling
      })
      .catch(() => {
        if (!dismissedRef.current) setBannerState('pending')
      })

    return () => {
      pollingRef.current?.detener()
      if (ttlRef.current) clearTimeout(ttlRef.current)
    }
  }, [isAuthenticated, location.pathname])

  // ── Escuchar evento Socket.IO pago:confirmado para detección instantánea ──
  useEffect(() => {
    if (!isAuthenticated) return

    const socket = socketService.getSocket()

    const onPagoConfirmado = (payload: { qrPagoId?: string }) => {
      const raw = localStorage.getItem('pending_payment')
      if (!raw) return
      try {
        const data: PendingPaymentData = JSON.parse(raw)
        // Confirmar que el evento es para nuestro QR pendiente
        if (payload.qrPagoId && payload.qrPagoId !== data.qrPagoId) return
        handlePaid(data)
      } catch {}
    }

    socket.on('pago:confirmado', onPagoConfirmado)

    return () => {
      socket.off('pago:confirmado', onPagoConfirmado)
    }
  }, [isAuthenticated])

  // ── Descartado visualmente — el polling SIGUE corriendo en background ──
  const handleDismiss = () => {
    dismissedRef.current = true
    setBannerState('hidden')
    // NO detener pollingRef ni ttlRef — siguen activos en background
    // El modal de "¡Pago confirmado!" aparecerá igualmente cuando el banco confirme
  }

  const handleVerQR = () => {
    sessionStorage.setItem('checkout_auto_open_qr', '1')
    navigate('/checkout')
  }

  if (bannerState === 'hidden' || bannerState === 'checking') return null

  return (
    <>
      {/* ── Banner pago pendiente ── */}
      {bannerState === 'pending' && pendingData && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm">
          <div className="bg-white border border-amber-200 shadow-xl rounded-t-2xl sm:rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">Tienes un pago pendiente</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{pendingData.eventTitle || 'Evento'}</p>
                  <p className="text-sm font-bold text-amber-700 mt-1">Bs {pendingData.monto?.toFixed(2)}</p>
                </div>
                <button onClick={handleDismiss} className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleVerQR}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <QrCode size={14} />
                  Continuar pago
                </button>
                <button
                  onClick={() => navigate('/mis-compras')}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 transition-colors"
                >
                  <ExternalLink size={12} />
                  Mis compras
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de pago exitoso (pantalla completa) ── */}
      {bannerState === 'paid' && pendingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center">
            <div className="h-2" style={{ background: '#22c55e' }} />
            <div className="p-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#dcfce7' }}
              >
                <CheckCircle2 size={44} style={{ color: '#16a34a' }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">¡Pago confirmado!</h2>
              <p className="text-gray-500 text-sm mb-2">Tu pago fue procesado exitosamente.</p>
              {pendingData.eventTitle && (
                <p className="font-semibold text-sm mb-5" style={{ color: '#233C7A' }}>
                  {pendingData.eventTitle}
                </p>
              )}
              <div className="rounded-xl px-4 py-3 mb-6 text-sm font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
                Tus entradas están disponibles en Mis Compras
              </div>
              <button
                onClick={() => { setBannerState('hidden'); navigate('/mis-compras') }}
                className="w-full py-3 rounded-xl font-bold text-white transition-colors"
                style={{ background: '#233C7A' }}
              >
                Ver mis entradas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
