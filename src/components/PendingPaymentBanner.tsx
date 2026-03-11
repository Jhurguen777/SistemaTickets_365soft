import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle2, X, QrCode, ExternalLink } from 'lucide-react'
import { paymentServiceV2 } from '@/services/paymentServiceV2'
import { useAuthStore } from '@/store/authStore'

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

  const isHiddenRoute = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))

  const handlePaid = (data: PendingPaymentData) => {
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
    setBannerState('paid')
    setTimeout(() => {
      setBannerState('hidden')
      navigate('/mis-compras')
    }, 4000)
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

    // Ignorar si fue descartado en esta sesión
    if (sessionStorage.getItem('banner_dismissed') === data.qrPagoId) return

    setPendingData(data)
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
        setBannerState('pending')
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
      .catch(() => setBannerState('pending'))

    return () => {
      pollingRef.current?.detener()
      if (ttlRef.current) clearTimeout(ttlRef.current)
    }
  }, [isAuthenticated, location.pathname])

  const handleDismiss = () => {
    sessionStorage.setItem('banner_dismissed', pendingData?.qrPagoId ?? '1')
    setBannerState('hidden')
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
