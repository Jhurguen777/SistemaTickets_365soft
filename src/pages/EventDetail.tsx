import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EventGrid from '@/components/home/EventGrid'
import api from '@/services/api'

interface EventDetailProps {
  onOpenModal: (modalType: string) => void
}

interface Event {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  date: string
  time: string
  doorsOpen: string
  location: string
  address: string
  capacity: number
  price: number
  category: string
  subcategory: string
  organizer: string
  status: string
  sectors: Array<{
    id: string
    name: string
    price: number
    available: number
  }>
  gallery: string[]
}

export default function EventDetail({ onOpenModal }: EventDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState('')

  // Cargar evento del backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await api.get(`/eventos/${id}`)
        const evt = response.data.data

        // Transformar al formato que espera el componente
        const formattedEvent: Event = {
          id: evt.id,
          title: evt.titulo,
          description: evt.descripcion || '',
          longDescription: evt.descripcion || '',
          image: evt.imagenUrl || '/media/banners/default.jpg',
          date: new Date(evt.fecha).toISOString().split('T')[0],
          time: evt.hora,
          doorsOpen: evt.doorsOpen || evt.hora,
          location: evt.ubicacion,
          address: evt.direccion || evt.ubicacion,
          capacity: evt.capacidad,
          price: evt.precio,
          category: evt.categoria || 'Fiestas',
          subcategory: evt.subcategoria || '',
          organizer: evt.organizer || '365soft Eventos',
          status: evt.estado,
          sectors: evt.sectores && evt.sectores.length > 0 ? evt.sectores.map((s: any) => ({
            id: s.id,
            name: s.nombre,
            price: s.precio,
            available: s.disponible
          })) : [
            { id: '1', name: 'General', price: evt.precio, available: evt.capacidad }
          ],
          gallery: []
        }

        setEvent(formattedEvent)
        if (formattedEvent.sectors.length > 0) {
          setSelectedSector(formattedEvent.sectors[0].id)
        }
      } catch (err) {
        console.error('Error al cargar evento:', err)
        setError('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleBuyTickets = () => {
    // Navigate to seating selection
    navigate(`/eventos/${id}/asientos`, {
      state: {
        eventId: event?.id || id,
        sectorId: selectedSector
      }
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const sector = event?.sectors.find(s => s.id === selectedSector)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar el evento'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-200">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full">
                {event.category}
              </span>
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold uppercase rounded-full">
                {event.status}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg text-gray-200">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="text-primary" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold">{formatDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="text-primary" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-semibold">{event.time}</p>
                      <p className="text-sm text-gray-500">Puertas abren: {event.doorsOpen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-primary flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-semibold">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.address}</p>
                      <button className="mt-2 text-primary text-sm font-semibold hover:underline">
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="text-primary" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Capacidad</p>
                      <p className="font-semibold">{event.capacity.toLocaleString()} personas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Organizador</p>
                    <p className="font-semibold">{event.organizer}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Acerca del evento</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{event.longDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Galería</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {event.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${event.title} ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Events */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Otros eventos</h2>
              <EventGrid hasMore={false} />
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Comprar entradas</h3>

                {/* Price Display */}
                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold">Precio por asiento</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecciona tu asiento a continuación
                  </p>
                </div>

                {/* Buy Button */}
                <Button
                  size="lg"
                  onClick={handleBuyTickets}
                  className="w-full"
                >
                  Comprar Entradas
                </Button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>🔒 Compra 100% segura</p>
                  <button
                    onClick={() => onOpenModal('howToBuy')}
                    className="text-primary hover:underline"
                  >
                    ¿Cómo comprar?
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
