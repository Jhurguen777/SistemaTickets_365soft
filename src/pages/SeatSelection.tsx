import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Users, Check, Wifi } from 'lucide-react'
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
}

interface SeatSelectionState {
  state?: {
    eventId: string
    sectorId: string
  }
}

// Mapeo de sectores
const getSectorInfo = (sectorId: string) => {
  const sectors = {
    '1': { name: 'General', price: 150 },
    '2': { name: 'VIP', price: 350 },
    '3': { name: 'Super VIP', price: 500 }
  }
  return sectors[sectorId as keyof typeof sectors] || sectors['1']
}

const getAllSectors = () => {
  return [
    { id: '1', name: 'General', price: 150, available: 5000 },
    { id: '2', name: 'VIP', price: 350, available: 500 },
    { id: '3', name: 'Super VIP', price: 500, available: 200 }
  ]
}

// Generar asientos de demostración
// 3 columnas de 10 asientos = 30 asientos por fila
// 20 filas = 600 asientos totales
const generateMockSeats = (sectorId: string): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
  const seats: Seat[] = []
  const sectorInfo = getSectorInfo(sectorId)
  const seatsPerRow = 30 // 3 columnas de 10 asientos

  rows.forEach((row) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const random = Math.random()
      let status: 'AVAILABLE' | 'OCCUPIED' = 'AVAILABLE'

      if (random < 0.15) {
        status = 'OCCUPIED'
      }

      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status,
        price: sectorInfo.price
      })
    }
  })

  return seats
}

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation() as SeatSelectionState
  const { user } = useAuthStore()

  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [selectedSector, setSelectedSector] = useState('1')

  const eventId = location?.state?.eventId || id
  const sectorId = selectedSector
  const sectorInfo = getSectorInfo(sectorId)
  const allSectors = getAllSectors()

  // Load seats with demo fallback
  useEffect(() => {
    const loadSeats = async () => {
      try {
        setLoading(true)

        // Try API first
        try {
          const response = await api.get(`/events/${eventId}/sectors/${sectorId}/seats`)
          setSeats(response.data)
          setDemoMode(false)
        } catch (apiError) {
          console.log('API no disponible, usando modo demo')
          // Fall back to demo mode
          setDemoMode(true)
          setSeats(generateMockSeats(sectorId))
        }
      } catch (error) {
        console.error('Error loading seats:', error)
        setDemoMode(true)
        setSeats(generateMockSeats(sectorId))
      } finally {
        setLoading(false)
      }
    }

    if (eventId && sectorId) {
      loadSeats()
    }
  }, [eventId, sectorId])

  // Recargar asientos cuando cambia el sector
  useEffect(() => {
    const loadSeats = async () => {
      try {
        setLoading(true)
        setSeats(generateMockSeats(sectorId))
      } catch (error) {
        console.error('Error loading seats:', error)
        setSeats(generateMockSeats(sectorId))
      } finally {
        setLoading(false)
      }
    }

    loadSeats()
  }, [sectorId])

  // Socket connection (optional, doesn't block UI)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const connectSocket = () => {
      socketService.connect()

      socketService.onConnected(() => {
        console.log('Socket conectado')
        socketService.joinEvent(eventId!)
      })

      socketService.onConnectError(() => {
        console.log('Socket no disponible, modo demo')
        setDemoMode(true)
      })

      socketService.onSeatReserved((data) => {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            seat.id === data.seatId
              ? { ...seat, status: 'OCCUPIED' }
              : seat
          )
        )
      })

      // Timeout: if not connected in 3 seconds, continue without socket
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

    // Reserve seat via WebSocket (if connected)
    if (socketService.isConnected() && !selectedSeats.some((s) => s.id === seat.id)) {
      socketService.reserveSeat({
        eventoId: eventId!,
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
            sectorId,
            selectedSeats: selectedSeats.map((s) => s.id)
          }
        }
      })
      return
    }

    navigate('/checkout', {
      state: {
        eventId,
        sectorId,
        seats: selectedSeats
      }
    })
  }

  const getSeatStatusColor = (seat: Seat) => {
    if (selectedSeats.some((s) => s.id === seat.id)) {
      return 'bg-purple-500 hover:bg-purple-600 text-white'
    }
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
      case 'OCCUPIED':
        return 'bg-red-500 cursor-not-allowed'
      default:
        return 'bg-gray-400 cursor-not-allowed'
    }
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
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-white/80 hover:text-white mb-4 font-semibold transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Selecciona tus asientos</h1>
              <p className="text-white/80">
                Evento: Vibra Carnavalera 2026 - Sector {sectorInfo.name}
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stage and Seats */}
          <div className="lg:col-span-2">
            {/* Stage */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 text-center mb-8">
                  <p className="text-2xl font-bold text-primary mb-2">ESCENARIO</p>
                  <div className="w-full h-2 bg-primary/30 rounded-full" />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded" />
                    <span className="text-sm">Disponible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded" />
                    <span className="text-sm">Seleccionado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded" />
                    <span className="text-sm">Comprado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-400 rounded" />
                    <span className="text-sm">No disponible</span>
                  </div>
                </div>

                {/* Seats Grid - 3 columnas de 10 asientos */}
                <div className="space-y-4">
                  {/* Encabezados de columna (solo una vez) */}
                  <div className="flex items-center gap-3 px-3">
                    <div className="flex-shrink-0 w-20"></div>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="border-b-2 border-gray-300 pb-2 mb-2">
                          <p className="text-sm font-bold text-gray-700">Columna 1</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-b-2 border-gray-300 pb-2 mb-2">
                          <p className="text-sm font-bold text-gray-700">Columna 2</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-b-2 border-gray-300 pb-2 mb-2">
                          <p className="text-sm font-bold text-gray-700">Columna 3</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {Array.from(new Set(seats.map((s) => s.row))).sort().map((row) => {
                    const rowSeats = seats
                      .filter((seat) => seat.row === row)
                      .sort((a, b) => a.number - b.number)

                    // Dividir en 3 columnas de 10 asientos
                    const column1 = rowSeats.slice(0, 10)
                    const column2 = rowSeats.slice(10, 20)
                    const column3 = rowSeats.slice(20, 30)

                    return (
                      <div key={row} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          {/* Etiqueta de fila a la IZQUIERDA, centrada verticalmente */}
                          <div className="flex-shrink-0">
                            <span className="inline-block bg-primary text-white px-3 py-1 rounded-lg font-bold text-sm">
                              Fila {row}
                            </span>
                          </div>

                          {/* 3 Columnas de asientos */}
                          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Columna 1 */}
                            <div className="border-l-2 border-gray-200 pl-2">
                              <div className="flex flex-row gap-2 justify-center">
                                {column1.map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => toggleSeat(seat)}
                                    disabled={seat.status !== 'AVAILABLE'}
                                    className={`w-9 h-9 rounded text-sm font-semibold transition-all shadow-sm ${
                                      seat.status !== 'AVAILABLE' ? 'cursor-not-allowed' : 'hover:scale-110 hover:shadow-md'
                                    } ${getSeatStatusColor(seat)}`}
                                  >
                                    {selectedSeats.some((s) => s.id === seat.id) && (
                                      <Check size={12} className="mx-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Columna 2 */}
                            <div className="border-l-2 border-gray-200 pl-2">
                              <div className="flex flex-row gap-2 justify-center">
                                {column2.map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => toggleSeat(seat)}
                                    disabled={seat.status !== 'AVAILABLE'}
                                    className={`w-9 h-9 rounded text-sm font-semibold transition-all shadow-sm ${
                                      seat.status !== 'AVAILABLE' ? 'cursor-not-allowed' : 'hover:scale-110 hover:shadow-md'
                                    } ${getSeatStatusColor(seat)}`}
                                  >
                                    {selectedSeats.some((s) => s.id === seat.id) && (
                                      <Check size={12} className="mx-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Columna 3 */}
                            <div className="border-l-2 border-gray-200 pl-2">
                              <div className="flex flex-row gap-2 justify-center">
                                {column3.map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => toggleSeat(seat)}
                                    disabled={seat.status !== 'AVAILABLE'}
                                    className={`w-9 h-9 rounded text-sm font-semibold transition-all shadow-sm ${
                                      seat.status !== 'AVAILABLE' ? 'cursor-not-allowed' : 'hover:scale-110 hover:shadow-md'
                                    } ${getSeatStatusColor(seat)}`}
                                  >
                                    {selectedSeats.some((s) => s.id === seat.id) && (
                                      <Check size={12} className="mx-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {selectedSeats.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="text-primary" size={24} />
                      <div>
                        <p className="font-semibold">Asientos seleccionados</p>
                        <p className="text-sm text-gray-600">
                          {selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        Bs {totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sector Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Comprar entradas</h3>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-3">
                    Selecciona tu sector
                  </label>
                  <div className="space-y-2">
                    {allSectors.map((sectorOption) => (
                      <label
                        key={sectorOption.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSector === sectorOption.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex-1">
                          <input
                            type="radio"
                            name="sector"
                            value={sectorOption.id}
                            checked={selectedSector === sectorOption.id}
                            onChange={(e) => {
                              setSelectedSector(e.target.value)
                              setSelectedSeats([])
                            }}
                            className="sr-only"
                          />
                          <div>
                            <p className="font-semibold">{sectorOption.name}</p>
                            <p className="text-sm text-gray-500">
                              {sectorOption.available} disponibles
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            Bs {sectorOption.price}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Summary */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Resumen de compra</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Sector</span>
                    <span className="font-semibold">{sectorInfo.name}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Asientos seleccionados</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>

                  <div className="flex justify-between items-center text-xl pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">
                      Bs {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={proceedToCheckout}
                    disabled={selectedSeats.length === 0}
                    className="w-full"
                  >
                    Continuar al pago
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    <p>Tienes 15 minutos para completar tu compra</p>
                  </div>
                </div>

                {/* Selected Seats List */}
                {selectedSeats.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Tus asientos:</h4>
                    <div className="space-y-2">
                      {selectedSeats.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex justify-between items-center text-sm bg-green-50 p-2 rounded"
                        >
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
        </div>
      </div>
    </div>
  )
}
