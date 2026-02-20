import { RegisteredUser } from '@/types/admin'
import { generateTicketQRCode } from './qrService'

export interface UserPurchase {
  id: string
  eventoId: string
  eventoTitulo: string
  eventoImagen: string
  eventoFecha: string
  eventoHora: string
  eventoUbicacion: string
  eventoDireccion: string
  asientos: Array<{
    fila: string
    numero: number
    nombre: string
    email: string
    ci: string
    sector: string
    qrCode: string
    attendeeId: string
  }>
  cantidad: number
  monto: number
  estadoPago: 'PAGADO' | 'PENDIENTE' | 'REEMBOLSADO' | 'FALLIDO'
  qrCode: string
  certificadoUrl?: string
  createdAt: string
}

// Datos iniciales de ejemplo
const INITIAL_PURCHASES: UserPurchase[] = [
  {
    id: 'pur-1',
    eventoId: '1',
    eventoTitulo: 'Vibra Carnavalera 2026',
    eventoImagen: '/media/banners/vibra-carnavalera.jpg',
    eventoFecha: '2026-02-15',
    eventoHora: '20:00',
    eventoUbicacion: 'Estadio Olímpico, La Paz',
    eventoDireccion: 'Av. Saavedra #1895, La Paz, Bolivia',
    asientos: [
      {
        fila: 'A',
        numero: 5,
        nombre: 'Juan Pérez',
        email: 'juan@gmail.com',
        ci: '1234567',
        sector: 'VIP',
        qrCode: generateTicketQRCode('pur-1', 'att1', 'A5', '1234567'),
        attendeeId: 'att1'
      },
      {
        fila: 'A',
        numero: 6,
        nombre: 'Ana Pérez',
        email: 'ana@gmail.com',
        ci: '7654321',
        sector: 'VIP',
        qrCode: generateTicketQRCode('pur-1', 'att2', 'A6', '7654321'),
        attendeeId: 'att2'
      }
    ],
    cantidad: 2,
    monto: 700,
    estadoPago: 'PAGADO',
    qrCode: generateTicketQRCode('pur-1', 'att1', 'A5', '1234567'),
    createdAt: '2025-01-25T10:30:00'
  },
  {
    id: 'pur-2',
    eventoId: '2',
    eventoTitulo: 'Carnaval de Oruro 2026',
    eventoImagen: '/media/banners/carnaval-oruro.jpg',
    eventoFecha: '2026-02-28',
    eventoHora: '19:00',
    eventoUbicacion: 'Estadio Jesús Bermúdez, Oruro',
    eventoDireccion: 'Calle Bolívar #456, Oruro, Bolivia',
    asientos: [
      {
        fila: 'C',
        numero: 1,
        nombre: 'Carlos Mendoza',
        email: 'carlos@gmail.com',
        ci: '7890123',
        sector: 'VIP',
        qrCode: generateTicketQRCode('pur-2', 'att8', 'C1', '7890123'),
        attendeeId: 'att8'
      }
    ],
    cantidad: 1,
    monto: 500,
    estadoPago: 'PAGADO',
    qrCode: generateTicketQRCode('pur-2', 'att8', 'C1', '7890123'),
    createdAt: '2025-01-24T15:45:00'
  },
  {
    id: 'pur-3',
    eventoId: '1',
    eventoTitulo: 'Vibra Carnavalera 2026',
    eventoImagen: '/media/banners/vibra-carnavalera.jpg',
    eventoFecha: '2026-02-15',
    eventoHora: '20:00',
    eventoUbicacion: 'Estadio Olímpico, La Paz',
    eventoDireccion: 'Av. Saavedra #1895, La Paz, Bolivia',
    asientos: [
      {
        fila: 'B',
        numero: 1,
        nombre: 'María González',
        email: 'maria@gmail.com',
        ci: '3456789',
        sector: 'General',
        qrCode: generateTicketQRCode('pur-3', 'att4', 'B1', '3456789'),
        attendeeId: 'att4'
      }
    ],
    cantidad: 1,
    monto: 150,
    estadoPago: 'PENDIENTE',
    qrCode: generateTicketQRCode('pur-3', 'att4', 'B1', '3456789'),
    createdAt: '2025-01-26T09:15:00'
  }
]

const getPurchases = (): UserPurchase[] => {
  const stored = localStorage.getItem('user_purchases')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing purchases:', error)
      return INITIAL_PURCHASES
    }
  }
  return INITIAL_PURCHASES
}

const savePurchases = (purchases: UserPurchase[]) => {
  localStorage.setItem('user_purchases', JSON.stringify(purchases))
}

/**
 * Obtiene todas las compras del usuario
 */
export const getUserPurchases = (): UserPurchase[] => {
  return getPurchases()
}

/**
 * Crea una nueva compra
 */
export const createPurchase = (purchaseData: {
  eventoId: string
  eventoTitulo: string
  eventoImagen: string
  eventoFecha: string
  eventoHora: string
  eventoUbicacion: string
  eventoDireccion: string
  asientos: Array<{
    fila: string
    numero: number
    nombre: string
    email: string
    ci: string
    sector: string
  }>
  monto: number
}): UserPurchase => {
  const purchases = getPurchases()
  const purchaseId = `pur-${Date.now()}`

  const newPurchase: UserPurchase = {
    id: purchaseId,
    ...purchaseData,
    cantidad: purchaseData.asientos.length,
    estadoPago: 'PAGADO',
    qrCode: generateTicketQRCode(
      purchaseId,
      `att-${Date.now()}`,
      purchaseData.asientos[0].fila + purchaseData.asientos[0].numero,
      purchaseData.asientos[0].ci
    ),
    createdAt: new Date().toISOString()
  }

  // Agregar QR y attendeeId a cada asiento
  newPurchase.asientos = purchaseData.asientos.map((asiento, index) => ({
    ...asiento,
    qrCode: generateTicketQRCode(
      purchaseId,
      `att-${Date.now()}-${index}`,
      asiento.fila + asiento.numero,
      asiento.ci
    ),
    attendeeId: `att-${Date.now()}-${index}`
  }))

  purchases.unshift(newPurchase)
  savePurchases(purchases)

  return newPurchase
}

/**
 * Obtiene una compra por ID
 */
export const getPurchaseById = (purchaseId: string): UserPurchase | null => {
  const purchases = getPurchases()
  return purchases.find(p => p.id === purchaseId) || null
}

/**
 * Actualiza el estado de una compra
 */
export const updatePurchaseStatus = (
  purchaseId: string,
  status: UserPurchase['estadoPago']
): void => {
  const purchases = getPurchases()
  const index = purchases.findIndex(p => p.id === purchaseId)

  if (index !== -1) {
    purchases[index].estadoPago = status
    savePurchases(purchases)
  }
}

export default {
  getUserPurchases,
  createPurchase,
  getPurchaseById,
  updatePurchaseStatus
}
