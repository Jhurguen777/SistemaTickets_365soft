// Servicio para manejar asientos
import api from './api'

export interface Asiento {
  id: string
  fila: string
  numero: number
  precio: number
  estado: 'DISPONIBLE' | 'RESERVANDO' | 'VENDIDO' | 'BLOQUEADO'
}

interface AsientosResponse {
  ok: boolean
  total: number
  data: Asiento[]
}

/**
 * Obtener todos los asientos de un evento
 */
export const getAsientosEvento = async (eventoId: string): Promise<Asiento[]> => {
  const response = await api.get<AsientosResponse>(`/asientos/evento/${eventoId}`)
  return response.data.data
}

export default {
  getAsientosEvento
}
