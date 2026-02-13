// src/services/socket.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect() {
    if (!this.socket) {
      this.socket = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
        {
          transports: ['websocket', 'polling'],
          withCredentials: true,
        }
      )

      this.socket.on('connect', () => {
        console.log('✅ Conectado a Socket.IO')
      })

      this.socket.on('disconnect', () => {
        console.log('❌ Desconectado de Socket.IO')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.IO:', error)
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket() {
    return this.socket || this.connect()
  }

  // Connection callbacks
  onConnected(callback: () => void) {
    this.getSocket().on('connect', callback)
  }

  onDisconnected(callback: () => void) {
    this.getSocket().on('disconnect', callback)
  }

  onConnectError(callback: () => void) {
    this.getSocket().on('connect_error', callback)
  }

  // Eventos específicos
  joinEvent(eventId: string) {
    this.getSocket().emit('join_evento', eventId)
  }

  leaveEvent(eventId: string) {
    this.getSocket().emit('leave_evento', eventId)
  }

  reserveSeat(data: { eventoId: string; asientoId: string; userId: string }) {
    this.getSocket().emit('reservar_asiento', data)
  }

  onSeatsUpdate(callback: (data: any) => void) {
    this.getSocket().on('asientos_estado', callback)
  }

  onSeatReserved(callback: (data: any) => void) {
    this.getSocket().on('asiento_reservado', callback)
  }

  onSeatReleased(callback: (data: any) => void) {
    this.getSocket().on('asiento_liberado', callback)
  }

  onReservationSuccess(callback: (data: any) => void) {
    this.getSocket().on('reserva_exitosa', callback)
  }

  onReservationFailed(callback: (data: any) => void) {
    this.getSocket().on('reserva_fallida', callback)
  }

  // Remover listeners
  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.getSocket().off(event, callback)
    } else {
      this.getSocket().off(event)
    }
  }
}

export const socketService = new SocketService()
export default socketService
