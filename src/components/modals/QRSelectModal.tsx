import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { QrCode, CheckCircle2 } from 'lucide-react'

interface QRSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (method: string) => void
  selected?: string
}

const QRSelectModal: React.FC<QRSelectModalProps> = ({ isOpen, onClose, onSelect, selected }) => {
  const [localSelected, setLocalSelected] = useState<string>('')

  useEffect(() => {
    if (isOpen) setLocalSelected(selected || '')
  }, [isOpen, selected])

  const handleAccept = () => {
    if (!localSelected) return
    onSelect(localSelected)
    onClose()
  }

  const active = localSelected === 'qr'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¿Cómo deseas pagar?" size="sm">
      <div className="pt-1 pb-2">

        <p className="text-sm text-gray-500 mb-4">Toca el método de pago que deseas usar.</p>

        {/* Opción QR */}
        <button
          type="button"
          onClick={() => setLocalSelected('qr')}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all mb-4 ${
            active
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-gray-200 hover:border-primary/40 active:bg-gray-50'
          }`}
        >
          {/* Ícono grande */}
          <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md transition-colors ${
            active ? 'bg-primary' : 'bg-primary'
          }`}>
            <QrCode className="w-8 h-8 text-white" />
          </div>

          {/* Texto */}
          <div className="flex-1 text-left">
            <p className={`font-extrabold text-lg leading-tight ${active ? 'text-primary' : 'text-gray-800'}`}>
              Pago con QR
            </p>
            <p className="text-sm text-gray-500 mt-1 leading-snug">
              Abre la app de tu banco, escanea el código QR y confirma el pago.
            </p>
          </div>

          {/* Indicador de selección */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
            active ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
          }`}>
            {active && <CheckCircle2 className="w-5 h-5 text-white" fill="white" strokeWidth={0} />}
          </div>
        </button>

        {/* Botones */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 py-3">
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!active}
            className="flex-1 py-3 text-base font-bold"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default QRSelectModal

