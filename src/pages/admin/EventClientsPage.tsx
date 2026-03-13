import { useState, useEffect, useMemo } from 'react'
import {
  User, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle, Clock,
  ArrowLeft, Search, Download, Filter, Eye, Check, X, ChevronLeft, ChevronRight,
  FileText, Info, QrCode, RefreshCw
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { RegisteredUser } from '@/types/admin'
import adminService from '@/services/adminService'
import asistenciaService from '@/services/asistenciaService'

type AsistenciaFilter = 'all' | 'present' | 'pending'

export default function EventClientsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [clients, setClients] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(false)
  const [eventTitle, setEventTitle] = useState<string>('')

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [asistenciaFilter, setAsistenciaFilter] = useState<AsistenciaFilter>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal de detalles
  const [selectedClient, setSelectedClient] = useState<RegisteredUser | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Acciones
  const [markingAsistencia, setMarkingAsistencia] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadClients()
    }
  }, [id])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await adminService.getEventUsers(id!)
      setClients(data)
      if (data.length > 0 && data[0].eventTitle) {
        setEventTitle(data[0].eventTitle)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrado de datos
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchSearch =
        client.nombre.toLowerCase().includes(searchLower) ||
        client.apellido?.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.documento?.toLowerCase().includes(searchLower) ||
        client.telefono?.toLowerCase().includes(searchLower)

      // Filtro de asistencia
      const matchAsistencia =
        asistenciaFilter === 'all' ||
        (asistenciaFilter === 'present' && client.asistenciaRegistrada) ||
        (asistenciaFilter === 'pending' && !client.asistenciaRegistrada)

      // Filtro de sector
      const matchSector = sectorFilter === 'all' || client.sector === sectorFilter

      return matchSearch && matchAsistencia && matchSector
    })
  }, [clients, searchTerm, asistenciaFilter, sectorFilter])

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Obtener sectores únicos para el filtro
  const uniqueSectors = useMemo(() => {
    const sectors = [...new Set(clients.map(c => c.sector))].filter(Boolean)
    return sectors.sort()
  }, [clients])

  // Estadísticas
  const stats = useMemo(() => {
    const total = clients.length
    const asistieron = clients.filter(c => c.asistenciaRegistrada).length
    const pendientes = total - asistieron
    const totalRecaudado = clients.reduce((sum, c) => sum + c.totalPagado, 0)

    return {
      total,
      asistieron,
      pendientes,
      porcentajeAsistencia: total > 0 ? ((asistieron / total) * 100).toFixed(1) : '0',
      totalRecaudado
    }
  }, [clients])

  // Marcar asistencia manualmente
  const handleMarkAsistencia = async (clientId: string) => {
    try {
      setMarkingAsistencia(clientId)
      const client = clients.find(c => c.id === clientId)
      if (!client) return

      // Llamar al servicio de asistencia (asumimos que hay un endpoint para marcar asistencia manual)
      await asistenciaService.registrarAsistenciaManual({
        compraId: client.id,
        adminId: 'admin' // TODO: Obtener del contexto de autenticación
      })

      // Actualizar estado local
      setClients(prev => prev.map(c =>
        c.id === clientId
          ? { ...c, asistenciaRegistrada: true, fechaAsistencia: new Date().toISOString() }
          : c
      ))
    } catch (error) {
      console.error('Error marcando asistencia:', error)
      alert('Error al marcar asistencia')
    } finally {
      setMarkingAsistencia(null)
    }
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = [
      'Nombre',
      'Apellido',
      'Email',
      'Teléfono',
      'Documento',
      'Sector',
      'Asiento',
      'Total',
      'Fecha Compra',
      'Asistencia',
      'Fecha Asistencia',
      'Comprador'
    ]

    const rows = filteredClients.map(client => [
      client.nombre,
      client.apellido || '',
      client.email,
      client.telefono || '',
      client.documento || '',
      client.sector,
      client.asiento || 'General',
      client.totalPagado,
      new Date(client.fechaCompra).toLocaleDateString('es-ES'),
      client.asistenciaRegistrada ? 'Asistió' : 'Pendiente',
      client.fechaAsistencia
        ? new Date(client.fechaAsistencia).toLocaleDateString('es-ES')
        : '',
      client.comprador?.nombre || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `asistentes_${eventTitle || 'evento'}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('')
    setAsistenciaFilter('all')
    setSectorFilter('all')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </button>

        <button
          onClick={loadClients}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Título del evento y estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asistentes Registrados</h1>
            {eventTitle && (
              <p className="text-lg text-gray-700 mt-1">{eventTitle}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {stats.total} {stats.total === 1 ? 'asistente registrado' : 'asistentes registrados'}
            </p>
          </div>

          {/* Estadísticas en una sola fila */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm min-w-[120px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stats.asistieron}</div>
                  <div className="text-xs text-gray-500">Asistieron</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-green-600 mt-1">{stats.porcentajeAsistencia}%</div>
            </div>

            <div className="bg-white rounded-lg px-4 py-3 shadow-sm min-w-[120px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stats.pendientes}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-amber-600 mt-1">{((stats.pendientes / stats.total) * 100).toFixed(1) || 0}%</div>
            </div>

            <div className="bg-white rounded-lg px-4 py-3 shadow-sm min-w-[160px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Bs {stats.totalRecaudado.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas: búsqueda, filtros y acciones */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, documento o teléfono..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros y acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            {/* Filtro de asistencia */}
            <select
              value={asistenciaFilter}
              onChange={(e) => {
                setAsistenciaFilter(e.target.value as AsistenciaFilter)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="present">Asistieron</option>
              <option value="pending">Pendientes</option>
            </select>

            {/* Filtro de sector */}
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              disabled={uniqueSectors.length === 0}
            >
              <option value="all">Todos los sectores</option>
              {uniqueSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            {/* Resetear filtros */}
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando <strong>{paginatedClients.length}</strong> de <strong>{filteredClients.length}</strong> asistentes
          </span>
          {filteredClients.length !== clients.length && (
            <span className="text-xs text-gray-500">
              (se aplicaron filtros)
            </span>
          )}
        </div>
      </div>

      {/* Tabla de asistentes */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : paginatedClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg mb-2">
            {searchTerm || asistenciaFilter !== 'all' || sectorFilter !== 'all'
              ? 'No se encontraron asistentes con los filtros aplicados'
              : 'No hay asistentes registrados para este evento'
            }
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm || asistenciaFilter !== 'all' || sectorFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los asistentes aparecerán aquí cuando se registren'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><User size={14} />Asistente</div>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><Mail size={14} />Contacto</div>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><MapPin size={14} />Sector/Doc</div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Asiento
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 justify-end"><CreditCard size={14} />Total</div>
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><Calendar size={14} />Fecha</div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Asistencia
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client, index) => (
                <tr
                  key={client.id}
                  className={`border-b border-gray-100 hover:shadow-md transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {client.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{client.nombre}</div>
                        {client.apellido && (
                          <div className="text-sm text-gray-500">{client.apellido}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={13} className="text-gray-400" />
                        <span className="truncate max-w-[180px]">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        <span>{client.telefono || '-'}</span>
                      </div>
                      {client.comprador && (
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Info size={10} className="text-gray-400" />
                          Comprador: {client.comprador.nombre}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 shadow-sm">
                        {client.sector}
                      </span>
                      {client.documento && client.documento !== 'No registrado' && (
                        <div className="text-xs text-gray-500 font-medium">
                          Doc: {client.documento}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 shadow-sm border border-slate-200">
                      {client.asiento || 'General'}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-gray-900 text-base">
                      Bs {client.totalPagado.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(client.fechaCompra).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    {client.asistenciaRegistrada ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shadow-sm">
                        <CheckCircle size={12} />
                        Asistió
                        {client.fechaAsistencia && (
                          <span className="ml-1 text-xs font-medium">
                            {new Date(client.fechaAsistencia).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 shadow-sm">
                        <Clock size={12} />
                        Pendiente
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedClient(client)
                          setShowDetailsModal(true)
                        }}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>

                      {!client.asistenciaRegistrada && (
                        <button
                          onClick={() => handleMarkAsistencia(client.id)}
                          disabled={markingAsistencia === client.id}
                          className="p-2.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Marcar asistencia"
                        >
                          {markingAsistencia === client.id ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página <span className="font-bold text-gray-900">{currentPage}</span> de{' '}
                  <span className="font-bold text-gray-900">{totalPages}</span>
                  <span className="ml-2 text-gray-500">({filteredClients.length} total)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                              : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900 border border-transparent hover:border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles del asistente */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Detalles del Asistente</h2>
                  <p className="text-blue-100 text-sm">Información completa del registro</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Información personal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Nombre</div>
                    <div className="font-semibold text-gray-900">{selectedClient.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Apellido</div>
                    <div className="font-semibold text-gray-900">{selectedClient.apellido || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                    <div className="font-semibold text-gray-900">{selectedClient.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</div>
                    <div className="font-semibold text-gray-900">{selectedClient.telefono || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Documento</div>
                    <div className="font-semibold text-gray-900">{selectedClient.documento || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Oficina</div>
                    <div className="font-semibold text-gray-900">{selectedClient.oficina || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Información del ticket */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-green-600" />
                  Información del Ticket
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Sector</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 mt-1">
                      {selectedClient.sector}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Asiento</div>
                    <div className="font-mono font-bold text-gray-900">{selectedClient.asiento || 'General'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Total Pagado</div>
                    <div className="font-bold text-xl text-green-600">Bs {selectedClient.totalPagado.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Compra</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedClient.fechaCompra).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de asistencia */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-amber-600" />
                  Estado de Asistencia
                </h3>
                <div className={`rounded-xl p-4 ${
                  selectedClient.asistenciaRegistrada
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-amber-50 border-2 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                        selectedClient.asistenciaRegistrada
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedClient.asistenciaRegistrada ? (
                          <>
                            <CheckCircle size={20} />
                            Asistió al evento
                          </>
                        ) : (
                          <>
                            <Clock size={20} />
                            Pendiente de asistencia
                          </>
                        )}
                      </div>
                      {selectedClient.fechaAsistencia && (
                        <div className="text-sm text-gray-600 mt-2">
                          Hora de entrada:{' '}
                          <span className="font-semibold">
                            {new Date(selectedClient.fechaAsistencia).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    {!selectedClient.asistenciaRegistrada && (
                      <button
                        onClick={() => {
                          handleMarkAsistencia(selectedClient.id)
                          setShowDetailsModal(false)
                        }}
                        disabled={markingAsistencia === selectedClient.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {markingAsistencia === selectedClient.id ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            Marcar Asistencia
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del comprador */}
              {selectedClient.comprador && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info size={20} className="text-gray-600" />
                    Información del Comprador
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {selectedClient.comprador.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedClient.comprador.nombre}</div>
                        <div className="text-sm text-gray-600">{selectedClient.comprador.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <QrCode size={20} className="text-purple-600" />
                  Código QR de Acceso
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                      <QrCode size={64} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Código QR del asistente</p>
                    <p className="text-xs text-gray-400">ID: {selectedClient.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
