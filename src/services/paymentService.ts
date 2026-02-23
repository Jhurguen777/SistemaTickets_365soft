// Servicio para manejar pagos QR con el backend

import api from './api'

export interface IniciarPagoRequest {
  asientoId: string
  eventoId: string
}

export interface IniciarPagoResponse {
  success: boolean
  message: string
  compra: {
    id: string
    usuarioId: string
    eventoId: string
    asientoId: string
    monto: number
    moneda: string
    estadoPago: string
    qrCode: string
    createdAt: string
  }
}

export interface VerificarPagoResponse {
  success: boolean
  message: string
  qr: {
    id: string
    alias: string
    estado: string
    monto: number
    moneda: string
    fechaVencimiento: string
    imagenQr?: string
    detalleGlosa: string
  }
  estadoTransaccion?: any
  pagoProcesado: boolean
}

/**
 * Iniciar proceso de pago QR
 * Crea la compra y genera el QR del banco
 */
export const iniciarPagoQR = async (params: IniciarPagoRequest): Promise<IniciarPagoResponse> => {
  const response = await api.post<IniciarPagoResponse>('/compras/iniciar-pago', params)
  return response.data
}

/**
 * Verificar estado de pago QR
 * Consulta al banco y actualiza el estado local
 */
export const verificarPagoQR = async (qrId: string): Promise<VerificarPagoResponse> => {
  const response = await api.get<VerificarPagoResponse>(`/compras/verificar-pago/${qrId}`)
  return response.data
}

/**
 * Obtener compras del usuario
 */
export const obtenerMisCompras = async (page: number = 1, limit: number = 10) => {
  const response = await api.get('/compras/mis-compras', {
    params: { page, limit }
  })
  return response.data
}

/**
 * Obtener detalle de compra
 */
export const obtenerDetalleCompra = async (compraId: string) => {
  const response = await api.get(`/compras/detalle/${compraId}`)
  return response.data
}

/**
 * Cancelar QR (si el usuario no pagó)
 */
export const cancelarQRPago = async (qrId: string) => {
  const response = await api.post(`/compras/cancelar-qr/${qrId}`)
  return response.data
}

export default {
  iniciarPagoQR,
  verificarPagoQR,
  obtenerMisCompras,
  obtenerDetalleCompra,
  cancelarQRPago
}
