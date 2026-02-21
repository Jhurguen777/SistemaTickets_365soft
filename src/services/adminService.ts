// src/services/adminService.ts
import {
  AdminEvent,
  Event,
  RegisteredUser,
  FinancialReport,
  DashboardStats,
  CreateEventDTO,
  Sector,
  User,
  UserPurchase,
  AttendanceReport,
  SalesByPeriod,
  SectorStats,
  Config,
  Admin,
  CreateAdminDTO,
  AuditLog,
  ActiveSession,
  AdminRole,
  Attendee,
  PurchaseWithAttendees,
  AsistenciaStatus,
  CheckInResult
} from '@/types/admin'

// Importar API real
import api from './api'
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

// Usuarios mock
const INITIAL_ADMIN_USERS: User[] = [
  {
    id: 'u1',
    nombre: 'Juan Pérez',
    email: 'juan@gmail.com',
    telefono: '+591 70012345',
    ci: '1234567',
    direccion: 'Calle 1 #123',
    ciudad: 'La Paz',
    estado: 'ACTIVO',
    totalCompras: 3,
    totalGastado: 2350,
    ultimoAcceso: new Date('2025-01-25'),
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'u2',
    nombre: 'María González',
    email: 'maria@gmail.com',
    telefono: '+591 70067890',
    ci: '2345678',
    direccion: 'Av. Principal #456',
    ciudad: 'Cochabamba',
    estado: 'ACTIVO',
    totalCompras: 2,
    totalGastado: 1850,
    ultimoAcceso: new Date('2025-01-24'),
    createdAt: new Date('2025-01-10')
  },
  {
    id: 'u3',
    nombre: 'Carlos Mendoza',
    email: 'carlos@gmail.com',
    telefono: '+591 70011111',
    ci: '3456789',
    direccion: 'Calle Secundaria #789',
    ciudad: 'Santa Cruz',
    estado: 'ACTIVO',
    totalCompras: 5,
    totalGastado: 3500,
    ultimoAcceso: new Date('2025-01-23'),
    createdAt: new Date('2025-01-05')
  },
  {
    id: 'u4',
    nombre: 'Ana Rodríguez',
    email: 'ana@gmail.com',
    telefono: '+591 70022222',
    ci: '4567890',
    direccion: 'Zona Central #321',
    ciudad: 'Oruro',
    estado: 'BLOQUEADO',
    totalCompras: 1,
    totalGastado: 1250,
    ultimoAcceso: new Date('2025-01-10'),
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'u5',
    nombre: 'Luis Fernández',
    email: 'luis@gmail.com',
    telefono: '+591 70033333',
    ci: '5678901',
    ciudad: 'Sucre',
    estado: 'ACTIVO',
    totalCompras: 2,
    totalGastado: 720,
    ultimoAcceso: new Date('2025-01-22'),
    createdAt: new Date('2025-01-08')
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

// Asistentes mock (invitados individuales)
const INITIAL_ATTENDEES: Attendee[] = [
  // Juan Pérez compró 3 entradas
  {
    id: 'att1',
    purchaseId: 'u1',
    eventId: '1',
    nombre: 'Juan Pérez',
    email: 'juan@gmail.com',
    ci: '1234567',
    asiento: 'A5',
    sector: 'VIP',
    asistencia: 'ASISTIO',
    horaCheckIn: new Date('2025-01-25T19:30:00'),
    qrCode: 'QR-JUAN-1234567-A5'
  },
  {
    id: 'att2',
    purchaseId: 'u1',
    eventId: '1',
    nombre: 'Ana Pérez',
    email: 'ana@gmail.com',
    ci: '7654321',
    asiento: 'A6',
    sector: 'VIP',
    asistencia: 'ASISTIO',
    horaCheckIn: new Date('2025-01-25T19:31:00'),
    qrCode: 'QR-ANA-7654321-A6'
  },
  {
    id: 'att3',
    purchaseId: 'u1',
    eventId: '1',
    nombre: 'Carlos Pérez',
    email: 'carlos.p@gmail.com',
    ci: '2345678',
    asiento: 'A7',
    sector: 'VIP',
    asistencia: 'NO_SHOW',
    qrCode: 'QR-CARLOS-2345678-A7'
  },
  // María González compró 4 entradas
  {
    id: 'att4',
    purchaseId: 'u2',
    eventId: '1',
    nombre: 'María González',
    email: 'maria@gmail.com',
    ci: '3456789',
    asiento: 'B1',
    sector: 'General',
    asistencia: 'CONFIRMADO',
    qrCode: 'QR-MARIA-3456789-B1'
  },
  {
    id: 'att5',
    purchaseId: 'u2',
    eventId: '1',
    nombre: 'Luis González',
    email: 'luis.g@gmail.com',
    ci: '4567890',
    asiento: 'B2',
    sector: 'General',
    asistencia: 'CONFIRMADO',
    qrCode: 'QR-LUIS-4567890-B2'
  },
  {
    id: 'att6',
    purchaseId: 'u2',
    eventId: '1',
    nombre: 'Sofía González',
    email: 'sofia.g@gmail.com',
    ci: '5678901',
    asiento: 'B3',
    sector: 'General',
    asistencia: 'CONFIRMADO',
    qrCode: 'QR-SOFIA-5678901-B3'
  },
  {
    id: 'att7',
    purchaseId: 'u2',
    eventId: '1',
    nombre: 'Pedro González',
    email: 'pedro.g@gmail.com',
    ci: '6789012',
    asiento: 'B4',
    sector: 'General',
    asistencia: 'CONFIRMADO',
    qrCode: 'QR-PEDRO-6789012-B4'
  },
  // Carlos Mendoza compró 3 entradas
  {
    id: 'att8',
    purchaseId: 'u3',
    eventId: '2',
    nombre: 'Carlos Mendoza',
    email: 'carlos@gmail.com',
    ci: '7890123',
    asiento: 'C1',
    sector: 'VIP',
    asistencia: 'ASISTIO',
    horaCheckIn: new Date('2025-01-24T18:45:00'),
    qrCode: 'QR-CARLOS-7890123-C1'
  },
  {
    id: 'att9',
    purchaseId: 'u3',
    eventId: '2',
    nombre: 'Laura Mendoza',
    email: 'laura.m@gmail.com',
    ci: '8901234',
    asiento: 'C2',
    sector: 'VIP',
    asistencia: 'ASISTIO',
    horaCheckIn: new Date('2025-01-24T18:46:00'),
    qrCode: 'QR-LAURA-8901234-C2'
  },
  {
    id: 'att10',
    purchaseId: 'u3',
    eventId: '2',
    nombre: 'Diego Mendoza',
    email: 'diego.m@gmail.com',
    ci: '9012345',
    asiento: 'C3',
    sector: 'VIP',
    asistencia: 'CONFIRMADO',
    qrCode: 'QR-DIEGO-9012345-C3'
  }
]

// Configuración mock
const INITIAL_CONFIG: Config = {
  nombre: 'SistemaTickets 365soft',
  logo: '/logo.png',
  slogan: 'Tu mejor opción para entradas de eventos',
  emailContacto: 'contacto@365soft.com',
  tema: 'claro',
  colorPrimario: '#3B82F6',
  redesSociales: {
    facebook: 'https://facebook.com/365soft',
    twitter: 'https://twitter.com/365soft',
    instagram: 'https://instagram.com/365soft',
    youtube: 'https://youtube.com/@365soft',
    tiktok: 'https://tiktok.com/@365soft'
  },
  metodosPago: {
    visa: true,
    mastercard: true,
    amex: true,
    qrSimple: true,
    baniPay: true,
    tigoMoney: true
  },
  textosLegales: {
    terminosCondiciones: 'Términos y Condiciones de uso...',
    politicaPrivacidad: 'Política de Privacidad...',
    avisoLegal: 'Aviso Legal...',
    politicaReembolso: 'Política de Reembolso...'
  }
}

const getStoredAdminUsers = (): User[] => {
  const stored = localStorage.getItem('admin_users_list')
  if (stored) {
    return JSON.parse(stored).map((u: any) => ({
      ...u,
      createdAt: new Date(u.createdAt),
      ultimoAcceso: u.ultimoAcceso ? new Date(u.ultimoAcceso) : undefined
    }))
  }
  return INITIAL_ADMIN_USERS
}

const saveAdminUsers = (users: User[]) => {
  localStorage.setItem('admin_users_list', JSON.stringify(users))
}

const getStoredConfig = (): Config => {
  const stored = localStorage.getItem('admin_config')
  if (stored) {
    return JSON.parse(stored)
  }
  return INITIAL_CONFIG
}

const saveConfig = (config: Config) => {
  localStorage.setItem('admin_config', JSON.stringify(config))
}

// Administradores mock
const INITIAL_ADMINS: Admin[] = [
  {
    id: 'admin1',
    nombre: 'Administrador Principal',
    email: 'administrador@gmail.com',
    rol: 'SUPER_ADMIN',
    estado: 'ACTIVO',
    ultimoAcceso: new Date(),
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'admin2',
    nombre: 'Gestor de Eventos',
    email: 'eventos@365soft.com',
    rol: 'GESTOR_EVENTOS',
    estado: 'ACTIVO',
    ultimoAcceso: new Date('2025-01-20'),
    createdAt: new Date('2025-01-10')
  },
  {
    id: 'admin3',
    nombre: 'Gestor de Reportes',
    email: 'reportes@365soft.com',
    rol: 'GESTOR_REPORTES',
    estado: 'ACTIVO',
    ultimoAcceso: new Date('2025-01-18'),
    createdAt: new Date('2025-01-05')
  }
]

// Auditoría mock
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit1',
    adminId: 'admin1',
    adminNombre: 'Administrador Principal',
    accion: 'CREAR_EVENTO',
    detalles: 'Creó el evento "Vibra Carnavalera 2026"',
    ip: '192.168.1.100',
    dispositivo: 'Desktop',
    navegador: 'Chrome',
    fecha: new Date('2025-01-20T10:30:00')
  },
  {
    id: 'audit2',
    adminId: 'admin1',
    adminNombre: 'Administrador Principal',
    accion: 'LOGIN',
    detalles: 'Inicio de sesión exitoso',
    ip: '192.168.1.100',
    dispositivo: 'Desktop',
    navegador: 'Chrome',
    fecha: new Date('2025-01-25T09:00:00')
  },
  {
    id: 'audit3',
    adminId: 'admin2',
    adminNombre: 'Gestor de Eventos',
    accion: 'MODIFICAR_EVENTO',
    detalles: 'Modificó el evento "Carnaval de Oruro 2026"',
    ip: '192.168.1.105',
    dispositivo: 'Laptop',
    navegador: 'Firefox',
    fecha: new Date('2025-01-24T14:20:00')
  },
  {
    id: 'audit4',
    adminId: 'admin1',
    adminNombre: 'Administrador Principal',
    accion: 'BLOQUEAR_USUARIO',
    detalles: 'Bloqueó al usuario "Ana Rodríguez"',
    ip: '192.168.1.100',
    dispositivo: 'Desktop',
    navegador: 'Chrome',
    fecha: new Date('2025-01-23T16:45:00')
  },
  {
    id: 'audit5',
    adminId: 'admin3',
    adminNombre: 'Gestor de Reportes',
    accion: 'LOGIN',
    detalles: 'Inicio de sesión exitoso',
    ip: '192.168.1.110',
    dispositivo: 'Tablet',
    navegador: 'Safari',
    fecha: new Date('2025-01-18T08:30:00')
  }
]

// Sesiones activas mock
const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'session1',
    adminId: 'admin1',
    adminNombre: 'Administrador Principal',
    adminEmail: 'administrador@gmail.com',
    inicioSesion: new Date('2025-01-25T09:00:00'),
    ip: '192.168.1.100',
    ubicacion: 'La Paz, Bolivia',
    dispositivo: 'Desktop - Chrome'
  },
  {
    id: 'session2',
    adminId: 'admin3',
    adminNombre: 'Gestor de Reportes',
    adminEmail: 'reportes@365soft.com',
    inicioSesion: new Date('2025-01-25T11:30:00'),
    ip: '192.168.1.110',
    ubicacion: 'Cochabamba, Bolivia',
    dispositivo: 'Tablet - Safari'
  }
]

const getStoredAdmins = (): Admin[] => {
  const stored = localStorage.getItem('system_admins')
  if (stored) {
    return JSON.parse(stored).map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      ultimoAcceso: a.ultimoAcceso ? new Date(a.ultimoAcceso) : undefined
    }))
  }
  return INITIAL_ADMINS
}

const saveAdmins = (admins: Admin[]) => {
  localStorage.setItem('system_admins', JSON.stringify(admins))
}

const getStoredAuditLogs = (): AuditLog[] => {
  const stored = localStorage.getItem('audit_logs')
  if (stored) {
    return JSON.parse(stored).map((log: any) => ({
      ...log,
      fecha: new Date(log.fecha)
    }))
  }
  return INITIAL_AUDIT_LOGS
}

const saveAuditLogs = (logs: AuditLog[]) => {
  localStorage.setItem('audit_logs', JSON.stringify(logs))
}

const getStoredActiveSessions = (): ActiveSession[] => {
  const stored = localStorage.getItem('active_sessions')
  if (stored) {
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      inicioSesion: new Date(s.inicioSesion)
    }))
  }
  return INITIAL_ACTIVE_SESSIONS
}

const saveActiveSessions = (sessions: ActiveSession[]) => {
  localStorage.setItem('active_sessions', JSON.stringify(sessions))
}

const getStoredAttendees = (): Attendee[] => {
  const stored = localStorage.getItem('attendees')
  if (stored) {
    return JSON.parse(stored).map((a: any) => ({
      ...a,
      horaCheckIn: a.horaCheckIn ? new Date(a.horaCheckIn) : undefined
    }))
  }
  return INITIAL_ATTENDEES
}

const saveAttendees = (attendees: Attendee[]) => {
  localStorage.setItem('attendees', JSON.stringify(attendees))
}

// Servicios
export const adminService = {
  // Eventos - Conectados a Backend Real
  getEvents: async (): Promise<AdminEvent[]> => {
    try {
      const response = await api.get('/eventos')
      const eventos = response.data.data.eventos || []

      // Transformar datos del backend al formato del frontend
      return eventos.map((evt: any) => ({
        id: evt.id,
        title: evt.titulo,
        description: evt.descripcion || '',
        longDescription: evt.descripcion || '',
        image: evt.imagenUrl || '/media/banners/default.jpg',
        date: evt.fecha,
        time: evt.hora,
        doorsOpen: evt.doorsOpen || evt.hora,
        location: evt.ubicacion,
        address: evt.direccion || evt.ubicacion,
        capacity: evt.capacidad,
        price: evt.precio,
        category: evt.categoria || 'Fiestas',
        subcategory: evt.subcategoria || '',
        organizer: evt.organizer || '365soft Eventos',
        status: evt.estado,
        sectors: evt.sectores && evt.sectores.length > 0 ? evt.sectores.map((s: any) => ({
          id: s.id,
          name: s.nombre,
          price: s.precio,
          available: s.disponible,
          total: s.total
        })) : [
          {
            id: '1',
            name: 'General',
            price: evt.precio,
            available: evt.capacidad - (evt._count?.compras || 0),
            total: evt.capacidad
          }
        ],
        gallery: evt.imagenUrl ? [evt.imagenUrl] : [],
        totalSales: (evt._count?.compras || 0) * evt.precio,
        totalTicketsSold: evt._count?.compras || 0,
        createdAt: new Date(evt.createdAt),
        updatedAt: new Date(evt.updatedAt)
      }))
    } catch (error) {
      console.error('Error fetching events from backend, using fallback:', error)
      // Fallback a localStorage si el backend falla
      return getStoredEvents()
    }
  },

  getEventById: async (id: string): Promise<Event | null> => {
    try {
      const response = await api.get(`/eventos/${id}`)
      const evt = response.data.data

      return {
        id: evt.id,
        title: evt.titulo,
        description: evt.descripcion || '',
        longDescription: evt.descripcion || '',
        image: evt.imagenUrl || '/media/banners/default.jpg',
        date: evt.fecha,
        time: evt.hora,
        doorsOpen: evt.doorsOpen || evt.hora,
        location: evt.ubicacion,
        address: evt.direccion || evt.ubicacion,
        capacity: evt.capacidad,
        price: evt.precio,
        category: evt.categoria || 'Fiestas',
        subcategory: evt.subcategoria || '',
        organizer: evt.organizer || '365soft Eventos',
        status: evt.estado,
        sectors: evt.sectores && evt.sectores.length > 0 ? evt.sectores.map((s: any) => ({
          id: s.id,
          name: s.nombre,
          price: s.precio,
          available: s.disponible,
          total: s.total
        })) : [
          {
            id: '1',
            name: 'General',
            price: evt.precio,
            available: evt.capacidad - (evt._count?.compras || 0),
            total: evt.capacidad
          }
        ],
        gallery: evt.imagenUrl ? [evt.imagenUrl] : [],
        totalSales: (evt._count?.compras || 0) * evt.precio,
        totalTicketsSold: evt._count?.compras || 0,
        createdAt: new Date(evt.createdAt),
        updatedAt: new Date(evt.updatedAt)
      }
    } catch (error) {
      console.error('Error fetching event from backend:', error)
      // Fallback a localStorage
      const events = getStoredEvents()
      return events.find(e => e.id === id) || null
    }
  },

  createEvent: async (data: CreateEventDTO): Promise<Event> => {
    try {
      // Asegurar que sectors siempre tenga un valor por defecto
      const sectors = data.sectors && data.sectors.length > 0
        ? data.sectors
        : [{ id: '1', name: 'General', price: 150, available: 0, total: 0 }]

      // Transformar datos del frontend al formato del backend
      const backendData = {
        titulo: data.title,
        descripcion: data.description,
        fecha: new Date(data.date).toISOString(),
        hora: data.time,
        ubicacion: data.location,
        direccion: data.address,
        imagenUrl: data.image,
        capacidad: data.capacity,
        precio: sectors[0]?.price || 150,
        categoria: data.category,
        subcategory: data.subcategory,
        organizer: data.organizer,
        doorsOpen: data.doorsOpen,
        estado: data.status || 'ACTIVO',
        sectores: sectors.map(s => ({
          nombre: s.name,
          precio: s.price,
          total: s.total
        }))
      }

      const response = await api.post('/eventos', backendData)
      const evt = response.data.data

      return {
        id: evt.id,
        title: evt.titulo,
        description: evt.descripcion || '',
        longDescription: evt.descripcion || '',
        image: evt.imagenUrl || '/media/banners/default.jpg',
        date: evt.fecha,
        time: evt.hora,
        doorsOpen: evt.doorsOpen || evt.hora,
        location: evt.ubicacion,
        address: evt.direccion || evt.ubicacion,
        capacity: evt.capacidad,
        price: evt.precio,
        category: evt.categoria || 'Fiestas',
        subcategory: evt.subcategoria || '',
        organizer: evt.organizer || '365soft Eventos',
        status: evt.estado,
        sectors: evt.sectores ? evt.sectores.map((s: any) => ({
          id: s.id,
          name: s.nombre,
          price: s.precio,
          available: s.disponible,
          total: s.total
        })) : sectors,
        gallery: data.gallery || [],
        totalSales: 0,
        totalTicketsSold: 0,
        createdAt: new Date(evt.createdAt),
        updatedAt: new Date(evt.updatedAt)
      }
    } catch (error: any) {
      console.error('Error creating event:', error)
      throw new Error(error.response?.data?.error || 'Error al crear evento')
    }
  },

  updateEvent: async (id: string, data: Partial<CreateEventDTO>): Promise<Event> => {
    try {
      const backendData: any = {}

      if (data.title) backendData.titulo = data.title
      if (data.description !== undefined) backendData.descripcion = data.description
      if (data.date) backendData.fecha = new Date(data.date).toISOString()
      if (data.time) backendData.hora = data.time
      if (data.location) backendData.ubicacion = data.location
      if (data.image !== undefined) backendData.imagenUrl = data.image
      if (data.capacity) backendData.capacidad = data.capacity
      if (data.sectors && data.sectors[0]?.price) backendData.precio = data.sectors[0].price
      if (data.status) backendData.estado = data.status

      const response = await api.put(`/eventos/${id}`, backendData)
      const evt = response.data.data

      return {
        id: evt.id,
        title: evt.titulo,
        description: evt.descripcion || '',
        longDescription: evt.descripcion || '',
        image: evt.imagenUrl || '/media/banners/default.jpg',
        date: evt.fecha,
        time: evt.hora,
        doorsOpen: evt.hora,
        location: evt.ubicacion,
        address: evt.ubicacion,
        capacity: evt.capacidad,
        price: evt.precio,
        category: 'Fiestas',
        subcategory: '',
        organizer: '365soft Eventos',
        status: evt.estado,
        sectors: data.sectors || [],
        gallery: data.gallery || [],
        totalSales: 0,
        totalTicketsSold: 0,
        createdAt: new Date(evt.createdAt),
        updatedAt: new Date(evt.updatedAt)
      }
    } catch (error: any) {
      console.error('Error updating event:', error)
      throw new Error(error.response?.data?.error || 'Error al actualizar evento')
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/eventos/${id}`)
    } catch (error: any) {
      console.error('Error deleting event:', error)
      throw new Error(error.response?.data?.error || 'Error al eliminar evento')
    }
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
  },

  // Usuarios
  getUsersList: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredAdminUsers()
  },

  getUserById: async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const users = getStoredAdminUsers()
    return users.find(u => u.id === id) || null
  },

  getUserPurchases: async (userId: string): Promise<UserPurchase[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const users = getStoredUsers()
    const events = getStoredEvents()

    return users
      .filter(u => u.id === userId)
      .map(purchase => {
        const event = events.find(e => e.id === purchase.eventId)
        return {
          id: purchase.id,
          eventId: purchase.eventId,
          eventTitle: purchase.eventTitle,
          eventDate: event ? new Date(event.date) : new Date(),
          cantidad: purchase.cantidad,
          totalPagado: purchase.totalPagado,
          estadoPago: purchase.estadoPago,
          fechaCompra: purchase.fechaCompra
        }
      })
  },

  blockUser: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const users = getStoredAdminUsers()
    const index = users.findIndex(u => u.id === id)

    if (index !== -1) {
      users[index].estado = 'BLOQUEADO'
      saveAdminUsers(users)
    }
  },

  unblockUser: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const users = getStoredAdminUsers()
    const index = users.findIndex(u => u.id === id)

    if (index !== -1) {
      users[index].estado = 'ACTIVO'
      saveAdminUsers(users)
    }
  },

  // Reportes
  getAttendanceReport: async (eventId: string): Promise<AttendanceReport> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const users = getStoredUsers().filter(u => u.eventId === eventId)
    const events = getStoredEvents()
    const event = events.find(e => e.id === eventId)

    const confirmados = users.filter(u => u.estadoPago === 'PAGADO').length
    const asistieron = Math.floor(confirmados * 0.8) // Mock: 80% de asistencia
    const noShows = confirmados - asistieron
    const tasaAsistencia = confirmados > 0 ? (asistieron / confirmados) * 100 : 0

    return {
      eventId,
      eventTitle: event?.title || 'Evento',
      confirmados,
      asistieron,
      noShows,
      tasaAsistencia,
      asistentes: users.filter(u => u.estadoPago === 'PAGADO').slice(0, asistieron).map(u => u.nombre),
      noShowsList: users.filter(u => u.estadoPago === 'PAGADO').slice(asistieron).map(u => u.nombre)
    }
  },

  getSalesByPeriod: async (period: 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date): Promise<SalesByPeriod[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const users = getStoredUsers().filter(u => u.estadoPago === 'PAGADO')

    // Mock: agrupar por período
    if (period === 'week') {
      return [
        { periodo: 'Lun', ventas: 25, ingresos: 6250 },
        { periodo: 'Mar', ventas: 30, ingresos: 7500 },
        { periodo: 'Mié', ventas: 22, ingresos: 5500 },
        { periodo: 'Jue', ventas: 35, ingresos: 8750 },
        { periodo: 'Vie', ventas: 40, ingresos: 10000 },
        { periodo: 'Sáb', ventas: 50, ingresos: 12500 },
        { periodo: 'Dom', ventas: 45, ingresos: 11250 }
      ]
    }

    return [
      { periodo: 'Ene', ventas: 150, ingresos: 37500 },
      { periodo: 'Feb', ventas: 200, ingresos: 50000 },
      { periodo: 'Mar', ventas: 180, ingresos: 45000 },
      { periodo: 'Abr', ventas: 220, ingresos: 55000 }
    ]
  },

  getSectorStats: async (): Promise<SectorStats[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const users = getStoredUsers().filter(u => u.estadoPago === 'PAGADO')
    const totalVentas = users.reduce((sum, u) => sum + u.cantidad, 0)

    const sectores = ['General', 'VIP', 'Super VIP']
    return sectores.map(sector => {
      const ventasSector = users.filter(u => u.sector === sector)
      const cantidad = ventasSector.reduce((sum, u) => sum + u.cantidad, 0)
      const ingresos = ventasSector.reduce((sum, u) => sum + u.totalPagado, 0)

      return {
        name: sector,
        ventas: cantidad,
        ingresos,
        porcentaje: totalVentas > 0 ? (cantidad / totalVentas) * 100 : 0
      }
    })
  },

  // Configuración
  getConfig: async (): Promise<Config> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return getStoredConfig()
  },

  updateConfig: async (config: Partial<Config>): Promise<Config> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const currentConfig = getStoredConfig()
    const newConfig = { ...currentConfig, ...config }

    saveConfig(newConfig)
    return newConfig
  },

  // Accesos - Administradores
  getAdmins: async (): Promise<Admin[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredAdmins()
  },

  getAdminById: async (id: string): Promise<Admin | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const admins = getStoredAdmins()
    return admins.find(a => a.id === id) || null
  },

  createAdmin: async (data: CreateAdminDTO): Promise<Admin> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const admins = getStoredAdmins()
    const newAdmin: Admin = {
      id: `admin${Date.now()}`,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: 'ACTIVO',
      createdAt: new Date()
    }

    admins.push(newAdmin)
    saveAdmins(admins)

    // Agregar log de auditoría
    const logs = getStoredAuditLogs()
    logs.unshift({
      id: `audit${Date.now()}`,
      adminId: 'current', // Would be actual admin ID
      adminNombre: 'Administrador Actual',
      accion: 'CREAR_ADMIN',
      detalles: `Creó al administrador "${data.nombre}" con rol ${data.rol}`,
      ip: '192.168.1.1',
      dispositivo: 'Desktop',
      navegador: 'Chrome',
      fecha: new Date()
    })
    saveAuditLogs(logs)

    return newAdmin
  },

  updateAdmin: async (id: string, data: Partial<CreateAdminDTO>): Promise<Admin> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const admins = getStoredAdmins()
    const index = admins.findIndex(a => a.id === id)

    if (index === -1) {
      throw new Error('Administrador no encontrado')
    }

    admins[index] = {
      ...admins[index],
      ...data
    }

    saveAdmins(admins)
    return admins[index]
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const admins = getStoredAdmins()
    const filtered = admins.filter(a => a.id !== id)

    if (filtered.length === admins.length) {
      throw new Error('Administrador no encontrado')
    }

    saveAdmins(filtered)
  },

  // Accesos - Auditoría
  getAuditLogs: async (): Promise<AuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredAuditLogs()
  },

  getAuditLogsByAdmin: async (adminId: string): Promise<AuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const logs = getStoredAuditLogs()
    return logs.filter(log => log.adminId === adminId)
  },

  // Accesos - Sesiones Activas
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return getStoredActiveSessions()
  },

  closeSession: async (sessionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const sessions = getStoredActiveSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)

    if (filtered.length === sessions.length) {
      throw new Error('Sesión no encontrada')
    }

    saveActiveSessions(filtered)
  },

  // Asistencia
  getEventAttendees: async (eventId: string): Promise<PurchaseWithAttendees[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const users = getStoredUsers()
    const attendees = getStoredAttendees()

    // Agrupar asistentes por compra
    return users
      .filter(u => u.eventId === eventId)
      .map(user => {
        const userAttendees = attendees.filter(a => a.purchaseId === user.id)
        return {
          ...user,
          invitados: userAttendees
        }
      })
  },

  getAttendeeByQR: async (qrCode: string, eventId: string): Promise<CheckInResult> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = getStoredAttendees()
    const attendee = attendees.find(a => a.qrCode === qrCode && a.eventId === eventId)

    if (!attendee) {
      return {
        success: false,
        message: 'QR no válido o no corresponde a este evento'
      }
    }

    if (attendee.asistencia === 'ASISTIO') {
      return {
        success: false,
        attendee,
        message: 'Este asistente ya registró su entrada'
      }
    }

    if (attendee.asistencia === 'NO_SHOW') {
      return {
        success: false,
        attendee,
        message: 'Este asistente fue marcado como NO SHOW'
      }
    }

    return {
      success: true,
      attendee,
      message: 'Asistente encontrado correctamente'
    }
  },

  markAttendance: async (attendeeId: string): Promise<Attendee> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = getStoredAttendees()
    const index = attendees.findIndex(a => a.id === attendeeId)

    if (index === -1) {
      throw new Error('Asistente no encontrado')
    }

    attendees[index].asistencia = 'ASISTIO'
    attendees[index].horaCheckIn = new Date()

    saveAttendees(attendees)

    // Agregar log de auditoría
    const logs = getStoredAuditLogs()
    logs.unshift({
      id: `audit${Date.now()}`,
      adminId: 'current',
      adminNombre: 'Administrador Actual',
      accion: 'MARCAR_ASISTENCIA',
      detalles: `Marcó asistencia de ${attendees[index].nombre} (${attendees[index].asiento})`,
      ip: '192.168.1.1',
      dispositivo: 'Desktop',
      navegador: 'Chrome',
      fecha: new Date()
    })
    saveAuditLogs(logs)

    return attendees[index]
  },

  unmarkAttendance: async (attendeeId: string): Promise<Attendee> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = getStoredAttendees()
    const index = attendees.findIndex(a => a.id === attendeeId)

    if (index === -1) {
      throw new Error('Asistente no encontrado')
    }

    attendees[index].asistencia = 'CONFIRMADO'
    attendees[index].horaCheckIn = undefined

    saveAttendees(attendees)
    return attendees[index]
  },

  markNoShow: async (attendeeId: string): Promise<Attendee> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = getStoredAttendees()
    const index = attendees.findIndex(a => a.id === attendeeId)

    if (index === -1) {
      throw new Error('Asistente no encontrado')
    }

    attendees[index].asistencia = 'NO_SHOW'
    attendees[index].horaCheckIn = undefined

    saveAttendees(attendees)
    return attendees[index]
  },

  getAttendeesStats: async (eventId: string): Promise<{
    total: number
    confirmados: number
    asistieron: number
    noShows: number
    pendientes: number
  }> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = getStoredAttendees().filter(a => a.eventId === eventId)

    return {
      total: attendees.length,
      confirmados: attendees.filter(a => a.asistencia === 'CONFIRMADO').length,
      asistieron: attendees.filter(a => a.asistencia === 'ASISTIO').length,
      noShows: attendees.filter(a => a.asistencia === 'NO_SHOW').length,
      pendientes: attendees.filter(a => a.asistencia === 'PENDIENTE').length
    }
  }
}

export default adminService
