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
  sectors: Array<{ id: string; name: string; price: number; available: number }>
  gallery: string[]
}

export default function EventDetail({ onOpenModal }: EventDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await api.get(`/eventos/${id}`)
        const evt = response.data.data
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
          sectors: evt.sectores && evt.sectores.length > 0
            ? evt.sectores.map((s: any) => ({ id: s.id, name: s.nombre, price: s.precio, available: s.disponible }))
            : [{ id: '1', name: 'General', price: evt.precio, available: evt.capacidad }],
          gallery: []
        }
        setEvent(formattedEvent)
        if (formattedEvent.sectors.length > 0) setSelectedSector(formattedEvent.sectors[0].id)
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
    navigate(`/eventos/${id}/asientos`, { state: { eventId: event?.id || id, sectorId: selectedSector } })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Cargando evento...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error || 'No se pudo cargar el evento'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="mr-1 sm:mr-2" />
          Volver
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[200px] sm:h-[350px] md:h-[500px] bg-gray-200 mt-2">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-4">
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary text-white text-xs font-bold uppercase rounded-full">
                {event.category}
              </span>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500 text-white text-xs font-bold uppercase rounded-full">
                {event.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 leading-tight">{event.title}</h1>
            <p className="text-xs sm:text-lg text-gray-200 line-clamp-2">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Buy Button sticky bottom — solo en móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:hidden shadow-lg">
        <Button size="lg" onClick={handleBuyTickets} className="w-full">
          Comprar Entradas
        </Button>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-12 pb-20 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">

            {/* Info Cards — 2 columnas en móvil */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="text-primary flex-shrink-0 mt-0.5" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="font-semibold text-xs sm:text-sm leading-tight">{formatDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Clock className="text-primary flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500">Horario</p>
                      <p className="font-semibold text-xs sm:text-sm">{event.time}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">Puertas: {event.doorsOpen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="text-primary flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500">Ubicación</p>
                      <p className="font-semibold text-xs sm:text-base">{event.location}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{event.address}</p>
                      <button className="mt-1 text-primary text-xs sm:text-sm font-semibold hover:underline">
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Users className="text-primary flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="font-semibold text-xs sm:text-sm">{event.capacity.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-xs text-gray-500 mb-1">Organizador</p>
                  <p className="font-semibold text-xs sm:text-sm leading-tight">{event.organizer}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-2xl font-bold mb-3 sm:mb-4">Acerca del evento</h2>
                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{event.longDescription}</p>
              </CardContent>
            </Card>

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-2xl font-bold mb-3 sm:mb-4">Galería</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {event.gallery.map((image, index) => (
                      <img key={index} src={image} alt={`${event.title} ${index + 1}`}
                        className="w-full h-24 sm:h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Events */}
            {/* <div>
              <h2 className="text-base sm:text-2xl font-bold mb-3 sm:mb-6">Otros eventos</h2>
              <EventGrid hasMore={false} />
            </div> */}
          </div>

          {/* Sidebar — solo desktop */}
          <div className="hidden sm:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Comprar entradas</h3>
                <div className="border-t pt-6 mb-6">
                  <p className="text-sm text-gray-500">Selecciona tu asiento a continuación</p>
                </div>
                <Button size="lg" onClick={handleBuyTickets} className="w-full">
                  Comprar Entradas
                </Button>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>🔒 Compra 100% segura</p>
                  <button onClick={() => onOpenModal('howToBuy')} className="text-primary hover:underline">
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