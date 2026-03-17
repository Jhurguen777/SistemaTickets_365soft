import React, { useState, useEffect } from 'react'
import { ChevronLeft, CheckCircle2, XCircle, ZoomIn, Download, Search, Filter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { comprobantesPagoService, Comprobante } from '@/services/comprobantesPagoService'

const C = {
  azul: '#233C7A',
  verde: '#10B981',
  rojo: '#EF4444',
  amarillo: '#F59E0B',
  gris: '#F5F5F5',
  verdeClaro: '#D1FAE5',
  rojoClaro: '#FEE2E2',
}

type EstadoFilter = 'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

const PaymentVerificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [comprobantesOriginales, setComprobantesOriginales] = useState<Comprobante[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>('PENDIENTE')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedComprobante, setSelectedComprobante] = useState<Comprobante | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [rechazoModal, setRechazoModal] = useState<{ open: boolean; comprobanteId: string }>({ open: false, comprobanteId: '' })
  const [mensajeRechazo, setMensajeRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [comprobantesAgrupados, setComprobantesAgrupados] = useState<any[]>([])

  // Cargar comprobantes
  const cargarComprobantes = async () => {
    setLoading(true)
    try {
      const estado = filtroEstado === 'TODOS' ? undefined : filtroEstado
      const response = await comprobantesPagoService.listarComprobantes(estado, 1, 50)
      const todosComprobantes = response.data

      // Guardar comprobantes originales para aprobar/rechazar
      setComprobantesOriginales(todosComprobantes)

      // Agrupar comprobantes por evento y usuario
      const grupos = new Map<string, Comprobante[]>()
      const comprobantesAislados: Comprobante[] = []

      todosComprobantes.forEach(comprobante => {
        const key = `${comprobante.compra.evento.id}-${comprobante.compra.usuario.id}`
        if (!grupos.has(key)) {
          grupos.set(key, [])
        }
        grupos.get(key)!.push(comprobante)
      })

      // Crear array de grupos para mostrar
      const gruposParaMostrar: any[] = []
      for (const [key, grupo] of grupos.entries()) {
        if (grupo.length > 1) {
          // Agrupar: crear un comprobante combinado
          const montoTotal = grupo.reduce((sum: number, c) => sum + c.compra.monto, 0)
          const todosAsientos = grupo.flatMap((c: Comprobante) => {
            if (c.compra.asiento) {
              return [{ fila: c.compra.asiento.fila, numero: c.compra.asiento.numero }]
            }
            return []
          })
          const asientosUnicos = todosAsientos.filter(a => a.length > 0)

          const primerComprobante = grupo[0]
          gruposParaMostrar.push({
            ...primerComprobante,
            id: `grupo-${primerComprobante.id}`,
            esGrupo: true,
            montoTotal,
            cantidadBoletos: grupo.length,
            asientos: asientosUnicos,
          })
        } else {
          // Individual: mostrar como está
          comprobantesAislados.push(grupo[0])
        }
      }

      setComprobantesAgrupados(gruposParaMostrar)
      setComprobantes([...gruposParaMostrar, ...comprobantesAislados])
    } catch (error: any) {
      console.error('Error al cargar comprobantes:', error)
      alert('Error al cargar los comprobantes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarComprobantes()
  }, [filtroEstado])

  // Filtrar por búsqueda
  const comprobantesParaFiltrar = [...comprobantesAgrupados, ...comprobantes]
  const comprobantesFiltrados = comprobantesParaFiltrar.filter(c => {
    if (!busqueda) return true
    const busquedaLower = busqueda.toLowerCase()
    return (
      c.compra.usuario.nombre.toLowerCase().includes(busquedaLower) ||
      c.compra.usuario.email.toLowerCase().includes(busquedaLower) ||
      c.compra.evento.titulo.toLowerCase().includes(busquedaLower)
    )
  })

  // Manejar aprobar comprobante
  const handleAprobar = async (comprobanteId: string) => {
    if (!confirm('¿Estás seguro de aprobar este comprobante?')) return

    setProcesando(true)
    try {
      // Si es un grupo, aprobar todos los comprobantes del grupo
      if (comprobanteId.startsWith('grupo-')) {
        const idReal = comprobanteId.replace('grupo-', '')
        // Buscar en comprobantes originales (no en los agrupados)
        const grupo = comprobantesOriginales.filter(c => c.id === idReal)
        for (const comp of grupo) {
          await comprobantesPagoService.aprobarComprobante(comp.id)
        }
      } else {
        await comprobantesPagoService.aprobarComprobante(comprobanteId)
      }
      alert('Comprobante(s) aprobado(s) exitosamente')
      cargarComprobantes()
    } catch (error: any) {
      alert(error.message || 'Error al aprobar el comprobante')
    } finally {
      setProcesando(false)
    }
  }

  // Manejar rechazar comprobante
  const handleRechazo = async () => {
    if (!mensajeRechazo.trim()) {
      alert('Por favor escribe un motivo del rechazo')
      return
    }

    setProcesando(true)
    try {
      // Si es un grupo, rechazar todos los comprobantes del grupo
      if (rechazoModal.comprobanteId.startsWith('grupo-')) {
        const idReal = rechazoModal.comprobanteId.replace('grupo-', '')
        // Buscar en comprobantes originales (no en los agrupados)
        const grupo = comprobantesOriginales.filter(c => c.id === idReal)
        for (const comp of grupo) {
          await comprobantesPagoService.rechazarComprobante(comp.id, mensajeRechazo)
        }
      } else {
        await comprobantesPagoService.rechazarComprobante(rechazoModal.comprobanteId, mensajeRechazo)
      }
      alert('Comprobante(s) rechazado(s) exitosamente')
      setRechazoModal({ open: false, comprobanteId: '' })
      setMensajeRechazo('')
      cargarComprobantes()
    } catch (error: any) {
      alert(error.message || 'Error al rechazar el comprobante')
    } finally {
      setProcesando(false)
    }
  }

  // Abrir modal de rechazo
  const openRechazoModal = (comprobanteId: string) => {
    setRechazoModal({ open: true, comprobanteId })
    setMensajeRechazo('')
  }

  // Ver imagen en modal
  const verImagen = (comprobante: Comprobante) => {
    setSelectedComprobante(comprobante)
    setImageZoom(1)
    setShowImageModal(true)
  }

  // Descargar imagen
  const descargarImagen = (imagenBase64: string, nombre: string) => {
    const link = document.createElement('a')
    link.href = imagenBase64
    link.download = nombre
    link.click()
  }

  // Formatear fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear tamaño de archivo
  const formatTamano = (bytes?: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const contarPorEstado = () => {
    const pendientes = comprobantesFiltrados.filter(c => c.estado === 'PENDIENTE').length
    const aprobados = comprobantesFiltrados.filter(c => c.estado === 'APROBADO').length
    const rechazados = comprobantesFiltrados.filter(c => c.estado === 'RECHAZADO').length
    return { pendientes, aprobados, rechazados }
  }

  const estadisticas = contarPorEstado()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" />
            <span className="font-medium">Volver</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Verificación de Pagos</h1>

          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros y estadísticas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Buscador */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario, email o evento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Filtros de estado */}
            <div className="flex gap-2">
              {(['TODOS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'] as EstadoFilter[]).map((filtro) => (
                <button
                  key={filtro}
                  onClick={() => setFiltroEstado(filtro)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filtroEstado === filtro
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro.charAt(0) + filtro.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: C.amarillo }} />
              <span className="text-sm text-gray-600">
                Pendientes: <span className="font-bold text-gray-900">{estadisticas.pendientes}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: C.verde }} />
              <span className="text-sm text-gray-600">
                Aprobados: <span className="font-bold text-gray-900">{estadisticas.aprobados}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: C.rojo }} />
              <span className="text-sm text-gray-600">
                Rechazados: <span className="font-bold text-gray-900">{estadisticas.rechazados}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Lista de comprobantes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : comprobantesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay comprobantes</h3>
            <p className="text-gray-600">
              {busqueda
                ? 'No se encontraron resultados para tu búsqueda'
                : 'No hay comprobantes en este estado'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comprobantesFiltrados.map((comprobante: any) => (
              <div
                key={comprobante.id}
                className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Columna izquierda: Información del comprobante */}
                  <div className="flex-1 space-y-4">
                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      {comprobante.estado === 'PENDIENTE' && (
                        <>
                          <div className="w-3 h-3 rounded-full" style={{ background: C.amarillo }} />
                          <span className="text-sm font-semibold" style={{ color: '#92400E' }}>
                            Pendiente de revisión
                          </span>
                        </>
                      )}
                      {comprobante.estado === 'APROBADO' && (
                        <>
                          <div className="w-3 h-3 rounded-full" style={{ background: C.verde }} />
                          <span className="text-sm font-semibold text-green-600">Aprobado</span>
                        </>
                      )}
                      {comprobante.estado === 'RECHAZADO' && (
                        <>
                          <div className="w-3 h-3 rounded-full" style={{ background: C.rojo }} />
                          <span className="text-sm font-semibold text-red-600">Rechazado</span>
                        </>
                      )}
                    </div>

                    {/* Fecha de subida */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de subida</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatFecha(comprobante.fechaSubida)}
                      </p>
                    </div>

                    {/* Información del evento */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Evento</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {comprobante.compra.evento.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFecha(String(comprobante.compra.evento.fecha))} • {comprobante.compra.evento.ubicacion}
                      </p>
                    </div>

                    {/* Información del usuario */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Comprador</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {comprobante.compra.usuario.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{comprobante.compra.usuario.email}</p>
                    </div>

                    {/* Información de la compra */}
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {comprobante.esGrupo ? 'Monto total' : 'Monto'}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {comprobante.esGrupo ? `${comprobante.compra.moneda} ${comprobante.montoTotal.toFixed(2)}` : `${comprobante.compra.moneda} ${comprobante.compra.monto.toFixed(2)}`}
                        </p>
                      </div>
                      {comprobante.esGrupo && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Boletos</p>
                            <p className="text-sm font-medium text-gray-900">{comprobante.cantidadBoletos}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Asientos</p>
                            <p className="text-sm font-medium text-gray-900">
                              {comprobante.asientos.map((a, i) =>
                                <span key={i}>
                                  {a.fila}{a.numero}
                                  {i < comprobante.asientos.length - 1 && ', '}
                                </span>
                              ).join('')}
                            </p>
                          </div>
                        </>
                      )}
                      {!comprobante.esGrupo && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Asiento</p>
                          <p className="text-sm font-medium text-gray-900">
                            {comprobante.compra.asiento
                              ? `${comprobante.compra.asiento.fila}${comprobante.compra.asiento.numero}`
                              : `#${comprobante.compra.numeroBoleto || ''}`}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Archivo</p>
                        <p className="text-sm text-gray-600">
                          {formatTamano(comprobante.tamanoBytes)}
                        </p>
                      </div>
                    </div>

                    {/* Mensaje de rechazo */}
                    {comprobante.estado === 'RECHAZADO' && comprobante.mensajeRechazo && (
                      <div className="p-3 rounded-xl" style={{ background: C.rojoClaro }}>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Motivo de rechazo</p>
                        <p className="text-sm text-gray-900">{comprobante.mensajeRechazo}</p>
                      </div>
                    )}

                    {/* Acciones */}
                    {comprobante.estado === 'PENDIENTE' && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleAprobar(comprobante.id)}
                          disabled={procesando}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle2 size={18} />
                          Aprobar
                        </button>
                        <button
                          onClick={() => openRechazoModal(comprobante.id)}
                          disabled={procesando}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Columna derecha: Imagen del comprobante */}
                  <div className="lg:w-96">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Comprobante</p>
                    <div className="relative group cursor-pointer" onClick={() => verImagen(comprobante)}>
                      <img
                        src={comprobante.imagenUrl}
                        alt="Comprobante de pago"
                        className="w-full h-64 object-contain rounded-xl border border-gray-200"
                      />
                      {/* Overlay al hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <ZoomIn size={32} className="text-white" />
                      </div>
                    </div>
                    <button
                      onClick={() => descargarImagen(comprobante.imagenUrl, `comprobante_${comprobante.id}`)}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <Download size={16} />
                      Descargar imagen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualización de imagen con zoom */}
      {showImageModal && selectedComprobante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Comprobante de Pago</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Controles de zoom */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  disabled={imageZoom <= 0.5}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                  disabled={imageZoom >= 3}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => descargarImagen(selectedComprobante.imagenUrl, `comprobante_${selectedComprobante.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all"
              >
                <Download size={16} />
                Descargar
              </button>
            </div>

            {/* Imagen */}
            <div className="p-4 overflow-auto">
              <img
                src={selectedComprobante.imagenUrl}
                alt="Comprobante de pago"
                style={{ transform: `scale(${imageZoom})` }}
                className="max-w-full object-contain mx-auto"
              />
            </div>

            {/* Información adicional */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Usuario</p>
                  <p className="font-medium text-gray-900">{selectedComprobante.compra.usuario.nombre}</p>
                  <p className="text-gray-600 text-xs">{selectedComprobante.compra.usuario.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Evento</p>
                  <p className="font-medium text-gray-900">{selectedComprobante.compra.evento.titulo}</p>
                  <p className="text-gray-600 text-xs">
                    {formatFecha(String(selectedComprobante.compra.evento.fecha))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Monto</p>
                  <p className="font-bold text-gray-900">
                    {selectedComprobante.compra.moneda} {selectedComprobante.compra.monto.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className={`font-medium ${
                    selectedComprobante.estado === 'PENDIENTE' ? 'text-yellow-600' :
                    selectedComprobante.estado === 'APROBADO' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {selectedComprobante.estado.charAt(0) + selectedComprobante.estado.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo */}
      {rechazoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRechazoModal({ open: false, comprobanteId: '' })}>
          <div className="bg-white rounded-2xl max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 px-6 pt-6 pb-4">Rechazar Comprobante</h2>

            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-4">
                Por favor indica el motivo por el cual se rechaza este comprobante. Este mensaje será visible para el usuario.
              </p>

              <textarea
                value={mensajeRechazo}
                onChange={(e) => setMensajeRechazo(e.target.value)}
                placeholder="Escribe el motivo del rechazo..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setRechazoModal({ open: false, comprobanteId: '' })}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazo}
                  disabled={!mensajeRechazo.trim() || procesando}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {procesando ? 'Rechazando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentVerificationsPage
