import React from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export interface EventCardProps {
  id: string
  title: string
  image: string
  date: string
  time: string
  location: string
  price: number
  category?: string
  onBuyClick?: () => void
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  image,
  date,
  time,
  location,
  price,
  category,
  onBuyClick
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleClick = () => {
    // Navigate to event detail
    window.location.href = `/eventos/${id}`
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      hoverable
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {category && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">
              {formatDate(date)} - {time}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Desde</p>
            <p className="text-xl font-bold text-primary">
              Bs {price.toFixed(2)}
            </p>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation() // Prevent card click
              onBuyClick?.()
            }}
            className="flex-shrink-0"
          >
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard
