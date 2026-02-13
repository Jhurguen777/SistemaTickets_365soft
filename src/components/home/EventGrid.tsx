import React from 'react'
import EventCard, { EventCardProps } from './EventCard'
import Button from '@/components/ui/Button'

interface EventGridProps {
  events?: EventCardProps[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const mockEvents: EventCardProps[] = [
  {
    id: '1',
    title: 'Vibra Carnavalera',
    image: '/media/banners/vibra-carnavalera.jpg',
    date: '2026-02-15',
    time: '20:00',
    location: 'La Paz, Bolivia',
    price: 150,
    category: 'Fiestas'
  },
  {
    id: '2',
    title: 'Carnaval de Oruro 2026',
    image: '/media/banners/carnaval-oruro.jpg',
    date: '2026-02-28',
    time: '19:00',
    location: 'Oruro, Bolivia',
    price: 250,
    category: 'Fiestas'
  },
  {
    id: '3',
    title: 'Concierto Sinfónico',
    image: '/media/banners/sinfonico.jpg',
    date: '2026-03-10',
    time: '20:30',
    location: 'Teatro Municipal',
    price: 180,
    category: 'Conciertos'
  },
  {
    id: '4',
    title: 'Festival de Rock',
    image: '/media/banners/rock-fest.jpg',
    date: '2026-03-15',
    time: '21:00',
    location: 'Estadio Olímpico',
    price: 200,
    category: 'Conciertos'
  },
  {
    id: '5',
    title: 'Obra de Teatro',
    image: '/media/banners/teatro.jpg',
    date: '2026-03-20',
    time: '19:30',
    location: 'Teatro al Aire Libre',
    price: 120,
    category: 'Teatro'
  },
  {
    id: '6',
    title: 'Partido de Fútbol',
    image: '/media/banners/futbol.jpg',
    date: '2026-03-25',
    time: '16:00',
    location: 'Estadio Hernando Siles',
    price: 100,
    category: 'Deportes'
  },
  {
    id: '7',
    title: 'Feria del Libro',
    image: '/media/banners/feria-libro.jpg',
    date: '2026-04-01',
    time: '10:00',
    location: 'Centro de Convenciones',
    price: 30,
    category: 'Ferias'
  },
  {
    id: '8',
    title: 'Concierto de Cumbia',
    image: '/media/banners/cumbia.jpg',
    date: '2026-04-05',
    time: '21:00',
    location: 'Discoteca Party',
    price: 80,
    category: 'Conciertos'
  }
]

const EventGrid: React.FC<EventGridProps> = ({
  events = mockEvents,
  onLoadMore,
  hasMore = true,
  loading = false
}) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={onLoadMore}
              disabled={loading}
              className="min-w-[200px]"
            >
              {loading ? 'Cargando...' : 'Ver más'}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventGrid
