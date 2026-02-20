import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Calendar, MapPin, QrCode, Ticket as TicketIcon, Home } from 'lucide-react'
import QRCode from 'qrcode.react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import purchasesService, { UserPurchase } from '@/services/purchasesService'
import { generateTicketPDF } from '@/services/pdfService'

export default function MisCompras() {
  const [purchases, setPurchases] = useState<UserPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = () => {
    try {
      setLoading(true)
      const userPurchases = purchasesService.getUserPurchases()
      setPurchases(userPurchases)
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadTicketPDF = (purchase: UserPurchase) => {
    try {
      generateTicketPDF({
        purchaseId: purchase.id,
        eventName: purchase.eventoTitulo,
        eventDate: new Date(purchase.eventoFecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        eventTime: purchase.eventoHora,
        eventLocation: purchase.eventoUbicacion,
        eventAddress: purchase.eventoDireccion,
        attendees: purchase.asientos,
        totalPaid: purchase.monto,
        purchaseDate: new Date(purchase.createdAt).toLocaleDateString('es-ES')
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    }
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REEMBOLSADO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FALLIDO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <TicketIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para ver tus compras
            </p>
            <Button onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* QR Modal */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Código QR de Entrada</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <p className="font-semibold text-gray-900 text-lg">{selectedAttendee.nombre}</p>
                <p className="text-sm text-gray-600">
                  Asiento: {selectedAttendee.asiento} | Sector: {selectedAttendee.sector}
                </p>
                <p className="text-xs text-gray-500 mt-1">CI: {selectedAttendee.ci}</p>
              </div>

              <div className="flex justify-center mb-4 bg-white p-6 rounded-lg border-2 border-primary">
                <QRCode
                  value={selectedQR}
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                Presenta este código QR en la entrada del evento
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={downloadQR}
                  className="flex-1"
                  variant="outline"
                >
                  <Download size={18} className="mr-2" />
                  Descargar QR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mis Compras</h1>
              <p className="text-white/80 mt-2">
                Gestiona tus entradas y certificados
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={() => navigate('/')}
            >
              <Home size={20} className="mr-2" />
              Inicio
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TicketIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">Aún no tienes compras</h2>
              <p className="text-gray-600 mb-6">
                Explora nuestros eventos y compra tus primeras entradas
              </p>
              <Button onClick={() => navigate('/')}>
                Explorar eventos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total compras</p>
                  <p className="text-3xl font-bold text-primary">{purchases.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total gastado</p>
                  <p className="text-3xl font-bold text-green-600">
                    Bs {purchases
                      .filter(p => p.estadoPago === 'PAGADO')
                      .reduce((sum, p) => sum + p.monto, 0)
                      .toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Próximo evento</p>
                  <p className="text-xl font-bold">
                    {purchases.length > 0
                      ? new Date(purchases[0].eventoFecha).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : '-'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Purchases List */}
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Event Header */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={purchase.eventoImagen}
                          alt={purchase.eventoTitulo}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {purchase.eventoTitulo}
                          </h3>
                          <div className="space-y-1 text-sm text-white/90">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-2" />
                              <span>
                                {formatEventDate(purchase.eventoFecha)} - {purchase.eventoHora}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2" />
                              <span>{purchase.eventoUbicacion}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-white/80">Total pagado</p>
                          <p className="text-2xl font-bold">
                            Bs {purchase.monto.toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            getStatusColor(purchase.estadoPago)
                          }`}
                        >
                          {purchase.estadoPago}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <TicketIcon size={16} />
                      {purchase.cantidad} {purchase.cantidad === 1 ? 'Entrada' : 'Entradas'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {purchase.asientos.map((asiento, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <TicketIcon size={20} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {asiento.nombre}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {asiento.email}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Asiento:</span>
                              <span className="font-semibold text-primary">{asiento.asiento}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sector:</span>
                              <span className="font-semibold">{asiento.sector}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">CI:</span>
                              <span className="font-mono text-xs">{asiento.ci}</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedQR(asiento.qrCode)
                              setSelectedAttendee(asiento)
                              setShowQRModal(true)
                            }}
                            className="w-full"
                          >
                            <QrCode size={14} className="mr-2" />
                            Ver QR
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <p className="text-xs text-gray-500">
                        Comprado el {formatDate(purchase.createdAt)}
                      </p>

                      <div className="flex gap-2">
                        {purchase.estadoPago === 'PAGADO' && (
                          <Button
                            size="sm"
                            onClick={() => downloadTicketPDF(purchase)}
                            className="flex items-center gap-2"
                          >
                            <Download size={16} />
                            Descargar PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
