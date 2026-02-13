import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aviso de privacidad" size="xl">
      <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto">
        <p className="text-gray-700 mb-4">
          En nuestro sistema nos tomamos muy en serio la privacidad de nuestros clientes y visitantes. A continuación, te explicamos nuestra Política de Privacidad:
        </p>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Recopilación de información</h3>
          <p className="text-sm text-gray-700">
            Para poder ofrecerte nuestros servicios, es posible que recopilemos cierta información personal, como tu nombre, dirección de correo electrónico, número de teléfono y detalles de pago. También podemos recopilar información sobre cómo utilizas nuestro sitio web y nuestros servicios, incluyendo tu historial de compras y navegación.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Uso de la información</h3>
          <p className="text-sm text-gray-700">
            Utilizamos la información recopilada para procesar tus compras, ofrecerte un servicio personalizado, mejorar nuestro sitio web y comunicarnos contigo sobre nuevos eventos y promociones. No vendemos ni compartimos tus datos personales con terceros con fines comerciales.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Compartición de información</h3>
          <p className="text-sm text-gray-700">
            Sin embargo, es posible que compartamos tu información con nuestros aliados, promotores de eventos o socios para brindarte servicios de alta calidad y personalizados, como notificaciones sobre eventos o promociones. En caso de que se requiera compartir tu información con terceros, nos aseguraremos de que se mantenga la confidencialidad y la privacidad de tus datos.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Publicidad</h3>
          <p className="text-sm text-gray-700">
            También es posible que te enviemos publicidad por correo electrónico, teléfono o WhatsApp sobre eventos y promociones que puedan ser de tu interés. Si deseas dejar de recibir nuestras comunicaciones de marketing, puedes optar por no recibirlas en cualquier momento a través de la opción de cancelación de suscripción que se encuentra en el correo electrónico o poniéndote en contacto con nuestro equipo de atención al cliente.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Protección de la información</h3>
          <p className="text-sm text-gray-700">
            Utilizamos medidas de seguridad para proteger tus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-lg font-bold text-primary mb-2">Cambios en la política de privacidad</h3>
          <p className="text-sm text-gray-700">
            Nos reservamos el derecho de actualizar y modificar esta Política de Privacidad en cualquier momento. Te recomendamos que revises esta página periódicamente para estar al tanto de cualquier cambio.
          </p>
        </section>

        <p className="text-sm text-gray-600 mt-4">
          Si tienes alguna pregunta o inquietud sobre nuestra Política de Privacidad, por favor, ponte en contacto con nuestro equipo de atención al cliente.
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

export default PrivacyModal
