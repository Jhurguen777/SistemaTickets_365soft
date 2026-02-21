import React, { useState, useEffect } from 'react'
import EventCard, { EventCardProps } from './EventCard'
import Button from '@/components/ui/Button'
import api from '@/services/api'

interface EventGridProps {
  events?: EventCardProps[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const EventGrid: React.FC<EventGridProps> = ({
  onLoadMore,
  hasMore: hasMoreProp = true,
  loading: loadingProp = false
}) => {
  const [events, setEvents] = useState<EventCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar eventos del backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get('/eventos')
        const eventos = response.data.data.eventos || []

        // Transformar los eventos al formato que espera EventCard
        const formattedEvents: EventCardProps[] = eventos.map((evt: any) => ({
          id: evt.id,
          title: evt.titulo,
          image: evt.imagenUrl || '/media/banners/default.jpg',
          date: new Date(evt.fecha).toISOString().split('T')[0],
          time: evt.hora,
          location: evt.ubicacion,
          price: evt.precio,
          category: evt.categoria || 'Fiestas'
        }))

        setEvents(formattedEvents)
      } catch (err) {
        console.error('Error al cargar eventos:', err)
        setError('Error al cargar los eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando eventos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Por favor, recarga la página</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay eventos disponibles</h3>
            <p className="text-gray-500">Pronto habrá nuevos eventos para ti</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProp && onLoadMore && (
              <div className="mt-12 text-center">
                <Button
                  size="lg"
                  onClick={onLoadMore}
                  disabled={loadingProp}
                  className="min-w-[200px]"
                >
                  {loadingProp ? 'Cargando...' : 'Ver más'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default EventGrid
