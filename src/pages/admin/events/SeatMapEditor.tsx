import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, ChevronUp, ChevronDown, Pencil, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import api from '@/services/api'

interface Sector {
  id: string
  name: string
  color: string
  price: number
  total: number
  available: number
}

interface Row {
  id: string
  name: string
  seats: number
  columns: number
  order: number
  sectorId?: string
}

interface SpecialSeat {
  rowId: string
  seatIndex: number
  sectorId?: string
  sectorName?: string
  price?: number
  color?: string
  status?: 'available' | 'reserved' | 'sold'
}

const COLORS = [
  { name: 'Verde',    value: '#10B981' },
  { name: 'Rojo',     value: '#EF4444' },
  { name: 'Azul',     value: '#3B82F6' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Púrpura',  value: '#8B5CF6' },
  { name: 'Rosa',     value: '#EC4899' },
  { name: 'Gris',     value: '#6B7280' },
  { name: 'Naranja',  value: '#F97316' },
  { name: 'Cian',     value: '#06B6D4' },
  { name: 'Lima',     value: '#84CC16' },
  { name: 'Índigo',   value: '#6366F1' },
  { name: 'Ámbar',    value: '#D97706' },
]

const newSectorForm = (colorIndex = 0) => ({
  id: `sector-${Date.now()}`,
  name: '',
  color: COLORS[colorIndex % COLORS.length].value,
  price: 0,
})

export default function SeatMapEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [eventTitle, setEventTitle] = useState('')

  // Sectores ya confirmados
  const [sectors, setSectors] = useState<Sector[]>([])
  // Filas globales de sectores confirmados
  const [rows, setRows] = useState<Row[]>([])

  // Formulario del sector en curso
  const [activeSector, setActiveSector] = useState<{ id: string; name: string; color: string; price: number } | null>(newSectorForm(0))
  // Filas del sector en curso (aún no confirmado)
  const [activeRows, setActiveRows] = useState<Row[]>([])

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null)
  const [showBulkGenerator, setShowBulkGenerator] = useState(false)
  const [bulkRows, setBulkRows] = useState(5)
  const [bulkSeats, setBulkSeats] = useState(10)
  const [bulkColumns, setBulkColumns] = useState(2)

  // Asientos especiales
  const [specialSeats, setSpecialSeats] = useState<SpecialSeat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<{ rowId: string; seatIndex: number } | null>(null)
  const [showSeatPanel, setShowSeatPanel] = useState(false)
  const [editingSpecialSeat, setEditingSpecialSeat] = useState<SpecialSeat | null>(null)

  // Refs para los inputs del panel de asiento especial
  const sectorNameRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)

  // ── Asientos especiales ──
  const handleSeatClick = (rowId: string, seatIndex: number) => {
    const existingSpecialSeat = getSpecialSeat(rowId, seatIndex)
    setSelectedSeat({ rowId, seatIndex })
    setEditingSpecialSeat(existingSpecialSeat || {
      rowId,
      seatIndex,
      status: 'available'
    })
    setShowSeatPanel(true)
  }

  const getSpecialSeat = (rowId: string, seatIndex: number): SpecialSeat | undefined => {
    return specialSeats.find(s => s.rowId === rowId && s.seatIndex === seatIndex)
  }

  const handleSaveSpecialSeat = (data: Partial<SpecialSeat>, closePanel = false) => {
    if (!selectedSeat) return

    // Actualizar estado local
    setEditingSpecialSeat(prev => prev ? { ...prev, ...data } : null)

    const existingIndex = specialSeats.findIndex(
      s => s.rowId === selectedSeat.rowId && s.seatIndex === selectedSeat.seatIndex
    )

    if (existingIndex >= 0) {
      // Actualizar asiento especial existente
      const newSpecialSeats = [...specialSeats]
      newSpecialSeats[existingIndex] = { ...newSpecialSeats[existingIndex], ...data }
      setSpecialSeats(newSpecialSeats)
    } else {
      // Crear nuevo asiento especial
      setSpecialSeats([...specialSeats, {
        rowId: selectedSeat.rowId,
        seatIndex: selectedSeat.seatIndex,
        status: 'available',
        ...data
      }])
    }

    // Solo cerrar el panel si se explícitamente
    if (closePanel) {
      setShowSeatPanel(false)
      setSelectedSeat(null)
      setEditingSpecialSeat(null)
    }
  }

  const handleRemoveSpecialSeat = () => {
    if (!selectedSeat) return

    setSpecialSeats(specialSeats.filter(
      s => !(s.rowId === selectedSeat.rowId && s.seatIndex === selectedSeat.seatIndex)
    ))
    setShowSeatPanel(false)
    setSelectedSeat(null)
    setEditingSpecialSeat(null)
  }

  // ── Cargar evento ──
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await api.get(`/eventos/${id}`)
        const evt = response.data.data
        setEventTitle(evt.titulo || '')

        // Si hay seatMapConfig guardado, cargarlo
        if (evt.seatMapConfig) {
          const config = evt.seatMapConfig

          // Cargar sectores
          if (config.sectors && config.sectors.length > 0) {
            setSectors(config.sectors)
          }

          // Cargar filas
          if (config.rows && config.rows.length > 0) {
            setRows(config.rows)
          }

          // Cargar asientos especiales
          if (config.specialSeats && config.specialSeats.length > 0) {
            setSpecialSeats(config.specialSeats)
          }

          setActiveSector(null)
        } else {
          // Si no hay configuración guardada, empezar vacío
          setSectors([])
          setRows([])
          setSpecialSeats([])
          setActiveSector(null)
        }
      } catch (error) {
        console.error('Error al cargar evento:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [id])

  // ── Generar múltiples filas ──
  const handleGenerateBulkRows = () => {
    if (bulkRows < 1 || bulkSeats < 1 || bulkColumns < 1) {
      alert('Ingresa valores válidos')
      return
    }

    const offset = rows.length + activeRows.length
    const newRows: Row[] = []

    for (let i = 0; i < bulkRows; i++) {
      newRows.push({
        id: `row-${Date.now()}-${i}`,
        name: `Fila ${String.fromCharCode(65 + offset + i)}`,
        seats: bulkSeats,
        columns: bulkColumns,
        order: activeRows.length + i,
      })
    }

    setActiveRows([...activeRows, ...newRows])
    setShowBulkGenerator(false)
    setBulkRows(5)
    setBulkSeats(10)
    setBulkColumns(2)
  }

  // ── Filas del sector activo ──
  const handleAddActiveRow = () => {
    const offset = rows.length + activeRows.length
    const newRow: Row = {
      id: `row-${Date.now()}`,
      name: `Fila ${String.fromCharCode(65 + offset)}`,
      seats: 10,
      columns: 2,
      order: activeRows.length,
    }
    setActiveRows([...activeRows, newRow])
  }

  const handleRemoveActiveRow = (rowId: string) => {
    const updated = activeRows.filter(r => r.id !== rowId)
    updated.forEach((r, i) => (r.order = i))
    setActiveRows(updated)
  }

  const handleActiveRowChange = (rowId: string, field: keyof Row, value: any) => {
    setActiveRows(activeRows.map(r => r.id === rowId ? { ...r, [field]: value } : r))
  }

  const handleMoveActiveRowUp = (index: number) => {
    if (index === 0) return
    const nr = [...activeRows]
    ;[nr[index - 1], nr[index]] = [nr[index], nr[index - 1]]
    nr[index - 1].order = index - 1
    nr[index].order = index
    setActiveRows(nr)
  }

  const handleMoveActiveRowDown = (index: number) => {
    if (index === activeRows.length - 1) return
    const nr = [...activeRows]
    ;[nr[index + 1], nr[index]] = [nr[index], nr[index + 1]]
    nr[index + 1].order = index + 1
    nr[index].order = index
    setActiveRows(nr)
  }

  // ── Confirmar sector activo ──
  const handleAddSectorToList = () => {
    if (!activeSector) return
    if (!activeSector.name.trim()) { alert('Por favor ingresa un nombre para el sector'); return }
    if (activeSector.price <= 0) { alert('Por favor ingresa un precio válido'); return }
    if (activeRows.length === 0) { alert('Por favor agrega al menos una fila'); return }

    const totalSeats = activeRows.reduce((sum, r) => sum + r.seats, 0)
    const newSector: Sector = {
      id: activeSector.id,
      name: activeSector.name,
      color: activeSector.color,
      price: activeSector.price,
      total: totalSeats,
      available: totalSeats,
    }

    const baseOrder = rows.length
    const rowsWithSector = activeRows.map((r, i) => ({ ...r, sectorId: activeSector.id, order: baseOrder + i }))

    setSectors([...sectors, newSector])
    setRows([...rows, ...rowsWithSector])
    setActiveRows([])
    setActiveSector(null)
    setShowColorPicker(false)
  }

  // ── Iniciar nuevo sector ──
  const handleStartNewSector = () => {
    setActiveSector(newSectorForm(sectors.length))
    setActiveRows([])
    setShowColorPicker(false)
  }

  // ── Eliminar sector confirmado ──
  const handleRemoveSector = (sectorId: string) => {
    setSectors(sectors.filter(s => s.id !== sectorId))
    setRows(rows.filter(r => r.sectorId !== sectorId))
    if (editingSectorId === sectorId) setEditingSectorId(null)
  }

  // ── Filas de sectores confirmados ──
  const handleRemoveRow = (rowId: string) => {
    const updated = rows.filter(r => r.id !== rowId)
    updated.forEach((r, i) => (r.order = i))
    setRows(updated)
  }

  const handleRowChange = (rowId: string, field: keyof Row, value: any) => {
    setRows(rows.map(r => r.id === rowId ? { ...r, [field]: value } : r))
  }

  const handleMoveRowUp = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId)
    if (index <= 0) return
    const nr = [...rows]
    ;[nr[index - 1], nr[index]] = [nr[index], nr[index - 1]]
    nr[index - 1].order = index - 1
    nr[index].order = index
    setRows(nr)
  }

  const handleMoveRowDown = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId)
    if (index === rows.length - 1) return
    const nr = [...rows]
    ;[nr[index + 1], nr[index]] = [nr[index], nr[index + 1]]
    nr[index + 1].order = index + 1
    nr[index].order = index
    setRows(nr)
  }

  // ── Guardar ──
  const handleSaveAndReturn = async () => {
    if (!id) return
    if (sectors.length === 0) { alert('Por favor añade al menos un sector'); return }

    setSaving(true)
    try {
      const sectorsBySector: { [key: string]: Row[] } = {}
      rows.forEach(row => {
        if (row.sectorId) {
          if (!sectorsBySector[row.sectorId]) sectorsBySector[row.sectorId] = []
          sectorsBySector[row.sectorId].push(row)
        }
      })

      const sectorsData = Object.keys(sectorsBySector).map(sectorId => {
        const sectorRows = sectorsBySector[sectorId]
        const totalSeats = sectorRows.reduce((sum, row) => sum + row.seats, 0)
        const sector = sectors.find(s => s.id === sectorId)!
        return { nombre: sector.name, precio: sector.price, total: totalSeats, disponible: totalSeats }
      })

      // Guardar también la configuración completa de filas para poder recrearla
      const seatMapConfig = {
        sectors: sectors.map(s => ({ id: s.id, name: s.name, color: s.color, price: s.price })),
        rows: rows.map(r => ({ id: r.id, name: r.name, seats: r.seats, columns: r.columns, order: r.order, sectorId: r.sectorId })),
        specialSeats: specialSeats
      }

      await api.put(`/eventos/${id}`, {
        sectores: sectorsData,
        seatMapConfig: seatMapConfig
      })
      navigate(`/admin/eventos/${id}/editar`)
    } catch (error: any) {
      alert('Error al guardar: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando evento...</p>
        </div>
      </div>
    )
  }

  const sortedRows = [...rows].sort((a, b) => a.order - b.order)
  const sortedActiveRows = [...activeRows].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50 flex items-start -mx-8 -mt-6">

      {/* ═══════════════════════════════════
          PANEL IZQUIERDO
      ═══════════════════════════════════ */}
      <div className="w-[500px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 flex-1 pt-4">

          {/* Header */}
          <div className="mb-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-3 text-sm gap-1">
              <ArrowLeft size={15} /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900">Editor de Mapa de Asientos</h1>
            <p className="text-xs text-gray-500 mt-0.5">{eventTitle}</p>
          </div>

          {/* ── Sectores confirmados ── */}
          {sectors.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Sectores añadidos</p>
              <div className="space-y-2">
                {sectors.map((sector) => {
                  const sectorRows = sortedRows.filter(r => r.sectorId === sector.id)
                  const isEditing = editingSectorId === sector.id
                  return (
                    <div key={sector.id} className="rounded-xl border overflow-hidden" style={{ borderColor: sector.color + '50' }}>
                      {/* Header sector */}
                      <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: sector.color + '18' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sector.color }} />
                          <span className="text-sm font-semibold text-gray-800 truncate">{sector.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">Bs {sector.price} · {sector.total} asientos</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingSectorId(isEditing ? null : sector.id)}
                            className="p-1.5 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-700 transition-colors"
                            title={isEditing ? 'Cerrar' : 'Ver/editar filas'}
                          >
                            {isEditing ? <Check size={13} /> : <Pencil size={13} />}
                          </button>
                          <button
                            onClick={() => handleRemoveSector(sector.id)}
                            className="p-1.5 rounded-lg hover:bg-white/70 text-red-400 hover:text-red-600 transition-colors"
                            title="Eliminar sector"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Filas expandibles */}
                      {isEditing && (
                        <div className="px-3 py-3 space-y-1.5 bg-white">
                          {sectorRows.map((row, index) => (
                            <div key={row.id} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                                className="text-xs font-medium text-gray-900 border border-gray-200 rounded px-1.5 py-1 w-20"
                              />
                              <input
                                type="number"
                                value={row.seats}
                                onChange={(e) => handleRowChange(row.id, 'seats', parseInt(e.target.value) || 0)}
                                className="text-xs text-gray-600 border border-gray-200 rounded px-1.5 py-1 w-14"
                                min="1"
                              />
                              <span className="text-xs text-gray-400">asientos</span>
                              <input
                                type="number"
                                value={row.columns || 1}
                                onChange={(e) => handleRowChange(row.id, 'columns', parseInt(e.target.value) || 1)}
                                className="text-xs text-gray-600 border border-gray-200 rounded px-1.5 py-1 w-12"
                                min="1"
                                max="10"
                                title="Número de columnas"
                              />
                              <span className="text-xs text-gray-400">cols</span>
                              <div className="flex items-center ml-auto gap-0.5 flex-shrink-0">
                                <button onClick={() => handleMoveRowUp(row.id)} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30" disabled={index === 0}><ChevronUp size={12} /></button>
                                <button onClick={() => handleMoveRowDown(row.id)} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30" disabled={index === sectorRows.length - 1}><ChevronDown size={12} /></button>
                                <button onClick={() => handleRemoveRow(row.id)} className="p-0.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><X size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Formulario sector activo ── */}
          {activeSector ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {sectors.length === 0 ? 'Configura tu primer sector' : 'Nuevo sector'}
              </p>

              {/* Nombre + Color */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-10 h-10 rounded-xl border-2 border-white shadow-md ring-1 ring-gray-200 hover:ring-gray-400 transition-all"
                    style={{ backgroundColor: activeSector.color }}
                    title="Elegir color"
                  />
                  {showColorPicker && (
                    <div className="absolute left-0 top-12 z-30 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xl">
                      <p className="text-[10px] text-gray-400 mb-2 font-medium uppercase tracking-wide">Color del sector</p>
                      <div className="grid grid-cols-4 gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.name}
                            onClick={() => { setActiveSector({ ...activeSector, color: c.value }); setShowColorPicker(false) }}
                            className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${activeSector.color === c.value ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={activeSector.name}
                  onChange={(e) => setActiveSector({ ...activeSector, name: e.target.value })}
                  className="flex-1 text-sm font-medium border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="Nombre del sector (ej: General, VIP...)"
                />
              </div>

              {/* Precio */}
              <div className="flex items-center gap-2 mb-5">
                <label className="text-xs text-gray-500 w-12 flex-shrink-0">Precio</label>
                <input
                  type="number"
                  value={activeSector.price || ''}
                  onChange={(e) => setActiveSector({ ...activeSector, price: parseInt(e.target.value) || 0 })}
                  className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="0"
                  min="0"
                />
                <span className="text-xs text-gray-400 flex-shrink-0">Bs / asiento</span>
              </div>

              {/* Filas del sector activo */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600">Filas de asientos</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleAddActiveRow}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Plus size={11} /> +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkGenerator(!showBulkGenerator)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      ⚡ Generar
                    </button>
                  </div>
                </div>

                {/* Generador rápido */}
                {showBulkGenerator && (
                  <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 mb-2">Generar múltiples filas</p>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 block mb-0.5">Número de filas</label>
                        <input
                          type="number"
                          value={bulkRows}
                          onChange={(e) => setBulkRows(parseInt(e.target.value) || 0)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 block mb-0.5">Asientos por fila</label>
                        <input
                          type="number"
                          value={bulkSeats}
                          onChange={(e) => setBulkSeats(parseInt(e.target.value) || 0)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 block mb-0.5">Columnas</label>
                        <input
                          type="number"
                          value={bulkColumns}
                          onChange={(e) => setBulkColumns(parseInt(e.target.value) || 0)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleGenerateBulkRows}
                        className="flex-1 text-xs py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        Generar {bulkRows} filas × {bulkSeats} asientos × {bulkColumns} cols ({bulkRows * bulkSeats} total)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBulkGenerator(false)}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {activeRows.length === 0 ? (
                  <div className="text-center py-5 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Aún sin filas — usa "+1" o "⚡ Generar"
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {sortedActiveRows.map((row, index) => (
                      <div key={row.id} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200">
                        <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: activeSector.color }} />
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleActiveRowChange(row.id, 'name', e.target.value)}
                          className="text-xs font-medium text-gray-900 border border-gray-200 rounded-lg px-1.5 py-1 w-20"
                        />
                        <input
                          type="number"
                          value={row.seats}
                          onChange={(e) => handleActiveRowChange(row.id, 'seats', parseInt(e.target.value) || 0)}
                          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-1.5 py-1 w-14"
                          min="1"
                        />
                        <span className="text-xs text-gray-400">asientos</span>
                        <input
                          type="number"
                          value={row.columns}
                          onChange={(e) => handleActiveRowChange(row.id, 'columns', parseInt(e.target.value) || 1)}
                          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-1.5 py-1 w-12"
                          min="1"
                          max="10"
                          title="Número de columnas"
                        />
                        <span className="text-xs text-gray-400">cols</span>
                        <div className="flex items-center ml-auto gap-0.5 flex-shrink-0">
                          <button onClick={() => handleMoveActiveRowUp(index)} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30" disabled={index === 0}><ChevronUp size={13} /></button>
                          <button onClick={() => handleMoveActiveRowDown(index)} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30" disabled={index === activeRows.length - 1}><ChevronDown size={13} /></button>
                          <button onClick={() => handleRemoveActiveRow(row.id)} className="p-0.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><X size={13} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-[11px] text-gray-400 pt-0.5 pr-1">
                      {activeRows.length} fila{activeRows.length !== 1 ? 's' : ''} · {activeRows.reduce((s, r) => s + r.seats, 0)} asientos en total
                    </div>
                  </div>
                )}
              </div>

              {/* Botón añadir sector */}
              <button
                type="button"
                onClick={handleAddSectorToList}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                style={{ backgroundColor: activeSector.color }}
              >
                + Añadir sector "{activeSector.name || '...'}"
              </button>
            </div>
          ) : (
            /* Botón para iniciar nuevo sector */
            <button
              type="button"
              onClick={handleStartNewSector}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Añadir otro sector
            </button>
          )}
        </div>

        {/* Acciones al fondo del panel */}
        <div className="p-5 border-t border-gray-100 space-y-2">
          <Button
            onClick={handleSaveAndReturn}
            disabled={saving || sectors.length === 0}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            {saving ? 'Guardando...' : (<><Save size={15} className="mr-2" /> Guardar y volver</>)}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving} className="w-full">
            Cancelar
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════
          VISTA PREVIA
      ═══════════════════════════════════ */}
      <div className="flex-1 min-w-0 px-8 py-8 overflow-auto min-h-screen">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Vista Previa del Mapa</h3>

        {sortedRows.length === 0 && sortedActiveRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="text-sm">Añade sectores y filas para ver la vista previa</span>
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="min-w-max">
              {/* Escenario */}
              <div className="mb-6 text-center">
                <div className="inline-block px-12 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg tracking-widest">
                  ESCENARIO
                </div>
              </div>

              <div className="space-y-1.5">
                {/* Filas confirmadas */}
                {sortedRows.map((row) => {
                  const sector = sectors.find(s => s.id === row.sectorId)
                  const seatsPerColumn = Math.ceil(row.seats / (row.columns || 1))
                  const columns = []

                  for (let col = 0; col < (row.columns || 1); col++) {
                    const startSeat = col * seatsPerColumn
                    const endSeat = Math.min(startSeat + seatsPerColumn, row.seats)
                    const columnSeats = []

                    for (let i = startSeat; i < endSeat; i++) {
                      columnSeats.push(i)
                    }

                    columns.push(columnSeats)
                  }

                  return (
                    <div key={row.id} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 w-20 text-right flex-shrink-0">{row.name}</span>
                      <div className="flex gap-1">
                        {columns.map((columnSeats, colIndex) => (
                          <React.Fragment key={colIndex}>
                            <div className="flex gap-1">
                              {columnSeats.map((seatIndex) => {
                                const specialSeat = getSpecialSeat(row.id, seatIndex)
                                const isSpecial = !!specialSeat

                                return (
                                  <div
                                    key={seatIndex}
                                    onClick={() => handleSeatClick(row.id, seatIndex)}
                                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium border transition-all hover:scale-110 hover:z-10 relative cursor-pointer"
                                    style={{
                                      backgroundColor: specialSeat?.color || (sector ? sector.color : '#E5E7EB'),
                                      borderColor: specialSeat?.color || (sector ? sector.color : '#D1D5DB'),
                                      color: specialSeat?.color || (sector ? '#FFF' : '#6B7280'),
                                      borderWidth: isSpecial ? '3px' : '1px',
                                      boxShadow: isSpecial ? '0 0 8px rgba(0,0,0,0.3)' : undefined
                                    }}
                                    title={`${row.name} - Asiento ${seatIndex + 1}${specialSeat?.sectorName ? ` (${specialSeat.sectorName})` : ''}${specialSeat?.price ? ` - ${specialSeat.price}Bs` : ''}${sector && !specialSeat?.sectorName ? ` (${sector.name})` : ''}`}
                                  >
                                    {seatIndex + 1}
                                    {isSpecial && (
                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {colIndex < columns.length - 1 && (
                              <div className="w-6 flex items-center justify-center">
                                <div className="w-0.5 h-4 bg-gray-300 rounded"></div>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Preview del sector en borrador */}
                {activeSector && sortedActiveRows.length > 0 && (
                  <>
                    {sortedRows.length > 0 && <div className="border-t border-dashed border-gray-200 my-3" />}
                    <div className="mb-1.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: activeSector.color + 'aa' }}>
                        {activeSector.name || 'Nuevo sector'} — borrador
                      </span>
                    </div>
                    {sortedActiveRows.map((row) => {
                      const seatsPerColumn = Math.ceil(row.seats / (row.columns || 1))
                      const columns = []

                      for (let col = 0; col < (row.columns || 1); col++) {
                        const startSeat = col * seatsPerColumn
                        const endSeat = Math.min(startSeat + seatsPerColumn, row.seats)
                        const columnSeats = []

                        for (let i = startSeat; i < endSeat; i++) {
                          columnSeats.push(i)
                        }

                        columns.push(columnSeats)
                      }

                      return (
                        <div key={row.id} className="flex items-center gap-2 opacity-60">
                          <span className="text-xs font-medium text-gray-400 w-20 text-right flex-shrink-0">{row.name}</span>
                          <div className="flex gap-1">
                            {columns.map((columnSeats, colIndex) => (
                              <React.Fragment key={colIndex}>
                                <div className="flex gap-1">
                                  {columnSeats.map((seatIndex) => (
                                    <div
                                      key={seatIndex}
                                      className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium border-2 border-dashed"
                                      style={{ borderColor: activeSector.color, color: activeSector.color, backgroundColor: activeSector.color + '15' }}
                                    >
                                      {seatIndex + 1}
                                    </div>
                                  ))}
                                </div>
                                {colIndex < columns.length - 1 && (
                                  <div className="w-6 flex items-center justify-center">
                                    <div className="w-0.5 h-4 bg-gray-300 rounded"></div>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Leyenda */}
              {(sectors.length > 0 || (activeSector && sortedActiveRows.length > 0) || specialSeats.length > 0) && (
                <div className="mt-8 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-gray-700 mb-3">Leyenda de Sectores</h4>
                  <div className="flex flex-wrap gap-4">
                    {/* Sectores confirmados */}
                    {sectors.map(sector => (
                      <div key={sector.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: sector.color }} />
                        <span className="text-xs text-gray-600">{sector.name} — Bs {sector.price}</span>
                      </div>
                    ))}

                    {/* Sectores personalizados de asientos especiales */}
                    {specialSeats.length > 0 && (() => {
                      // Obtener sectores únicos de los asientos especiales usando Map para evitar duplicados
                      const uniqueSectors = new Map<string, any>()

                      specialSeats.forEach(seat => {
                        if (seat.sectorName) {
                          // Si ya existe este sector, no lo sobrescribimos (mantenemos el primero)
                          if (!uniqueSectors.has(seat.sectorName)) {
                            uniqueSectors.set(seat.sectorName, {
                              name: seat.sectorName,
                              color: seat.color,
                              price: seat.price
                            })
                          }
                        }
                      })

                      // Convertir el Map a array
                      const customSectors = Array.from(uniqueSectors.values())

                      return customSectors.map((customSector) => (
                        <div key={`custom-${customSector.name}`} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border-2"
                            style={{ backgroundColor: customSector.color, borderColor: customSector.color }}
                          />
                          <span className="text-xs text-gray-600">{customSector.name} — Bs {customSector.price}</span>
                        </div>
                      ))
                    })()}

                    {/* Sector activo (borrador) */}
                    {activeSector && sortedActiveRows.length > 0 && (
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="w-4 h-4 rounded border-2 border-dashed" style={{ borderColor: activeSector.color }} />
                        <span className="text-xs text-gray-500">{activeSector.name || 'Borrador'} (sin confirmar)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          PANEL DERECHO - ASIENTO ESPECIAL
      ═══════════════════════════════════ */}
      {showSeatPanel && selectedSeat && editingSpecialSeat && (
        <div className="w-80 flex-shrink-0 sticky top-0 h-screen bg-white border-l border-gray-200 shadow-xl overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Asiento Especial</h3>
              <button
                onClick={() => {
                  setShowSeatPanel(false)
                  setSelectedSeat(null)
                  setEditingSpecialSeat(null)
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info del asiento */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">{selectedSeat.seatIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Asiento seleccionado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(() => {
                      const row = [...rows, ...activeRows].find(r => r.id === selectedSeat.rowId)
                      return row ? `${row.name} - Asiento ${selectedSeat.seatIndex + 1}${editingSpecialSeat?.sectorName ? ` (${editingSpecialSeat.sectorName})` : ''}` : 'Asiento desconocido'
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración del asiento especial */}
            <div className="space-y-4">
              {/* Sector (texto) */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Tipo de sector</label>
                <input
                  ref={sectorNameRef}
                  type="text"
                  defaultValue={editingSpecialSeat?.sectorName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      handleSaveSpecialSeat({ sectorName: input.value.trim() })
                    }
                  }}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                  placeholder="Ej: VIP, Super VIP, Platea..."
                />
                <p className="text-[10px] text-gray-400 mt-1">Presiona Enter para guardar</p>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Color del asiento</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => {
                    const isSelected = editingSpecialSeat?.color === color.value

                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleSaveSpecialSeat({ color: color.value })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                          isSelected ? 'border-gray-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Precio individual */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Precio individual (Bs)</label>
                <input
                  ref={priceRef}
                  type="number"
                  defaultValue={editingSpecialSeat?.price}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      handleSaveSpecialSeat({ price: parseInt(input.value) || 0 })
                    }
                  }}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                  placeholder="Ej: 500"
                />
                <p className="text-[10px] text-gray-400 mt-1">Presiona Enter para guardar</p>
              </div>

              {/* Estado */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Estado</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'available', label: 'Disponible', color: 'bg-green-100 text-green-700' },
                    { value: 'reserved', label: 'Reservado', color: 'bg-yellow-100 text-yellow-700' },
                    { value: 'sold', label: 'Vendido', color: 'bg-red-100 text-red-700' }
                  ].map((status) => {
                    const isSelected = editingSpecialSeat?.status === status.value

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleSaveSpecialSeat({ status: status.value as any })}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                          isSelected ? status.color : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {status.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quitar personalización */}
              {editingSpecialSeat?.sectorName || editingSpecialSeat?.price || editingSpecialSeat?.color ? (
                <button
                  type="button"
                  onClick={handleRemoveSpecialSeat}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  Quitar personalización
                </button>
              ) : null}

              {/* Botón Guardar */}
              <button
                type="button"
                onClick={() => {
                  // Guardar los valores de los inputs antes de cerrar
                  const updates: Partial<SpecialSeat> = {}

                  if (sectorNameRef.current?.value.trim()) {
                    updates.sectorName = sectorNameRef.current.value.trim()
                  }

                  if (priceRef.current?.value) {
                    updates.price = parseInt(priceRef.current.value) || 0
                  }

                  // Si hay cambios, guardarlos
                  if (Object.keys(updates).length > 0) {
                    handleSaveSpecialSeat(updates, true) // true = cerrar panel
                  } else {
                    // Si no hay cambios, solo cerrar
                    setShowSeatPanel(false)
                    setSelectedSeat(null)
                    setEditingSpecialSeat(null)
                  }
                }}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Guardar y cerrar
              </button>

              {/* Info */}
              <div className="pt-4 border-t">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Los asientos especiales se sobrescriben sobre la configuración de la fila.
                  Tienen su propio color, precio y estado independientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
