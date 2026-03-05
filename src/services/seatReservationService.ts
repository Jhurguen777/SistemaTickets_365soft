// Servicio para gestionar la reservación de asientos con Redis locks
import api from './api'

export interface SeatReservationRequest {
  asientosIds: string[]
  eventoId: string
}

export interface SeatReservationResponse {
  ok: boolean
  mensaje: string
  total: number
  data: Array<{
    id: string
    fila: string
    numero: number
    estado: string
    precio: number
    lockedByMe: boolean
    ttlSegundos: number
    eventoId: string
  }>
  error?: string
}

export const seatReservationService = {
  // Reservar múltiples asientos con lock en Redis
  reservarAsientos: async (data: SeatReservationRequest): Promise<SeatReservationResponse> => {
    try {
      console.log('🚀 Enviando solicitud de reserva:', data)
      const response = await api.post('/asientos/reservar-varios', data)
      console.log('✅ Respuesta de reserva:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error en reserva:', error.response?.data)
      throw new Error(error.response?.data?.mensaje || 'Error al reservar asientos')
    }
  },

  // Verificar estado de asientos
  verificarEstadoAsiento: async (eventoId: string, fila: string, numero: number) => {
    try {
      const response = await api.get(`/asientos/verificar-estado/${eventoId}/${fila}/${numero}`)
      return response.data
    } catch (error) {
      console.error('Error verificando asiento:', error)
      return null
    }
  },

  // Liberar reservación
  liberarReserva: async (reservaId: string) => {
    try {
      const response = await api.post('/asientos/liberar-reserva', { reservaId })
      return response.data
    } catch (error) {
      console.error('Error liberando reserva:', error)
      throw error
    }
  },
}
