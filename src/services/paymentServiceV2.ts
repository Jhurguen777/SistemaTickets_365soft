// Servicio actualizado para el nuevo sistema de pagos con QR y polling
import api from './api'

export interface PaymentInitRequest {
  eventoId: string
  asientosIds: string[]
  monto?: number
}

export interface PaymentInitResponse {
  success: boolean
  message: string
  compras?: Array<{
    id: string
    usuarioId: string
    eventoId: string
    asientoId: string
    monto: number
    moneda: string
    estadoPago: string
    qrCode: string
    qrPagoId: string
    createdAt: string
  }>
  qrPago?: {
    id: string
    alias: string
    estado: string
    monto: number
    moneda: string
    imagenQr: string
    fechaVencimiento: string
  }
  error?: string
}

export interface PaymentVerificationResponse {
  success: boolean
  estado: 'PENDIENTE' | 'PROCESANDO' | 'PAGADO' | 'FALLIDO' | 'EXPIRADO'
  pagoProcesado: boolean
  message: string
  datos?: {
    estado: 'PENDIENTE' | 'PROCESANDO' | 'PAGADO' | 'FALLIDO' | 'EXPIRADO'
    transaccionId?: string
    mensaje: string
    montoConfirmado?: number
  }
  qr?: {
    id: string
    alias: string
    estado: string
    monto: number
    moneda: string
  }
}

export interface PurchaseAttendee {
  nombre: string
  apellido: string
  email: string
  telefono: string
  documento: string
  oficina: string
  otraOficina: boolean
  otraOficinaNombre: string
  asientoId: string
}

export interface CreatePurchaseRequest {
  eventoId: string
  reservaId: string
  asistentes: PurchaseAttendee[]
  medioPago: string
}

export interface CreatePurchaseResponse {
  exito: boolean
  datos: {
    compraId: string
    numeroCompra: string
    asientos: Array<{
      id: string
      fila: string
      numero: number
      precio: number
    }>
    total: number
  }
  error?: string
}

export const paymentServiceV2 = {
  // Crear compra con reserva existente
  crearCompra: async (data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> => {
    try {
      const response = await api.post('/compras/crear-con-reserva', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear compra')
    }
  },

  // Iniciar pago con QR
  iniciarPagoQR: async (data: PaymentInitRequest): Promise<PaymentInitResponse> => {
    try {
      const response = await api.post('/compras/iniciar-pago', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al iniciar pago')
    }
  },

  // Verificar estado del pago (polling)
  verificarPago: async (qrPagoId: string): Promise<PaymentVerificationResponse> => {
    try {
      console.log('📡 Verificando pago desde frontend:', {
        qrPagoId,
        url: `/compras/qr/verificar?id=${qrPagoId}`
      })
      const response = await api.get(`/compras/qr/verificar?id=${qrPagoId}`)
      console.log('📡 Respuesta de verificación:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error verificando pago:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      })
      throw new Error(error.response?.data?.mensaje || 'Error al verificar pago')
    }
  },

  // Función para polling con intervalo configurable
  iniciarPollingPago: (
    qrPagoId: string,
    onEstado: (estado: PaymentVerificationResponse) => void,
    intervaloMs: number = 20000
  ) => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let intentos = 0
    let erroresConsecutivos = 0
    const MAX_INTENTOS = 240 // 1 hora máximo (240 * 15s = 1 hora)
    const MAX_ERRORES_CONSECUTIVOS = 50 // Detener si hay 5 errores consecutivos
    let intervaloActual = intervaloMs

    console.log('🔄 Iniciando polling de pago:', { qrPagoId, intervaloMs })

    const verificar = async () => {
      try {
        intentos++
        if (intentos >= MAX_INTENTOS) {
          console.log('⏱️  Máximo de intentos alcanzado, deteniendo polling')
          detenerPolling()
          return
        }

        const resultado = await paymentServiceV2.verificarPago(qrPagoId)
        onEstado(resultado)

        // Reiniciar contador de errores en caso de éxito
        erroresConsecutivos = 0
        intervaloActual = intervaloMs

        // Si el pago está completado o fallido, detener polling
        if (resultado.estado === 'PAGADO' || resultado.estado === 'FALLIDO' || resultado.estado === 'EXPIRADO') {
          console.log('✅ Pago finalizado con estado:', resultado.estado)
          detenerPolling()
        }
      } catch (error: any) {
        erroresConsecutivos++
        console.error(`Error en polling (${erroresConsecutivos}/${MAX_ERRORES_CONSECUTIVOS}):`, error)

        // Aumentar el intervalo si hay errores consecutivos (backoff)
        if (erroresConsecutivos > 1) {
          intervaloActual = Math.min(intervaloMs * Math.pow(2, erroresConsecutivos - 1), 30000) // Máximo 30s
          console.log(`📉 Aumentando intervalo a ${intervaloActual}ms debido a errores consecutivos`)
          // Reiniciar el intervalo con el nuevo tiempo
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = setInterval(verificar, intervaloActual)
          }
        }

        // Detener polling si hay demasiados errores consecutivos
        if (erroresConsecutivos >= MAX_ERRORES_CONSECUTIVOS) {
          console.error('❌ Demasiados errores consecutivos, deteniendo polling')
          onEstado({
            success: false,
            estado: 'FALLIDO',
            pagoProcesado: false,
            message: 'Error de conexión. Por favor verifica tu estado de pago.',
            datos: {
              estado: 'FALLIDO',
              mensaje: error.message || 'Error de conexión'
            }
          })
          detenerPolling()
        }
      }
    }

    const iniciar = () => {
      if (intervalId) return
      intervalId = setInterval(verificar, intervaloActual)
    }

    const detenerPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        console.log('🛑 Polling detenido')
      }
    }

    return {
      iniciar,
      detener: detenerPolling,
    }
  },
}
