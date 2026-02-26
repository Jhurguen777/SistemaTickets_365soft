import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  Eye,
  Edit
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EventCard from '@/components/admin/EventCard'
import adminService from '@/services/adminService'
import { DashboardStats, AdminEvent } from '@/types/admin'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([])
  const [allEvents, setAllEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, eventsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getEvents()
      ])
      setStats(statsData)
      setAllEvents(eventsData)
      // Últimos 5 eventos
      setRecentEvents(eventsData.slice(-5).reverse())
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId)
    if (event) {
      setSelectedEventId(eventId)
      setSelectedEventTitle(event.title)
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedEventId('')
    setSelectedEventTitle('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) return null

  // Datos de ventas recientes (últimos 7 días)
  const ventasSemanales = stats.ventasUltimaSemana.length > 0
    ? stats.ventasUltimaSemana
    : [
        { dia: 'Lun', monto: 0 },
        { dia: 'Mar', monto: 0 },
        { dia: 'Mié', monto: 0 },
        { dia: 'Jue', monto: 0 },
        { dia: 'Vie', monto: 0 },
        { dia: 'Sáb', monto: 0 },
        { dia: 'Dom', monto: 0 }
      ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Ventas</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                Bs {stats.totalVentas.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
            <TrendingUp size={14} className="mr-1" />
            <span>Ingresos totales</span>
          </div>
        </div>

        {/* Eventos Activos */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Eventos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.eventosActivos}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400">
            <Calendar size={14} className="mr-1" />
            <span>Eventos publicados</span>
          </div>
        </div>

        {/* Total Usuarios */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Usuarios Registrados</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.totalUsuarios}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-purple-600 dark:text-purple-400">
            <Users size={14} className="mr-1" />
            <span>Usuarios registrados</span>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Próximos Eventos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.proximosEventos}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-orange-600 dark:text-orange-400">
            <Calendar size={14} className="mr-1" />
            <span>Por realizarse</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Eventos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Eventos Activos</h2>
          <Link to="/admin/eventos">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Ver Todos
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {allEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
