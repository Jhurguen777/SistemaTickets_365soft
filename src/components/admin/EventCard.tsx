import { Calendar, MapPin, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AdminEvent } from '@/types/admin'

interface EventCardProps {
  event: AdminEvent
  onViewDetails: (eventId: string) => void
}

export default function EventCard({ event, onViewDetails }: EventCardProps) {
  const availableTickets = event.sectors.reduce((sum, sector) => sum + sector.available, 0)
  const soldTickets = event.totalTicketsSold

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer max-w-sm mx-auto w-full"
      hoverable
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
            <CalendarDays size={80} className="text-white/80" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[3.5rem]">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16} className="mr-2 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">
              {formatDate(event.date)} - {event.time}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="mr-2 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 rounded-lg p-1.5 text-center">
            <p className="text-sm font-black text-green-600 dark:text-green-400">{availableTickets}</p>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Disponibles</p>
          </div>
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 rounded-lg p-1.5 text-center">
            <p className="text-sm font-black text-red-600 dark:text-red-400">{soldTickets}</p>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Vendidos</p>
          </div>
        </div>

        <Link to={`/admin/eventos/${event.id}/clientes`} className="w-full">
          <Button size="sm" className="w-full">
            Ver Detalle
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
