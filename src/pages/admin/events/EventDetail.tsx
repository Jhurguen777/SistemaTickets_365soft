import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Camera,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  UserPlus,
  UserMinus
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import QRScanner from '@/components/admin/QRScanner'
import adminService from '@/services/adminService'
import { Event, PurchaseWithAttendees, Attendee, AsistenciaStatus } from '@/types/admin'

type AttendanceFilter = 'todos' | 'confirmados' | 'asistieron' | 'no-shows'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [purchases, setPurchases] = useState<PurchaseWithAttendees[]>([])
  const [stats, setStats] = useState({
    total: 0,
    confirmados: 0,
    asistieron: 0,
    noShows: 0,
    pendientes: 0
  })
  const [loading, setLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set())
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>('todos')

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

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
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return
    }

    try {
      await adminService.deleteEvent(id!)
      window.location.href = '/admin/eventos'
    } catch (error: any) {
      alert(error.message || 'Error al eliminar evento')
    }
  }

  const handleMarkAttendance = async (attendeeId: string) => {
    try {
      await adminService.markAttendance(attendeeId)
      await loadData()
    } catch (error) {
      alert('Error al marcar asistencia')
    }
  }

  const handleUnmarkAttendance = async (attendeeId: string) => {
    try {
      await adminService.unmarkAttendance(attendeeId)
      await loadData()
    } catch (error) {
      alert('Error al desmarcar asistencia')
    }
  }

  const handleMarkNoShow = async (attendeeId: string) => {
    if (!confirm('¿Marcar este asistente como NO SHOW?')) return

    try {
      await adminService.markNoShow(attendeeId)
      await loadData()
    } catch (error) {
      alert('Error al marcar como NO SHOW')
    }
  }

  const handleScanSuccess = async (attendee: Attendee) => {
    try {
      await adminService.markAttendance(attendee.id)
      await loadData()
      setTimeout(() => {
        alert(`✅ Asistencia marcada: ${attendee.nombre}`)
      }, 1000)
    } catch (error) {
      alert('Error al marcar asistencia')
    }
  }

  const togglePurchaseExpanded = (purchaseId: string) => {
    const newExpanded = new Set(expandedPurchases)
    if (newExpanded.has(purchaseId)) {
      newExpanded.delete(purchaseId)
    } else {
      newExpanded.add(purchaseId)
    }
    setExpandedPurchases(newExpanded)
  }

  const handleExportList = () => {
    alert('Exportando lista de asistentes a PDF/Excel...')
  }

  // Filtrar asistentes
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchTerm === '' ||
      purchase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSector = sectorFilter === 'todos' ||
      purchase.invitados.some(inv => inv.sector === sectorFilter)

    // Verificar si algún invitado coincide con el filtro de asistencia
    const matchesAttendance = attendanceFilter === 'todos' ||
      purchase.invitados.some(inv => {
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
        <Icon size={12} />
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Evento no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          eventId={event.id}
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-1">Vista detallada del evento</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link to={`/eventos/${event.id}`}>
            <Button variant="outline" size="sm">
              <Eye size={18} className="mr-2" />
              Ver en Sitio
            </Button>
          </Link>
          <Link to={`/admin/eventos/${event.id}/editar`}>
            <Button variant="outline" size="sm">
              <Edit size={18} className="mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={18} className="mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <Card>
            <CardContent className="p-6">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-semibold">
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{event.time} (Puertas: {event.doorsOpen})</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-semibold">{event.location}</p>
                    <p className="text-sm text-gray-600">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Capacidad</p>
                    <p className="font-semibold">{event.capacity.toLocaleString()} personas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Precio Base</p>
                    <p className="font-semibold">Bs {event.price}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-line">{event.longDescription || event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Control de Asistencia</h3>
                  <p className="text-sm text-gray-600 mt-1">Gestión de entrada de asistentes</p>
                </div>
                <Button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center gap-2"
                >
                  <Camera size={18} />
                  Escanear QR
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">{stats.confirmados}</p>
                  <p className="text-xs text-blue-600">Confirmados</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">{stats.asistieron}</p>
                  <p className="text-xs text-green-600">Asistieron</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">{stats.noShows}</p>
                  <p className="text-xs text-red-600">No Shows</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-400" />
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value as AttendanceFilter)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="confirmados">Confirmados</option>
                    <option value="asistieron">Asistieron</option>
                    <option value="no-shows">No Shows</option>
                  </select>

                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="todos">Todos los sectores</option>
                    {event.sectors.map(sector => (
                      <option key={sector.id} value={sector.name}>{sector.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleExportList}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download size={18} />
                  Exportar
                </button>
              </div>

              {/* Attendees List with Expandable Rows */}
              <div className="space-y-4">
                {filteredPurchases.map((purchase) => {
                  const isExpanded = expandedPurchases.has(purchase.id)
                  const asistentesCount = purchase.invitados.length
                  const asistieronCount = purchase.invitados.filter(i => i.asistencia === 'ASISTIO').length

                  return (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Main Row - Comprador */}
                      <div
                        className={`p-4 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => togglePurchaseExpanded(purchase.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {purchase.nombre.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{purchase.nombre}</p>
                                <span className="text-sm text-gray-500">COMPRADOR</span>
                              </div>
                              <p className="text-sm text-gray-600">{purchase.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Entradas</p>
                              <p className="font-bold text-gray-900">{asistentesCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Asistencia</p>
                              <p className="font-bold text-green-600">{asistieronCount}/{asistentesCount}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">Bs {purchase.totalPagado.toLocaleString()}</p>
                              {getStatusBadge(purchase.estadoPago === 'PAGADO' ? 'CONFIRMADO' : 'PENDIENTE' as AsistenciaStatus)}
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Row - Invitados */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="space-y-3">
                            {purchase.invitados.map((attendee) => (
                              <div
                                key={attendee.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {attendee.nombre.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{attendee.nombre}</p>
                                    <p className="text-xs text-gray-600">CI: {attendee.ci}</p>
                                    <p className="text-xs text-gray-600">{attendee.email}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Asiento</p>
                                    <p className="font-bold text-gray-900">{attendee.asiento}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Sector</p>
                                    <p className="text-sm font-semibold text-purple-700">{attendee.sector}</p>
                                  </div>
                                  <div>
                                    {getStatusBadge(attendee.asistencia)}
                                    {attendee.horaCheckIn && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(attendee.horaCheckIn).toLocaleTimeString('es-ES', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    {attendee.asistencia === 'CONFIRMADO' && (
                                      <>
                                        <button
                                          onClick={() => handleMarkAttendance(attendee.id)}
                                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Marcar asistencia"
                                        >
                                          <UserPlus size={18} />
                                        </button>
                                        <button
                                          onClick={() => handleMarkNoShow(attendee.id)}
                                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Marcar como No Show"
                                        >
                                          <UserMinus size={18} />
                                        </button>
                                      </>
                                    )}
                                    {attendee.asistencia === 'ASISTIO' && (
                                      <button
                                        onClick={() => handleUnmarkAttendance(attendee.id)}
                                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Desmarcar asistencia"
                                      >
                                        <UserMinus size={18} />
                                      </button>
                                    )}
                                    {attendee.asistencia === 'NO_SHOW' && (
                                      <button
                                        onClick={() => handleUnmarkAttendance(attendee.id)}
                                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Cambiar a Confirmado"
                                      >
                                        <UserPlus size={18} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredPurchases.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No se encontraron asistentes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Sectores</p>
                  <p className="text-2xl font-bold text-gray-900">{event.sectors.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asistentes Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Asistencia</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.total > 0 ? ((stats.asistieron / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organizador</p>
                  <p className="font-semibold text-gray-900">{event.organizer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sectors */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Sectores</h3>
              <div className="space-y-3">
                {event.sectors.map((sector) => (
                  <div key={sector.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-900">{sector.name}</p>
                      <p className="text-lg font-bold text-primary">Bs {sector.price}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Disponibles: {sector.available}</span>
                      <span className="text-gray-600">
                        Total: {sector.total || sector.available + (event.totalTicketsSold || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
