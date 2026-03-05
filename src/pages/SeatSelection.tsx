import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Wifi, Clock, AlertCircle, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import socketService from '@/services/socket'
import api from '@/services/api'
import { seatReservationService } from '@/services/seatReservationService'
import { useAuthStore } from '@/store/authStore'

interface Seat {
  id: string
  row: string
  number: number
  status: 'DISPONIBLE' | 'RESERVANDO' | 'EN_PROCESO' | 'VENDIDO' | 'BLOQUEADO'
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

// ─── Auto-scaling seat map ────────────────────────────────────────────────────
// Mide el contenedor con ResizeObserver y calcula el tamaño óptimo de cada
// asiento para que toda la fila más larga quepa sin scroll horizontal.

interface SeatGridProps {
  seatMapConfig: SeatMapConfig
  seats: Seat[]
  selectedSeats: Seat[]
  onToggle: (seat: Seat) => void
}

const SeatGrid: React.FC<SeatGridProps> = ({ seatMapConfig, seats, selectedSeats, onToggle }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [seatPx, setSeatPx] = useState(32)

  const sortedRows = useMemo(() =>
    [...(seatMapConfig.rows ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [seatMapConfig.rows]
  )

  // Fila con más "slots" (asientos + pasillos proporcionales)
  const maxSlots = useMemo(() => {
    if (sortedRows.length === 0) return 0
    return Math.max(...sortedRows.map(row => {
      const cols = row.columns || 1
      return row.seats + (cols - 1) * 0.7   // pasillo = 0.7 slots
    }))
  }, [sortedRows])

  const LABEL_PX = 80   // ancho reservado para "Fila A"
  const GAP = 0.15      // gap = seatPx * GAP

  const recalc = useCallback(() => {
    if (!wrapperRef.current || maxSlots === 0) return
    const avail = wrapperRef.current.clientWidth - LABEL_PX - 8
    // avail = maxSlots * px + (maxSlots - 1) * px * GAP
    const divisor = maxSlots + (maxSlots - 1) * GAP
    const size = Math.floor(avail / divisor)
    setSeatPx(Math.max(10, Math.min(36, size)))
  }, [maxSlots])

  useEffect(() => {
    recalc()
    const ro = new ResizeObserver(recalc)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [recalc])

  const gap = Math.max(2, Math.round(seatPx * GAP))
  const aisleW = Math.round(seatPx * 0.7)
  const fontSize = seatPx < 16 ? '7px' : seatPx < 22 ? '8px' : seatPx < 28 ? '10px' : '11px'

  const getColor = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return '#8B5CF6'
    if (seat.status === 'VENDIDO' || seat.status === 'BLOQUEADO') return '#EF4444'
    if (seat.status === 'RESERVANDO' || seat.status === 'EN_PROCESO') return '#F59E0B'
    return seat.color || '#10B981'
  }

  const renderSeat = (seat: Seat) => {
    const bg = getColor(seat)
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    const isOccupied = seat.status === 'VENDIDO' || seat.status === 'BLOQUEADO' || seat.status === 'RESERVANDO' || seat.status === 'EN_PROCESO'
    return (
      <button
        key={seat.id}
        onClick={() => onToggle(seat)}
        disabled={isOccupied}
        title={`${seat.row} · Asiento ${seat.number} (${seat.sectorName}) · Bs ${seat.price}`}
        style={{
          width: seatPx, height: seatPx, flexShrink: 0,
          borderRadius: Math.max(3, seatPx * 0.15),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize, fontWeight: 600, color: '#fff',
          backgroundColor: bg,
          border: `${isSelected ? 2 : 1}px solid ${bg}`,
          opacity: isOccupied ? 0.55 : 1,
          cursor: isOccupied ? 'not-allowed' : 'pointer',
          transform: isSelected ? 'scale(1.12)' : 'scale(1)',
          boxShadow: isSelected ? '0 0 0 2px rgba(139,92,246,0.4)' : undefined,
          transition: 'transform .12s, box-shadow .12s',
          position: 'relative',
        }}
      >
        {isSelected
          ? <Check size={Math.max(8, seatPx * 0.4)} strokeWidth={3} />
          : (seatPx >= 13 ? seat.number : '')
        }
      </button>
    )
  }

  return (
    // wrapper mide el ancho disponible
    <div ref={wrapperRef} style={{ width: '100%' }}>
      {/* Cabecera con números */}
      {sortedRows.length > 0 && (() => {
        const firstRow = sortedRows[0]
        const rowSeats = seats.filter(s => s.row === firstRow.name)
        const spc = Math.ceil(firstRow.seats / (firstRow.columns || 1))
        const cols = Array.from({ length: firstRow.columns || 1 }, (_, ci) => {
          const start = ci * spc
          return rowSeats.slice(start, Math.min(start + spc, rowSeats.length))
        })
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: gap, paddingLeft: LABEL_PX + gap }}>
            <div style={{ display: 'flex', alignItems: 'center', gap }}>
              {cols.map((colSeats, ci) => (
                <React.Fragment key={ci}>
                  <div style={{ display: 'flex', gap }}>
                    {colSeats.map(seat => (
                      <div key={seat.id} style={{
                        width: seatPx, height: Math.max(14, seatPx * 0.6),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize, fontWeight: 700, color: '#3B82F6' }}>
                          {seatPx >= 13 ? seat.number : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  {ci < cols.length - 1 && (
                    <div style={{ width: aisleW }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Filas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: Math.max(3, gap) }}>
        {sortedRows.map(row => {
          const rowSeats = seats.filter(s => s.row === row.name)
          const spc = Math.ceil(row.seats / (row.columns || 1))
          const cols = Array.from({ length: row.columns || 1 }, (_, ci) => {
            const start = ci * spc
            return rowSeats.slice(start, Math.min(start + spc, rowSeats.length))
          })
          return (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap }}>
              {/* Label */}
              <span style={{
                width: LABEL_PX, flexShrink: 0, textAlign: 'right', paddingRight: 4,
                fontSize: Math.max(9, seatPx * 0.38), fontWeight: 500, color: '#6B7280',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {row.name}
              </span>

              {/* Columnas */}
              <div style={{ display: 'flex', alignItems: 'center', gap }}>
                {cols.map((colSeats, ci) => (
                  <React.Fragment key={ci}>
                    <div style={{ display: 'flex', gap }}>
                      {colSeats.map(renderSeat)}
                    </div>
                    {/* Pasillo */}
                    {ci < cols.length - 1 && (
                      <div style={{ width: aisleW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 1, height: seatPx * 0.6, background: '#D1D5DB', borderRadius: 1 }} />
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

// ─── Componente principal ─────────────────────────────────────────────────────

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
  const [reservaId, setReservaId] = useState<string | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const [timerPhase, setTimerPhase] = useState<'SELECCION' | 'RESERVACION'>('SELECCION')

  const eventId = id!

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // ── Timer (3 minutos para selección + 10 minutos para pago) ──
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Si estamos en fase de reservación y hay una reserva activa, intentamos liberarla
          if (timerPhase === 'RESERVACION' && reservaId) {
            liberarAsientos()
          }
          setSelectedSeats([])
          setReservaId(null)
          setIsTimerActive(false)
          alert('Tiempo de selección agotado. Por favor selecciona tus asientos nuevamente.')
          return timerPhase === 'SELECCION' ? 600 : 180 // Reset según fase
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerActive, timeLeft, timerPhase, reservaId])

  // ── Generar asientos desde config ──
  const generateSeatsFromConfig = (config: SeatMapConfig, asientosReales: any[], eventoPrecio: number) => {
    if (!config.rows || config.rows.length === 0) { console.warn('seatMapConfig sin rows'); return }
    const asientosMap = new Map<string, any>()
    asientosReales.forEach(a => asientosMap.set(`${a.fila}-${a.numero}`, a))
    const generatedSeats: Seat[] = []
    const sortedRows = [...config.rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    sortedRows.forEach(row => {
      for (let i = 0; i < row.seats; i++) {
        const sp = config.specialSeats?.find(s => s.rowId === row.id && s.seatIndex === i)
        const sector = config.sectors?.find(s => s.id === row.sectorId)
        const price = sp?.price ?? sector?.price ?? eventoPrecio
        const color = sp?.color || sector?.color || '#10B981'
        const sectorName = sp?.sectorName || sector?.name || 'General'
        const sectorId = sector?.id
        const asientoReal = asientosMap.get(`${row.name}-${i + 1}`)
        let status: 'DISPONIBLE' | 'RESERVANDO' | 'EN_PROCESO' | 'VENDIDO' | 'BLOQUEADO' = 'DISPONIBLE'
        if (asientoReal) {
          const estado = asientoReal.estado
          if (estado === 'VENDIDO') status = 'VENDIDO'
          else if (estado === 'BLOQUEADO') status = 'BLOQUEADO'
          else if (estado === 'RESERVANDO') status = 'RESERVANDO'
          else if (estado === 'EN_PROCESO') status = 'EN_PROCESO'
          else status = 'DISPONIBLE'
        }
        const seatId = asientoReal?.id || `temp-${row.name}-${i + 1}`
        generatedSeats.push({ id: seatId, row: row.name, number: i + 1, status, price, sectorId, sectorName, color })
      }
    })
    setSeats(generatedSeats)
  }

  // ── Cargar evento ──
  useEffect(() => {
    if (!eventId) return
    const loadEventData = async () => {
      try {
        setLoading(true); setSeats([])
        const response = await api.get(`/eventos/${eventId}`)
        const event = response.data.data
        const eventoPrecio: number = event.precio || 0
        setEventData({ id: event.id, title: event.titulo || event.title || 'Evento', precio: event.precio || 0, seatMapConfig: event.seatMapConfig })
        if (!event.seatMapConfig) { setDemoMode(true); setLoading(false); return }
        setSeatMapConfig(event.seatMapConfig)
        let asientosReales: any[] = []
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3000)
          const asientosResponse = await api.get(`/asientos/evento/${eventId}`, { signal: controller.signal })
          clearTimeout(timeout)
          asientosReales = asientosResponse.data.data || []
        } catch (err: any) {
          if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.warn('Error asientos:', err)
          asientosReales = event.asientos || []
        }
        generateSeatsFromConfig(event.seatMapConfig, asientosReales, eventoPrecio)
      } catch (error) {
        console.error('Error cargando evento:', error)
        setDemoMode(true)
      } finally {
        setLoading(false)
      }
    }
    loadEventData()
  }, [eventId])

  // ── Socket ──
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    try {
      socketService.connect()
      socketService.joinEvent(eventId)
      socketService.onConnected(() => { })
      socketService.onConnectError(() => setDemoMode(true))

      // Actualizar asientos en tiempo real con los nuevos estados
      socketService.onSeatReserved((data: any) => {
        // El backend envía asientosIds: array de IDs
        const ids = data.asientosIds || []
        console.log('🔄 Socket: asientos reservados', ids, data.estado)
        setSeats(prev => prev.map(s =>
          ids.includes(s.id) ? { ...s, status: data.estado || 'RESERVANDO' } : s
        ))
      })

      // Actualizar asientos cuando se libera una reserva
      socketService.onSeatReleased((data: any) => {
        const ids = data.asientosIds || []
        console.log('🔄 Socket: asientos liberados', ids)
        setSeats(prev => prev.map(s =>
          ids.includes(s.id) ? { ...s, status: 'DISPONIBLE' } : s
        ))
      })

      timeoutId = setTimeout(() => { if (!socketService.isConnected()) setDemoMode(true) }, 3000)
    } catch { setDemoMode(true) }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      // NO liberar asientos automáticamente al navegar al checkout
      // Los asientos se liberan manualmente al cancelar o expirar el tiempo
      // Solo liberar si el timer expiró (no hay reserva activa)
      if (!reservaId && selectedSeats.length > 0) {
        liberarAsientos()
      }
      try { socketService.disconnect() } catch {}
    }
  }, [eventId])

  // ── Toggle asiento ──
  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status !== 'DISPONIBLE' && seat.status !== 'RESERVANDO' && seat.status !== 'EN_PROCESO') return
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id)
      if (isSelected) return prev.filter(s => s.id !== seat.id)
      if (prev.length >= 10) { alert('Máximo 10 asientos por persona'); return prev }
      return [...prev, seat]
    })
  }, [selectedSeats, eventId, user])

  // ── Proceder a checkout con nueva API de reservación ──
  const proceedToCheckout = async () => {
    if (selectedSeats.length === 0) { alert('Por favor selecciona al menos un asiento'); return }
    if (!user) {
      navigate('/login', { state: { redirectTo: `/eventos/${id}/asientos`, eventData: { eventId, selectedSeats: selectedSeats.map(s => s.id) } } })
      return
    }

    setIsReserving(true)
    try {
      // Usar la nueva API de reservación múltiple con Redis locks
      const reservationData = {
        eventoId: eventId,
        asientosIds: selectedSeats.map(seat => seat.id)
      }

      const response = await seatReservationService.reservarAsientos(reservationData)

      if (response.ok) {
        // Generar un reservaId usando los IDs de asientos
        const reservaId = response.data.map(s => s.id).join('-')

        setReservaId(reservaId)
        setTimerPhase('RESERVACION')
        setTimeLeft(180) // 3 minutos para completar el pago (según backend)

        // Actualizar los asientos seleccionados con los datos reales del backend
        const updatedSeats = selectedSeats.map(originalSeat => {
          const realSeat = response.data.find(s =>
            s.fila === originalSeat.row && s.numero === originalSeat.number
          )
          return realSeat ? { ...originalSeat, id: realSeat.id } : originalSeat
        })
        setSelectedSeats(updatedSeats)

        // Navegar al checkout con los nuevos datos
        console.log('📋 Navegando al Checkout con:', { eventId, reservaId, seats: updatedSeats })
        navigate('/checkout', {
          state: {
            eventId,
            reservaId,
            seats: updatedSeats
          }
        })
      } else {
        alert(response.error || 'Error al reservar los asientos. Por favor intenta nuevamente.')
      }
    } catch (error: any) {
      console.error('Error al reservar asientos:', error)
      alert(error.message || 'Error al reservar los asientos. Por favor intenta nuevamente.')
    } finally {
      setIsReserving(false)
    }
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)

  // Función para liberar asientos correctamente
  const liberarAsientos = async () => {
    if (!eventId || selectedSeats.length === 0) return

    try {
      await api.post('/asientos/liberar-varios', {
        asientosIds: selectedSeats.map(s => s.id),
        eventoId: eventId
      })
      console.log('✅ Asientos liberados')
    } catch (error) {
      console.error('⚠️ Error liberando asientos:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando asientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-primary text-white py-3">
        <div className="w-full px-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors text-sm">
              <ArrowLeft size={18} className="mr-1" /> Volver
            </button>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Clock size={14} className={timeLeft < 60 ? 'text-red-300' : 'text-yellow-300'} />
              <div className="text-right">
                <p className="text-xs text-white/80 leading-tight">Tiempo restante</p>
                <p className={`text-sm font-bold leading-tight ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Selecciona tus asientos</h1>
              <p className="text-white/80">Evento: {eventData?.title || 'Cargando...'}</p>
            </div>
            {demoMode && (
              <div className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg">
                <Wifi size={20} /><span className="text-sm font-semibold">MODO DEMO</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-0 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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
                  size="lg"
                  onClick={proceedToCheckout}
                  disabled={selectedSeats.length === 0 || isReserving}
                  className="w-full"
                >
                  {isReserving ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Reservando asientos...
                    </div>
                  ) : (
                    'Continuar al pago'
                  )}
                </Button>
                <div className="text-center text-sm text-gray-500 mt-3">
                  <p>Tienes 10 minutos para completar tu compra después de reservar</p>
                </div>
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

          {/* Mapa de asientos */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4 sm:p-6">

                {/* Escenario */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6">
                  <p className="text-xl sm:text-2xl font-bold text-primary mb-2">ESCENARIO</p>
                  <div className="w-full h-2 bg-primary/30 rounded-full" />
                </div>

                {/* Leyenda sectores */}
                {seatMapConfig?.sectors && seatMapConfig.sectors.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Sectores:</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                      {seatMapConfig.sectors.map(sector => (
                        <div key={sector.id} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: sector.color, borderColor: sector.color }} />
                          <span className="text-xs sm:text-sm font-medium">{sector.name}</span>
                          <span className="text-xs text-gray-500">Bs {sector.price}</span>
                        </div>
                      ))}
                      {seatMapConfig.specialSeats && seatMapConfig.specialSeats.length > 0 && (() => {
                        const uniqueSectors = new Map<string, any>()
                        seatMapConfig.specialSeats!.forEach((seat: SpecialSeat) => {
                          if (seat.sectorName && !uniqueSectors.has(seat.sectorName))
                            uniqueSectors.set(seat.sectorName, { name: seat.sectorName, color: seat.color, price: seat.price })
                        })
                        return Array.from(uniqueSectors.values()).map(cs => (
                          <div key={cs.name} className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: cs.color, borderColor: cs.color }} />
                            <span className="text-xs sm:text-sm font-medium">{cs.name}</span>
                            <span className="text-xs text-gray-500">Bs {cs.price}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}

                {/* Leyenda estados */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Estados:</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-green-500 rounded" />
                      <span className="text-xs sm:text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-purple-500 rounded" />
                      <span className="text-xs sm:text-sm">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-red-500 rounded" />
                      <span className="text-xs sm:text-sm">Ocupado</span>
                    </div>
                  </div>
                </div>

                {/* Grid de asientos — auto-escalado, sin overflow-x */}
                {seatMapConfig?.rows && seatMapConfig.rows.length > 0 && seats.length > 0 ? (
                  <SeatGrid
                    seatMapConfig={seatMapConfig}
                    seats={seats}
                    selectedSeats={selectedSeats}
                    onToggle={toggleSeat}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {seatMapConfig?.rows && seatMapConfig.rows.length > 0 && seats.length === 0 ? (
                      <div>
                        <p className="font-medium">Error al cargar los asientos.</p>
                        <p className="text-sm mt-1">Por favor recarga la página.</p>
                        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">
                          Recargar
                        </button>
                      </div>
                    ) : (
                      <p>No hay configuración de asientos disponible para este evento.</p>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}