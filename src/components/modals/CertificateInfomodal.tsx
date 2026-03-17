import React, { useEffect } from 'react'
import { Award, AlertTriangle, CheckCircle } from 'lucide-react'

interface CertificateInfoModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export default function CertificateInfoModal({ isOpen, onConfirm }: CertificateInfoModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
    >
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(24px); }
          70%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cert-modal { animation: popIn 0.4s cubic-bezier(0.34,1.4,0.64,1) both; }
      `}</style>

      <div className="cert-modal w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Header azul marino Alfa ── */}
        <div
          className="relative px-6 pt-8 pb-10 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #14305A 60%, #0f2347 100%)' }}
        >
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute top-3 right-8 w-14 h-14 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Ícono */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(255,255,255,0.08)', animationDuration: '2s' }} />
            <Award size={40} className="text-white drop-shadow-md" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1 drop-shadow-sm">
            ¡Atención!
          </h2>
          <p className="font-semibold text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Certificado de participación
          </p>
        </div>

        {/* ── Onda separadora ── */}
        <div className="-mt-4 relative z-10">
          <svg viewBox="0 0 400 40" className="w-full" preserveAspectRatio="none" style={{ height: 32 }}>
            <path d="M0,40 C100,0 300,0 400,40 L400,0 L0,0 Z" fill="#0f2347" />
          </svg>
        </div>

        {/* ── Cuerpo ── */}
        <div className="px-6 pb-6 -mt-2">

          {/* Mensaje principal */}
          <div className="text-center mb-5">
            <p className="text-gray-700 text-base leading-relaxed">
              Los datos que ingresarás a continuación serán utilizados para la
            </p>
            <p className="text-lg font-black mt-1" style={{ color: '#1B3A6B' }}>
              elaboración de tu certificado oficial
            </p>
          </div>

          {/* Puntos clave */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ background: 'rgba(27,58,107,0.05)', borderColor: 'rgba(27,58,107,0.2)' }}>
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#1B3A6B' }} />
              <p className="text-sm font-medium" style={{ color: '#1B3A6B' }}>
                Escribe tu <strong>nombre y apellido</strong> exactamente como deseas que aparezcan en el documento.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ background: 'rgba(27,58,107,0.05)', borderColor: 'rgba(27,58,107,0.2)' }}>
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#1B3A6B' }} />
              <p className="text-sm font-medium" style={{ color: '#1B3A6B' }}>
                Selecciona tu <strong>oficina Alfa</strong> correctamente, ya que también aparecerá en el certificado.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                <strong>Errores de escritura no podrán corregirse</strong> una vez procesado el pago.
              </p>
            </div>
          </div>

          {/* Botón */}
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all duration-200 active:scale-95 hover:opacity-90 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #14305A 100%)' }}
          >
            ✓ &nbsp;Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  )
}