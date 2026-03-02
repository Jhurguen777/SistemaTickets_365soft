import React, { useState, useEffect } from 'react'
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

  const eventId = id!

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setSelectedSeats([])
          setIsTimerActive(false)
          alert('Tiempo de selección agotado. Por favor selecciona tus asientos nuevamente.')
          return 600
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerActive, timeLeft])

  // ── GENERAR ASIENTOS DESDE CONFIG ──────────────────────────────────
  const generateSeatsFromConfig = (
    config: SeatMapConfig,
    asientosReales: any[],
    eventoPrecio: number
  ) => {
    if (!config.rows || config.rows.length === 0) {
      console.warn('⚠️ seatMapConfig no tiene rows')
      return
    }

    const asientosMap = new Map<string, any>()
    asientosReales.forEach(a => {
      asientosMap.set(`${a.fila}-${a.numero}`, a)
    })

    const generatedSeats: Seat[] = []
    const sortedRows = [...config.rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    sortedRows.forEach(row => {
      for (let i = 0; i < row.seats; i++) {
        const specialSeat = config.specialSeats?.find(
          s => s.rowId === row.id && s.seatIndex === i
        )
        const sector = config.sectors?.find(s => s.id === row.sectorId)

        const price = specialSeat?.price ?? sector?.price ?? eventoPrecio
        const color = specialSeat?.color || sector?.color || '#10B981'
        const sectorName = specialSeat?.sectorName || sector?.name || 'General'
        const sectorId = sector?.id

        const asientoReal = asientosMap.get(`${row.name}-${i + 1}`)

        let status: 'AVAILABLE' | 'OCCUPIED' = 'AVAILABLE'
        if (asientoReal) {
          const estado = asientoReal.estado
          if (estado === 'VENDIDO' || estado === 'BLOQUEADO' || estado === 'RESERVANDO') {
            status = 'OCCUPIED'
          }
        }

        const seatId = asientoReal?.id || `temp-${row.name}-${i + 1}`

        generatedSeats.push({
          id: seatId,
          row: row.name,
          number: i + 1,
          status,
          price,
          sectorId,
          sectorName,
          color
        })
      }
    })

    console.log(`✅ ${generatedSeats.length} asientos generados`)
    setSeats(generatedSeats)
  }

  // ── CARGAR EVENTO Y ASIENTOS ────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return

    const loadEventData = async () => {
      try {
        setLoading(true)
        setSeats([])

        const response = await api.get(`/eventos/${eventId}`)
        const event = response.data.data
        const eventoPrecio: number = event.precio || 0

        setEventData({
          id: event.id,
          title: event.titulo || event.title || 'Evento',
          precio: eventoPrecio,
          seatMapConfig: event.seatMapConfig
        })

        if (!event.seatMapConfig) {
          setDemoMode(true)
          setLoading(false)
          return
        }

        setSeatMapConfig(event.seatMapConfig)

        // ✅ Timeout 5s — nunca se queda colgado esperando asientos
        let asientosReales: any[] = []
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3000)
          const asientosResponse = await api.get(`/asientos/evento/${eventId}`, {
            signal: controller.signal
          })
          clearTimeout(timeout)
          asientosReales = asientosResponse.data.data || []
        } catch (err: any) {
          if (err.name === 'CanceledError' || err.name === 'AbortError') {
            console.warn('⚠️ Timeout asientos, usando fallback del evento')
          }
          asientosReales = event.asientos || []
        }

        generateSeatsFromConfig(event.seatMapConfig, asientosReales, eventoPrecio)

      } catch (error) {
        console.error('❌ Error cargando evento:', error)
        setDemoMode(true)
      } finally {
        // ✅ SIEMPRE se ejecuta — nunca queda en loading infinito
        setLoading(false)
      }
    }

    loadEventData()
  }, [eventId])

  // ── SOCKET ──────────────────────────────────────────────────────────
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    try {
      socketService.connect()

      socketService.onConnected(() => {
        console.log('Socket conectado')
        socketService.joinEvent(eventId)
      })

      socketService.onConnectError(() => {
        console.log('Socket no disponible, modo demo')
        setDemoMode(true)
      })

      socketService.onSeatReserved((data) => {
        setSeats(prev =>
          prev.map(seat =>
            seat.id === data.seatId ? { ...seat, status: 'OCCUPIED' } : seat
          )
        )
      })

      timeoutId = setTimeout(() => {
        if (!socketService.isConnected()) {
          setDemoMode(true)
        }
      }, 3000)

    } catch {
      setDemoMode(true)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      try { socketService.disconnect() } catch {}
    }
  }, [eventId])

  // ── TOGGLE ASIENTO ──────────────────────────────────────────────────
  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id)
      if (isSelected) return prev.filter(s => s.id !== seat.id)
      if (prev.length >= 10) {
        alert('Máximo 10 asientos por persona')
        return prev
      }
      return [...prev, seat]
    })

    if (socketService.isConnected() && !selectedSeats.some(s => s.id === seat.id)) {
      socketService.reserveSeat({
        eventoId: eventId,
        asientoId: seat.id,
        userId: user?.id || 'guest'
      })
    }
  }

  const proceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Por favor selecciona al menos un asiento')
      return
    }

    if (!user) {
      navigate('/login', {
        state: {
          redirectTo: `/eventos/${id}/asientos`,
          eventData: { eventId, selectedSeats: selectedSeats.map(s => s.id) }
        }
      })
      return
    }

    navigate('/checkout', {
      state: { eventId, seats: selectedSeats }
    })
  }

  const getSeatBackgroundColor = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return '#8B5CF6'
    if (seat.status === 'OCCUPIED') return '#EF4444'
    return seat.color || '#10B981'
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)

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
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors text-sm"
            >
              <ArrowLeft size={18} className="mr-1" />
              Volver
            </button>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Clock size={14} className={timeLeft < 60 ? 'text-red-300' : 'text-yellow-300'} />
              <div className="text-right">
                <p className="text-xs text-white/80 leading-tight">Tiempo restante</p>
                <p className={`text-sm font-bold leading-tight ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </p>
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
                <Wifi size={20} />
                <span className="text-sm font-semibold">MODO DEMO</span>
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
                      <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                        {formatTime(timeLeft)}
                      </p>
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
                    if (selectedSeats.length === 0) {
                      alert('Por favor selecciona al menos un asiento')
                      return
                    }
                    const seatList = selectedSeats.map(s => `${s.row}${s.number}`).join(', ')
                    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)
                    if (confirm(`Verificando disponibilidad...\n\nAsientos: ${seatList}\nTotal: Bs ${total.toFixed(2)}\n\n¿Confirmar disponibilidad?`)) {
                      alert('✅ ¡Asientos verificados!\n\nTienes 10 minutos para completar tu compra.')
                    }
                  }}
                  disabled={selectedSeats.length === 0}
                  className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                >
                  Verificar Disponibilidad
                </Button>

                <Button size="lg" onClick={proceedToCheckout} disabled={selectedSeats.length === 0} className="w-full">
                  Continuar al pago
                </Button>

                <div className="text-center text-sm text-gray-500 mt-3">
                  <p>Tienes 10 minutos para completar tu compra</p>
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
              <CardContent className="p-6">
                {/* Escenario */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 text-center mb-6">
                  <p className="text-2xl font-bold text-primary mb-2">ESCENARIO</p>
                  <div className="w-full h-2 bg-primary/30 rounded-full" />
                </div>

                {/* Leyenda sectores */}
                {seatMapConfig?.sectors && seatMapConfig.sectors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Sectores:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {seatMapConfig.sectors.map(sector => (
                        <div key={sector.id} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded border" style={{ backgroundColor: sector.color, borderColor: sector.color }} />
                          <span className="text-sm font-medium">{sector.name}</span>
                          <span className="text-xs text-gray-500">Bs {sector.price}</span>
                        </div>
                      ))}
                      {seatMapConfig.specialSeats && seatMapConfig.specialSeats.length > 0 && (() => {
                        const uniqueSectors = new Map<string, any>()
                        seatMapConfig.specialSeats!.forEach((seat: SpecialSeat) => {
                          if (seat.sectorName && !uniqueSectors.has(seat.sectorName)) {
                            uniqueSectors.set(seat.sectorName, { name: seat.sectorName, color: seat.color, price: seat.price })
                          }
                        })
                        return Array.from(uniqueSectors.values()).map(cs => (
                          <div key={cs.name} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: cs.color, borderColor: cs.color }} />
                            <span className="text-sm font-medium">{cs.name}</span>
                            <span className="text-xs text-gray-500">Bs {cs.price}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}

                {/* Leyenda estados */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Estados:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded" />
                      <span className="text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-purple-500 rounded" />
                      <span className="text-sm">Seleccionado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded" />
                      <span className="text-sm">Ocupado</span>
                    </div>
                  </div>
                </div>

                {/* Grid de asientos */}
                {seatMapConfig?.rows && seatMapConfig.rows.length > 0 && seats.length > 0 ? (
                  <div className="space-y-3 overflow-x-auto">
                    {[...seatMapConfig.rows]
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((row: Row) => {
                        const rowSeats = seats.filter(seat => seat.row === row.name)
                        const seatsPerColumn = Math.ceil(row.seats / (row.columns || 1))
                        const columns: Seat[][] = []

                        for (let col = 0; col < (row.columns || 1); col++) {
                          const start = col * seatsPerColumn
                          const end = Math.min(start + seatsPerColumn, rowSeats.length)
                          columns.push(rowSeats.slice(start, end))
                        }

                        return (
                          <div key={row.id} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-600 w-24 text-right flex-shrink-0">
                              {row.name}
                            </span>
                            <div className="flex gap-1.5">
                              {columns.map((columnSeats, colIndex) => (
                                <React.Fragment key={colIndex}>
                                  <div className="flex gap-1">
                                    {columnSeats.map(seat => (
                                      <button
                                        key={seat.id}
                                        onClick={() => toggleSeat(seat)}
                                        disabled={seat.status !== 'AVAILABLE'}
                                        className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium border transition-all"
                                        style={{
                                          backgroundColor: getSeatBackgroundColor(seat),
                                          borderColor: getSeatBackgroundColor(seat),
                                          color: '#FFFFFF',
                                          opacity: seat.status === 'OCCUPIED' ? 0.5 : 1,
                                          cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                                          transform: selectedSeats.some(s => s.id === seat.id) ? 'scale(1.1)' : 'scale(1)',
                                          boxShadow: selectedSeats.some(s => s.id === seat.id) ? '0 0 8px rgba(139,92,246,0.5)' : undefined
                                        }}
                                        title={`${row.name} - Asiento ${seat.number} (${seat.sectorName}) - Bs ${seat.price}`}
                                      >
                                        {selectedSeats.some(s => s.id === seat.id)
                                          ? <Check size={12} className="mx-auto" />
                                          : seat.number
                                        }
                                      </button>
                                    ))}
                                  </div>
                                  {colIndex < columns.length - 1 && columns.length > 1 && (
                                    <div className="w-8 flex items-center justify-center">
                                      <div className="w-0.5 h-4 bg-gray-300 rounded" />
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {seatMapConfig?.rows && seatMapConfig.rows.length > 0 && seats.length === 0 ? (
                      <div>
                        <p className="font-medium">Error al cargar los asientos.</p>
                        <p className="text-sm mt-1">Por favor recarga la página.</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm"
                        >
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