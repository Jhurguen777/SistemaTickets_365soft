import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import adminService from '@/services/adminService'
import { AdminEvent } from '@/types/admin'

export default function EventList() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todos')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, categoryFilter, statusFilter])

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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'todas') {
      filtered = filtered.filter(event => event.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    setFilteredEvents(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return
    }

    try {
      await adminService.deleteEvent(id)
      await loadEvents()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar evento')
    }
  }

  const categories = ['todas', ...new Set(events.map(e => e.category))]

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1">Administra todos los eventos del sistema</p>
        </div>
        <Link to="/admin/eventos/crear">
          <Button size="lg">
            <Plus size={20} className="mr-2" />
            Crear Evento
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'todas' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Evento</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Precio</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{event.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{event.category}</span>
                      {event.subcategory && (
                        <span className="text-xs text-gray-400 block">{event.subcategory}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      Bs {event.price}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Bs {event.totalSales.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {event.totalTicketsSold} vendidos
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link to={`/admin/eventos/${event.id}`}>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver"
                          >
                            <Eye size={18} />
                          </button>
                        </Link>
                        <Link to={`/admin/eventos/${event.id}/editar`}>
                          <button
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No se encontraron eventos</p>
                <p className="text-sm text-gray-500 mt-1">
                  Intenta con otros filtros o busca con otro término
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
