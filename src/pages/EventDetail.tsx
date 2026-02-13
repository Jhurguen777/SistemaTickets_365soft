import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EventGrid from '@/components/home/EventGrid'

interface EventDetailProps {
  onOpenModal: (modalType: string) => void
}

// Mock event data - En producción esto vendría de la API
const mockEvent = {
  id: '1',
  title: 'Vibra Carnavalera 2026',
  description: 'Únete a la celebración más grande del año. El Vibra Carnavalera te trae lo mejor de la música tropical, artistas nacionales e internacionales en un espectáculo inolvidable.',
  longDescription: `Prepárate para vivir la experiencia del carnaval más grande de Bolivia.

Vibra Carnavalera 2026 presenta:

• 3 días de música ininterrumpida
• Más de 20 artistas nacionales e internacionales
• Zonas de comida y bebida
• Área kids para toda la familia
• Seguridad y atención médica 24/7

No te pierdas este evento único que reúne a miles de personas para celebrar la cultura y tradición boliviana.`,
  image: '/media/banners/vibra-carnavalera.jpg',
  date: '2026-02-15',
  time: '20:00',
  doorsOpen: '18:00',
  location: 'Estadio Olímpico, La Paz',
  address: 'Av. Saavedra #1895, La Paz, Bolivia',
  capacity: 15000,
  price: 150,
  category: 'Fiestas',
  subcategory: 'Carnaval',
  organizer: '365soft Eventos',
  status: 'ACTIVO',
  sectors: [
    { id: '1', name: 'General', price: 150, available: 5000 },
    { id: '2', name: 'VIP', price: 350, available: 500 },
    { id: '3', name: 'Super VIP', price: 500, available: 200 }
  ],
  gallery: [
    '/media/banners/vibra-carnavalera.jpg',
    '/media/banners/carnaval-oruro.jpg',
    '/media/banners/fiesta.jpg'
  ]
}

const relatedEvents = [
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
    title: 'Fiesta de la Tradición',
    image: '/media/banners/fiesta.jpg',
    date: '2026-03-05',
    time: '20:00',
    location: 'Cochabamba, Bolivia',
    price: 180,
    category: 'Fiestas'
  },
  {
    id: '4',
    title: 'Noche de Folklore',
    image: '/media/banners/folklore.jpg',
    date: '2026-03-10',
    time: '21:00',
    location: 'Sucre, Bolivia',
    price: 120,
    category: 'Fiestas'
  }
]

export default function EventDetail({ onOpenModal }: EventDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedSector, setSelectedSector] = useState('1')

  const event = mockEvent // En producción: buscar evento por ID

  const handleBuyTickets = () => {
    // Navigate to seating selection
    navigate(`/eventos/${id}/asientos`, {
      state: {
        eventId: event.id,
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

  const sector = event.sectors.find(s => s.id === selectedSector)

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
              <h2 className="text-2xl font-bold mb-6">Eventos relacionados</h2>
              <EventGrid events={relatedEvents} hasMore={false} />
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Comprar entradas</h3>

                {/* Sector Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">
                    Selecciona tu sector
                  </label>
                  <div className="space-y-2">
                    {event.sectors.map((sectorOption) => (
                      <label
                        key={sectorOption.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSector === sectorOption.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex-1">
                          <input
                            type="radio"
                            name="sector"
                            value={sectorOption.id}
                            checked={selectedSector === sectorOption.id}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className="sr-only"
                          />
                          <div>
                            <p className="font-semibold">{sectorOption.name}</p>
                            <p className="text-sm text-gray-500">
                              {sectorOption.available} disponibles
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            Bs {sectorOption.price}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold">Precio por asiento</span>
                    <span className="font-bold text-primary">
                      Bs {sector?.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecciona tus asientos en el siguiente paso
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
