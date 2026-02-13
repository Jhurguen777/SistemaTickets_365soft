import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface HowToBuyModalProps {
  isOpen: boolean
  onClose: () => void
}

const HowToBuyModal: React.FC<HowToBuyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Como Comprar" size="lg">
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 mb-4">
          Comprar entradas en nuestro sitio web es muy fácil. A continuación, te explicamos los pasos a seguir:
        </p>

        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            Selecciona el evento al que quieres asistir y haz clic en <strong>"Comprar"</strong>.
          </li>
          <li>
            Elige el sector y la cantidad de entradas que deseas adquirir.
          </li>
          <li>
            Verifica el precio y los detalles de tu compra, incluyendo la fecha, hora y lugar del evento.
          </li>
          <li>
            Completa los datos de pago y confirma tu compra.
          </li>
          <li>
            Una vez que se haya procesado tu pago, recibirás tu entrada en pantalla. También te enviaremos una copia por Email.
          </li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Recuerda:</strong> Es importante leer los términos y condiciones de compra antes de realizar tu pedido.
          </p>
          <p className="text-sm text-gray-600">
            Si tienes alguna pregunta o problema durante el proceso de compra, no dudes en ponerte en contacto con nuestro equipo de atención al cliente.
          </p>
        </div>

        <p className="mt-6 text-center font-semibold text-primary">
          ¡Gracias por elegir nuestro sistema de tickets para tus eventos favoritos!
        </p>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default HowToBuyModal
