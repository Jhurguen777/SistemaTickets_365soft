// src/types/index.ts
export interface Evento {
  id: string
  titulo: string
  descripcion?: string
  fecha: string
  hora: string
  ubicacion: string
  imagenUrl?: string
  capacidad: number
  precio: number
  activo: boolean
}

export interface Asiento {
  id: string
  eventoId: string
  fila: string
  numero: number
  ocupado: boolean
  estado?: 'DISPONIBLE' | 'RESERVANDO' | 'OCUPADO'
}

export interface Compra {
  id: string
  usuarioId: string
  eventoId: string
  asientoId: string
  monto: number
  estadoPago: 'PENDIENTE' | 'PAGADO' | 'REEMBOLSADO' | 'FALLIDO'
  qrCode: string
  certificadoUrl?: string
  createdAt: string
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  agencia?: string
  rol: 'USUARIO' | 'ADMIN'
}
