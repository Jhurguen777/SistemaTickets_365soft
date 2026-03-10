import React from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PaymentMethodsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medios de Pago" size="md">
      <div className="text-center space-y-6">
        <p className="text-gray-700">
          Actualmente aceptamos el siguiente medio de pago:
        </p>

        {/* QR */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-primary">Pagos por Transferencia QR</h3>
          <div className="flex justify-center items-center">
            <div className="w-full max-w-xs p-6 bg-primary/5 rounded-xl flex flex-col items-center justify-center gap-3 border-2 border-primary/20">
              <div className="flex items-center gap-3 text-primary font-bold text-lg">
                <span className="bg-primary text-white p-2 rounded-lg">QR</span>
                Pago por transferencias por QR
              </div>
              <p className="text-sm text-gray-600">
                Paga de forma rápida y segura desde tu aplicación bancaria.
              </p>
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
