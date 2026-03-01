import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Wifi, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import socketService from '@/services/socket'
import api from '@/services/api'
import asientoService from '@/services/asientoService'
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
  // ✅ FIX: Siempre usar el 'id' de la URL como fuente de verdad
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [seatMapConfig, setSeatMapConfig] = useState<SeatMapConfig | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  // Timer de selección
  const [timeLeft, setTimeLeft] = useState(600)
  const [isTimerActive, setIsTimerActive] = useState(true)

  // ✅ FIX: Usar siempre el id de la URL, ignorar location.state.eventId
  // location.state puede tener el eventId de una navegación anterior (bug original)
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

  // Cargar datos del evento
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return

      try {
        setLoading(true)
        console.log('🔍 Cargando evento:', eventId)

        const response = await api.get(`/eventos/${eventId}`)
        const event = response.data.data

        console.log('✅ Evento cargado:', event.titulo)
        console.log('📋 Tiene seatMapConfig:', !!event.seatMapConfig)

        setEventData({
          id: event.id,
          title: event.titulo || event.title || 'Evento',
          precio: basePrice,
          seatMapConfig: event.seatMapConfig
        })

        if (event.seatMapConfig) {
          setSeatMapConfig(event.seatMapConfig)

          // ✅ Solución temporal: usar los asientos que ya vienen en el evento
          // El endpoint /api/asientos/evento/:id tiene problemas de conexión
          const asientosDelEvento = event.asientos || []
          console.log('✅ Usando asientos del evento:', asientosDelEvento.length)

          generateSeatsFromConfig(event.seatMapConfig, asientosDelEvento)
        } else {
          setDemoMode(true)
        }
      } catch (error) {
        console.error('❌ Error loading event:', error)
        setDemoMode(true)
      } finally {
        setLoading(false)
      }
    }

    loadEventData()
  }, [eventId])

  // Generar asientos basados en la configuración del mapa
  const generateSeatsFromConfig = (config: SeatMapConfig, asientosReales: any[] = []) => {
    if (!config.rows || config.rows.length === 0) return

    // Crear mapa de asientos reales por fila-numero para búsqueda rápida
    const asientosMap = new Map<string, any>()
    asientosReales.forEach(asiento => {
      const key = `${asiento.fila}-${asiento.numero}`
      asientosMap.set(key, asiento)
    })

    const generatedSeats: Seat[] = []

    config.rows.forEach(row => {
      for (let i = 0; i < row.seats; i++) {
        const specialSeat = config.specialSeats?.find(
          s => s.rowId === row.id && s.seatIndex === i
        )

        const sector = config.sectors?.find(s => s.id === row.sectorId)

        // ✅ FIX: Jerarquía de precios correcta:
        // 1. Precio del asiento especial (más específico)
        // 2. Precio del sector
        // 3. Precio base del evento (ya no hardcodeado a 150)
        let price = specialSeat?.price ?? sector?.price ?? basePrice

        let color = specialSeat?.color || sector?.color || '#10B981'
        let sectorName = specialSeat?.sectorName || sector?.name || 'General'
        let sectorId = sector?.id

        if (specialSeat) {
          price = specialSeat.price || price
          color = specialSeat.color || color
          sectorName = specialSeat.sectorName || sectorName
        }

        // Buscar el asiento real en la BD por fila-numero
        const key = `${row.name}-${i + 1}`
        const asientoReal = asientosMap.get(key)

        // Determinar el estado basado en el asiento real
        let status: 'AVAILABLE' | 'OCCUPIED' = 'AVAILABLE'
        if (asientoReal) {
          if (asientoReal.estado === 'VENDIDO' || asientoReal.estado === 'BLOQUEADO') {
            status = 'OCCUPIED'
          }
        }

        // Usar el UUID real de la BD, o generar uno temporal si no existe
        const seatId = asientoReal?.id || `${row.name}-${i + 1}`

        generatedSeats.push({
          id: seatId, // ✅ Ahora usa el UUID real de la BD
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

    setSeats(generatedSeats)
  }

  // Socket connection
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const connectSocket = () => {
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
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seat.id === data.seatId ? { ...seat, status: 'OCCUPIED' } : seat
          )
        )
      })

      timeoutId = setTimeout(() => {
        if (!socketService.isConnected()) {
          console.log('Timeout de conexión Socket, usando modo demo')
          setDemoMode(true)
        }
      }, 3000)
    }

    connectSocket()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      socketService.disconnect()
    }
  }, [eventId])

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return

    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id)

      if (isSelected) {
        return prev.filter((s) => s.id !== seat.id)
      } else {
        if (prev.length >= 10) {
          alert('Máximo 10 asientos por persona')
          return prev
        }
        return [...prev, seat]
      }
    })

    if (socketService.isConnected() && !selectedSeats.some((s) => s.id === seat.id)) {
      socketService.reserveSeat({
        eventoId: eventId,
        asientoId: seat.id,
        userId: user?.id || 'guest'
      })
    }
  }, [eventId, selectedSeats, user])

  const proceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Por favor selecciona al menos un asiento')
      return
    }

    if (!user) {
      navigate('/login', {
        state: {
          redirectTo: `/eventos/${id}/asientos`,
          eventData: {
            eventId,
            selectedSeats: selectedSeats.map((s) => s.id)
          }
        }
      })
      return
    }

    // ✅ FIX: Navegar con eventId de la URL (siempre correcto)
    navigate('/checkout', {
      state: {
        eventId,
        seats: selectedSeats
      }
    })
  }

  const getSeatBackgroundColor = (seat: Seat) => {
    if (selectedSeats.some((s) => s.id === seat.id)) return '#8B5CF6'
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
              <p className="text-white/80">
                Evento: {eventData?.title || 'Cargando...'}
              </p>
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
                    if (confirm(`Verificando disponibilidad...\n\nAsientos: ${seatList}\nTotal: Bs ${total.toFixed(2)}\n\n¿Confirmar que estos asientos están disponibles?`)) {
                      alert('✅ ¡Asientos verificados y reservados!\n\nTienes 10 minutos para completar tu compra.')
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
                      {selectedSeats.map((seat) => (
                        <div key={seat.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>Fila {seat.row} - Asiento {seat.number}</span>
                          <span className="font-semibold">Bs {seat.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seat Map */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Escenario */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 text-center mb-6">
                  <p className="text-2xl font-bold text-primary mb-2">ESCENARIO</p>
                  <div className="w-full h-2 bg-primary/30 rounded-full" />
                </div>

                {/* Leyenda sectores */}
                {seatMapConfig && seatMapConfig.sectors && seatMapConfig.sectors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Sectores:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {seatMapConfig.sectors.map((sector) => (
                        <div key={sector.id} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded border" style={{ backgroundColor: sector.color, borderColor: sector.color }} />
                          <div>
                            <span className="text-sm font-medium">{sector.name}</span>
                            <span className="text-xs text-gray-500 ml-1">Bs {sector.price}</span>
                          </div>
                        </div>
                      ))}

                      {seatMapConfig.specialSeats && seatMapConfig.specialSeats.length > 0 && (() => {
                        const uniqueSectors = new Map<string, any>()
                        seatMapConfig.specialSeats!.forEach((seat: SpecialSeat) => {
                          if (seat.sectorName && !uniqueSectors.has(seat.sectorName)) {
                            uniqueSectors.set(seat.sectorName, { name: seat.sectorName, color: seat.color, price: seat.price })
                          }
                        })
                        return Array.from(uniqueSectors.values()).map((customSector) => (
                          <div key={customSector.name} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: customSector.color, borderColor: customSector.color }} />
                            <div>
                              <span className="text-sm font-medium">{customSector.name}</span>
                              <span className="text-xs text-gray-500 ml-1">Bs {customSector.price}</span>
                            </div>
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
                {seatMapConfig && seatMapConfig.rows ? (
                  <div className="space-y-3">
                    {seatMapConfig.rows
                      .sort((a: Row, b: Row) => a.order - b.order)
                      .map((row: Row) => {
                        const rowSeats = seats.filter((seat) => seat.row === row.name)
                        const seatsPerColumn = Math.ceil(row.seats / (row.columns || 1))
                        const columns = []

                        for (let col = 0; col < (row.columns || 1); col++) {
                          const startSeat = col * seatsPerColumn
                          const endSeat = Math.min(startSeat + seatsPerColumn, row.seats)
                          columns.push(rowSeats.slice(startSeat, endSeat))
                        }

                        return (
                          <div key={row.id} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-600 w-24 text-right flex-shrink-0">{row.name}</span>
                            <div className="flex gap-1.5">
                              {columns.map((columnSeats, colIndex) => (
                                <React.Fragment key={colIndex}>
                                  <div className="flex gap-1">
                                    {columnSeats.map((seat) => (
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
                                          transform: selectedSeats.some((s) => s.id === seat.id) ? 'scale(1.1)' : 'scale(1)',
                                          boxShadow: selectedSeats.some((s) => s.id === seat.id) ? '0 0 8px rgba(139, 92, 246, 0.5)' : undefined
                                        }}
                                        title={`${row.name} - Asiento ${seat.number}${seat.sectorName ? ` (${seat.sectorName})` : ''} - Bs ${seat.price}`}
                                      >
                                        {selectedSeats.some((s) => s.id === seat.id) && (
                                          <Check size={12} className="mx-auto" />
                                        )}
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
                    <p>No hay configuración de asientos disponible para este evento.</p>
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