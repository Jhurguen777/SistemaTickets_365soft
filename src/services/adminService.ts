// src/services/adminService.ts
import {
  AdminEvent,
  Event,
  RegisteredUser,
  FinancialReport,
  DashboardStats,
  CreateEventDTO,
  Sector
} from '@/types/admin'

// Datos Mock Iniciales
const INITIAL_EVENTS: AdminEvent[] = [
  {
    id: '1',
    title: 'Vibra Carnavalera 2026',
    description: 'Únete a la celebración más grande del año',
    longDescription: 'Prepárate para vivir la experiencia del carnaval más grande de Bolivia. Vibra Carnavalera 2026 presenta: 3 días de música ininterrumpida, Más de 20 artistas nacionales e internacionales.',
    image: '/media/banners/vibra-carnavalera.jpg',
    date: '2026-02-15',
    time: '20:00',
    doorsOpen: '18:00',
    location: 'Estadio Olímpico, La Paz',
    address: 'Av. Saavedra #1895, La Paz, Bolivia',
    capacity: 15000,
    price: 150,
    category: 'Fiestas',
    subcategory: 'Carnaval',
    organizer: '365soft Eventos',
    status: 'ACTIVO',
    sectors: [
      { id: '1', name: 'General', price: 150, available: 3500, total: 5000 },
      { id: '2', name: 'VIP', price: 350, available: 250, total: 500 },
      { id: '3', name: 'Super VIP', price: 500, available: 100, total: 200 }
    ],
    gallery: [
      '/media/banners/vibra-carnavalera.jpg',
      '/media/banners/carnaval-oruro.jpg',
      '/media/banners/fiesta.jpg'
    ],
    totalSales: 657500,
    totalTicketsSold: 1850,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    title: 'Carnaval de Oruro 2026',
    description: 'El patrimonio cultural de la humanidad',
    longDescription: 'La Diablada, la Morenada, la Caporales y muchas danzas más en el evento más grande de Bolivia.',
    image: '/media/banners/carnaval-oruro.jpg',
    date: '2026-02-28',
    time: '19:00',
    doorsOpen: '17:00',
    location: 'Estadio Jesús Bermúdez, Oruro',
    address: 'Calle Bolívar #456, Oruro, Bolivia',
    capacity: 35000,
    price: 250,
    category: 'Fiestas',
    subcategory: 'Carnaval',
    organizer: 'Gobierno Autónomo de Oruro',
    status: 'ACTIVO',
    sectors: [
      { id: '1', name: 'General', price: 250, available: 8000, total: 10000 },
      { id: '2', name: 'VIP', price: 500, available: 1500, total: 2000 }
    ],
    gallery: ['/media/banners/carnaval-oruro.jpg'],
    totalSales: 1250000,
    totalTicketsSold: 3500,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-20')
  },
  {
    id: '3',
    title: 'Fiesta de la Tradición',
    description: 'Cochabamba celebra su cultura',
    longDescription: 'Un evento único donde podrás disfrutar de la mejor comida, música y tradiciones cochabambinas.',
    image: '/media/banners/fiesta.jpg',
    date: '2026-03-05',
    time: '20:00',
    doorsOpen: '18:00',
    location: 'Feria Exposición, Cochabamba',
    address: 'Av. Ayacucho #123, Cochabamba, Bolivia',
    capacity: 8000,
    price: 180,
    category: 'Fiestas',
    subcategory: 'Tradición',
    organizer: '365soft Eventos',
    status: 'ACTIVO',
    sectors: [
      { id: '1', name: 'General', price: 180, available: 3000, total: 5000 }
    ],
    gallery: ['/media/banners/fiesta.jpg'],
    totalSales: 360000,
    totalTicketsSold: 2000,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-25')
  },
  {
    id: '4',
    title: 'Noche de Folklore',
    description: 'Lo mejor de la música boliviana',
    longDescription: 'Artistas locales e internacionales se reunen para celebrar el folklore boliviano.',
    image: '/media/banners/folklore.jpg',
    date: '2026-03-10',
    time: '21:00',
    doorsOpen: '19:00',
    location: 'Teatro Achá, Sucre',
    address: 'Calle Calvo #789, Sucre, Bolivia',
    capacity: 2000,
    price: 120,
    category: 'Conciertos',
    subcategory: 'Folklore',
    organizer: 'Casa de la Cultura',
    status: 'ACTIVO',
    sectors: [
      { id: '1', name: 'General', price: 120, available: 800, total: 1000 }
    ],
    gallery: ['/media/banners/folklore.jpg'],
    totalSales: 24000,
    totalTicketsSold: 200,
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-28')
  }
]

const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'u1',
    eventId: '1',
    eventTitle: 'Vibra Carnavalera 2026',
    nombre: 'Juan Pérez',
    email: 'juan@gmail.com',
    telefono: '+591 70012345',
    sector: 'VIP',
    cantidad: 2,
    totalPagado: 700,
    fechaCompra: new Date('2025-01-20'),
    estadoPago: 'PAGADO',
    asientos: ['A5', 'A6']
  },
  {
    id: 'u2',
    eventId: '1',
    eventTitle: 'Vibra Carnavalera 2026',
    nombre: 'María González',
    email: 'maria@gmail.com',
    telefono: '+591 70067890',
    sector: 'General',
    cantidad: 4,
    totalPagado: 600,
    fechaCompra: new Date('2025-01-21'),
    estadoPago: 'PAGADO',
    asientos: ['B1', 'B2', 'B3', 'B4']
  },
  {
    id: 'u3',
    eventId: '2',
    eventTitle: 'Carnaval de Oruro 2026',
    nombre: 'Carlos Mendoza',
    email: 'carlos@gmail.com',
    telefono: '+591 70011111',
    sector: 'VIP',
    cantidad: 3,
    totalPagado: 1500,
    fechaCompra: new Date('2025-01-22'),
    estadoPago: 'PAGADO',
    asientos: ['C1', 'C2', 'C3']
  },
  {
    id: 'u4',
    eventId: '2',
    eventTitle: 'Carnaval de Oruro 2026',
    nombre: 'Ana Rodríguez',
    email: 'ana@gmail.com',
    telefono: '+591 70022222',
    sector: 'General',
    cantidad: 5,
    totalPagado: 1250,
    fechaCompra: new Date('2025-01-23'),
    estadoPago: 'PENDIENTE',
    asientos: ['D1', 'D2', 'D3', 'D4', 'D5']
  },
  {
    id: 'u5',
    eventId: '3',
    eventTitle: 'Fiesta de la Tradición',
    nombre: 'Luis Fernández',
    email: 'luis@gmail.com',
    telefono: '+591 70033333',
    sector: 'General',
    cantidad: 2,
    totalPagado: 360,
    fechaCompra: new Date('2025-01-24'),
    estadoPago: 'PAGADO',
    asientos: ['E1', 'E2']
  }
]

// Obtener datos del localStorage o usar iniciales
const getStoredEvents = (): AdminEvent[] => {
  const stored = localStorage.getItem('admin_events')
  if (stored) {
    return JSON.parse(stored).map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt)
    }))
  }
  return INITIAL_EVENTS
}

const getStoredUsers = (): RegisteredUser[] => {
  const stored = localStorage.getItem('admin_users')
  if (stored) {
    return JSON.parse(stored).map((u: any) => ({
      ...u,
      fechaCompra: new Date(u.fechaCompra)
    }))
  }
  return INITIAL_USERS
}

// Guardar en localStorage
const saveEvents = (events: AdminEvent[]) => {
  localStorage.setItem('admin_events', JSON.stringify(events))
}

const saveUsers = (users: RegisteredUser[]) => {
  localStorage.setItem('admin_users', JSON.stringify(users))
}

// Servicios
export const adminService = {
  // Eventos
  getEvents: async (): Promise<AdminEvent[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredEvents()
  },

  getEventById: async (id: string): Promise<Event | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const events = getStoredEvents()
    return events.find(e => e.id === id) || null
  },

  createEvent: async (data: CreateEventDTO): Promise<Event> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const events = getStoredEvents()
    const newEvent: AdminEvent = {
      ...data,
      id: Date.now().toString(),
      totalSales: 0,
      totalTicketsSold: 0,
      sectors: data.sectors.map((s, i) => ({
        ...s,
        id: `${Date.now()}-${i}`
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    events.push(newEvent)
    saveEvents(events)
    return newEvent
  },

  updateEvent: async (id: string, data: Partial<CreateEventDTO>): Promise<Event> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const events = getStoredEvents()
    const index = events.findIndex(e => e.id === id)

    if (index === -1) {
      throw new Error('Evento no encontrado')
    }

    events[index] = {
      ...events[index],
      ...data,
      updatedAt: new Date()
    }

    saveEvents(events)
    return events[index]
  },

  deleteEvent: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const events = getStoredEvents()
    const filtered = events.filter(e => e.id !== id)

    if (filtered.length === events.length) {
      throw new Error('Evento no encontrado')
    }

    saveEvents(filtered)
  },

  // Usuarios
  getEventUsers: async (eventId: string): Promise<RegisteredUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const users = getStoredUsers()
    return users.filter(u => u.eventId === eventId)
  },

  getAllUsers: async (): Promise<RegisteredUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredUsers()
  },

  // Reportes
  getFinancialReport: async (): Promise<FinancialReport> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const events = getStoredEvents()
    const users = getStoredUsers()

    const totalRecaudado = events.reduce((sum, e) => sum + e.totalSales, 0)

    const porEvento = events.map(event => {
      const eventUsers = users.filter(u => u.eventId === event.id)
      const sectores = event.sectors.map(sector => {
        const ventasSector = eventUsers.filter(u => u.sector === sector.name)
        return {
          name: sector.name,
          price: sector.price,
          vendidos: ventasSector.reduce((sum, u) => sum + u.cantidad, 0),
          disponibles: sector.available,
          totalRecaudado: ventasSector.reduce((sum, u) => sum + u.totalPagado, 0)
        }
      })

      return {
        eventId: event.id,
        eventTitle: event.title,
        sectores,
        totalRecaudado: event.totalSales,
        totalVendidos: event.totalTicketsSold
      }
    })

    const promedioTicket = users.length > 0
      ? users.reduce((sum, u) => sum + u.totalPagado, 0) / users.length
      : 0

    const ocupacionPromedio = events.length > 0
      ? events.reduce((sum, e) => sum + (e.totalTicketsSold / e.capacity * 100), 0) / events.length
      : 0

    const eventoMasVendido = events.reduce((max, e) =>
      e.totalTicketsSold > max.totalTicketsSold ? e : max
    )

    const eventoMenosVendido = events.reduce((min, e) =>
      e.totalTicketsSold < min.totalTicketsSold ? e : min
    )

    return {
      totalRecaudado,
      porEvento,
      promedioTicket,
      ocupacionPromedio,
      eventoMasVendido: {
        title: eventoMasVendido.title,
        ventas: eventoMasVendido.totalTicketsSold
      },
      eventoMenosVendido: {
        title: eventoMenosVendido.title,
        ventas: eventoMenosVendido.totalTicketsSold
      }
    }
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const events = getStoredEvents()
    const users = getStoredUsers()

    const totalVentas = events.reduce((sum, e) => sum + e.totalSales, 0)
    const eventosActivos = events.filter(e => e.status === 'ACTIVO').length
    const totalUsuarios = users.length
    const proximosEventos = events.filter(e => new Date(e.date) > new Date()).length

    // Ventas última semana
    const hoy = new Date()
    const haceUnaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
    const ventasUltimaSemana = users
      .filter(u => u.fechaCompra >= haceUnaSemana && u.estadoPago === 'PAGADO')
      .reduce((acc, u) => {
        const dia = u.fechaCompra.toLocaleDateString('es-ES', { weekday: 'short' })
        const existing = acc.find(item => item.dia === dia)
        if (existing) {
          existing.monto += u.totalPagado
        } else {
          acc.push({ dia, monto: u.totalPagado })
        }
        return acc
      }, [] as { dia: string; monto: number }[])

    // Ventas por evento
    const ventasPorEvento = events.map(e => ({
      titulo: e.title,
      monto: e.totalSales
    }))

    // Distribución por sector
    const distribucionPorSector = users.reduce((acc, u) => {
      const existing = acc.find(item => item.name === u.sector)
      if (existing) {
        existing.value += u.cantidad
      } else {
        acc.push({ name: u.sector, value: u.cantidad })
      }
      return acc
    }, [] as { name: string; value: number }[])

    return {
      totalVentas,
      eventosActivos,
      totalUsuarios,
      proximosEventos,
      ventasUltimaSemana,
      ventasPorEvento,
      distribucionPorSector
    }
  }
}

export default adminService
