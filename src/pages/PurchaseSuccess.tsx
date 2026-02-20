import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Home, QrCode, Ticket, X } from 'lucide-react'
import QRCode from 'qrcode.react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { generateTicketPDF } from '@/services/pdfService'

interface SuccessState {
  state?: {
    purchaseId?: string
    eventData?: any
    attendeeData?: any
  }
}

interface PurchaseData {
  id: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  eventImage: string
  attendees: Array<{
    nombre: string
    asiento: string
    sector: string
    ci: string
    email: string
    qrCode: string
  }>
  totalPaid: number
}

export default function PurchaseSuccess() {
  const navigate = useNavigate()
  const location = useLocation() as SuccessState
  const { purchaseId, eventData, attendeeData } = location.state || {}

  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    // Si no hay datos, intentar obtenerlos del localStorage
    if (!eventData && purchaseId) {
      const purchases = JSON.parse(localStorage.getItem('user_purchases') || '[]')
      const purchase = purchases.find((p: any) => p.id === purchaseId)
      if (purchase) {
        setPurchaseData({
          id: purchase.id,
          eventName: purchase.eventoTitulo,
          eventDate: purchase.eventoFecha,
          eventTime: purchase.eventoHora || '20:00',
          eventLocation: purchase.eventoUbicacion,
          eventAddress: purchase.eventoDireccion,
          eventImage: purchase.eventoImagen,
          attendees: purchase.asientos,
          totalPaid: purchase.monto
        })
      }
    } else if (eventData) {
      setPurchaseData({
        id: purchaseId || `PUR-${Date.now()}`,
        eventName: eventData.title || eventData.eventoTitulo,
        eventDate: eventData.date || eventData.eventoFecha,
        eventTime: eventData.time || '20:00',
        eventLocation: eventData.location || eventData.eventoUbicacion,
        eventAddress: eventData.address || eventData.eventoDireccion,
        eventImage: eventData.image || eventData.eventoImagen,
        attendees: attendeeData?.asientos || [{ nombre: 'Usuario', asiento: 'A1', sector: 'General', ci: '1234567', email: 'user@email.com', qrCode: 'DEMO-QR' }],
        totalPaid: attendeeData?.total || eventData.price || 0
      })
    }
  }, [eventData, attendeeData, purchaseId])

  const handleDownloadPDF = () => {
    if (!purchaseData) return

    setDownloading(true)
    try {
      generateTicketPDF({
        purchaseId: purchaseData.id,
        eventName: purchaseData.eventName,
        eventDate: new Date(purchaseData.eventDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        eventTime: purchaseData.eventTime,
        eventLocation: purchaseData.eventLocation,
        eventAddress: purchaseData.eventAddress,
        attendees: purchaseData.attendees,
        totalPaid: purchaseData.totalPaid,
        purchaseDate: new Date().toLocaleDateString('es-ES')
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleViewQR = (attendee: any, index: number) => {
    setSelectedQR(attendee.qrCode)
    setSelectedAttendee({ ...attendee, index })
    setShowQRModal(true)
  }

  const downloadQR = () => {
    if (!selectedQR) return

    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-${selectedAttendee.nombre.replace(/\s+/g, '-')}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
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
                #{purchaseData?.id || purchaseId || 'PENDING-12345'}
              </p>

              <p className="text-sm text-gray-600">
                Hemos enviado una copia de tus entradas a tu correo electrónico.
              </p>
            </div>

            {/* Event Info */}
            {purchaseData && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
                <div className="flex gap-6">
                  <img
                    src={purchaseData.eventImage}
                    alt={purchaseData.eventName}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {purchaseData.eventName}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {new Date(purchaseData.eventDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} - {purchaseData.eventTime}</p>
                      <p>📍 {purchaseData.eventLocation}</p>
                      <p>💰 Total pagado: <span className="font-bold text-green-600">Bs {purchaseData.totalPaid.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets/QR Codes Section */}
            {purchaseData && purchaseData.attendees.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <Ticket size={20} />
                  Tus Entradas ({purchaseData.attendees.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {purchaseData.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Ticket size={32} className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{attendee.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Asiento: <span className="font-medium">{attendee.asiento}</span>
                            {' '}| Sector: <span className="font-medium">{attendee.sector}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">CI: {attendee.ci}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQR(attendee, index)}
                        className="w-full mt-3"
                      >
                        <QrCode size={16} className="mr-2" />
                        Ver Código QR
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex-1 sm:flex-none"
              >
                <Download size={20} className="mr-2" />
                {downloading ? 'Generando PDF...' : 'Descargar Entradas'}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/mis-compras')}
                className="flex-1 sm:flex-none"
              >
                <Ticket size={20} className="mr-2" />
                Ver Mis Compras
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

      {/* QR Modal */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Código QR</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <p className="font-semibold text-gray-900">{selectedAttendee.nombre}</p>
                <p className="text-sm text-gray-600">
                  Asiento: {selectedAttendee.asiento} | Sector: {selectedAttendee.sector}
                </p>
              </div>

              <div className="flex justify-center mb-4 bg-white p-4 rounded-lg">
                <QRCode
                  value={selectedQR}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                Escanea este código en la entrada del evento
              </p>

              <Button
                onClick={downloadQR}
                className="w-full"
              >
                <Download size={18} className="mr-2" />
                Descargar QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
