import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Home, QrCode } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface SuccessState {
  state?: {
    purchaseId?: string
    qrCode?: string
    eventData?: any
  }
}

export default function PurchaseSuccess() {
  const navigate = useNavigate()
  const location = useLocation() as SuccessState
  const { purchaseId, qrCode } = location.state || {}

  const handleDownload = () => {
    // TODO: Download PDF ticket
    alert('Descargando entrada...')
  }

  const handleViewQR = () => {
    if (qrCode) {
      // Show QR code modal
      window.open(qrCode, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={64} className="text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Compra exitosa!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tus entradas han sido confirmadas
            </p>

            {/* Purchase Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Número de compra</p>
              <p className="text-2xl font-bold text-primary mb-4">
                #{purchaseId || 'PENDING-12345'}
              </p>

              <p className="text-sm text-gray-600">
                Hemos enviado una copia de tus entradas a tu correo electrónico.
              </p>
            </div>

            {/* QR Code Preview */}
            {qrCode && (
              <div className="mb-8">
                <div className="inline-block p-6 bg-white rounded-lg shadow-md">
                  <QrCode size={128} className="text-gray-800" />
                  <p className="text-sm text-gray-600 mt-3">
                    Escanea este código en la entrada
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDownload}
                className="flex-1 sm:flex-none"
              >
                <Download size={20} className="mr-2" />
                Descargar entradas
              </Button>

              {qrCode && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleViewQR}
                  className="flex-1 sm:flex-none"
                >
                  <QrCode size={20} className="mr-2" />
                  Ver QR
                </Button>
              )}

              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/mis-compras')}
                className="flex-1 sm:flex-none"
              >
                Ver mis compras
              </Button>
            </div>

            {/* Info */}
            <div className="mt-8 pt-8 border-t">
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <p className="font-semibold text-blue-900 mb-2">
                  📱 Importante:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Presenta tu código QR en la entrada del evento</li>
                  <li>• Llega 30 minutos antes del inicio</li>
                  <li>• Las entradas son intransferibles</li>
                  <li>• Guarda este correo, lo necesitarás para recuperar tus entradas</li>
                </ul>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                <Home size={20} className="mr-2" />
                Volver al inicio
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
