import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Wifi, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import socketService from '@/services/socket'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface Seat {
  id: string
  row: string
  number: number
  status: 'AVAILABLE' | 'OCCUPIED'
  price: number
  sectorId?: string
  sectorName?: string
  color?: string
}

interface Sector {
  id: string
  name: string
  color: string
  price: number
}

interface Row {
  id: string
  name: string
  seats: number
  columns: number
  order: number
  sectorId?: string
}

interface SpecialSeat {
  rowId: string
  seatIndex: number
  sectorName?: string
  color?: string
  price?: number
  status?: string
}

interface SeatMapConfig {
  sectors?: Sector[]
  rows?: Row[]
  specialSeats?: SpecialSeat[]
}

interface EventData {
  id: string
  title: string
  precio: number
  seatMapConfig?: SeatMapConfig
}

// Calcula el tamaño óptimo de butaca para que todo el mapa quepa en containerWidth
function calcSeatSize(
  containerWidth: number,
  maxSeatsPerRow: number,
  maxColumns: number,
  isMobile: boolean
): number {
  const rowLabelWidth = isMobile ? 52 : 96
  const gap = 4
  // cada pasillo vale 20px
  const aisleWidth = maxColumns > 1 ? (maxColumns - 1) * 20 : 0
  const padding = isMobile ? 16 : 48
  const available = containerWidth - rowLabelWidth - aisleWidth - padding
  // gap entre butacas: (N-1) * gap
  const sizeRaw = (available - (maxSeatsPerRow - 1) * gap) / maxSeatsPerRow
  return Math.min(Math.max(Math.floor(sizeRaw), 16), 36)
}

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [seatMapConfig, setSeatMapConfig] = useState<SeatMapConfig | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  const mobileMapRef = useRef<HTMLDivElement>(null)
  const desktopMapRef = useRef<HTMLDivElement>(null)
  const [mobileSeatSize, setMobileSeatSize] = useState(28)
  const [desktopSeatSize, setDesktopSeatSize] = useState(32)

  const eventId = id!

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ── CALCULAR TAMAÑO DE BUTACAS según ancho del contenedor ──────────
  const recalcSizes = useCallback(() => {
    if (!seatMapConfig?.rows) return
    const maxSeats = Math.max(...seatMapConfig.rows.map(r => r.seats))
    const maxCols = Math.max(...seatMapConfig.rows.map(r => r.columns || 1))

    if (mobileMapRef.current) {
      const w = mobileMapRef.current.offsetWidth
      if (w > 0) setMobileSeatSize(calcSeatSize(w, maxSeats, maxCols, true))
    }
    if (desktopMapRef.current) {
      const w = desktopMapRef.current.offsetWidth
      if (w > 0) setDesktopSeatSize(calcSeatSize(w, maxSeats, maxCols, false))
    }
  }, [seatMapConfig])

  useEffect(() => {
    const t1 = setTimeout(recalcSizes, 60)
    const t2 = setTimeout(recalcSizes, 400)
    window.addEventListener('resize', recalcSizes)
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', recalcSizes) }
  }, [recalcSizes, seats])

  // ── TIMER ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setSelectedSeats([])
          setIsTimerActive(false)
          alert('Tiempo agotado. Selecciona tus asientos nuevamente.')
          return 600
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerActive, timeLeft])

  // ── GENERAR ASIENTOS ────────────────────────────────────────────────
  const generateSeatsFromConfig = (config: SeatMapConfig, asientosReales: any[], eventoPrecio: number) => {
    if (!config.rows?.length) return
    const asientosMap = new Map<string, any>()
    asientosReales.forEach(a => asientosMap.set(`${a.fila}-${a.numero}`, a))

    const generated: Seat[] = []
    const sortedRows = [...config.rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    sortedRows.forEach(row => {
      for (let i = 0; i < row.seats; i++) {
        const sp = config.specialSeats?.find(s => s.rowId === row.id && s.seatIndex === i)
        const sector = config.sectors?.find(s => s.id === row.sectorId)
        const price = sp?.price ?? sector?.price ?? eventoPrecio
        const color = sp?.color || sector?.color || '#10B981'
        const sectorName = sp?.sectorName || sector?.name || 'General'
        const asientoReal = asientosMap.get(`${row.name}-${i + 1}`)
        let status: 'AVAILABLE' | 'OCCUPIED' = 'AVAILABLE'
        if (asientoReal) {
          const e = asientoReal.estado
          if (e === 'VENDIDO' || e === 'BLOQUEADO' || e === 'RESERVANDO') status = 'OCCUPIED'
        }
        generated.push({ id: asientoReal?.id || `temp-${row.name}-${i + 1}`, row: row.name, number: i + 1, status, price, sectorId: sector?.id, sectorName, color })
      }
    })
    setSeats(generated)
  }

  // ── CARGAR EVENTO ───────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return
    const load = async () => {
      try {
        setLoading(true); setSeats([])
        const response = await api.get(`/eventos/${eventId}`)
        const event = response.data.data
        const precio: number = event.precio || 0
        setEventData({ id: event.id, title: event.titulo || event.title || 'Evento', precio, seatMapConfig: event.seatMapConfig })
        if (!event.seatMapConfig) { setDemoMode(true); setLoading(false); return }
        setSeatMapConfig(event.seatMapConfig)
        let asientosReales: any[] = []
        try {
          const ctrl = new AbortController()
          const t = setTimeout(() => ctrl.abort(), 3000)
          const res = await api.get(`/asientos/evento/${eventId}`, { signal: ctrl.signal })
          clearTimeout(t)
          asientosReales = res.data.data || []
        } catch { asientosReales = event.asientos || [] }
        generateSeatsFromConfig(event.seatMapConfig, asientosReales, precio)
      } catch { setDemoMode(true) } finally { setLoading(false) }
    }
    load()
  }, [eventId])

  // ── SOCKET ──────────────────────────────────────────────────────────
  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    try {
      socketService.connect()
      socketService.onConnected(() => socketService.joinEvent(eventId))
      socketService.onConnectError(() => setDemoMode(true))
      socketService.onSeatReserved(data => setSeats(prev => prev.map(s => s.id === data.seatId ? { ...s, status: 'OCCUPIED' } : s)))
      tid = setTimeout(() => { if (!socketService.isConnected()) setDemoMode(true) }, 3000)
    } catch { setDemoMode(true) }
    return () => { if (tid) clearTimeout(tid); try { socketService.disconnect() } catch {} }
  }, [eventId])

  // ── TOGGLE ──────────────────────────────────────────────────────────
  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return
    setSelectedSeats(prev => {
      const sel = prev.some(s => s.id === seat.id)
      if (sel) return prev.filter(s => s.id !== seat.id)
      if (prev.length >= 10) { alert('Máximo 10 asientos por persona'); return prev }
      return [...prev, seat]
    })
    if (socketService.isConnected() && !selectedSeats.some(s => s.id === seat.id))
      socketService.reserveSeat({ eventoId: eventId, asientoId: seat.id, userId: user?.id || 'guest' })
  }

  const proceedToCheckout = () => {
    if (selectedSeats.length === 0) { alert('Por favor selecciona al menos un asiento'); return }
    if (!user) {
      navigate('/login', { state: { redirectTo: `/eventos/${id}/asientos`, eventData: { eventId, selectedSeats: selectedSeats.map(s => s.id) } } })
      return
    }
    navigate('/checkout', { state: { eventId, seats: selectedSeats } })
  }

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return '#8B5CF6'
    if (seat.status === 'OCCUPIED') return '#EF4444'
    return seat.color || '#10B981'
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  // ══════════════════════════════════════════════════════════════════
  // COMPONENTE DEL MAPA — acepta seatSize dinámico
  // ══════════════════════════════════════════════════════════════════
  const SeatMap = ({ seatSize, isMobile }: { seatSize: number; isMobile: boolean }) => {
    if (!seatMapConfig?.rows || seats.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {seatMapConfig?.rows?.length && seats.length === 0 ? (
            <div>
              <p className="font-medium">Error al cargar los asientos.</p>
              <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">Recargar</button>
            </div>
          ) : <p>No hay configuración de asientos disponible.</p>}
        </div>
      )
    }

    const ROW_LABEL_W = isMobile ? 52 : 96
    const GAP = 4
    const FONT = seatSize <= 20 ? 7 : seatSize <= 24 ? 9 : seatSize <= 28 ? 10 : 11
    const sortedRows = [...seatMapConfig.rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    // Cabecera de números (primera fila como referencia)
    const firstRow = sortedRows[0]
    const firstRowSeats = seats.filter(s => s.row === firstRow.name)
    const fCols = firstRow.columns || 1
    const fSPC = Math.ceil(firstRow.seats / fCols)
    const firstColumns: Seat[][] = Array.from({ length: fCols }, (_, c) =>
      firstRowSeats.slice(c * fSPC, Math.min((c + 1) * fSPC, firstRowSeats.length))
    )

    return (
      <div style={{ width: '100%' }}>

        {/* Escenario */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.07))',
          borderRadius: 8,
          padding: isMobile ? '8px 16px' : '14px 32px',
          textAlign: 'center',
          marginBottom: isMobile ? 10 : 18,
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          <p style={{ fontWeight: 800, fontSize: isMobile ? 13 : 20, color: '#3B82F6', letterSpacing: '0.12em', margin: 0 }}>ESCENARIO</p>
          <div style={{ height: 2, background: 'rgba(59,130,246,0.25)', borderRadius: 9999, marginTop: 6 }} />
        </div>

        {/* Leyenda sectores */}
        {(seatMapConfig.sectors?.length || seatMapConfig.specialSeats?.some((s: SpecialSeat) => s.sectorName)) && (
          <div style={{ marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {seatMapConfig.sectors?.map(sector => (
              <div key={sector.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', padding: '3px 8px', borderRadius: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: sector.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{sector.name}</span>
                <span style={{ fontSize: 9, color: '#9CA3AF' }}>Bs {sector.price}</span>
              </div>
            ))}
            {(() => {
              const u = new Map<string, SpecialSeat>()
              seatMapConfig.specialSeats?.forEach(s => { if (s.sectorName && !u.has(s.sectorName)) u.set(s.sectorName, s) })
              return Array.from(u.values()).map(s => (
                <div key={s.sectorName} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', padding: '3px 8px', borderRadius: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{s.sectorName}</span>
                  <span style={{ fontSize: 9, color: '#9CA3AF' }}>Bs {s.price}</span>
                </div>
              ))
            })()}
          </div>
        )}

        {/* Leyenda estados */}
        <div style={{ marginBottom: 10, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['#10B981', 'Disponible'], ['#8B5CF6', 'Seleccionado'], ['#EF4444', 'Ocupado']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
              <span style={{ fontSize: 10, color: '#6B7280' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Números de asiento (cabecera) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: GAP, marginBottom: 2 }}>
          <span style={{ width: ROW_LABEL_W, flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: GAP }}>
            {firstColumns.map((colSeats, ci) => (
              <React.Fragment key={ci}>
                <div style={{ display: 'flex', gap: GAP }}>
                  {colSeats.map(seat => (
                    <div key={seat.id} style={{ width: seatSize, textAlign: 'center' }}>
                      <span style={{ fontSize: FONT, fontWeight: 700, color: '#3B82F6' }}>{seat.number}</span>
                    </div>
                  ))}
                </div>
                {ci < firstColumns.length - 1 && (
                  <div style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 1, height: 10, background: '#E5E7EB' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Filas de asientos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {sortedRows.map(row => {
            const rowSeats = seats.filter(s => s.row === row.name)
            const numCols = row.columns || 1
            const spc = Math.ceil(row.seats / numCols)
            const columns: Seat[][] = Array.from({ length: numCols }, (_, c) =>
              rowSeats.slice(c * spc, Math.min((c + 1) * spc, rowSeats.length))
            )
            return (
              <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: GAP }}>
                {/* Etiqueta */}
                <span style={{
                  width: ROW_LABEL_W, flexShrink: 0, textAlign: 'right',
                  fontSize: isMobile ? 9 : 11, fontWeight: 500, color: '#9CA3AF', paddingRight: 4,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {row.name}
                </span>

                {/* Columnas con asientos */}
                <div style={{ display: 'flex', gap: GAP }}>
                  {columns.map((colSeats, ci) => (
                    <React.Fragment key={ci}>
                      <div style={{ display: 'flex', gap: GAP }}>
                        {colSeats.map(seat => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id)
                          const color = getSeatColor(seat)
                          return (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeat(seat)}
                              disabled={seat.status !== 'AVAILABLE'}
                              title={`${row.name} · Asiento ${seat.number} · ${seat.sectorName} · Bs ${seat.price}`}
                              style={{
                                width: seatSize,
                                height: seatSize,
                                borderRadius: Math.max(3, Math.floor(seatSize * 0.2)),
                                backgroundColor: color,
                                border: isSelected ? `2px solid rgba(255,255,255,0.6)` : '1px solid transparent',
                                color: '#fff',
                                fontSize: FONT,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                                opacity: seat.status === 'OCCUPIED' ? 0.4 : 1,
                                boxShadow: isSelected
                                  ? `0 0 0 2px #fff, 0 0 0 4px ${color}, 0 2px 8px rgba(139,92,246,0.4)`
                                  : '0 1px 2px rgba(0,0,0,0.15)',
                                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                                flexShrink: 0,
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              {isSelected
                                ? <Check size={Math.max(7, Math.floor(seatSize * 0.45))} strokeWidth={3} />
                                : seat.number}
                            </button>
                          )
                        })}
                      </div>
                      {/* Pasillo entre columnas */}
                      {ci < columns.length - 1 && (
                        <div style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 1, height: seatSize * 0.55, background: '#D1D5DB', borderRadius: 1 }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── LOADING ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">Cargando asientos...</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-primary text-white py-3">
        <div className="w-full px-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors text-sm">
              <ArrowLeft size={18} className="mr-1" />Volver
            </button>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <Clock size={14} className={timeLeft < 60 ? 'text-red-300' : 'text-yellow-300'} />
              <div className="text-right">
                <p className="text-xs text-white/80 leading-tight">Tiempo restante</p>
                <p className={`text-sm font-bold leading-tight ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">Selecciona tus asientos</h1>
              <p className="text-white/80 text-sm">{eventData?.title || 'Cargando...'}</p>
            </div>
            {demoMode && (
              <div className="flex items-center space-x-2 bg-yellow-500 text-white px-3 py-1.5 rounded-lg">
                <Wifi size={16} /><span className="text-xs font-semibold">MODO DEMO</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ DESKTOP ══════ */}
      <div className="hidden lg:block w-full px-4 py-6">
        <div className="grid grid-cols-4 gap-6">

          {/* Sidebar desktop */}
          <div className="col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Resumen de compra</h3>
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Clock className={timeLeft < 60 ? 'text-red-600' : 'text-primary'} size={20} />
                    <div>
                      <p className="text-xs text-gray-600">Tiempo restante</p>
                      <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>{formatTime(timeLeft)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Asientos seleccionados</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">Bs {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!selectedSeats.length) { alert('Selecciona al menos un asiento'); return }
                    const list = selectedSeats.map(s => `${s.row}${s.number}`).join(', ')
                    if (confirm(`Asientos: ${list}\nTotal: Bs ${totalPrice.toFixed(2)}\n\n¿Confirmar disponibilidad?`))
                      alert('✅ ¡Verificados! Tienes 10 minutos para completar tu compra.')
                  }}
                  disabled={!selectedSeats.length}
                  className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                >Verificar Disponibilidad</Button>
                <Button size="lg" onClick={proceedToCheckout} disabled={!selectedSeats.length} className="w-full">
                  Continuar al pago
                </Button>
                <p className="text-center text-sm text-gray-500 mt-3">Tienes 10 minutos para completar tu compra</p>
                {selectedSeats.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Tus asientos:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSeats.map(seat => (
                        <div key={seat.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{seat.row} - Asiento {seat.number}</span>
                          <span className="font-semibold">Bs {seat.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mapa desktop */}
          <div className="col-span-3">
            <Card>
              <div ref={desktopMapRef}>
                <CardContent className="p-6">
                  <SeatMap seatSize={desktopSeatSize} isMobile={false} />
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ══════ MÓVIL ══════ */}
      <div className="lg:hidden" style={{ paddingBottom: 88 }}>
        {/*
          El mapa ocupa todo el ancho de la pantalla.
          Las butacas se calculan para caber exactamente en ese ancho.
          Sin transform, sin scroll horizontal.
        */}
        <div
          ref={mobileMapRef}
          className="bg-white w-full"
          style={{ padding: '12px 8px 16px 2px' }}
        >
          <SeatMap seatSize={mobileSeatSize} isMobile={true} />
        </div>
      </div>

      {/* ══════ BARRA INFERIOR MÓVIL (fija) ══════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>

        {/* Lista expandible */}
        {showMobileSummary && selectedSeats.length > 0 && (
          <div style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB', padding: '10px 16px', maxHeight: 180, overflowY: 'auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: 8 }}>ASIENTOS SELECCIONADOS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedSeats.map(seat => (
                <div key={seat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                    <span style={{ fontSize: 12, color: '#374151' }}>{seat.row} · Asiento {seat.number}</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>{seat.sectorName}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6' }}>Bs {seat.price}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Total</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#3B82F6' }}>Bs {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Barra principal */}
        <div style={{ padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Contador / abrir lista */}
            <button
              onClick={() => selectedSeats.length > 0 && setShowMobileSummary(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: selectedSeats.length > 0 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: selectedSeats.length > 0 ? '#8B5CF6' : '#D1D5DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0,
                transition: 'background-color 0.2s',
              }}>
                {selectedSeats.length}
              </div>
              <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.2 }}>
                  {selectedSeats.length === 0
                    ? 'Toca un asiento para seleccionar'
                    : `${selectedSeats.length} asiento${selectedSeats.length !== 1 ? 's' : ''} ${showMobileSummary ? '▲' : '▼'}`}
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                  Bs {totalPrice.toFixed(2)}
                </p>
              </div>
            </button>

            {/* Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, flexShrink: 0,
              backgroundColor: timeLeft < 60 ? '#FEF2F2' : '#EFF6FF',
            }}>
              <Clock size={12} color={timeLeft < 60 ? '#EF4444' : '#3B82F6'} />
              <span style={{ fontSize: 13, fontWeight: 800, color: timeLeft < 60 ? '#EF4444' : '#3B82F6', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Botón continuar */}
            <Button
              onClick={proceedToCheckout}
              disabled={selectedSeats.length === 0}
              size="sm"
              className="flex-shrink-0 font-bold"
              style={{ padding: '8px 18px', fontSize: 13 } as any}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}