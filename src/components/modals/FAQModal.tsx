import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface FAQModalProps {
  isOpen: boolean
  onClose: () => void
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preguntas Frecuentes" size="xl">
      <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto">
        {/* Highlighted message */}
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded mb-6">
          <p className="font-semibold text-yellow-800">
            No encuentro mis entradas ¿Cómo puedo recuperarlas?
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Haz click en el menú Atención al Cliente y sigue las instrucciones.
          </p>
        </div>

        <p className="text-gray-700 mb-4">
          ¡Gracias por visitar nuestro sistema de tickets! Aquí te presentamos algunas preguntas y respuestas frecuentes relacionadas con la compra de entradas en nuestro sitio web:
        </p>

        <div className="space-y-4">
          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              1. ¿Cómo puedo comprar entradas?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Para comprar entradas en nuestro sitio web, simplemente busca el evento al que quieres asistir, selecciona la sección y la cantidad de entradas que deseas comprar, completa los datos de pago y confirma tu compra.
            </p>
          </details>

          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              2. ¿Cuáles son las formas de pago disponibles?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Aceptamos tarjetas de crédito y débito Visa, Mastercard, American Express y Diners Club, además de pagos en línea a través de QR Simple y el QR de BaniPay.
            </p>
          </details>

          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              3. ¿Cómo puedo recibir mis entradas?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Una vez que se haya procesado tu pago, recibirás tus entradas por correo electrónico en formato PDF. También puedes acceder a tus entradas desde la sección "Mi cuenta" en nuestro sitio web.
            </p>
          </details>

          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              4. ¿Puedo cancelar mi compra de entradas?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Las compras de entradas son definitivas y no reembolsables. Sin embargo, si el evento se cancela o se pospone, se te informará por correo electrónico sobre las opciones de reembolso o cambio de entradas.
            </p>
          </details>

          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              5. ¿Qué sucede si pierdo o me roban mis entradas?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Es importante que guardes tus entradas en un lugar seguro, ya que no podemos reemplazarlas en caso de pérdida o robo. Si alguien más utiliza tus entradas, no podremos garantizar el acceso al evento.
            </p>
          </details>

          <details className="group bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
              6. ¿Puedo cambiar la fecha o sección de mi entrada?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              No se pueden cambiar la fecha ni la sección de las entradas, por lo que es importante que elijas cuidadosamente antes de hacer tu compra.
            </p>
          </details>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Si tienes alguna otra pregunta o necesitas ayuda, no dudes en ponerte en contacto con nuestro equipo de atención al cliente.
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

export default FAQModal
