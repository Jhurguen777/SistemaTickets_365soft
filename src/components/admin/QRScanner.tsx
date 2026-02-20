import { useState } from 'react'
import { Camera, X, CheckCircle, XCircle, QrCode } from 'lucide-react'
import { Attendee, CheckInResult } from '@/types/admin'

interface QRScannerProps {
  eventId: string
  onScanSuccess: (attendee: Attendee) => void
  onClose: () => void
}

export default function QRScanner({ eventId, onScanSuccess, onClose }: QRScannerProps) {
  const [qrInput, setQrInput] = useState('')
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleManualInput = async () => {
    if (!qrInput.trim()) return

    setScanning(true)
    // Simular escaneo - en producción esto usaría react-qr-reader
    setTimeout(async () => {
      const adminService = (await import('@/services/adminService')).default
      const result = await adminService.getAttendeeByQR(qrInput.trim(), eventId)
      setScanResult(result)
      setScanning(false)

      if (result.success && result.attendee) {
        onScanSuccess(result.attendee)
        // Reproducir sonido de éxito
        playSuccessSound()
      } else {
        // Reproducir sonido de error
        playErrorSound()
      }
    }, 500)
  }

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {
      // Fallback si no hay archivo de audio
      console.log('Sonido de éxito')
    })
  }

  const playErrorSound = () => {
    const audio = new Audio('/sounds/error.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {
      console.log('Sonido de error')
    })
  }

  const reset = () => {
    setQrInput('')
    setScanResult(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <QrCode className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Escáner QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Simulación de cámara */}
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gray-50">
            <div className="flex flex-col items-center justify-center">
              <Camera size={64} className="text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">Escáner QR</p>
              <p className="text-sm text-gray-500 mt-2 text-center">
                En producción, aquí se activaría la cámara del dispositivo
              </p>
            </div>
          </div>

          {/* Input manual (para pruebas) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingresa código QR manualmente (para pruebas):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                placeholder="Ej: QR-JUAN-1234567-A5"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={scanning}
              />
              <button
                onClick={handleManualInput}
                disabled={scanning || !qrInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? 'Escaneando...' : 'Escanear'}
              </button>
            </div>
          </div>

          {/* Códigos de prueba */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Códigos QR de prueba:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• QR-JUAN-1234567-A5 (Asistente que ya asistió)</p>
              <p>• QR-ANA-7654321-A6 (Asistente que ya asistió)</p>
              <p>• QR-MARIA-3456789-B1 (Confirmado, puede asistir)</p>
              <p>• QR-LUIS-4567890-B2 (Confirmado, puede asistir)</p>
              <p>• QR-CARLOS-2345678-A7 (No Show)</p>
            </div>
          </div>

          {/* Resultado del escaneo */}
          {scanResult && (
            <div className={`border-2 rounded-lg p-4 ${
              scanResult.success
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                ) : (
                  <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    scanResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {scanResult.success ? '¡Asistente válido!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    scanResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {scanResult.message}
                  </p>
                  {scanResult.attendee && (
                    <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                      <p className="font-semibold text-gray-900">{scanResult.attendee.nombre}</p>
                      <p className="text-sm text-gray-600">CI: {scanResult.attendee.ci}</p>
                      <p className="text-sm text-gray-600">Asiento: {scanResult.attendee.asiento}</p>
                      <p className="text-sm text-gray-600">Sector: {scanResult.attendee.sector}</p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={reset}
                className="mt-3 w-full py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Escanear otro código
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  )
}
