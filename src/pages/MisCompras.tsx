import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Calendar, MapPin, QrCode, Ticket as TicketIcon, Home, X } from 'lucide-react'
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

  const downloadTicketPDF = (purchase: UserPurchase) => {
    try {
      generateTicketPDF({
        purchaseId: purchase.id,
        eventName: purchase.eventoTitulo,
        eventDate: new Date(purchase.eventoFecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
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
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGADO': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REEMBOLSADO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FALLIDO': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* QR Modal — bottom sheet en móvil */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Código QR de Entrada</h2>
              <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <div className="text-center mb-4">
                <p className="font-semibold text-gray-900">{selectedAttendee.nombre}</p>
                <p className="text-sm text-gray-600">Fila: {selectedAttendee.fila} | Nº {selectedAttendee.numero}{selectedAttendee.sector && selectedAttendee.sector !== '-' ? ` | Sector: ${selectedAttendee.sector}` : ''}</p>
                <p className="text-xs text-gray-500 mt-1">CI: {selectedAttendee.ci}</p>
              </div>
              <div className="flex justify-center mb-4 bg-white p-4 sm:p-6 rounded-lg border-2 border-primary">
                <QRCode value={selectedQR} size={200} level="H" includeMargin={true} />
              </div>
              <p className="text-xs text-gray-500 text-center mb-4">Presenta este código QR en la entrada del evento</p>
              <Button onClick={downloadQR} className="w-full" variant="outline">
                <Download size={16} className="mr-2" />
                Descargar QR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">Mis Compras</h1>
              <p className="text-white/80 mt-1 text-xs sm:text-base">Gestiona tus entradas y certificados</p>
            </div>
            <Button variant="ghost" className="text-white hover:text-white/80 text-sm" onClick={() => navigate('/')}>
              <Home size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <TicketIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-lg sm:text-2xl font-bold mb-2">Aún no tienes compras</h2>
              <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">Explora nuestros eventos y compra tus primeras entradas</p>
              <Button onClick={() => navigate('/')}>Explorar eventos</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Stats — 3 columnas en móvil con texto más pequeño */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Compras</p>
                  <p className="text-xl sm:text-3xl font-bold text-primary">{purchases.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Gastado</p>
                  <p className="text-lg sm:text-3xl font-bold text-green-600">
                    Bs {purchases.filter(p => p.estadoPago === 'PAGADO').reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Próximo</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {purchases.length > 0
                      ? new Date(purchases[0].eventoFecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
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
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <img
                          src={purchase.eventoImagen}
                          alt={purchase.eventoTitulo}
                          className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-xl font-bold mb-1 truncate">{purchase.eventoTitulo}</h3>
                          <div className="space-y-0.5 text-xs sm:text-sm text-white/90">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span className="truncate">{formatEventDate(purchase.eventoFecha)} - {purchase.eventoHora}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span className="truncate">{purchase.eventoUbicacion}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <div>
                          <p className="text-xs text-white/70">Total pagado</p>
                          <p className="text-lg sm:text-2xl font-bold">Bs {purchase.monto.toLocaleString()}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(purchase.estadoPago)}`}>
                          {purchase.estadoPago}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="p-4 sm:p-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                      <TicketIcon size={14} />
                      {purchase.cantidad} {purchase.cantidad === 1 ? 'Entrada' : 'Entradas'}
                    </h4>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-2">
                      {purchase.asientos.map((asiento, index) => (
                        <div key={index} className="relative flex flex-col sm:flex-row w-full bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">

                          {/* Main Left Section - Attendee Details */}
                          <div className="flex-1 p-4 sm:p-5 pb-5 sm:pb-5 bg-gradient-to-br from-white to-gray-50/80">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                  <TicketIcon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate mb-0.5">{purchase.eventoTitulo}</p>
                                  <p className="text-xs sm:text-sm font-semibold text-primary">Entrada Generada</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2 mt-1">
                                {purchase.estadoPago === 'PAGADO' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold rounded uppercase tracking-wide">
                                    Válido
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold rounded uppercase tracking-wide">
                                    {purchase.estadoPago}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Attendee Info */}
                            <div className="mb-5 pl-1">
                              <h3 className="font-bold text-gray-900 text-lg sm:text-xl uppercase tracking-tight truncate">{asiento.nombre}</h3>
                              {asiento.oficina && (
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5 truncate flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block"></span>
                                  {asiento.oficina}
                                </p>
                              )}
                            </div>


                            {/* Seat Info Grid */}
                            <div className="flex gap-2 sm:gap-4 justify-between bg-white border border-gray-100 rounded-lg p-2.5 sm:p-3 shadow-sm">
                              <div className="flex-1 text-center border-r border-gray-100 last:border-0 px-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Sector</p>
                                <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{asiento.sector && asiento.sector !== '-' ? asiento.sector : 'General'}</p>
                              </div>
                              {!asiento.fila || asiento.fila.toLowerCase() === 'general' ? (
                                <div className="flex-[2] text-center font-bold px-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Entrada N°</p>
                                  <p className="font-bold text-primary text-xs sm:text-sm truncate">{asiento.numero}</p>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1 text-center border-r border-gray-100 last:border-0 px-1">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Fila</p>
                                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{asiento.fila}</p>
                                  </div>
                                  <div className="flex-1 text-center font-bold px-1">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Asiento</p>
                                    <p className="font-bold text-primary text-xs sm:text-sm truncate">{asiento.numero}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Perforated Separator */}
                          <div className="relative flex flex-row sm:flex-col items-center justify-center bg-white z-10 w-full sm:w-auto">
                            {/* Mask borders inside the card body to avoid showing circle borders outside */}
                            <div className="absolute -left-4 sm:-top-4 w-8 h-8 bg-white z-0 hidden sm:block"></div>

                            {/* Left/Top semi-circle */}
                            <div className="absolute -left-3 sm:-top-3 w-6 h-6 bg-white rounded-full border border-gray-200 z-20 hidden sm:block"></div>

                            {/* Dashed line */}
                            <div className="w-full sm:w-px h-px sm:h-full border-t sm:border-l border-dashed border-gray-300 sm:my-3 mx-4 sm:mx-0 z-10"></div>

                            {/* Right/Bottom semi-circle */}
                            <div className="absolute -right-3 sm:-bottom-3 w-6 h-6 bg-white rounded-full border border-gray-200 z-20 hidden sm:block"></div>

                            <div className="absolute -right-4 sm:-bottom-4 w-8 h-8 bg-white z-0 hidden sm:block"></div>
                          </div>

                          {/* Right Stub Section - Actions & QR Code */}
                          <div className="sm:w-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] bg-gray-50 p-4 sm:p-5 flex flex-col items-center justify-center relative border-t-0 sm:border-t-0 sm:border-l-0">
                            {/* Overlay to fade pattern */}
                            <div className="absolute inset-0 bg-white/60"></div>

                            <div className="w-full h-full flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-3 z-10 relative">
                              <div className="flex flex-col items-center gap-3 w-full max-w-[120px]">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 group-hover:border-primary/40 transition-colors">
                                  <div className="w-11 h-11 sm:w-16 sm:h-16 flex items-center justify-center">
                                    <QrCode size={typeof window !== 'undefined' && window.innerWidth < 640 ? 44 : 64} className="text-gray-900 w-full h-full p-0.5" strokeWidth={1.5} />
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  className="w-full text-xs shadow-sm bg-gray-900 hover:bg-gray-800 text-white"
                                  onClick={() => { setSelectedQR(asiento.qrCode); setSelectedAttendee(asiento); setShowQRModal(true) }}
                                >
                                  Ver QR
                                </Button>
                              </div>

                              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 -mr-[18px]">
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-mono whitespace-nowrap -rotate-90">
                                  TCKT-{purchase.id.slice(-6).toUpperCase()}-{index + 1}
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <p className="text-xs text-gray-500">Comprado el {formatDate(purchase.createdAt)}</p>
                      {purchase.estadoPago === 'PAGADO' && (
                        <Button size="sm" onClick={() => downloadTicketPDF(purchase)} className="w-full sm:w-auto text-xs sm:text-sm">
                          <Download size={14} className="mr-1.5" />
                          Descargar PDF
                        </Button>
                      )}
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