import React, { useState, useEffect } from 'react'
import { Loader2, QrCode, CheckCircle2, XCircle, Clock, X, Smartphone, Shield, Download } from 'lucide-react'

// ── Paleta ALFA ──────────────────────────────────────────────
const C = {
  azul:    '#233C7A',
  rojo:    '#E0081D',
  amarillo:'#FAB90E',
  gris:    '#F5F5F5',
  negro:   '#212121',
}

interface QRPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  qrData: {
    qrData?: string
    qrUrl?: string
    monto: number
    moneda: string
    imagenQr?: string
    tiempoExpiracion: string
    compraId: string
  } | null
  _purchaseId: string
  paymentStatus?: 'PENDIENTE' | 'PROCESANDO' | 'PAGADO' | 'FALLIDO' | 'EXPIRADO'
  _onPaymentSuccess: () => void
  _onPaymentFailed: () => void
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  qrData,
  paymentStatus,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!qrData || !isOpen) return
    const expiryDate = new Date(qrData.tiempoExpiracion)
    const update = () => {
      const diff = expiryDate.getTime() - Date.now()
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [qrData, isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (seconds: number): string => {
    const hrs  = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isPaid       = paymentStatus === 'PAGADO'
  const isProcessing = paymentStatus === 'PROCESANDO'
  const isExpired    = paymentStatus === 'EXPIRADO' || timeLeft === 0
  const isFailed     = paymentStatus === 'FALLIDO'
  const isPending    = !isPaid && !isProcessing && !isExpired && !isFailed

  const qrImageSrc = qrData?.imagenQr
    ? (qrData.imagenQr.startsWith('http') ? qrData.imagenQr : `data:image/png;base64,${qrData.imagenQr}`)
    : qrData?.qrUrl
      ? (qrData.qrUrl.startsWith('http') ? qrData.qrUrl : `data:image/png;base64,${qrData.qrUrl}`)
      : null

  // Timer: azul → amarillo (< 10 min) → rojo (< 5 min)
  const timerColor = timeLeft < 300 ? C.rojo : timeLeft < 600 ? C.amarillo : C.azul

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => isPending && onClose()}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: '#fff', maxHeight: '96vh' }}
      >
        {/* ── Header AZUL ALFA ── */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: C.azul }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <QrCode size={20} style={{ color: C.azul }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Pago con QR</h2>
              <p className="text-xs" style={{ color: '#a8b8d8' }}>Banco MC4 · Pago seguro</p>
            </div>
          </div>
          {isPending && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">

          {/* ── PAGADO ── */}
          {isPaid && (
            <div className="flex flex-col items-center py-10 px-6 text-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#e8f5e9' }}>
                <CheckCircle2 size={52} style={{ color: '#2e7d32' }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#2e7d32' }}>¡Pago exitoso!</h3>
              <p style={{ color: C.negro }} className="text-sm">Tu compra fue procesada correctamente.</p>
              <button
                onClick={onClose}
                className="mt-2 w-full text-white font-semibold py-3 rounded-xl transition-colors"
                style={{ background: C.azul }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── PROCESANDO ── */}
          {isProcessing && (
            <div className="flex flex-col items-center py-10 px-6 text-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#fffde7' }}>
                <Loader2 size={52} className="animate-spin" style={{ color: C.amarillo }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: C.negro }}>Verificando pago...</h3>
              <p className="text-sm" style={{ color: '#555' }}>Estamos confirmando tu transacción.</p>
            </div>
          )}

          {/* ── EXPIRADO / FALLIDO ── */}
          {(isExpired || isFailed) && (
            <div className="flex flex-col items-center py-10 px-6 text-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#fce4e4' }}>
                <XCircle size={52} style={{ color: C.rojo }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: C.rojo }}>
                {isExpired ? 'QR vencido' : 'Pago fallido'}
              </h3>
              <p className="text-sm" style={{ color: '#555' }}>
                {isExpired
                  ? 'El tiempo expiró. Por favor genera un nuevo QR.'
                  : 'Hubo un error al procesar el pago.'}
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 font-semibold py-3 rounded-xl transition-colors border"
                  style={{ borderColor: C.gris, color: C.negro }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 text-white font-semibold py-3 rounded-xl transition-colors"
                  style={{ background: C.azul }}
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}

          {/* ── PENDIENTE — QR activo ── */}
          {isPending && qrData && (
            <div className="px-5 pt-4 pb-5 space-y-4">

              {/* Monto */}
              <div
                className="flex items-center justify-between px-5 py-3 rounded-xl"
                style={{ background: C.gris }}
              >
                <span className="font-medium text-sm" style={{ color: C.negro }}>Monto a pagar</span>
                <span className="font-extrabold text-2xl" style={{ color: C.azul }}>
                  Bs {qrData.monto.toFixed(2)}
                </span>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-center gap-1 py-1">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} style={{ color: timerColor }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: timerColor }}
                  >
                    Tiempo restante
                  </span>
                </div>
                <span className="font-extrabold text-2xl" style={{ color: timerColor }}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="rounded-2xl shadow-md overflow-hidden"
                  style={{ border: `3px solid ${C.gris}`, background: '#fff', padding: '10px' }}
                >
                  {qrImageSrc ? (
                    <img
                      src={qrImageSrc}
                      alt="QR de pago"
                      style={{ width: '360px', height: '360px', objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    <div
                      style={{ width: '360px', height: '360px', background: C.gris }}
                      className="flex flex-col items-center justify-center gap-3"
                    >
                      <Loader2 size={44} className="animate-spin" style={{ color: C.azul }} />
                      <p className="text-sm" style={{ color: '#999' }}>Cargando QR...</p>
                    </div>
                  )}
                </div>

                {/* Descargar QR */}
                {qrImageSrc && (
                  <a
                    href={qrImageSrc}
                    download="QR-pago.png"
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                    style={{
                      color: C.azul,
                      border: `1.5px solid ${C.azul}`,
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#eef1f8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Download size={15} />
                    Descargar QR
                  </a>
                )}
              </div>

              {/* Instrucciones */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone size={15} style={{ color: C.azul }} />
                  <span className="font-semibold text-sm" style={{ color: C.azul }}>¿Cómo pagar?</span>
                </div>
                <ol className="space-y-2">
                  {[
                    'Abre la app de tu banco',
                    'Selecciona "Escanear QR" o "Pagos QR"',
                    'Apunta la cámara al código QR de arriba',
                    'Confirma el monto y el pago',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.negro }}>
                      <span
                        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: C.azul }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Seguridad */}
              <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: '#aaa' }}>
                <Shield size={12} />
                <span>Pago 100% seguro · No compartas este QR</span>
              </div>
            </div>
          )}

          {/* Sin datos */}
          {!qrData && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={48} className="animate-spin" style={{ color: C.azul }} />
              <p className="text-sm" style={{ color: '#aaa' }}>Generando QR de pago...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRPaymentModal
