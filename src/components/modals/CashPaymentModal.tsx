import React, { useState, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Upload, X, Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { comprobantesPagoService } from '@/services/comprobantesPagoService'

const C = {
  azul:    '#233C7A',
  rojo:    '#E0081D',
  amarillo:'#FAB90E',
  gris:    '#F5F5F5',
  negro:   '#212121',
}

interface CashPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  compraId: string // Puede ser un ID único o múltiples IDs separados por coma
  monto: number
  moneda: string
  eventId?: string
  onSubmitSuccess?: () => void
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  onClose,
  compraId,
  monto,
  moneda,
  eventId,
  onSubmitSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (file: File) => {
    setError(null)
    setSuccess(false)

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setError('Solo se aceptan archivos JPG y PNG')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo de 5MB')
      return
    }

    setSelectedFile(file)

    // Generar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCamera = async () => {
    try {
      // Usar la cámara del dispositivo
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })

      // Crear un elemento de video temporal
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true

      // Crear canvas para capturar la imagen
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      video.onloadedmetadata = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir a base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9)

        // Convertir base64 a File
        const byteCharacters = atob(imageData.split(',')[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        const file = new File([blob], 'comprobante.jpg', { type: 'image/jpeg' })

        handleFileSelect(file)

        // Detener la cámara
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setError('No se pudo acceder a la cámara. Por favor intenta subir el archivo.')
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile || !preview) {
      setError('Por favor selecciona una imagen del comprobante')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // compraId puede ser un ID único o múltiples IDs separados por coma
      const compraIds = compraId.split(',').map(id => id.trim()).filter(id => id)

      // Subir el comprobante para TODAS las compras CONCURRENTemente (al mismo tiempo)
      const uploadPromises = compraIds.map(id =>
        comprobantesPagoService.subirComprobante({
          compraId: id,
          imagenBase64: preview,
          nombreArchivo: selectedFile.name,
          tipoArchivo: selectedFile.type
        })
      )

      // Esperar a que todas terminen
      await Promise.all(uploadPromises)

      // Guardar información de las compras pendientes para polling
      if (eventId) {
        localStorage.setItem(`pending_cash_payment_${eventId}`, JSON.stringify({
          compraIds: compraIds,
          eventId,
          timestamp: Date.now()
        }))
      }

      setSuccess(true)
      setIsUploading(false)

      setTimeout(() => {
        onSubmitSuccess?.()
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Error al subir comprobante:', err)
      setError(err.message || 'Error al subir el comprobante. Por favor intenta nuevamente.')
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (isUploading) return
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    setSuccess(false)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Comprobante Enviado" size="sm">
        <div className="pt-1 pb-2">
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Comprobante enviado!</h2>
            <p className="text-gray-600 text-center text-sm px-4">
              Tu comprobante ha sido enviado correctamente. Un administrador revisará tu pago y te notificará cuando sea aprobado.
            </p>
            <p className="text-gray-500 text-center text-xs mt-4">
              Puedes ver el estado en "Mis Compras"
            </p>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subir Comprobante de Pago" size="sm">
      <div className="pt-1 pb-2">

        {/* Monto a pagar */}
        <div
          className="flex items-center justify-between px-5 py-3 rounded-xl mb-4"
          style={{ background: C.gris }}
        >
          <span className="font-medium text-sm" style={{ color: C.negro }}>Monto a pagar</span>
          <span className="font-extrabold text-2xl" style={{ color: C.azul }}>
            {moneda} {monto.toFixed(2)}
          </span>
        </div>

        {/* Mensaje de instrucción */}
        <div className="mb-4 p-4 rounded-xl" style={{ background: '#FFFBEB', border: `1px solid ${C.amarillo}` }}>
          <div className="flex items-start gap-2">
            <AlertCircle size={18} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1" style={{ color: '#92400E' }}>Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Sube una foto clara de tu comprobante de pago</li>
                <li>Debe mostrar: fecha, monto y referencia</li>
                <li>Formatos aceptados: JPG, PNG (máx 5MB)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          } ${selectedFile ? 'border-primary' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />

          {!selectedFile ? (
            <>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: C.azul }}
              >
                <Upload size={32} className="text-white" />
              </div>
              <p className="font-semibold text-gray-700 mb-2">
                Arrastra tu comprobante aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">o</p>
              <div className="flex gap-3 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Explorar archivos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCamera}
                  disabled={isUploading}
                >
                  <Camera size={16} className="mr-1" />
                  Tomar foto
                </Button>
              </div>
            </>
          ) : (
            <div>
              {/* Preview de la imagen */}
              <div className="relative inline-block mb-4">
                <img
                  src={preview || ''}
                  alt="Preview del comprobante"
                  className="max-h-48 rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Info del archivo */}
              <div className="text-sm text-gray-600 mb-2">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={isUploading}
              >
                Cambiar imagen
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#FEF2F2', border: `1px solid ${C.rojo}` }}>
            <div className="flex items-start gap-2">
              <AlertCircle size={18} style={{ color: C.rojo }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#991B1B' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 py-3"
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="flex-1 py-3 text-base font-bold"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar comprobante'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CashPaymentModal
