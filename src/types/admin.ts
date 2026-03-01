// src/types/admin.ts

export interface Sector {
  id: string
  name: string
  price: number
  available: number
  total: number  // ← era optional, lo hacemos requerido
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
  status: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'PAUSADO' | 'FINALIZADO'
  sectors: Sector[]
  gallery: string[]
  totalSales: number        // ← movido aquí desde AdminEvent
  totalTicketsSold: number  // ← movido aquí desde AdminEvent
  createdAt: Date
  updatedAt: Date
}

export interface AdminEvent extends Event {
  // Ya hereda todo de Event, no necesita redefinir nada
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

export interface SectorReport {
  name: string
  price: number
  vendidos: number
  disponibles: number
  totalRecaudado: number
}

export interface EventReport {
  eventId: string
  eventTitle: string
  sectors: SectorReport[]   // ← era "sectores", debe ser "sectors" para coincidir con el tipo
  totalRecaudado: number
  totalVendidos: number
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
  price: number             // ← agregado, faltaba
  category: string
  subcategory?: string
  organizer: string
  status: 'ACTIVO' | 'INACTIVO' | 'CANCELADO' | 'PAUSADO' | 'FINALIZADO'
  image: string
  gallery: string[]
  sectors: Sector[]         // ← era Omit<Sector, 'id'>[], ahora es Sector[] completo
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string
}

export interface User {
  id: string
  nombre: string
  email: string
  telefono: string
  ci: string
  direccion?: string
  ciudad?: string
  estado: 'ACTIVO' | 'BLOQUEADO'
  totalCompras: number
  totalGastado: number
  ultimoAcceso?: Date
  createdAt: Date
}

export interface UserPurchase {
  id: string
  eventId: string
  eventTitle: string
  eventDate: Date
  cantidad: number
  totalPagado: number
  estadoPago: 'PAGADO' | 'PENDIENTE'
  fechaCompra: Date
}

export interface AttendanceReport {
  eventId: string
  eventTitle: string
  confirmados: number
  asistieron: number
  noShows: number
  tasaAsistencia: number
  asistentes: string[]
  noShowsList: string[]
}

export interface SalesByPeriod {
  periodo: string
  ventas: number
  ingresos: number
}

export interface SectorStats {
  name: string
  ventas: number
  ingresos: number
  porcentaje: number
}

export interface SiteConfig {
  nombre: string
  logo: string
  slogan: string
  emailContacto: string
  tema: 'claro' | 'oscuro'
  colorPrimario: string
}

export interface SocialMedia {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  tiktok?: string
}

export interface PaymentMethods {
  visa: boolean
  mastercard: boolean
  amex: boolean
  qrSimple: boolean
  baniPay: boolean
  tigoMoney: boolean
}

export interface LegalTexts {
  terminosCondiciones: string
  politicaPrivacidad: string
  avisoLegal: string
  politicaReembolso: string
}

export interface Config extends SiteConfig {
  redesSociales: SocialMedia
  metodosPago: PaymentMethods
  textosLegales: LegalTexts
}

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'GESTOR_EVENTOS'
  | 'GESTOR_REPORTES'
  | 'GESTOR_ASISTENCIA'
  | 'GESTOR_USUARIOS'

export interface Admin {
  id: string
  nombre: string
  email: string
  rol: AdminRole
  estado: 'ACTIVO' | 'INACTIVO'
  ultimoAcceso?: Date
  createdAt: Date
}

export interface CreateAdminDTO {
  nombre: string
  email: string
  password: string
  rol: AdminRole
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREAR_EVENTO'
  | 'MODIFICAR_EVENTO'
  | 'ELIMINAR_EVENTO'
  | 'BLOQUEAR_USUARIO'
  | 'DESBLOQUEAR_USUARIO'
  | 'MARCAR_ASISTENCIA'
  | 'CREAR_ADMIN'
  | 'MODIFICAR_CONFIG'

export interface AuditLog {
  id: string
  adminId: string
  adminNombre: string
  accion: AuditAction
  detalles: string
  ip: string
  dispositivo: string
  navegador: string
  fecha: Date
}

export interface ActiveSession {
  id: string
  adminId: string
  adminNombre: string
  adminEmail: string
  inicioSesion: Date
  ip: string
  ubicacion: string
  dispositivo: string
}

export type AsistenciaStatus = 'PENDIENTE' | 'CONFIRMADO' | 'ASISTIO' | 'NO_SHOW'

export interface Attendee {
  id: string
  purchaseId: string
  eventId: string
  nombre: string
  email: string
  ci: string
  asiento: string
  sector: string
  asistencia: AsistenciaStatus
  horaCheckIn?: Date
  qrCode: string
}

export interface PurchaseWithAttendees extends RegisteredUser {
  invitados: Attendee[]
}

export interface CheckInResult {
  success: boolean
  attendee?: Attendee
  message: string
}