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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ventas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  Bs {stats.totalVentas.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>Ingresos totales</span>
            </div>
          </CardContent>
        </Card>

        {/* Eventos Activos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.eventosActivos}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Calendar size={16} className="mr-1" />
              <span>Eventos publicados</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Usuarios */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Registrados</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalUsuarios}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <Users size={16} className="mr-1" />
              <span>Compras realizadas</span>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.proximosEventos}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <Calendar size={16} className="mr-1" />
              <span>Por realizarse</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de Eventos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">Eventos Activos</h2>
          <Link to="/admin/eventos">
            <Button variant="outline" size="sm">
              Ver Todos
              <ArrowRight size={16} className="ml-2" />
            </Button>
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
