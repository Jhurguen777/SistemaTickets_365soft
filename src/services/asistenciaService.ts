import api from './api'

export interface RegistrarAsistenciaManualParams {
  compraId: string
  adminId?: string
}

export interface VerificarQRParams {
  qrCode: string
  latitud?: number
  longitud?: number
  adminId?: string
}

export interface AsistenciaResponse {
  success: boolean
  message: string
  datosAsistente?: {
    id: string
    nombre: string
    apellido?: string
    email: string
    telefono?: string
    asiento: string
    sector: string
    asistenciaRegistrada: boolean
    fechaAsistencia?: string
  }
}

export interface Asistencia {
  id: string
  compraId: string
  usuarioId?: string
  ubicacionGPS?: { latitud: number; longitud: number }
  validadoPor?: string
  fechaCreacion: Date
}

export const asistenciaService = {
  /**
   * Registrar asistencia manualmente por ID de compra
   */
  registrarAsistenciaManual: async (params: RegistrarAsistenciaManualParams): Promise<AsistenciaResponse> => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await api.post('/asistencia/manual', params, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return {
        success: true,
        message: 'Asistencia registrada correctamente',
        datosAsistente: response.data.data?.datosAsistente
      }
    } catch (error: any) {
      console.error('Error registrando asistencia manual:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Error al registrar asistencia'
      }
    }
  },

  /**
   * Verificar QR de un asistente
   */
  verificarQR: async (params: VerificarQRParams): Promise<AsistenciaResponse> => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await api.post('/asistencia/verificar', params, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return {
        success: true,
        message: response.data.data.message,
        datosAsistente: response.data.data.datosAsistente
      }
    } catch (error: any) {
      console.error('Error verificando QR:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'QR no válido'
      }
    }
  },

  /**
   * Listar asistencias de un evento
   */
  listarPorEvento: async (eventoId: string): Promise<Asistencia[]> => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await api.get(`/asistencia/evento/${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return response.data.data.map((a: any) => ({
        id: a.id,
        compraId: a.compraId,
        usuarioId: a.usuarioId,
        ubicacionGPS: a.ubicacionGPS,
        validadoPor: a.validadoPor,
        fechaCreacion: new Date(a.fechaCreacion)
      }))
    } catch (error) {
      console.error('Error obteniendo asistencias del evento:', error)
      return []
    }
  },

  /**
   * Obtener estadísticas de asistencia de un evento
   */
  getEstadisticas: async (eventoId: string): Promise<{
    totalCompras: number
    asistieron: number
    pendientes: number
    porcentajeAsistencia: number
  }> => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await api.get(`/asistencia/evento/${eventoId}/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return response.data.data
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        totalCompras: 0,
        asistieron: 0,
        pendientes: 0,
        porcentajeAsistencia: 0
      }
    }
  }
}

export default asistenciaService
