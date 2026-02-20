import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Users,
  Ticket,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { FinancialReport, AttendanceReport, SalesByPeriod, SectorStats } from '@/types/admin'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'ventas' | 'financiero' | 'asistencia'>('ventas')
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([])
  const [sectorStats, setSectorStats] = useState<SectorStats[]>([])
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      const [financial, sales, sector, eventsData] = await Promise.all([
        adminService.getFinancialReport(),
        adminService.getSalesByPeriod(selectedPeriod),
        adminService.getSectorStats(),
        adminService.getEvents()
      ])
      setFinancialReport(financial)
      setSalesByPeriod(sales)
      setSectorStats(sector)
      setEvents(eventsData)

      // Cargar reporte de asistencia del primer evento si existe
      if (eventsData.length > 0) {
        const attendance = await adminService.getAttendanceReport(eventsData[0].id)
        setAttendanceReport(attendance)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis detallado de ventas y métricas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText size={18} />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('ventas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ventas'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reporte de Ventas
          </button>
          <button
            onClick={() => setActiveTab('financiero')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'financiero'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reporte Financiero
          </button>
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'asistencia'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reporte de Asistencia
          </button>
        </nav>
      </div>

      {/* Reporte de Ventas */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
            </select>
          </div>

          {/* Distribución por Sector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles por Sector</h3>
                <div className="space-y-4">
                  {sectorStats.map((sector) => (
                    <div key={sector.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{sector.name}</h4>
                        <span className="text-sm text-gray-600">{sector.porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ventas</p>
                          <p className="font-semibold text-gray-900">{sector.ventas} entradas</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ingresos</p>
                          <p className="font-semibold text-gray-900">Bs {sector.ingresos.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${sector.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Reporte Financiero */}
      {activeTab === 'financiero' && financialReport && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Recaudado</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      Bs {financialReport.totalRecaudado.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Promedio Ticket</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      Bs {Math.round(financialReport.promedioTicket).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Ticket className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ocupación Promedio</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {financialReport.ocupacionPromedio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mejor Evento</p>
                    <p className="text-lg font-bold text-gray-900 mt-2 truncate">
                      {financialReport.eventoMasVendido.title}
                    </p>
                    <p className="text-sm text-gray-600">{financialReport.eventoMasVendido.ventas} ventas</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ventas por Evento */}
          {/* Tabla Detallada */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Detalle por Evento</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Evento</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Recaudado</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tickets Vendidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialReport.porEvento.map((evento) => (
                      <tr key={evento.eventId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{evento.eventTitle}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          Bs {evento.totalRecaudado.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{evento.totalVendidos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reporte de Asistencia */}
      {activeTab === 'asistencia' && (
        <div className="space-y-6">
          {/* Selector de Evento */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Evento:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={async (e) => {
                const attendance = await adminService.getAttendanceReport(e.target.value)
                setAttendanceReport(attendance)
              }}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {attendanceReport && (
            <>
              {/* KPIs de Asistencia */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Confirmados</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {attendanceReport.confirmados}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Asistieron</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {attendanceReport.asistieron}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">No Shows</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {attendanceReport.noShows}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="text-red-600" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tasa Asistencia</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {attendanceReport.tasaAsistencia.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <PieChart className="text-purple-600" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de No Shows */}
              {attendanceReport.noShowsList.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">No Shows (Confirmaron pero no asistieron)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {attendanceReport.noShowsList.map((name, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <XCircle size={16} className="text-red-600" />
                          <span className="text-sm text-gray-700">{name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
