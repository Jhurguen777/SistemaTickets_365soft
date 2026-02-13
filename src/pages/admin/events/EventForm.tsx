import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'

export default function EventForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    location: '',
    address: '',
    date: '',
    time: '',
    doorsOpen: '',
    capacity: 0,
    category: 'Fiestas',
    subcategory: '',
    organizer: '365soft Eventos',
    status: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'CANCELADO',
    image: '/media/banners/vibra-carnavalera.jpg',
    gallery: [],
    sectors: [
      { name: 'General', price: 150, available: 5000, total: 5000 }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validaciones básicas
    const newErrors: { [key: string]: string } = {}

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres'
    }
    if (!formData.description) {
      newErrors.description = 'La descripción es requerida'
    }
    if (!formData.location) {
      newErrors.location = 'La ubicación es requerida'
    }
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }
    if (!formData.time) {
      newErrors.time = 'El horario es requerido'
    }
    if (formData.capacity < 1) {
      newErrors.capacity = 'La capacidad debe ser al menos 1'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      if (isEditing && id) {
        await adminService.updateEvent(id, formData)
      } else {
        await adminService.createEvent(formData)
      }
      navigate('/admin/eventos')
    } catch (error: any) {
      setErrors({ form: error.message || 'Error al guardar el evento' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Modifica la información del evento' : 'Completa el formulario para crear un nuevo evento'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.form}
              </div>
            )}

            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Evento *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    placeholder="Ej: Concierto de Rock 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Fiestas">Fiestas</option>
                    <option value="Conciertos">Conciertos</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Ferias">Ferias</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Corta *
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    error={errors.description}
                    placeholder="Breve descripción del evento"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Larga
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descripción detallada del evento..."
                  />
                </div>
              </div>
            </div>

            {/* Fecha y Ubicación */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fecha y Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Evento *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    error={errors.date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario del Evento *
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    error={errors.time}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Apertura Puertas
                  </label>
                  <Input
                    type="time"
                    value={formData.doorsOpen}
                    onChange={(e) => setFormData({ ...formData, doorsOpen: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Total *
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    error={errors.capacity}
                    placeholder="Ej: 15000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar / Ubicación *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    error={errors.location}
                    placeholder="Ej: Estadio Olímpico, La Paz"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Completa
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Av. Saavedra #1895, La Paz, Bolivia"
                  />
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizador
                  </label>
                  <Input
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Ej: 365soft Eventos"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
