import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { CreditCard } from 'lucide-react'

interface PaymentMethodsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medios de Pago" size="md">
      <div className="text-center space-y-6">
        <p className="text-gray-700">
          Aceptamos los siguientes medios de pago:
        </p>

        {/* Tarjetas */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Tarjetas de Crédito y Débito</h3>
          <div className="flex justify-center items-center space-x-6">
            {['Visa', 'Mastercard', 'Amex', 'Diners'].map((card) => (
              <div
                key={card}
                className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-700 border"
              >
                {card}
              </div>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Pagos QR</h3>
          <div className="flex justify-center items-center space-x-6">
            <div className="w-24 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary border-2 border-primary">
              QR Simple
            </div>
            <div className="w-24 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary border-2 border-primary">
              BaniPay
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PaymentMethodsModal
