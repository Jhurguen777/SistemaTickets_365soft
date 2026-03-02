// EventGrid.tsx
import React, { useState, useEffect } from 'react'
import EventCard, { EventCardProps } from './EventCard'
import Button from '@/components/ui/Button'
import api from '@/services/api'

interface EventGridProps {
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get('/eventos')
        const eventos = response.data.data.eventos || []
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
    <section className="py-6 sm:py-12 px-3 sm:px-4">
      <div className="container mx-auto">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Cargando eventos...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
            <p className="font-medium">{error}</p>
            <p className="text-xs mt-1">Por favor, recarga la página</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🎟️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No hay eventos disponibles</h3>
            <p className="text-gray-500 text-sm">Pronto habrá nuevos eventos para ti</p>
          </div>
        )}

        {/* Grid
          Mobile:  2 columns  (compact cards)
          SM:      2 columns
          LG:      3 columns
          XL:      4 columns
        */}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>

            {hasMoreProp && onLoadMore && (
              <div className="mt-8 sm:mt-12 text-center">
                <Button
                  size="lg"
                  onClick={onLoadMore}
                  disabled={loadingProp}
                  className="min-w-[160px] text-sm"
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