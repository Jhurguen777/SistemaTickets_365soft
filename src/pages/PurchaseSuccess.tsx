import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Home, QrCode, Ticket, X, Calendar, MapPin, CreditCard } from 'lucide-react'
import QRCode from 'qrcode.react'
import { generateTicketPDF } from '@/services/pdfService'

// ── Paleta Alfa ──────────────────────────────────────────────
const C = {
  azul:    '#233C7A',
  azulClaro: '#2d4e9e',
  rojo:    '#E0081D',
  amarillo: '#FAB90E',
  gris:    '#F5F5F5',
  negro:   '#212121',
  blanco:  '#FFFFFF',
}

interface SuccessState {
  state?: { purchaseId?: string; eventData?: any; attendeeData?: any }
}

interface Attendee {
  nombre: string
  asiento: string
  sector: string
  ci: string
  email: string
  qrCode: string
}

interface PurchaseData {
  id: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  eventImage: string
  attendees: Attendee[]
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
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
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
      const rawAttendees: Attendee[] = attendeeData?.asientos ?? [{ nombre: 'Asistente', asiento: 'General', sector: 'General', ci: '', email: '', qrCode: 'DEMO-QR' }]
      setPurchaseData({
        id: purchaseId || `PUR-${Date.now()}`,
        eventName: eventData.titulo || eventData.title || eventData.eventoTitulo || 'Evento',
        eventDate: eventData.fecha || eventData.date || eventData.eventoFecha || '',
        eventTime: eventData.hora || eventData.time || '20:00',
        eventLocation: eventData.ubicacion || eventData.location || eventData.eventoUbicacion || '',
        eventAddress: eventData.direccion || eventData.address || eventData.eventoDireccion || '',
        eventImage: eventData.imagenUrl || eventData.image || eventData.eventoImagen || '',
        attendees: rawAttendees,
        totalPaid: attendeeData?.total ?? eventData.precio ?? eventData.price ?? 0
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
        eventDate: purchaseData.eventDate
          ? new Date(purchaseData.eventDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          : '',
        eventTime: purchaseData.eventTime,
        eventLocation: purchaseData.eventLocation,
        eventAddress: purchaseData.eventAddress,
        attendees: purchaseData.attendees,
        totalPaid: purchaseData.totalPaid,
        purchaseDate: new Date().toLocaleDateString('es-ES')
      })
    } catch {
      alert('Error al generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleViewQR = (attendee: Attendee, index: number) => {
    setSelectedQR(attendee.qrCode)
    setSelectedAttendee({ ...attendee, index })
    setShowQRModal(true)
  }

  const downloadQR = () => {
    if (!selectedQR) return
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-${selectedAttendee?.nombre?.replace(/\s+/g, '-') ?? 'entrada'}.png`
      link.href = url
      link.click()
    }
  }

  const formatDate = (d: string) => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return d }
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${C.azul} 0%, ${C.azulClaro} 50%, #1a2f5e 100%)` }}>
      {/* Confetti dots animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bounce"
              style={{
                width: `${8 + (i % 5) * 4}px`,
                height: `${8 + (i % 5) * 4}px`,
                left: `${(i * 5.3) % 100}%`,
                top: `${(i * 7.1) % 60}%`,
                background: [C.amarillo, C.rojo, C.blanco, '#FAB90E', '#E0081D'][i % 5],
                opacity: 0.6,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.2 + (i % 3) * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-12">

        {/* Header badge */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl mb-4 ring-4 ring-white/30"
            style={{ background: `linear-gradient(135deg, ${C.amarillo}, ${C.rojo})` }}
          >
            <CheckCircle size={44} color={C.blanco} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center drop-shadow-lg">
            ¡Compra exitosa!
          </h1>
          <p className="text-white/80 mt-1 text-sm sm:text-base text-center">
            Tus entradas han sido confirmadas y enviadas a tu correo
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-4">

          {/* Purchase number card */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between shadow-xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Número de compra</p>
              <p className="text-white font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                #{(purchaseData?.id ?? purchaseId ?? 'PENDING').slice(-8).toUpperCase()}
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{ background: C.amarillo, color: C.negro }}
            >
              ✓ Confirmado
            </div>
          </div>

          {/* Event info card */}
          {purchaseData && (
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: C.blanco }}>
              {purchaseData.eventImage && (
                <div className="relative h-36 sm:h-44 overflow-hidden">
                  <img
                    src={purchaseData.eventImage}
                    alt={purchaseData.eventName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(35,60,122,0.85) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow">{purchaseData.eventName}</p>
                  </div>
                </div>
              )}
              {!purchaseData.eventImage && (
                <div className="px-5 pt-5 pb-2">
                  <p className="font-bold text-xl" style={{ color: C.azul }}>{purchaseData.eventName}</p>
                </div>
              )}
              <div className="p-4 space-y-2">
                {purchaseData.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={15} style={{ color: C.azul }} className="flex-shrink-0" />
                    <span className="text-sm" style={{ color: C.negro }}>
                      {formatDate(purchaseData.eventDate)}{purchaseData.eventTime ? ` · ${purchaseData.eventTime}` : ''}
                    </span>
                  </div>
                )}
                {purchaseData.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin size={15} style={{ color: C.rojo }} className="flex-shrink-0" />
                    <span className="text-sm" style={{ color: C.negro }}>{purchaseData.eventLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <CreditCard size={15} style={{ color: C.amarillo }} className="flex-shrink-0" />
                  <span className="text-sm font-bold" style={{ color: C.azul }}>
                    Total pagado: Bs {purchaseData.totalPaid.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tickets */}
          {purchaseData && purchaseData.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Ticket size={16} color={C.amarillo} />
                <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                  Tus Entradas ({purchaseData.attendees.length})
                </h2>
              </div>
              <div className="space-y-3">
                {purchaseData.attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="rounded-2xl overflow-hidden shadow-xl"
                    style={{ background: C.blanco }}
                  >
                    {/* Ticket top strip */}
                    <div
                      className="h-1.5"
                      style={{ background: `linear-gradient(90deg, ${C.azul}, ${C.amarillo}, ${C.rojo})` }}
                    />
                    <div className="p-4 flex items-start gap-4">
                      {/* Ticket number badge */}
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md"
                        style={{ background: C.azul }}
                      >
                        <Ticket size={18} color={C.amarillo} />
                        <span className="text-white text-xs font-bold mt-0.5">#{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base leading-tight" style={{ color: C.negro }}>
                          {attendee.nombre || 'Asistente'}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-xs font-medium" style={{ color: C.azul }}>
                            🎫 {attendee.asiento}
                          </span>
                          <span className="text-xs" style={{ color: '#666' }}>
                            {attendee.sector}
                          </span>
                        </div>
                        {attendee.ci && (
                          <p className="text-xs mt-0.5" style={{ color: '#999' }}>CI: {attendee.ci}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewQR(attendee, index)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0"
                        style={{ background: C.gris, border: `2px solid ${C.azul}20` }}
                      >
                        <QrCode size={20} style={{ color: C.azul }} />
                        <span className="text-xs font-semibold" style={{ color: C.azul }}>QR</span>
                      </button>
                    </div>

                    {/* Dashed separator */}
                    <div className="mx-4 border-t border-dashed" style={{ borderColor: '#ddd' }} />
                    <div className="px-4 py-2">
                      <p className="text-xs text-center" style={{ color: '#aaa' }}>
                        Presenta este código QR en la entrada del evento
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info banner */}
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={{ background: 'rgba(250,185,14,0.15)', border: `1px solid ${C.amarillo}40` }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: C.amarillo }}>📱 Información importante</p>
            <ul className="space-y-1 text-xs text-white/80">
              <li>• Presenta tu código QR en la entrada del evento</li>
              <li>• Llega 30 minutos antes del inicio</li>
              <li>• Las entradas son intransferibles</li>
              <li>• Revisa tu correo para una copia de tus entradas</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || !purchaseData}
              className="flex-1 flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              style={{ background: C.amarillo, color: C.negro }}
            >
              <Download size={18} />
              {downloading ? 'Generando PDF…' : 'Descargar Entradas'}
            </button>
            <button
              onClick={() => navigate('/mis-compras')}
              className="flex-1 flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: C.blanco }}
            >
              <Ticket size={18} />
              Ver Mis Compras
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors pb-6"
          >
            <Home size={16} />
            Volver al inicio
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header strip */}
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.azul}, ${C.amarillo}, ${C.rojo})` }} />
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: C.gris }}>
              <div>
                <h2 className="font-bold text-base" style={{ color: C.negro }}>Código QR de Entrada</h2>
                <p className="text-xs" style={{ color: '#888' }}>Entrada #{selectedAttendee.index + 1}</p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 rounded-xl transition-colors hover:bg-gray-100"
              >
                <X size={20} style={{ color: '#666' }} />
              </button>
            </div>

            <div className="p-5">
              <div className="text-center mb-4">
                <p className="font-bold text-sm" style={{ color: C.negro }}>{selectedAttendee.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                  {selectedAttendee.asiento} · {selectedAttendee.sector}
                </p>
              </div>

              {/* QR Code */}
              <div id="qr-canvas" className="flex justify-center mb-4">
                <div
                  className="p-4 rounded-2xl shadow-inner"
                  style={{ background: C.gris, border: `2px solid ${C.azul}20` }}
                >
                  <QRCode
                    value={selectedQR || 'DEMO-QR'}
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor={C.azul}
                    bgColor={C.gris}
                  />
                </div>
              </div>

              <p className="text-xs text-center mb-4" style={{ color: '#aaa' }}>
                Escanea este código en la entrada del evento
              </p>

              <button
                onClick={downloadQR}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all active:scale-95"
                style={{ background: C.azul, color: C.blanco }}
              >
                <Download size={16} />
                Descargar QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}