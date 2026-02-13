import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Condiciones Legales" size="md">
      <div className="prose prose-sm max-w-none">
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
          <p className="font-semibold text-red-800">
            Una vez que finalices tu compra NO podrás solicitar cambios de fecha, ni de sectores.
          </p>
          <p className="text-sm text-red-700 mt-2">
            Si no puedes asistir al evento transfiere tus boletos a otra persona. No hay cambios ni devoluciones.
          </p>
          <p className="text-sm text-red-700 mt-2 font-semibold">
            Si continúas, aceptas estas condiciones.
          </p>
        </div>

        <p className="text-gray-700 mb-4">
          Al realizar una compra en nuestro sistema, aceptas los siguientes términos y condiciones:
        </p>

        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Los boletos adquiridos no son reembolsables</li>
          <li>No se permiten cambios de fecha ni de sector/ubicación</li>
          <li>En caso de pérdida o robo, no se pueden reemplazar los boletos</li>
          <li>Si el evento se cancela, se informarán las opciones de reembolso</li>
          <li>Es responsabilidad del cliente verificar la fecha, hora y lugar del evento</li>
        </ul>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TermsModal
