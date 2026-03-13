import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, EyeOff, Edit, Trash2, Filter, Calendar, MapPin, Tag, X, LayoutGrid, Hash, Users, DollarSign, MoreVertical, Ticket, TrendingUp, Clock, Settings } from 'lucide-react'
import adminService from '@/services/adminService'
import { AdminEvent } from '@/types/admin'

// ── Modal de selección de tipo de evento ──────────────────────────────────────
function EventTypeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                ¿Cómo quieres vender los tickets?
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Elige el tipo de evento antes de continuar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opción 1: Con mapa de asientos */}
          <Link
            to="/admin/eventos/crear?tipo=asientos"
            className="group flex flex-col items-start gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <LayoutGrid size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                Con mapa de asientos
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Los compradores eligen su asiento en un plano interactivo
              </p>
            </div>
            <div className="mt-auto">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                Continuar →
              </span>
            </div>
          </Link>

          {/* Opción 2: Por cantidad */}
          <Link
            to="/admin/eventos/crear?tipo=cantidad"
            className="group flex flex-col items-start gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <Hash size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                Entrada general
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Se vende una cantidad fija de entradas sin asignación
              </p>
            </div>
            <div className="mt-auto">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition-colors">
                Continuar →
              </span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Podrás cambiar esta configuración más adelante desde el formulario
          </p>
        </div>
      </div>
    </div>
  )
}

// ── EventList ────────────────────────────────────────────────────────────────────
export default function EventList() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showTypeModal, setShowTypeModal] = useState(false)

  useEffect(() => { loadEvents() }, [])
  useEffect(() => { filterEvents() }, [events, searchTerm, categoryFilter, statusFilter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await adminService.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]
    if (searchTerm) filtered = filtered.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
    if (categoryFilter !== 'todas') filtered = filtered.filter(e => e.category === categoryFilter)
    if (statusFilter !== 'todos') filtered = filtered.filter(e => e.status === statusFilter)
    setFilteredEvents(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return
    try {
      await adminService.deleteEvent(id)
      await loadEvents()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar evento')
    }
  }

  const categories = ['todas', ...new Set(events.map(e => e.category))]

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      INACTIVO: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      CANCELADO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }
    return map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }

  const statusIcon = (status: string) => {
    const map: Record<string, any> = {
      ACTIVO: <TrendingUp size={16} />,
      INACTIVO: <Clock size={16} />,
      CANCELADO: <X size={16} />
    }
    return map[status] || <Clock size={16} />
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
      {/* Modal de selección de tipo */}
      <EventTypeModal open={showTypeModal} onClose={() => setShowTypeModal(false)} />

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestión de Eventos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra todos los eventos del sistema
          </p>
        </div>

        {/* Botón crear */}
        <button
          onClick={() => setShowTypeModal(true)}
          className="self-start lg:self-auto flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus size={18} />
          Crear Evento
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Categoría</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'todas' ? 'Todas las categorías' : cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Estado</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              <option value="todos">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="flex items-end">
            {searchTerm || categoryFilter !== 'todas' || statusFilter !== 'todos' ? (
              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('todas'); setStatusFilter('todos') }}
                className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            ) : (
              <button className="w-full px-3 py-2 text-sm text-gray-400 rounded-lg" disabled>
                No hay filtros
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {filteredEvents.length === 0 ? 'No se encontraron eventos' : `${filteredEvents.length} evento${filteredEvents.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Evento</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Fecha</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Categoría</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Estado</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Precio</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Ventas</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tickets</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={event.image} alt={event.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.location}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{event.category}</span>
                  {event.subcategory && <span className="text-xs text-gray-400 dark:text-gray-500 block">{event.subcategory}</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(event.status)}`}>
                    {statusIcon(event.status)}
                    {event.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.price}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.totalSales.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{event.totalTicketsSold} vendidos</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.totalTicketsSold}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/eventos/${event.id}`} className="px-2 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium" title="Ver detalles">
                      <Eye size={16} />
                    </Link>
                    <Link to={`/admin/eventos/${event.id}/clientes`} className="px-2 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors text-sm font-medium" title="Ver asistentes">
                      <Users size={16} />
                    </Link>
                    <Link to={`/admin/eventos/${event.id}/editar`} className="px-2 py-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors text-sm font-medium" title="Editar">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(event.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Filter size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron eventos</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Intenta con otros filtros</p>
          </div>
        )}
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Filter size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron eventos</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Intenta con otros filtros</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Imagen */}
              <div className="relative h-40 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className={`absolute top-3 right-3 ${statusBadge(event.status)}`}>
                  {statusIcon(event.status)}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{event.location}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Info secundaria */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>{new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} · {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Tag size={12} />
                    <span>{event.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                    <DollarSign size={12} className="text-gray-400" />
                    <span>Bs {event.price}</span>
                  </div>
                </div>

                {/* Estadísticas del evento */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="px-2 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Precio</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.price}</p>
                  </div>
                  <div className="px-2 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Ventas</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="px-2 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tickets</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.totalTicketsSold}</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/admin/eventos/${event.id}`} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Eye size={14} />
                  </Link>
                  <Link to={`/admin/eventos/${event.id}/clientes`} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  </Link>
                  <Link to={`/admin/eventos/${event.id}/editar`} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <Edit size={14} />
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(event.id)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
