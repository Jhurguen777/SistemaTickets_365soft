import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Loader2, QrCode, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface QRPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  qrData: {
    alias: string
    monto: number
    moneda: string
    imagenQr?: string
    fechaVencimiento: string
    detalleGlosa: string
  } | null
  purchaseId: string
  onPaymentSuccess: () => void
  onPaymentFailed: () => void
}

interface PaymentStatus {
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'CANCELADO'
  mensaje: string
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  qrData,
  purchaseId,
  onPaymentSuccess,
  onPaymentFailed
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  // Calcular tiempo restante
  useEffect(() => {
    if (!qrData || !isOpen) return

    const expiryDate = new Date(qrData.fechaVencimiento)
    const updateTimer = () => {
      const now = new Date()
      const diff = expiryDate.getTime() - now.getTime()
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [qrData, isOpen])

  // Verificar estado del pago periódicamente
  useEffect(() => {
    if (!isOpen || !qrData || paymentStatus?.estado === 'PAGADO') return

    const checkPaymentStatus = async () => {
      setIsChecking(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/compras/verificar-pago/${qrData.alias}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setPaymentStatus({
            estado: data.data.qr.estado,
            mensaje: data.data.message || data.message
          })

          if (data.data.qr.estado === 'PAGADO') {
            setTimeout(() => {
              onPaymentSuccess()
            }, 1500)
          } else if (data.data.qr.estado === 'VENCIDO' || data.data.qr.estado === 'CANCELADO') {
            setTimeout(() => {
              onPaymentFailed()
            }, 1500)
          }
        }
      } catch (error) {
        console.error('Error verificando pago:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Verificar inmediatamente
    checkPaymentStatus()

    // Luego verificar cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000)

    return () => clearInterval(interval)
  }, [isOpen, qrData, paymentStatus?.estado])

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!qrData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Pago QR" size="md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </Modal>
    )
  }

  const isPaid = paymentStatus?.estado === 'PAGADO'
  const isExpired = paymentStatus?.estado === 'VENCIDO' || timeLeft === 0
  const isCancelled = paymentStatus?.estado === 'CANCELADO'

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isPaid && onClose()}
      title="Pago con QR"
      size="md"
    >
      <div className="text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isPaid ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={48} />
            </div>
          ) : isExpired || isCancelled ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="text-red-600" size={48} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="text-blue-600" size={48} />
            </div>
          )}
        </div>

        {/* Mensaje de estado */}
        {isPaid ? (
          <div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago exitoso!</h3>
            <p className="text-gray-600">Tu compra ha sido procesada correctamente.</p>
          </div>
        ) : isExpired ? (
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">QR vencido</h3>
            <p className="text-gray-600">El tiempo para pagar ha expirado. Por favor intenta nuevamente.</p>
          </div>
        ) : isCancelled ? (
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Pago cancelado</h3>
            <p className="text-gray-600">El pago ha sido cancelado.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-2">Escanea el QR para pagar</h3>
            <p className="text-gray-600">Usa la app de tu banco para escanear</p>
          </div>
        )}

        {/* QR Code */}
        {!isPaid && !isCancelled && (
          <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
            {qrData.imagenQr ? (
              <img
                src={`data:image/png;base64,${qrData.imagenQr}`}
                alt="QR de pago"
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={48} />
              </div>
            )}
          </div>
        )}

        {/* Detalles del pago */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-gray-600">Monto a pagar:</span>
            <span className="font-bold text-lg">
              {qrData.moneda} {qrData.monto.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Alias:</span>
            <span className="font-mono text-sm">{qrData.alias}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Descripción:</span>
            <span className="text-sm text-right max-w-xs truncate">{qrData.detalleGlosa}</span>
          </div>
          {!isPaid && !isExpired && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Tiempo restante:</span>
              <span className={`font-bold text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Verificando... */}
        {!isPaid && !isExpired && !isCancelled && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className={`animate-spin ${isChecking ? '' : 'opacity-0'}`} size={20} />
            <span className="text-sm">Verificando pago...</span>
          </div>
        )}

        {/* Info adicional */}
        {!isPaid && !isCancelled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div className="text-left text-sm text-yellow-800">
                <p className="font-semibold mb-1">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abre la app de Banco MC4 en tu celular</li>
                  <li>Selecciona "Escanea QR" o "Pagos QR"</li>
                  <li>Apunta la cámara al código QR</li>
                  <li>Confirma el pago</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-3">
          {isPaid ? (
            <Button onClick={onClose} className="w-full">
              Continuar
            </Button>
          ) : isExpired || isCancelled ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Intentar nuevamente
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cerrar (no cierres esta ventana)
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default QRPaymentModal
