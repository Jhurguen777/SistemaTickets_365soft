import { generateTicketQRCode } from './qrService'
import api from './api'


export interface UserPurchase {
  id: string
  eventoId: string
  eventoTitulo: string
  eventoImagen: string
  eventoFecha: string
  eventoHora: string
  eventoDoorsOpen?: string
  eventoUbicacion: string
  eventoDireccion: string
  eventoCategoria?: string
  eventoDescripcion?: string
  asientos: Array<{
    fila: string
    numero: number
    asiento: string
    nombre: string
    email: string
    ci: string
    sector: string
    oficina?: string
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

const getPurchases = (): UserPurchase[] => {
  const stored = localStorage.getItem('user_purchases')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

const savePurchases = (purchases: UserPurchase[]) => {
  localStorage.setItem('user_purchases', JSON.stringify(purchases))
}

/**
 * Obtiene las compras del usuario autenticado desde el backend,
 * agrupadas por evento.
 */
export const getUserPurchases = async (
  user: { nombre: string; email: string; ci?: string | null } | null
): Promise<UserPurchase[]> => {
  try {
    const res = await api.get('/compras/mis-compras', { params: { limit: 100 } })
    const compras: any[] = (res.data.data ?? []).filter((c: any) => c.estadoPago === 'PAGADO')

    // Agrupar por eventoId
    const grouped = new Map<string, any[]>()
    for (const c of compras) {
      const key = c.eventoId
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(c)
    }

    const purchases: UserPurchase[] = []
    for (const [eventoId, group] of grouped) {
      const first = group[0]
      const totalMonto = group.reduce((sum: number, c: any) => sum + c.monto, 0)

      purchases.push({
        id: first.id,
        eventoId,
        eventoTitulo: first.evento?.titulo ?? '',
        eventoImagen: first.evento?.imagenUrl ?? '/media/banners/default.jpg',
        eventoFecha: first.evento?.fecha ?? '',
        eventoHora: first.evento?.hora ?? '',
        eventoDoorsOpen: first.evento?.doorsOpen ?? '',
        eventoUbicacion: first.evento?.ubicacion ?? '',
        eventoDireccion: first.evento?.direccion ?? '',
        eventoCategoria: first.evento?.categoria ?? '',
        eventoDescripcion: first.evento?.descripcion ?? '',
        asientos: group.map((c: any) => {
          const esGeneral = !c.asiento
          return {
            fila: esGeneral ? 'General' : (c.asiento?.fila ?? ''),
            numero: esGeneral ? (c.numeroBoleto ?? 0) : (c.asiento?.numero ?? 0),
            asiento: esGeneral ? `#${c.numeroBoleto ?? ''}` : `${c.asiento?.fila ?? ''}${c.asiento?.numero ?? ''}`,
            nombre: (`${c.nombreAsistente ?? ''} ${c.apellidoAsistente ?? ''}`.trim() || user?.nombre) ?? '',
            email: c.emailAsistente ?? user?.email ?? '',
            ci: c.documentoAsistente ?? user?.ci ?? '',
            sector: esGeneral ? 'General' : '-',
            oficina: c.oficina ?? undefined,
            qrCode: c.qrCode,
            attendeeId: c.id,
          }
        }),
        cantidad: group.length,
        monto: totalMonto,
        estadoPago: first.estadoPago,
        qrCode: first.qrCode,
        createdAt: first.createdAt,
      })
    }

    return purchases.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error fetching purchases from API:', error)
    return []
  }
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
    eventoId: purchaseData.eventoId,
    eventoTitulo: purchaseData.eventoTitulo,
    eventoImagen: purchaseData.eventoImagen,
    eventoFecha: purchaseData.eventoFecha,
    eventoHora: purchaseData.eventoHora,
    eventoUbicacion: purchaseData.eventoUbicacion,
    eventoDireccion: purchaseData.eventoDireccion,
    asientos: [],
    cantidad: purchaseData.asientos.length,
    estadoPago: 'PAGADO',
    monto: purchaseData.monto,
    qrCode: generateTicketQRCode(
      purchaseId,
      `att-${Date.now()}`,
      purchaseData.asientos[0].fila + purchaseData.asientos[0].numero,
      purchaseData.asientos[0].ci
    ),
    createdAt: new Date().toISOString()
  }

  // Agregar QR y attendeeId a cada asiento
  newPurchase.asientos = purchaseData.asientos.map((asiento, index) => {
    const attendeeId = `att-${Date.now()}-${index}`
    return {
      ...asiento,
      asiento: `${asiento.fila}${asiento.numero}`,
      qrCode: generateTicketQRCode(
        purchaseId,
        attendeeId,
        asiento.fila + asiento.numero,
        asiento.ci
      ),
      attendeeId
    }
  })

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
  updatePurchaseStatus,
}
