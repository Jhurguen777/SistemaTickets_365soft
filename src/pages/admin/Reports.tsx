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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Reportes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Análisis detallado de ventas y métricas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FileText size={16} />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('ventas')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors ${
              activeTab === 'ventas'
                ? 'border-gray-900 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
            }`}
          >
            REPORTE DE VENTAS
          </button>
          <button
            onClick={() => setActiveTab('financiero')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors ${
              activeTab === 'financiero'
                ? 'border-gray-900 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
            }`}
          >
            REPORTE FINANCIERO
          </button>
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors ${
              activeTab === 'asistencia'
                ? 'border-gray-900 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
            }`}
          >
            REPORTE DE ASISTENCIA
          </button>
        </nav>
      </div>

      {/* Reporte de Ventas */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white dark:bg-gray-800"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
            </select>
          </div>

          {/* Distribución por Sector */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Detalles por Sector</h3>
            <div className="space-y-4">
              {sectorStats.map((sector) => (
                <div key={sector.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{sector.name}</h4>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{sector.porcentaje.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ventas</p>
                      <p className="font-medium text-gray-900 dark:text-white">{sector.ventas} entradas</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
                      <p className="font-medium text-gray-900 dark:text-white">Bs {sector.ingresos.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all"
                      style={{ width: `${sector.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reporte Financiero */}
      {activeTab === 'financiero' && financialReport && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Recaudado</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    Bs {financialReport.totalRecaudado.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promedio Ticket</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    Bs {Math.round(financialReport.promedioTicket).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Ticket className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ocupación Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {financialReport.ocupacionPromedio.toFixed(1)}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mejor Evento</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                    {financialReport.eventoMasVendido.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{financialReport.eventoMasVendido.ventas} ventas</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabla Detallada */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Detalle por Evento</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Evento</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Total Recaudado</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Tickets Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {financialReport.porEvento.map((evento) => (
                    <tr key={evento.eventId} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">{evento.eventTitle}</td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Bs {evento.totalRecaudado.toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-300">{evento.totalVendidos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reporte de Asistencia */}
      {activeTab === 'asistencia' && (
        <div className="space-y-6">
          {/* Selector de Evento */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Evento:</label>
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white dark:bg-gray-800"
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
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Confirmados</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {attendanceReport.confirmados}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="text-gray-600 dark:text-gray-300" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Asistieron</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {attendanceReport.asistieron}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-gray-600 dark:text-gray-300" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">No Shows</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {attendanceReport.noShows}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <XCircle className="text-gray-600 dark:text-gray-300" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasa Asistencia</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {attendanceReport.tasaAsistencia.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PieChart className="text-gray-600 dark:text-gray-300" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de No Shows */}
              {attendanceReport.noShowsList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">No Shows (Confirmaron pero no asistieron)</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {attendanceReport.noShowsList.map((name, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <XCircle size={14} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
