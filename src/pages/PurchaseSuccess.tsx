import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, ShoppingBag, QrCode, X, Hash } from 'lucide-react'
import QRCode, { QRCodeCanvas } from 'qrcode.react'
import api from '@/services/api'

const C = {
  azul:    '#233C7A',
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
  eventDoorsOpen: string
  eventLocation: string
  eventAddress: string
  eventImage: string
  eventCategory: string
  eventDescription: string
  attendees: Attendee[]
  totalPaid: number
}

export default function PurchaseSuccess() {
  const navigate = useNavigate()
  const location = useLocation() as SuccessState
  const { purchaseId, eventData, attendeeData } = location.state || {}

  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // Caso 1: llegamos con eventData completo desde el checkout
      if (eventData) {
        const rawAttendees: Attendee[] = attendeeData?.asientos ?? [{ nombre: 'Asistente', asiento: 'General', sector: 'General', ci: '', email: '', qrCode: 'DEMO-QR' }]
        setPurchaseData({
          id: purchaseId || `PUR-${Date.now()}`,
          eventName: eventData.titulo || eventData.title || eventData.eventoTitulo || 'Evento',
          eventDate: eventData.fecha || eventData.date || eventData.eventoFecha || '',
          eventTime: eventData.hora || eventData.time || '20:00',
          eventDoorsOpen: eventData.doorsOpen || eventData.horaApertura || '',
          eventLocation: eventData.ubicacion || eventData.location || eventData.eventoUbicacion || '',
          eventAddress: eventData.direccion || eventData.address || eventData.eventoDireccion || '',
          eventImage: eventData.imagenUrl || eventData.image || eventData.eventoImagen || '',
          eventCategory: eventData.categoria || eventData.category || '',
          eventDescription: eventData.descripcionCorta || eventData.descripcion || '',
          attendees: rawAttendees,
          totalPaid: attendeeData?.total ?? eventData.precio ?? eventData.price ?? 0
        })
        setLoading(false)
        return
      }

      // Caso 2: tenemos purchaseId, buscar en localStorage
      if (purchaseId) {
        const purchases = JSON.parse(localStorage.getItem('user_purchases') || '[]')
        const purchase = purchases.find((p: any) => p.id === purchaseId)
        if (purchase) {
          setPurchaseData({
            id: purchase.id,
            eventName: purchase.eventoTitulo,
            eventDate: purchase.eventoFecha,
            eventTime: purchase.eventoHora || '20:00',
            eventDoorsOpen: purchase.eventoApertura || '',
            eventLocation: purchase.eventoUbicacion,
            eventAddress: purchase.eventoDireccion,
            eventImage: purchase.eventoImagen,
            eventCategory: purchase.eventoCategoria || '',
            eventDescription: purchase.eventoDescripcion || '',
            attendees: purchase.asientos,
            totalPaid: purchase.monto
          })
          setLoading(false)
          return
        }
      }

      // Caso 3: sin estado — cargar la compra más reciente PAGADO de la API
      try {
        const res = await api.get('/compras/mis-compras', { params: { limit: 5 } })
        const compras: any[] = res.data.data ?? []
        const pagadas = compras.filter((c: any) => c.estadoPago === 'PAGADO')
        if (pagadas.length > 0) {
          const last = pagadas[0]
          const evento = last.evento ?? {}
          setPurchaseData({
            id: last.id,
            eventName: evento.titulo || 'Evento',
            eventDate: evento.fecha || '',
            eventTime: evento.hora || '',
            eventDoorsOpen: evento.doorsOpen || '',
            eventLocation: evento.ubicacion || '',
            eventAddress: evento.direccion || '',
            eventImage: evento.imagenUrl || '',
            eventCategory: evento.categoria || '',
            eventDescription: evento.descripcion || '',
            attendees: [{
              nombre: `${last.nombreAsistente ?? ''} ${last.apellidoAsistente ?? ''}`.trim() || 'Asistente',
              asiento: last.asiento ? `${last.asiento.fila ?? ''}${last.asiento.numero ?? ''}` : last.numeroBoleto ? `N°${last.numeroBoleto}` : 'General',
              sector: last.asiento ? (last.asiento.sector ?? 'General') : 'General',
              ci: last.documentoAsistente ?? '',
              email: last.emailAsistente ?? '',
              qrCode: last.qrCode ?? '',
            }],
            totalPaid: last.monto ?? 0
          })
        }
      } catch { /* sin compras disponibles */ }

      setLoading(false)
    }
    load()
  }, [eventData, attendeeData, purchaseId])

  const handleDownloadPDF = async () => {
    if (!purchaseData) return
    setDownloading(true)
    try {
      const { generateTicketPDF } = await import('@/services/pdfService')

      const qrDataUrls = purchaseData.attendees.map((_, i) => {
        const canvas = document.getElementById(`pdf-qr-${i}`) as HTMLCanvasElement
        return canvas ? canvas.toDataURL('image/png') : null
      })

      await generateTicketPDF({
        purchaseId: purchaseData.id,
        eventName: purchaseData.eventName,
        eventDate: purchaseData.eventDate
          ? new Date(purchaseData.eventDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
          : '',
        eventTime: purchaseData.eventTime,
        eventDoorsOpen: purchaseData.eventDoorsOpen,
        eventLocation: purchaseData.eventLocation,
        eventAddress: purchaseData.eventAddress,
        eventCategory: purchaseData.eventCategory,
        eventDescription: purchaseData.eventDescription,
        attendees: purchaseData.attendees,
        totalPaid: purchaseData.totalPaid,
        purchaseDate: new Date().toLocaleDateString('es-ES'),
        qrDataUrls,
      })
    } catch (e) {
      console.error(e)
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

  const purchaseCode = (purchaseData?.id ?? purchaseId ?? 'PENDING').slice(-8).toUpperCase()

  if (loading) {
    return (
      <div style={{ background: '#F7F8FA', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `${C.azul} transparent transparent transparent` }} />
          <p className="text-sm text-gray-400">Cargando tu compra…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>

      {/* Top success banner */}
      <div style={{ background: C.azul }} className="py-10 px-4 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: '#22c55e' }}
          >
            <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">¡Compra confirmada!</h1>
        <p className="text-white/70 text-sm">Tus entradas han sido enviadas a tu correo electrónico</p>

        {/* Order number pill */}
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <Hash size={14} color={C.amarillo} />
          <span className="text-white text-sm font-mono font-bold">Orden #{purchaseCode}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#22c55e', color: '#fff' }}>CONFIRMADO</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Tickets section */}
        {purchaseData && purchaseData.attendees.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: '#9CA3AF' }}>
              Tus entradas ({purchaseData.attendees.length})
            </h2>
            <div className="space-y-4">
              {purchaseData.attendees.map((attendee, index) => (
                <div
                  key={index}
                  id={`ticket-card-${index}`}
                  className="rounded-2xl overflow-hidden flex"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)', minHeight: 200 }}
                >
                  {/* ── TIRA IZQUIERDA ── */}
                  <div
                    className="flex-shrink-0 flex flex-col items-center justify-between py-4 px-2"
                    style={{ background: C.azul, width: 52 }}
                  >
                    {/* Texto vertical arriba */}
                    <span
                      className="text-white font-black uppercase select-none"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 13, letterSpacing: '0.2em' }}
                    >
                      ALFA BOLIVIA
                    </span>
                    {/* Logo abajo */}
                    <img
                      src="/assets/alfa-negativo.png"
                      alt="Alfa Bolivia"
                      style={{ width: 40, height: 'auto', objectFit: 'contain' }}
                    />
                  </div>

                  {/* ── CUERPO CENTRAL (fondo blanco) ── */}
                  <div className="flex-1 flex flex-col bg-white min-w-0">

                    {/* Cabecera: nombre evento grande */}
                    <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#9CA3AF' }}>
                        VAS A VER
                      </p>
                      <p className="font-black uppercase leading-tight truncate" style={{ fontSize: 19, color: C.azul }}>
                        {purchaseData.eventName}
                      </p>
                      {purchaseData.eventLocation && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
                          {purchaseData.eventLocation}{purchaseData.eventAddress ? `, ${purchaseData.eventAddress}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Datos + QR */}
                    <div className="px-4 py-3 flex gap-3 flex-1">
                      {/* Datos en grid 2 col */}
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 content-start">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.azul }}>NOMBRE</p>
                          <p className="text-xs font-semibold uppercase mt-0.5 truncate" style={{ color: '#6B7280' }}>{attendee.nombre || 'Asistente'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.azul }}>FECHA</p>
                          <p className="text-xs font-semibold uppercase mt-0.5" style={{ color: '#6B7280' }}>
                            {purchaseData.eventDate
                              ? new Date(purchaseData.eventDate).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider" style={{ color: C.azul }}>HORA</p>
                          <p className="text-xs font-semibold uppercase mt-0.5" style={{ color: '#6B7280' }}>{purchaseData.eventTime || '—'}</p>
                        </div>
                      </div>
                      {/* QR + Ver QR apilados a la derecha */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2">
                        <QRCode
                          value={attendee.qrCode || 'TICKET'}
                          size={52}
                          level="M"
                          includeMargin={false}
                          fgColor={C.azul}
                          bgColor="#ffffff"
                        />
                        <button
                          data-pdf-hide
                          onClick={() => handleViewQR(attendee, index)}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded w-full justify-center"
                          style={{ background: C.azul, color: '#fff' }}
                        >
                          <QrCode size={11} />
                          Ver QR
                        </button>
                      </div>
                    </div>

                    {/* Footer: badge SEC */}
                    <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
                      <div className="flex rounded overflow-hidden" style={{ border: `2px solid ${C.azul}` }}>
                        <span className="px-2 py-1 text-xs font-black text-white uppercase" style={{ background: C.azul }}>SEC</span>
                        <span className="px-3 py-1 text-xs font-extrabold uppercase bg-white" style={{ color: C.azul }}>{attendee.sector || 'GEN'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── IMAGEN DERECHA (talonario) ── */}
                  {purchaseData.eventImage ? (
                    <>
                      {/* Separador dentado */}
                      <div className="flex-shrink-0 bg-white flex flex-col justify-around py-3" style={{ width: 14 }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="rounded-full self-end" style={{ width: 14, height: 14, background: '#F7F8FA', marginRight: -7 }} />
                        ))}
                      </div>
                      <div className="flex-shrink-0" style={{ width: 160, position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={purchaseData.eventImage}
                          alt="evento"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-shrink-0" style={{ width: 8, background: `linear-gradient(180deg, ${C.amarillo}, ${C.rojo})` }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !purchaseData}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            style={{ background: C.azul, color: C.blanco }}
          >
            <Download size={18} />
            {downloading ? 'Generando PDF…' : 'Descargar entradas (PDF)'}
          </button>
          <button
            onClick={() => navigate('/mis-compras')}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-xl transition-all active:scale-95"
            style={{ background: C.blanco, border: `2px solid ${C.azul}`, color: C.azul }}
          >
            <ShoppingBag size={18} />
            Mis compras
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium transition-colors pb-4"
          style={{ color: '#9CA3AF' }}
        >
          Volver al inicio
        </button>
      </div>

      {/* Canvases ocultos para generar QR en PDF */}
      <div style={{ position: 'absolute', left: -9999, top: -9999, pointerEvents: 'none' }}>
        {purchaseData?.attendees.map((attendee, i) => (
          <QRCodeCanvas
            key={i}
            id={`pdf-qr-${i}`}
            value={attendee.qrCode || 'TICKET'}
            size={200}
            level="H"
            includeMargin={false}
            fgColor={C.azul}
            bgColor="#ffffff"
          />
        ))}
      </div>

      {/* QR Modal */}
      {showQRModal && selectedQR && selectedAttendee && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
            style={{ background: C.azul }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header estilo ADMIT ONE */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  VAS A VER
                </p>
                <p className="font-black uppercase text-white leading-tight" style={{ fontSize: 17 }}>
                  {purchaseData?.eventName}
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <X size={18} color="white" />
              </button>
            </div>

            {/* Nombre + badges */}
            <div className="px-5 pt-4 pb-2 text-center">
              <p className="text-xl font-extrabold uppercase text-white tracking-tight">
                {selectedAttendee.nombre}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <div className="flex rounded overflow-hidden" style={{ border: `2px solid rgba(255,255,255,0.3)` }}>
                  <span className="px-2 py-0.5 text-xs font-black uppercase text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>SEC</span>
                  <span className="px-2 py-0.5 text-xs font-extrabold uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedAttendee.sector || 'GEN'}</span>
                </div>
                <div className="flex rounded overflow-hidden" style={{ border: `2px solid rgba(255,255,255,0.3)` }}>
                  <span className="px-2 py-0.5 text-xs font-black uppercase text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>N°</span>
                  <span className="px-2 py-0.5 text-xs font-extrabold uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedAttendee.asiento}</span>
                </div>
              </div>
            </div>

            {/* Separador dentado */}
            <div className="flex items-center px-5 py-3">
              <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* QR grande */}
            <div id="qr-canvas" className="flex justify-center px-5 pb-2">
              <div className="p-3 rounded-2xl bg-white">
                <QRCode
                  value={selectedQR || 'DEMO-QR'}
                  size={210}
                  level="H"
                  includeMargin={false}
                  fgColor={C.negro}
                  bgColor="#fff"
                />
              </div>
            </div>

            <p className="text-xs text-center pb-4 pt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Escanea este código en la entrada del evento
            </p>

            {/* Botón descargar */}
            <div className="px-5 pb-6">
              <button
                onClick={downloadQR}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-xl"
                style={{ background: C.amarillo, color: C.negro }}
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
