import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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
  const [loading, setLoading] = useState(true)

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
      // Últimos 5 eventos
      setRecentEvents(eventsData.slice(-5).reverse())
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
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
                <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por Día */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ventas de la Última Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasSemanales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => [`Bs ${value}`, 'Monto']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monto"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Ventas (Bs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ventas por Evento */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ventas por Evento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ventasPorEvento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="titulo" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`Bs ${value}`, 'Ventas']} />
                <Bar dataKey="monto" fill="#00C49F" name="Ventas (Bs)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Sector */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Ventas por Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.distribucionPorSector}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.distribucionPorSector.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de Eventos Recientes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Eventos Recientes</h3>
            <Link to="/admin/eventos">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Evento</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'ACTIVO'
                          ? 'bg-green-100 text-green-700'
                          : event.status === 'INACTIVO'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      Bs {event.totalSales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link to={`/admin/eventos/${event.id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link to={`/admin/eventos/${event.id}/editar`}>
                          <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar">
                            <Edit size={16} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
