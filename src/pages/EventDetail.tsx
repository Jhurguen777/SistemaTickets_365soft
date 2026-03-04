import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, DollarSign,
  Eye, Camera, Filter, Search, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Download, UserPlus, UserMinus,
  Map as MapIcon, X
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import QRScanner from '@/components/admin/QRScanner'
import adminService from '@/services/adminService'
import { Event, PurchaseWithAttendees, Attendee, AsistenciaStatus } from '@/types/admin'
import api from '@/services/api'

interface Sector { id: string; name: string; color: string; price: number }
interface Row { id: string; name: string; seats: number; columns: number; order: number; sectorId?: string }
interface SeatMapConfig { sectors?: Sector[]; rows?: Row[]; specialSeats?: any[] }
type AttendanceFilter = 'todos' | 'confirmados' | 'asistieron' | 'no-shows'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [seatMapConfig, setSeatMapConfig] = useState<SeatMapConfig | null>(null)
  const [showSeatMapModal, setShowSeatMapModal] = useState(false)
  const [purchases, setPurchases] = useState<PurchaseWithAttendees[]>([])
  const [stats, setStats] = useState({ total: 0, confirmados: 0, asistieron: 0, noShows: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set())
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>('todos')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { if (id) loadData() }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventData, purchasesData, statsData] = await Promise.all([
        adminService.getEventById(id!),
        adminService.getEventAttendees(id!),
        adminService.getAttendeesStats(id!)
      ])
      setEvent(eventData)
      setPurchases(purchasesData)
      setStats(statsData)
      try {
        const response = await api.get(`/eventos/${id}`)
        if (response.data.data.seatMapConfig) setSeatMapConfig(response.data.data.seatMapConfig)
      } catch {}
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este evento?')) return
    try { await adminService.deleteEvent(id!); window.location.href = '/admin/eventos' }
    catch (error: any) { alert(error.message || 'Error al eliminar') }
  }

  const handleMarkAttendance = async (attendeeId: string) => {
    try { await adminService.markAttendance(attendeeId); await loadData() }
    catch { alert('Error al marcar asistencia') }
  }
  const handleUnmarkAttendance = async (attendeeId: string) => {
    try { await adminService.unmarkAttendance(attendeeId); await loadData() }
    catch { alert('Error al desmarcar asistencia') }
  }
  const handleMarkNoShow = async (attendeeId: string) => {
    if (!confirm('¿Marcar como NO SHOW?')) return
    try { await adminService.markNoShow(attendeeId); await loadData() }
    catch { alert('Error al marcar como NO SHOW') }
  }
  const handleScanSuccess = async (attendee: Attendee) => {
    try {
      await adminService.markAttendance(attendee.id)
      await loadData()
      setTimeout(() => alert(`✅ Asistencia marcada: ${attendee.nombre}`), 1000)
    } catch { alert('Error al marcar asistencia') }
  }

  const togglePurchaseExpanded = (purchaseId: string) => {
    const n = new Set(expandedPurchases)
    n.has(purchaseId) ? n.delete(purchaseId) : n.add(purchaseId)
    setExpandedPurchases(n)
  }

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchTerm === '' ||
      purchase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = sectorFilter === 'todos' || purchase.invitados.some(inv => inv.sector === sectorFilter)
    const matchesAttendance = attendanceFilter === 'todos' || purchase.invitados.some(inv => {
      if (attendanceFilter === 'confirmados') return inv.asistencia === 'CONFIRMADO'
      if (attendanceFilter === 'asistieron') return inv.asistencia === 'ASISTIO'
      if (attendanceFilter === 'no-shows') return inv.asistencia === 'NO_SHOW'
      return true
    })
    return matchesSearch && matchesSector && matchesAttendance
  })

  const getStatusBadge = (status: AsistenciaStatus) => {
    const badges = {
      PENDIENTE: { label: 'Pendiente', className: 'bg-gray-100 text-gray-700', icon: Clock },
      CONFIRMADO: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      ASISTIO: { label: 'Asistió', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      'NO_SHOW': { label: 'No Show', className: 'bg-red-100 text-red-700', icon: XCircle }
    }
    const { label, className, icon: Icon } = badges[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${className}`}>
        <Icon size={11} />{label}
      </span>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
  if (!event) return <div className="text-center py-12"><p className="text-gray-600">Evento no encontrado</p></div>

  return (
    <div className="space-y-4 sm:space-y-6">
      {showQRScanner && (
        <QRScanner eventId={event.id} onScanSuccess={handleScanSuccess} onClose={() => setShowQRScanner(false)} />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{event.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Vista detallada del evento</p>
          </div>
        </div>
        {/* Botones de acción — scroll horizontal en móvil */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 ml-9 sm:ml-0">
          <Link to={`/eventos/${event.id}`} className="flex-shrink-0">
            <Button variant="outline" size="sm" className="text-xs px-3 py-1.5">
              <Eye size={14} className="mr-1" />Ver Sitio
            </Button>
          </Link>
          <Link to={`/admin/eventos/${event.id}/editar`} className="flex-shrink-0">
            <Button variant="outline" size="sm" className="text-xs px-3 py-1.5">
              <Edit size={14} className="mr-1" />Editar
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs px-3 py-1.5 flex-shrink-0">
            <Trash2 size={14} className="mr-1" />Eliminar
          </Button>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Event Info Card */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <img src={event.image} alt={event.title} className="w-full h-40 sm:h-64 object-cover rounded-lg mb-4 sm:mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Fecha y Hora', value: new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), sub: `${event.time} (Puertas: ${event.doorsOpen})` },
                  { icon: MapPin, label: 'Ubicación', value: event.location, sub: event.address },
                  { icon: Users, label: 'Capacidad', value: `${event.capacity.toLocaleString()} personas` },
                  { icon: DollarSign, label: 'Precio Base', value: `Bs ${event.price}` },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="text-primary flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{value}</p>
                      {sub && <p className="text-xs text-gray-500">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-1">Descripción</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.longDescription || event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              {/* Attendance header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Control de Asistencia</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Gestión de entrada de asistentes</p>
                </div>
                <Button onClick={() => setShowQRScanner(true)} size="sm" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
                  <Camera size={14} />
                  <span className="hidden sm:inline">Escanear</span> QR
                </Button>
              </div>

              {/* Stats grid — 2 cols en móvil, 4 en desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
                {[
                  { label: 'Total', value: stats.total, bg: 'bg-gray-50', text: 'text-gray-900' },
                  { label: 'Confirmados', value: stats.confirmados, bg: 'bg-blue-50', text: 'text-blue-900' },
                  { label: 'Asistieron', value: stats.asistieron, bg: 'bg-green-50', text: 'text-green-900' },
                  { label: 'No Shows', value: stats.noShows, bg: 'bg-red-50', text: 'text-red-900' },
                ].map(({ label, value, bg, text }) => (
                  <div key={label} className={`text-center p-2 sm:p-3 ${bg} rounded-lg`}>
                    <p className={`text-xl sm:text-2xl font-bold ${text}`}>{value}</p>
                    <p className="text-xs text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              {/* Filters — colapsables en móvil */}
              <div className="mb-4">
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="sm:hidden flex items-center gap-2 text-sm text-gray-600 font-medium mb-2"
                >
                  <Filter size={14} />
                  Filtros {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2`}>
                  <select
                    value={attendanceFilter}
                    onChange={e => setAttendanceFilter(e.target.value as AttendanceFilter)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="confirmados">Confirmados</option>
                    <option value="asistieron">Asistieron</option>
                    <option value="no-shows">No Shows</option>
                  </select>
                  <select
                    value={sectorFilter}
                    onChange={e => setSectorFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary"
                  >
                    <option value="todos">Todos los sectores</option>
                    {event.sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => alert('Exportando...')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                  >
                    <Download size={14} />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Attendees list */}
              <div className="space-y-3">
                {filteredPurchases.map(purchase => {
                  const isExpanded = expandedPurchases.has(purchase.id)
                  const asistieronCount = purchase.invitados.filter(i => i.asistencia === 'ASISTIO').length

                  return (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Purchase row */}
                      <div
                        className={`p-3 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                        onClick={() => togglePurchaseExpanded(purchase.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {purchase.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-gray-900 text-sm truncate">{purchase.nombre}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-green-600 font-bold">{asistieronCount}/{purchase.invitados.length}</span>
                                {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{purchase.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{purchase.invitados.length} entrada(s)</span>
                              <span className="text-xs font-semibold text-gray-900">Bs {purchase.totalPagado.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded attendees */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                          {purchase.invitados.map(attendee => (
                            <div key={attendee.id} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {attendee.nombre.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 text-xs">{attendee.nombre}</p>
                                    <p className="text-xs text-gray-500">CI: {attendee.ci}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {attendee.asistencia === 'CONFIRMADO' && (
                                    <>
                                      <button onClick={() => handleMarkAttendance(attendee.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Marcar asistencia"><UserPlus size={14} /></button>
                                      <button onClick={() => handleMarkNoShow(attendee.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="No Show"><UserMinus size={14} /></button>
                                    </>
                                  )}
                                  {attendee.asistencia === 'ASISTIO' && (
                                    <button onClick={() => handleUnmarkAttendance(attendee.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><UserMinus size={14} /></button>
                                  )}
                                  {attendee.asistencia === 'NO_SHOW' && (
                                    <button onClick={() => handleUnmarkAttendance(attendee.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><UserPlus size={14} /></button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Asiento: <strong>{attendee.asiento}</strong></span>
                                  <span className="text-xs text-purple-700 font-semibold">{attendee.sector}</span>
                                </div>
                                {getStatusBadge(attendee.asistencia)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredPurchases.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={36} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No se encontraron asistentes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Stats */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base font-bold mb-3">Estadísticas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                {[
                  { label: 'Sectores', value: event.sectors.length },
                  { label: 'Asistentes Registrados', value: stats.total },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-600">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-gray-600">Tasa de Asistencia</p>
                  <p className="text-xl font-bold text-green-600">
                    {stats.total > 0 ? ((stats.asistieron / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Organizador</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{event.organizer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sectors */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base font-bold mb-3">Sectores</h3>
              <div className="space-y-2">
                {event.sectors.map(sector => (
                  <div key={sector.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{sector.name}</p>
                      <p className="text-base font-bold text-primary">Bs {sector.price}</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Disponibles: {sector.available}</span>
                      <span>Total: {sector.total || sector.available}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seat Map */}
          {seatMapConfig?.rows && seatMapConfig.rows.length > 0 && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base font-bold mb-2">Mapa de Asientos</h3>
                <p className="text-xs text-gray-500 mb-3">Visualiza la distribución de asientos</p>
                <Button onClick={() => setShowSeatMapModal(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                  <MapIcon size={16} className="mr-2" />Ver Mapa Completo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Seat Map Modal ── */}
      {showSeatMapModal && seatMapConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
            <div className="fixed inset-0 bg-gray-900/75" onClick={() => setShowSeatMapModal(false)} />
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Mapa de Asientos</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{event?.title}</p>
                </div>
                <button onClick={() => setShowSeatMapModal(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-auto flex-1 p-4 sm:p-8">
                <div className="min-w-max">
                  <div className="mb-4 text-center">
                    <div className="inline-block px-8 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg tracking-widest">ESCENARIO</div>
                  </div>
                  {seatMapConfig.sectors && seatMapConfig.sectors.length > 0 && (
                    <div className="mb-6 pb-4 border-b flex flex-wrap justify-center gap-3">
                      {seatMapConfig.sectors.map(sector => (
                        <div key={sector.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: sector.color, borderColor: sector.color }} />
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{sector.name}</p>
                            <p className="text-xs text-gray-500">Bs {sector.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    {seatMapConfig.rows?.sort((a, b) => a.order - b.order).map(row => {
                      const sector = seatMapConfig.sectors?.find(s => s.id === row.sectorId)
                      const seatsPerColumn = Math.ceil(row.seats / (row.columns || 1))
                      const columns = Array.from({ length: row.columns || 1 }, (_, col) => {
                        const start = col * seatsPerColumn
                        return Array.from({ length: Math.min(seatsPerColumn, row.seats - start) }, (_, i) => start + i)
                      })
                      return (
                        <div key={row.id} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 w-20 text-right flex-shrink-0">{row.name}</span>
                          <div className="flex gap-1.5">
                            {columns.map((columnSeats, colIndex) => (
                              <React.Fragment key={colIndex}>
                                <div className="flex gap-1">
                                  {columnSeats.map(seatIndex => {
                                    const sp = seatMapConfig.specialSeats?.find((s: any) => s.rowId === row.id && s.seatIndex === seatIndex)
                                    return (
                                      <div key={seatIndex} className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium border"
                                        style={{ backgroundColor: sp?.color || sector?.color || '#E5E7EB', borderColor: sp?.color || sector?.color || '#D1D5DB', color: '#fff' }}
                                        title={`${row.name} - Asiento ${seatIndex + 1}`}>
                                        {seatIndex + 1}
                                      </div>
                                    )
                                  })}
                                </div>
                                {colIndex < columns.length - 1 && <div className="w-6 flex items-center justify-center"><div className="w-0.5 h-4 bg-gray-300 rounded" /></div>}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t flex-shrink-0">
                <Button onClick={() => setShowSeatMapModal(false)} variant="outline" size="sm">Cerrar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}