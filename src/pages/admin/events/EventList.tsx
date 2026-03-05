import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Edit, Trash2, Filter, Calendar, MapPin, Tag } from 'lucide-react'
import adminService from '@/services/adminService'
import { AdminEvent } from '@/types/admin'

export default function EventList() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todos')

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
      ACTIVO: 'bg-green-50 text-green-700',
      INACTIVO: 'bg-gray-100 text-gray-700 dark:text-gray-300',
      CANCELADO: 'bg-red-50 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Gestión de Eventos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administra todos los eventos del sistema
          </p>
        </div>
        <Link to="/admin/eventos/crear" className="self-start sm:self-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center">
            <Plus size={16} />
            Crear Evento
          </button>
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Categoría</label>
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Estado</label>
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
        </div>
      </div>

      {/* ── Count ── */}
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'evento' : 'eventos'}
      </p>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Evento</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Categoría</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Estado</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Precio</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Ventas</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={event.image} alt={event.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{event.category}</span>
                    {event.subcategory && <span className="text-xs text-gray-400 block">{event.subcategory}</span>}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Bs {event.price}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Bs {event.totalSales.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{event.totalTicketsSold} vendidos</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link to={`/admin/eventos/${event.id}`}>
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Ver">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link to={`/admin/eventos/${event.id}/editar`}>
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(event.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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
              <Filter size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No se encontraron eventos</p>
              <p className="text-xs text-gray-400 mt-1">Intenta con otros filtros</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Filter size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">No se encontraron eventos</p>
          </div>
        ) : filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Card header con imagen */}
            <div className="flex gap-3 p-3">
              <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">{event.title}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${statusBadge(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={10} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={10} />
                    <span>{new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} · {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag size={10} />
                    <span>{event.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
              <div className="px-3 py-2 text-center">
                <p className="text-xs text-gray-500">Precio</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.price}</p>
              </div>
              <div className="px-3 py-2 text-center">
                <p className="text-xs text-gray-500">Ventas</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Bs {event.totalSales.toLocaleString()}</p>
              </div>
              <div className="px-3 py-2 text-center">
                <p className="text-xs text-gray-500">Tickets</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.totalTicketsSold}</p>
              </div>
            </div>

            {/* Actions row */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
              <Link to={`/admin/eventos/${event.id}`} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Eye size={14} /> Ver
              </Link>
              <Link to={`/admin/eventos/${event.id}/editar`} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                <Edit size={14} /> Editar
              </Link>
              <button onClick={() => handleDelete(event.id)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}