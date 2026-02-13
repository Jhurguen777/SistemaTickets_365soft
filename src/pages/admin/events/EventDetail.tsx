import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, DollarSign, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { Event, RegisteredUser } from '@/types/admin'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventData, usersData] = await Promise.all([
        adminService.getEventById(id!),
        adminService.getEventUsers(id!)
      ])
      setEvent(eventData)
      setUsers(usersData)
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

      {/* Event Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Image and Basic Info */}
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

              <div className="mt-6 pt-6 border-t">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === 'ACTIVO'
                    ? 'bg-green-100 text-green-700'
                    : event.status === 'INACTIVO'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {event.status}
                </span>
                <span className="ml-3 text-sm text-gray-600">
                  Categoría: <span className="font-semibold">{event.category}</span>
                  {event.subcategory && ` > ${event.subcategory}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Registered Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Usuarios Registrados</h3>
                <Link to={`/admin/usuarios/evento/${event.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sector</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{user.nombre}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.sector}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          Bs {user.totalPagado}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.estadoPago === 'PAGADO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.estadoPago}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay usuarios registrados aún
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
                  <p className="text-sm text-gray-600">Usuarios Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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

          {/* Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Galería</h3>
                <div className="grid grid-cols-2 gap-2">
                  {event.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${event.title} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
