import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Users,
  Ticket,
  Download,
  BarChart3,
  PieChart,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import adminService from '@/services/adminService'
import api from '@/services/api'
import { FinancialReport, AttendanceReport, SectorStats } from '@/types/admin'

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'ventas' | 'financiero' | 'asistencia'>('ventas')
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  const [ventasPorPeriodo, setVentasPorPeriodo] = useState<{ periodo: string; ventas: number; ingresos: number }[]>([])
  const [sectorStats, setSectorStats] = useState<SectorStats[]>([])
  const [rawCompras, setRawCompras] = useState<any[]>([])

  useEffect(() => { loadData() }, [selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Eventos reales
      const eventsData = await adminService.getEvents()
      setEvents(eventsData)

      // 2. Compras reales
      const comprasRes = await api.get('/compras', { params: { limit: 1000 } })
      const compras: any[] = comprasRes.data?.data?.compras
        ?? comprasRes.data?.data
        ?? comprasRes.data
        ?? []
      setRawCompras(compras)

      // 3-5. Calcular todo desde datos reales
      calcularVentasPorPeriodo(compras, selectedPeriod)
      calcularSectorStats(compras, eventsData)
      calcularFinancialReport(compras, eventsData)

      // 6. Asistencia del primer evento
      if (eventsData.length > 0) {
        const firstId = eventsData[0].id
        setSelectedEventId(firstId)
        await cargarAsistencia(firstId, compras)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularVentasPorPeriodo = (compras: any[], period: 'week' | 'month') => {
    const pagadas = compras.filter(c => c.estadoPago === 'PAGADO' || c.estado === 'PAGADO')

    if (period === 'week') {
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const hoy = new Date()
      const resultado: { periodo: string; ventas: number; ingresos: number }[] = []

      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setDate(hoy.getDate() - i)
        const diaLabel = dias[fecha.getDay()]
        const fechaStr = fecha.toISOString().split('T')[0]

        const comprasDia = pagadas.filter(c => {
          const f = (c.createdAt || c.fechaCompra || '').split('T')[0]
          return f === fechaStr
        })

        resultado.push({
          periodo: diaLabel,
          ventas: comprasDia.length,
          ingresos: comprasDia.reduce((sum, c) => sum + (c.monto || 0), 0)
        })
      }
      setVentasPorPeriodo(resultado)
    } else {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const hoy = new Date()
      const resultado: { periodo: string; ventas: number; ingresos: number }[] = []

      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
        const mes = fecha.getMonth()
        const anio = fecha.getFullYear()

        const comprasMes = pagadas.filter(c => {
          const f = new Date(c.createdAt || c.fechaCompra || '')
          return f.getMonth() === mes && f.getFullYear() === anio
        })

        resultado.push({
          periodo: meses[mes],
          ventas: comprasMes.length,
          ingresos: comprasMes.reduce((sum, c) => sum + (c.monto || 0), 0)
        })
      }
      setVentasPorPeriodo(resultado)
    }
  }

  const calcularSectorStats = (compras: any[], eventsData: any[]) => {
    const pagadas = compras.filter(c => c.estadoPago === 'PAGADO' || c.estado === 'PAGADO')
    const sectoresMap: Record<string, { ventas: number; ingresos: number }> = {}

    pagadas.forEach(c => {
      const sectorNombre = c.asiento?.sector?.nombre
        || c.sector?.nombre
        || c.sectorNombre
        || 'General'

      if (!sectoresMap[sectorNombre]) sectoresMap[sectorNombre] = { ventas: 0, ingresos: 0 }
      sectoresMap[sectorNombre].ventas += 1
      sectoresMap[sectorNombre].ingresos += c.monto || 0
    })

    // Fallback: usar sectores de eventos si no hay info en compras
    if (Object.keys(sectoresMap).length === 0) {
      eventsData.forEach(evt => {
        evt.sectors?.forEach((s: any) => {
          const vendidos = evt.totalTicketsSold || 0
          const pct = s.total > 0 ? s.total / (evt.capacity || 1) : 0
          sectoresMap[s.name] = {
            ventas: Math.round(vendidos * pct),
            ingresos: Math.round(vendidos * pct) * s.price
          }
        })
      })
    }

    const totalVentas = Object.values(sectoresMap).reduce((sum, s) => sum + s.ventas, 0)

    const stats: SectorStats[] = Object.entries(sectoresMap).map(([name, data]) => ({
      name,
      ventas: data.ventas,
      ingresos: data.ingresos,
      porcentaje: totalVentas > 0 ? (data.ventas / totalVentas) * 100 : 0
    }))

    setSectorStats(stats)
  }

  const calcularFinancialReport = (compras: any[], eventsData: any[]) => {
    const pagadas = compras.filter(c => c.estadoPago === 'PAGADO' || c.estado === 'PAGADO')

    const totalRecaudado = pagadas.reduce((sum, c) => sum + (c.monto || 0), 0)
    const promedioTicket = pagadas.length > 0 ? totalRecaudado / pagadas.length : 0

    const porEventoMap: Record<string, { title: string; total: number; vendidos: number }> = {}

    pagadas.forEach(c => {
      const eId = c.eventoId || c.evento?.id
      const eTitle = c.evento?.titulo || eventsData.find(e => e.id === eId)?.title || 'Sin nombre'
      if (!porEventoMap[eId]) porEventoMap[eId] = { title: eTitle, total: 0, vendidos: 0 }
      porEventoMap[eId].total += c.monto || 0
      porEventoMap[eId].vendidos += 1
    })

    // Complementar con eventos sin compras
    eventsData.forEach(evt => {
      if (!porEventoMap[evt.id]) {
        porEventoMap[evt.id] = {
          title: evt.title,
          total: evt.totalSales || 0,
          vendidos: evt.totalTicketsSold || 0
        }
      }
    })

    const porEvento = Object.entries(porEventoMap).map(([eventId, data]) => ({
      eventId,
      eventTitle: data.title,
      totalRecaudado: data.total,
      totalVendidos: data.vendidos,
      sectors: []
    }))

    const totalCapacidad = eventsData.reduce((sum, e) => sum + (e.capacity || 0), 0)
    const ocupacionPromedio = totalCapacidad > 0 ? (pagadas.length / totalCapacidad) * 100 : 0

    const fallback = { eventTitle: '-', totalVendidos: 0 }
    const eventoTop = porEvento.reduce((max, e) => e.totalVendidos > max.totalVendidos ? e : max, porEvento[0] || fallback)
    const eventoMin = porEvento.reduce((min, e) => e.totalVendidos < min.totalVendidos ? e : min, porEvento[0] || fallback)

    setFinancialReport({
      totalRecaudado,
      porEvento,
      promedioTicket,
      ocupacionPromedio,
      eventoMasVendido:   { title: eventoTop?.eventTitle || '-', ventas: eventoTop?.totalVendidos || 0 },
      eventoMenosVendido: { title: eventoMin?.eventTitle || '-', ventas: eventoMin?.totalVendidos || 0 }
    })
  }

  const cargarAsistencia = async (eventId: string, compras?: any[]) => {
    // Intentar endpoint real primero
    try {
      const res = await api.get(`/asistencia/evento/${eventId}`)
      const data = res.data?.data
      if (data) { setAttendanceReport(data); return }
    } catch { /* fallback */ }

    // Calcular desde compras
    const allCompras = compras || rawCompras
    const comprasEvento = allCompras.filter(c =>
      (c.eventoId || c.evento?.id) === eventId &&
      (c.estadoPago === 'PAGADO' || c.estado === 'PAGADO')
    )

    const confirmados = comprasEvento.length
    const asistieron  = comprasEvento.filter(c => c.asistencia === 'ASISTIO' || c.checkIn === true || c.horaCheckIn).length
    const noShows     = comprasEvento.filter(c => c.asistencia === 'NO_SHOW').length
    const tasaAsistencia = confirmados > 0 ? (asistieron / confirmados) * 100 : 0
    const evt = events.find(e => e.id === eventId)

    setAttendanceReport({
      eventId,
      eventTitle: evt?.title || 'Evento',
      confirmados,
      asistieron,
      noShows,
      tasaAsistencia,
      asistentes: comprasEvento
        .filter(c => c.asistencia === 'ASISTIO' || c.horaCheckIn)
        .map(c => c.asistente?.nombre || c.nombre || `Asistente #${c.id?.slice(-4)}`),
      noShowsList: comprasEvento
        .filter(c => c.asistencia === 'NO_SHOW')
        .map(c => c.asistente?.nombre || c.nombre || `Asistente #${c.id?.slice(-4)}`)
    })
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Reportes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Datos en tiempo real desde el backend</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <FileText size={16} />
            PDF
          </button>
          <button onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          {(['ventas', 'financiero', 'asistencia'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}>
              {tab === 'ventas' ? 'REPORTE DE VENTAS' : tab === 'financiero' ? 'REPORTE FINANCIERO' : 'REPORTE DE ASISTENCIA'}
            </button>
          ))}
        </nav>
      </div>

      {/* ── VENTAS ── */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Período:</label>
            <select value={selectedPeriod}
              onChange={e => {
                const p = e.target.value as 'week' | 'month'
                setSelectedPeriod(p)
                calcularVentasPorPeriodo(rawCompras, p)
              }}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white dark:bg-gray-800">
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
            </select>
          </div>

          {/* KPIs del período */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Ventas',   value: ventasPorPeriodo.reduce((s, v) => s + v.ventas, 0),   suffix: ' tickets' },
              { label: 'Total Ingresos', value: ventasPorPeriodo.reduce((s, v) => s + v.ingresos, 0), prefix: 'Bs ' },
              { label: 'Mejor Día',      value: ventasPorPeriodo.reduce((max, v) => v.ventas > max.ventas ? v : max, ventasPorPeriodo[0] || { periodo: '-', ventas: 0, ingresos: 0 }).periodo, isText: true },
              { label: 'Pico Ingresos',  value: Math.max(...ventasPorPeriodo.map(v => v.ingresos), 0), prefix: 'Bs ' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {kpi.isText ? kpi.value : `${kpi.prefix ?? ''}${Number(kpi.value).toLocaleString()}${kpi.suffix ?? ''}`}
                </p>
              </div>
            ))}
          </div>

          {/* Tabla por período */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Ventas por {selectedPeriod === 'week' ? 'Día' : 'Mes'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Período</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Tickets</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPorPeriodo.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">{row.periodo}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-300">{row.ventas}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">Bs {row.ingresos.toLocaleString()}</td>
                    </tr>
                  ))}
                  {ventasPorPeriodo.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-sm text-gray-400">Sin datos de ventas para este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribución por sector */}
          {sectorStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Detalles por Sector</h3>
              <div className="space-y-4">
                {sectorStats.map(sector => (
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
                      <div className="bg-gray-900 h-2 rounded-full transition-all" style={{ width: `${sector.porcentaje}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FINANCIERO ── */}
      {activeTab === 'financiero' && financialReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Recaudado',   value: `Bs ${financialReport.totalRecaudado.toLocaleString()}`,    icon: DollarSign },
              { label: 'Promedio Ticket',   value: `Bs ${financialReport.promedioTicket.toFixed(2)}`,          icon: Ticket },
              { label: 'Ocupación Promedio',value: `${financialReport.ocupacionPromedio.toFixed(1)}%`,         icon: BarChart3 },
              { label: 'Mejor Evento',      value: financialReport.eventoMasVendido.title,
                sub: `${financialReport.eventoMasVendido.ventas} ventas`,                                       icon: TrendingUp },
            ].map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1 truncate">{kpi.value}</p>
                      {kpi.sub && <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.sub}</p>}
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                      <Icon className="text-gray-600 dark:text-gray-300" size={20} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

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
                  {financialReport.porEvento.map((evento: any) => (
                    <tr key={evento.eventId} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">{evento.eventTitle}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">Bs {evento.totalRecaudado.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-300">{evento.totalVendidos}</td>
                    </tr>
                  ))}
                  {financialReport.porEvento.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-sm text-gray-400">Sin datos financieros</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ASISTENCIA ── */}
      {activeTab === 'asistencia' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Evento:</label>
            <select value={selectedEventId}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white dark:bg-gray-800"
              onChange={async e => {
                setSelectedEventId(e.target.value)
                await cargarAsistencia(e.target.value)
              }}>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>

          {attendanceReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Confirmados',     value: attendanceReport.confirmados,                       icon: Users },
                  { label: 'Asistieron',      value: attendanceReport.asistieron,                        icon: CheckCircle },
                  { label: 'No Shows',        value: attendanceReport.noShows,                           icon: XCircle },
                  { label: 'Tasa Asistencia', value: `${attendanceReport.tasaAsistencia.toFixed(1)}%`,   icon: PieChart },
                ].map((kpi, i) => {
                  const Icon = kpi.icon
                  return (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="text-gray-600 dark:text-gray-300" size={20} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {attendanceReport.noShowsList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      No Shows ({attendanceReport.noShowsList.length})
                    </h3>
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

              {attendanceReport.confirmados === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">No hay compras registradas para este evento aún.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}