// EventCard.tsx
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
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
      hoverable
      onClick={() => { window.location.href = `/eventos/${id}` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[3/4]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {category && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase rounded-full">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {title}
        </h3>

        <div className="space-y-1 mb-3 flex-1">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Calendar size={13} className="mr-1.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{formatDate(date)} · {time}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin size={13} className="mr-1.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 leading-none">Desde</p>
            <p className="text-base sm:text-lg font-bold text-primary leading-tight">
              Bs {price.toFixed(2)}
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs px-3 py-1.5 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onBuyClick?.() }}
          >
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard