import api from './api';

export interface SubirComprobanteRequest {
  compraId: string;
  imagenBase64: string;
  nombreArchivo?: string;
  tipoArchivo?: string;
}

export interface SubirComprobanteResponse {
  success: boolean;
  message: string;
  comprobante?: {
    id: string;
    imagenUrl: string;
    estado: string;
    fechaSubida: string;
  };
}

export interface Comprobante {
  id: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaSubida: string;
  imagenUrl: string;
  tipoArchivo?: string;
  tamanoBytes?: number;
  mensajeRechazo?: string;
  compra: {
    id: string;
    monto: number;
    moneda: string;
    estadoPago: string;
    evento: {
      id: string;
      titulo: string;
      fecha: Date;
      ubicacion: string;
    };
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    asiento?: { fila: string; numero: number };
    numeroBoleto?: number;
  };
}

export interface AprobarComprobanteResponse {
  success: boolean;
  message: string;
  compra?: {
    id: string;
    estadoPago: string;
    asientos?: Array<{ fila: string; numero: number }>;
    numeroBoletos?: number[];
  };
}

export const comprobantesPagoService = {

  subirComprobante: async (data: SubirComprobanteRequest): Promise<SubirComprobanteResponse> => {
    try {
      const response = await api.post('/compras/comprobantes-pago/subir', data);
      return response.data;
    } catch (error: any) {
      const err: any = new Error(error.response?.data?.message || 'Error al subir comprobante');
      err.status = error.response?.status;
      throw err;
    }
  },

  listarComprobantes: async (
    estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
    page: number = 1,
    limit: number = 20
  ): Promise<{
    success: boolean;
    data: Comprobante[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    try {
      const params: any = { page, limit };
      if (estado) params.estado = estado;
      const response = await api.get('/compras/comprobantes-pago', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al listar comprobantes');
    }
  },

  obtenerComprobante: async (comprobanteId: string): Promise<{ success: boolean; data: Comprobante }> => {
    try {
      const response = await api.get(`/compras/comprobantes-pago/${comprobanteId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener comprobante');
    }
  },

  aprobarComprobante: async (comprobanteId: string): Promise<AprobarComprobanteResponse> => {
    try {
      const response = await api.post(`/compras/comprobantes-pago/${comprobanteId}/aprobar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aprobar comprobante');
    }
  },

  rechazarComprobante: async (comprobanteId: string, mensajeRechazo?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/compras/comprobantes-pago/${comprobanteId}/rechazar`, { mensajeRechazo });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar comprobante');
    }
  }
};