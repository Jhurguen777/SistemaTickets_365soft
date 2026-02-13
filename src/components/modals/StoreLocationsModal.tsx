import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { MapPin, Clock } from 'lucide-react'

interface StoreLocationsModalProps {
  isOpen: boolean
  onClose: () => void
}

const StoreLocationsModal: React.FC<StoreLocationsModalProps> = ({ isOpen, onClose }) => {
  const locations = {
    laPaz: [
      {
        name: 'SUPERTICKET ESPACIO KÚU INTI',
        address: 'El Bosque Boulevard, Calle 15 de Calacoto.',
        mapUrl: 'https://maps.app.goo.gl/h4BCNWnr8Npxp8H16',
        hours: 'Martes a Domingo de 11:00 a 14:30 y de 15:30 a 20:00'
      },
      {
        name: 'SUPERTICKET CINEBOL',
        address: 'El Alto, Ciudad Satelite, Av. Alfredo Sanjines 500',
        mapUrl: 'https://goo.gl/maps/h7C3nen89xG1amYw9',
        hours: 'Martes a Domingo de 10:00 a 20:30'
      },
      {
        name: 'SUPERTICKET CENTRO LA PAZ',
        address: 'Plaza del Estudiante, Av. Villazón 1940. Edificio Inchauste, Piso 6 Of. 601 C',
        mapUrl: 'https://goo.gl/maps/guKYkhYbjj7D4A7H8',
        hours: 'Lunes a Viernes de 9:00 a 12:30 y 14:30 a 18:30. Sábados de 9:00 a 12:30'
      }
    ],
    santaCruz: [
      {
        name: 'SUPERTICKET CENTRO',
        address: 'Av. Monseñor Rivero, Edificio Milenium, Piso 8, Of. A.',
        mapUrl: 'https://maps.app.goo.gl/zZm8fsz8jKeYSk627',
        hours: 'Lunes a Viernes de 9:00 a 12:30 y 14:30 a 18:30. Sábados de 9:00 a 12:30'
      }
    ]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PUNTOS DE VENTA" size="xl">
      <div className="space-y-8 max-h-[60vh] overflow-y-auto">
        {/* La Paz Section */}
        <section>
          <h3 className="text-xl font-bold text-primary mb-4">EN LA PAZ</h3>
          <div className="space-y-4">
            {locations.laPaz.map((location, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">{location.name}</h4>
                <p className="text-sm text-gray-700 mb-3">{location.address}</p>
                <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{location.hours}</span>
                </div>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-semibold"
                >
                  <MapPin size={16} className="mr-1" />
                  Ver en Google Maps
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Santa Cruz Section */}
        <section>
          <h3 className="text-xl font-bold text-primary mb-4">EN SANTA CRUZ</h3>
          <div className="space-y-4">
            {locations.santaCruz.map((location, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">{location.name}</h4>
                <p className="text-sm text-gray-700 mb-3">{location.address}</p>
                <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{location.hours}</span>
                </div>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-semibold"
                >
                  <MapPin size={16} className="mr-1" />
                  Ver en Google Maps
                </a>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StoreLocationsModal
