// Componente que detecta pagos pendientes guardados en localStorage
// y permite al usuario retomar o verificar el estado sin perder su compra.

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle2, X, QrCode, Loader2, ExternalLink } from 'lucide-react'
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

type BannerState = 'checking' | 'pending' | 'paid' | 'expired' | 'hidden'

const HIDDEN_ROUTES = ['/checkout', '/compra-exitosa', '/login', '/admin']

export default function PendingPaymentBanner() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [bannerState, setBannerState] = useState<BannerState>('hidden')
  const [pendingData, setPendingData] = useState<PendingPaymentData | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [pollingActive, setPollingActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const pollingRef = useRef<{ detener: () => void } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // No mostrar en ciertas rutas
  const isHiddenRoute = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))

  useEffect(() => {
    if (!isAuthenticated || isHiddenRoute) {
      setBannerState('hidden')
      return
    }

    const raw = localStorage.getItem('pending_payment')
    if (!raw) {
      setBannerState('hidden')
      return
    }

    let data: PendingPaymentData
    try {
      data = JSON.parse(raw)
    } catch {
      localStorage.removeItem('pending_payment')
      setBannerState('hidden')
      return
    }

    // Si ya expiró por tiempo sin consultar el banco
    const expiry = new Date(data.fechaVencimiento).getTime()
    if (Date.now() > expiry + 5 * 60 * 1000) {
      // 5 min extra de gracia por si el banco confirma tarde
      localStorage.removeItem('pending_payment')
      setBannerState('hidden')
      return
    }

    setPendingData(data)
    setBannerState('checking')

    // Verificar estado al montar
    paymentServiceV2.verificarPago(data.qrPagoId)
      .then(resultado => {
        if (resultado.estado === 'PAGADO') {
          localStorage.removeItem('pending_payment')
          setBannerState('paid')
          setTimeout(() => {
            setBannerState('hidden')
            navigate('/mis-compras')
          }, 4000)
        } else if (resultado.estado === 'EXPIRADO' || resultado.estado === 'FALLIDO') {
          localStorage.removeItem('pending_payment')
          setBannerState('hidden')
        } else {
          // PENDIENTE o PROCESANDO
          setBannerState('pending')
        }
      })
      .catch(() => {
        // Error de red: mostrar igual por si el usuario quiere ver el QR
        setBannerState('pending')
      })
  }, [isAuthenticated, location.pathname])

  // Countdown en el modal del QR
  useEffect(() => {
    if (!showQRModal || !pendingData) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const updateTimer = () => {
      const diff = new Date(pendingData.fechaVencimiento).getTime() - Date.now()
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }
    updateTimer()
    timerRef.current = setInterval(updateTimer, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [showQRModal, pendingData])

  // Iniciar / detener polling cuando se abre el modal QR
  useEffect(() => {
    if (!showQRModal || !pendingData || pollingActive) return

    setPollingActive(true)
    const polling = paymentServiceV2.iniciarPollingPago(
      pendingData.qrPagoId,
      resultado => {
        if (resultado.estado === 'PAGADO') {
          localStorage.removeItem('pending_payment')
          setShowQRModal(false)
          pollingRef.current?.detener()

          // Crear registro local y navegar a éxito
          setBannerState('paid')
          setTimeout(() => {
            setBannerState('hidden')
            navigate('/mis-compras')
          }, 3000)
        } else if (resultado.estado === 'EXPIRADO' || resultado.estado === 'FALLIDO') {
          localStorage.removeItem('pending_payment')
          setShowQRModal(false)
          pollingRef.current?.detener()
          setBannerState('hidden')
        }
      },
      15000
    )

    pollingRef.current = polling
    polling.iniciar()
    ;(window as any).paymentPolling = polling

    return () => {
      polling.detener()
      setPollingActive(false)
    }
  }, [showQRModal])

  const handleDismiss = () => {
    // Guardar en sessionStorage para no volver a mostrar en esta sesión
    sessionStorage.setItem('banner_dismissed', pendingData?.qrPagoId ?? '1')
    setBannerState('hidden')
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  // Verificar si fue descartado en esta sesión
  useEffect(() => {
    if (pendingData && sessionStorage.getItem('banner_dismissed') === pendingData.qrPagoId) {
      setBannerState('hidden')
    }
  }, [pendingData])

  if (bannerState === 'hidden' || bannerState === 'checking') return null

  return (
    <>
      {/* ── Banner Principal ── */}
      {bannerState === 'pending' && pendingData && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-slide-up">
          <div className="bg-white border border-amber-200 shadow-xl rounded-t-2xl sm:rounded-xl overflow-hidden">
            {/* Barra de color superior */}
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    Tienes un pago pendiente
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {pendingData.eventTitle || 'Evento'}
                  </p>
                  <p className="text-sm font-bold text-amber-700 mt-1">
                    Bs {pendingData.monto?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Ocultar"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <QrCode size={14} />
                  Ver QR de pago
                </button>
                <button
                  onClick={() => { navigate('/mis-compras') }}
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

      {/* ── Banner de pago confirmado ── */}
      {bannerState === 'paid' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-slide-up">
          <div className="bg-white border border-green-200 shadow-xl rounded-t-2xl sm:rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">¡Pago confirmado!</p>
                <p className="text-xs text-gray-500">Redirigiendo a Mis Compras…</p>
              </div>
              <Loader2 size={16} className="animate-spin text-green-500 ml-auto flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal QR ── */}
      {showQRModal && pendingData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="font-bold text-gray-900">Pago pendiente</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">
                  {pendingData.eventTitle}
                </p>
              </div>
              <button
                onClick={() => { setShowQRModal(false); pollingRef.current?.detener(); setPollingActive(false) }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Countdown */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-600">Tiempo restante</span>
                <span className={`font-mono font-bold ${timeLeft < 120 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* QR Image */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-center mb-4">
                {pendingData.imagenQr ? (
                  pendingData.imagenQr.startsWith('data:') || pendingData.imagenQr.startsWith('http') ? (
                    <img
                      src={pendingData.imagenQr}
                      alt="QR de pago"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <img
                      src={`data:image/png;base64,${pendingData.imagenQr}`}
                      alt="QR de pago"
                      className="w-48 h-48 object-contain"
                    />
                  )
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-300" size={40} />
                  </div>
                )}
              </div>

              {/* Monto */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Monto a pagar</span>
                <span className="font-bold text-gray-900 text-lg">
                  {pendingData.moneda} {pendingData.monto?.toFixed(2)}
                </span>
              </div>

              {/* Estado polling */}
              <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
                <Loader2 size={12} className="animate-spin" />
                Verificando pago automáticamente…
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
