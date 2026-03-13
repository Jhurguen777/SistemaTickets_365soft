import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { X, CheckCircle, XCircle, QrCode, Loader2, Zap } from 'lucide-react'
import api from '@/services/api'

interface CheckInData {
  usuario: { id: string; nombre: string; email: string }
  evento: { id: string; titulo: string }
  asiento: { id: string; fila: string; numero: number } | null
  ingresoEn: string
}

type ResultadoState = {
  tipo: 'success' | 'error'
  mensaje: string
  detalle?: string
  data?: CheckInData
} | null

interface QRScannerProps {
  eventoId: string
  onScanSuccess: (data: CheckInData) => void
  onClose: () => void
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [iniciando, setIniciando] = useState(true)
  const [errorCamara, setErrorCamara] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoState>(null)
  const [flashActivo, setFlashActivo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const cooldownRef = useRef(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let scanner: QrScanner | null = null

    const init = async () => {
      if (!videoRef.current) return
      try {
        scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (cooldownRef.current) return
            cooldownRef.current = true
            procesarQR(result.data)
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 15,
            preferredCamera: 'environment',
          }
        )
        scannerRef.current = scanner
        await scanner.start()
        setIniciando(false)
      } catch (err: any) {
        setErrorCamara(
          String(err).toLowerCase().includes('permission')
            ? 'Permiso de cámara denegado'
            : 'No se pudo acceder a la cámara'
        )
        setIniciando(false)
      }
    }

    init()
    return () => {
      scanner?.stop()
      scanner?.destroy()
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [])

  const showResultado = (r: ResultadoState, autoDismissMs?: number) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    setResultado(r)
    if (autoDismissMs) {
      dismissTimerRef.current = setTimeout(() => {
        setResultado(null)
        cooldownRef.current = false
      }, autoDismissMs)
    }
  }

  const procesarQR = async (qrCode: string) => {
    try {
      const res = await api.post('/asistencia/verificar-qr', { qrCode })
      const data: CheckInData = res.data.data
      showResultado({
        tipo: 'success',
        mensaje: 'Registrado exitoso',
        data,
      }, 3000)
      onScanSuccess(data)
    } catch (err: any) {
      const msg = err.response?.data?.mensaje ?? 'QR inválido o error del servidor'
      showResultado({ tipo: 'error', mensaje: 'No se pudo registrar', detalle: msg }, 3000)
    }
  }

  const toggleFlash = async () => {
    try {
      await scannerRef.current?.toggleFlash()
      setFlashActivo(v => !v)
    } catch {}
  }

  const handleClose = () => {
    scannerRef.current?.stop()
    scannerRef.current?.destroy()
    onClose()
  }

  return (
    /* Fondo oscuro */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-8">

      {/* Contenedor — full screen móvil, tamaño fijo desktop */}
      <div className="relative bg-black w-full h-full sm:w-[480px] sm:h-[600px] sm:rounded-2xl overflow-hidden">

        {/* ── Video (posición absoluta, llena el contenedor) ── */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* ── Barra superior ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">Escáner QR</span>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* ── Overlay cargando ── */}
        {iniciando && !errorCamara && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60">
            <Loader2 size={40} className="text-white animate-spin mb-3" />
            <p className="text-white text-sm font-medium">Iniciando cámara...</p>
          </div>
        )}

        {/* ── Overlay error cámara ── */}
        {errorCamara && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black px-8 text-center">
            <XCircle size={48} className="text-red-400 mb-3" />
            <p className="text-white font-semibold mb-1">Sin acceso a cámara</p>
            <p className="text-gray-400 text-sm">{errorCamara}</p>
          </div>
        )}

        {/* ── Marco guía de escaneo ── */}
        {!iniciando && !errorCamara && !resultado && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="relative" style={{ width: 220, height: 220 }}>
              {/* Esquinas */}
              {[
                'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 border-white ${cls}`} />
              ))}
              {/* Línea animada */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary/80 animate-pulse" />
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-xs whitespace-nowrap">
                Centra el QR aquí
              </p>
            </div>
          </div>
        )}

        {/* ── Notificación resultado (overlay sobre cámara) ── */}
        {resultado && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <div className={`rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 ${
              resultado.tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {resultado.tipo === 'success'
                ? <CheckCircle size={26} className="text-white flex-shrink-0" />
                : <XCircle size={26} className="text-white flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base leading-tight">
                  {resultado.tipo === 'success' ? 'Registrado exitoso' : resultado.mensaje}
                </p>
                {resultado.tipo === 'error' && (
                  <p className="text-white/80 text-sm mt-0.5 truncate">{resultado.detalle}</p>
                )}
              </div>
              <button
                onClick={() => { setResultado(null); cooldownRef.current = false }}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ── Barra inferior ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
          {/* Flash */}
          <button
            onClick={toggleFlash}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              flashActivo ? 'bg-yellow-400' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Zap size={20} className={flashActivo ? 'text-black' : 'text-white'} />
          </button>

          {/* Cerrar */}
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white font-semibold text-sm transition-colors"
          >
            Cerrar
          </button>

          {/* Balance */}
          <div className="w-12" />
        </div>
      </div>
    </div>
  )
}
