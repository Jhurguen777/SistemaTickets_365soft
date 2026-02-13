// Tipos para el panel de administración

export interface Sector {
  id: string
  name: string
  price: number
  available: number
  total?: number
}

export interface Event {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  date: string
  time: string
  doorsOpen: string
  location: string
  address: string
  capacity: number
  price: number
  category: string
  subcategory?: string
  organizer: string
  status: 'ACTIVO' | 'INACTIVO' | 'CANCELADO'
  sectors: Sector[]
  gallery: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminEvent extends Event {
  totalSales: number
  totalTicketsSold: number
  createdAt: Date
  updatedAt: Date
}

export interface RegisteredUser {
  id: string
  eventId: string
  eventTitle: string
  nombre: string
  email: string
  telefono: string
  sector: string
  cantidad: number
  totalPagado: number
  fechaCompra: Date
  estadoPago: 'PAGADO' | 'PENDIENTE'
  asientos?: string[]
}

export interface EventReport {
  eventId: string
  eventTitle: string
  sectors: SectorReport[]
  totalRecaudado: number
  totalVendidos: number
}

export interface SectorReport {
  name: string
  price: number
  vendidos: number
  disponibles: number
  totalRecaudado: number
}

export interface FinancialReport {
  totalRecaudado: number
  porEvento: EventReport[]
  promedioTicket: number
  ocupacionPromedio: number
  eventoMasVendido: {
    title: string
    ventas: number
  }
  eventoMenosVendido: {
    title: string
    ventas: number
  }
}

export interface DashboardStats {
  totalVentas: number
  eventosActivos: number
  totalUsuarios: number
  proximosEventos: number
  ventasUltimaSemana: {
    dia: string
    monto: number
  }[]
  ventasPorEvento: {
    titulo: string
    monto: number
  }[]
  distribucionPorSector: {
    name: string
    value: number
  }[]
}

export interface CreateEventDTO {
  title: string
  description: string
  longDescription: string
  location: string
  address: string
  date: string
  time: string
  doorsOpen: string
  capacity: number
  category: string
  subcategory?: string
  organizer: string
  status: 'ACTIVO' | 'INACTIVO' | 'CANCELADO'
  image: string
  gallery: string[]
  sectors: Omit<Sector, 'id'>[]
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string
}
