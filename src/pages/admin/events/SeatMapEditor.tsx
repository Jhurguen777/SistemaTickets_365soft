import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp,
  Palette, Settings, Grid, ZoomIn, ZoomOut, RotateCcw, Menu, X
} from 'lucide-react'
import api from '@/services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Sector {
  id: string
  name: string
  color: string
  price: number
}

interface Row {
  id: string
  name: string
  seats: number
  columns: number
  order: number
  sectorId: string
}

interface SpecialSeat {
  rowId: string
  seatIndex: number
  color: string
  price: number
  sectorName: string
}

interface SeatMapConfig {
  sectors: Sector[]
  rows: Row[]
  specialSeats: SpecialSeat[]
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F43F5E', '#84CC16', '#A855F7',
]

const DEFAULT_CONFIG: SeatMapConfig = {
  sectors: [{ id: '1', name: 'General', color: '#22C55E', price: 100 }],
  rows: [
    { id: 'r1', name: 'Fila A', seats: 10, columns: 1, order: 0, sectorId: '1' },
    { id: 'r2', name: 'Fila B', seats: 10, columns: 1, order: 1, sectorId: '1' },
    { id: 'r3', name: 'Fila C', seats: 10, columns: 1, order: 2, sectorId: '1' },
  ],
  specialSeats: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeatMapEditor() {
  const navigate = useNavigate()
  const { id: eventId } = useParams()

  const [config, setConfig] = useState<SeatMapConfig>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [activeTab, setActiveTab] = useState<'sectores' | 'filas' | 'especiales'>('sectores')
  const [panelOpen, setPanelOpen] = useState(false)   // móvil: panel colapsado
  const [selectedSpecialSector, setSelectedSpecialSector] = useState<string>('')
  const [paintMode, setPaintMode] = useState(false)
  const [hoverSeat, setHoverSeat] = useState<{ rowId: string; idx: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // ── Load existing config ──
  useEffect(() => {
    const load = async () => {
      if (!eventId) { setLoading(false); return }
      try {
        const res = await api.get(`/eventos/${eventId}`)
        const saved = res.data.data.seatMapConfig
        if (saved?.rows?.length) setConfig(saved)
      } catch { /* use defaults */ }
      finally { setLoading(false) }
    }
    load()
  }, [eventId])

  // ── Save ──
  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/admin/eventos/${eventId}/seat-map`, { seatMapConfig: config })
      alert('✅ Mapa guardado correctamente')
    } catch { alert('Error al guardar el mapa') }
    finally { setSaving(false) }
  }

  // ─── Sector CRUD ───────────────────────────────────────────────────────────
  const addSector = () => {
    const newSector: Sector = { id: uid(), name: `Sector ${config.sectors.length + 1}`, color: PRESET_COLORS[config.sectors.length % PRESET_COLORS.length], price: 100 }
    setConfig(c => ({ ...c, sectors: [...c.sectors, newSector] }))
  }

  const updateSector = (id: string, patch: Partial<Sector>) =>
    setConfig(c => ({ ...c, sectors: c.sectors.map(s => s.id === id ? { ...s, ...patch } : s) }))

  const deleteSector = (id: string) => {
    if (config.sectors.length <= 1) { alert('Debe haber al menos un sector'); return }
    const fallback = config.sectors.find(s => s.id !== id)!.id
    setConfig(c => ({
      ...c,
      sectors: c.sectors.filter(s => s.id !== id),
      rows: c.rows.map(r => r.sectorId === id ? { ...r, sectorId: fallback } : r),
    }))
  }

  // ─── Row CRUD ──────────────────────────────────────────────────────────────
  const addRow = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const name = `Fila ${letters[config.rows.length % 26]}`
    const newRow: Row = { id: uid(), name, seats: 10, columns: 1, order: config.rows.length, sectorId: config.sectors[0]?.id || '1' }
    setConfig(c => ({ ...c, rows: [...c.rows, newRow] }))
  }

  const updateRow = (id: string, patch: Partial<Row>) =>
    setConfig(c => ({ ...c, rows: c.rows.map(r => r.id === id ? { ...r, ...patch } : r) }))

  const deleteRow = (id: string) =>
    setConfig(c => ({
      ...c,
      rows: c.rows.filter(r => r.id !== id).map((r, i) => ({ ...r, order: i })),
      specialSeats: c.specialSeats.filter(s => s.rowId !== id),
    }))

  const moveRow = (id: string, dir: 1 | -1) => {
    const rows = [...config.rows].sort((a, b) => a.order - b.order)
    const idx = rows.findIndex(r => r.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= rows.length) return
    ;[rows[idx], rows[newIdx]] = [rows[newIdx], rows[idx]]
    setConfig(c => ({ ...c, rows: rows.map((r, i) => ({ ...r, order: i })) }))
  }

  // ─── Special seats ─────────────────────────────────────────────────────────
  const toggleSpecialSeat = useCallback((rowId: string, seatIndex: number) => {
    if (!paintMode || !selectedSpecialSector) return
    const sector = config.sectors.find(s => s.id === selectedSpecialSector)
    if (!sector) return
    setConfig(c => {
      const exists = c.specialSeats.find(s => s.rowId === rowId && s.seatIndex === seatIndex)
      if (exists) {
        return { ...c, specialSeats: c.specialSeats.filter(s => !(s.rowId === rowId && s.seatIndex === seatIndex)) }
      }
      return { ...c, specialSeats: [...c.specialSeats, { rowId, seatIndex, color: sector.color, price: sector.price, sectorName: sector.name }] }
    })
  }, [paintMode, selectedSpecialSector, config.sectors])

  const clearSpecialSeats = () => { if (confirm('¿Limpiar todos los asientos especiales?')) setConfig(c => ({ ...c, specialSeats: [] })) }

  // ─── Map preview ───────────────────────────────────────────────────────────
  const sortedRows = [...config.rows].sort((a, b) => a.order - b.order)
  // ── Seat size adaptativo ──
  const SEAT_SIZE = 28

  const getSeatColor = (rowId: string, seatIndex: number, sectorId: string) => {
    const sp = config.specialSeats.find(s => s.rowId === rowId && s.seatIndex === seatIndex)
    if (sp) return sp.color
    return config.sectors.find(s => s.id === sectorId)?.color || '#9CA3AF'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )

  // ─── Panel lateral / bottom (contenido compartido) ────────────────────────
  const PanelContent = () => (
    <div className="flex flex-col h-full">
      {/* Panel tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {([
          { key: 'sectores', label: 'Sectores', icon: Palette },
          { key: 'filas',    label: 'Filas',    icon: Grid },
          { key: 'especiales', label: 'Pintar', icon: Settings },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Panel body — scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ── Sectores tab ── */}
        {activeTab === 'sectores' && (
          <>
            <button onClick={addSector} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
              <Plus size={14} /> Añadir Sector
            </button>
            {config.sectors.map(sector => (
              <div key={sector.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2.5">
                {/* Name + delete */}
                <div className="flex items-center gap-2">
                  <input
                    value={sector.name}
                    onChange={e => updateSector(sector.id, { name: e.target.value })}
                    className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-200 focus:border-primary outline-none py-0.5 dark:text-white"
                    placeholder="Nombre del sector"
                  />
                  <button onClick={() => deleteSector(sector.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 flex-shrink-0">Bs</span>
                  <input
                    type="number"
                    value={sector.price}
                    min={0}
                    onChange={e => updateSector(sector.id, { price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
                {/* Color grid */}
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Color</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => updateSector(sector.id, { color: c })}
                        className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${sector.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  {/* Custom color */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">Personalizado:</span>
                    <input
                      type="color"
                      value={sector.color}
                      onChange={e => updateSector(sector.id, { color: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                    />
                    <span className="text-xs text-gray-500 font-mono">{sector.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Filas tab ── */}
        {activeTab === 'filas' && (
          <>
            <button onClick={addRow} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
              <Plus size={14} /> Añadir Fila
            </button>
            <div className="space-y-2">
              {sortedRows.map((row, idx) => {
                const sector = config.sectors.find(s => s.id === row.sectorId)
                return (
                  <div key={row.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                    {/* Row header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: sector?.color || '#9CA3AF' }} />
                      <input
                        value={row.name}
                        onChange={e => updateRow(row.id, { name: e.target.value })}
                        className="flex-1 text-xs font-semibold bg-transparent border-b border-gray-200 focus:border-primary outline-none py-0.5 dark:text-white min-w-0"
                      />
                      {/* Order buttons */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button onClick={() => moveRow(row.id, -1)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={13} /></button>
                        <button onClick={() => moveRow(row.id, 1)} disabled={idx === sortedRows.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={13} /></button>
                        <button onClick={() => deleteRow(row.id)} className="p-0.5 text-gray-300 hover:text-red-500 ml-1"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {/* Row fields — grid 2 cols */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wide">Asientos</label>
                        <input
                          type="number"
                          value={row.seats}
                          min={1}
                          max={100}
                          onChange={e => updateRow(row.id, { seats: parseInt(e.target.value) || 1 })}
                          className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wide">Pasillos</label>
                        <input
                          type="number"
                          value={row.columns}
                          min={1}
                          max={10}
                          onChange={e => updateRow(row.id, { columns: parseInt(e.target.value) || 1 })}
                          className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white mt-0.5"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wide">Sector</label>
                        <select
                          value={row.sectorId}
                          onChange={e => updateRow(row.id, { sectorId: e.target.value })}
                          className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white mt-0.5"
                        >
                          {config.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Especiales tab ── */}
        {activeTab === 'especiales' && (
          <>
            {/* Mode toggle */}
            <div className={`rounded-xl p-3 border-2 transition-colors ${paintMode ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Modo pintura</p>
                <button
                  onClick={() => setPaintMode(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${paintMode ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${paintMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500">{paintMode ? '✏️ Toca asientos en el mapa para marcarlos' : 'Activa para pintar asientos individuales'}</p>
            </div>

            {paintMode && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Sector a pintar:</label>
                  <div className="space-y-1.5">
                    {config.sectors.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSpecialSector(s.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors text-left ${selectedSpecialSector === s.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-medium text-gray-800 dark:text-white">{s.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">Bs {s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={clearSpecialSeats} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <RotateCcw size={13} /> Limpiar todo
                </button>
              </>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <strong>{config.specialSeats.length}</strong> asiento(s) especial(es) marcado(s)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">

      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Editor de Mapa de Asientos</h1>
            <p className="text-xs text-gray-500">{config.rows.length} filas · {config.rows.reduce((s, r) => s + r.seats, 0)} asientos</p>
          </div>
          {/* Móvil: stats en línea */}
          <div className="sm:hidden text-xs text-gray-500">
            {config.rows.length} filas · {config.rows.reduce((s, r) => s + r.seats, 0)} asientos
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg px-1">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300 w-9 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900">
              <ZoomIn size={14} />
            </button>
          </div>
          <button onClick={() => setZoom(1)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Reset zoom">
            <RotateCcw size={14} />
          </button>
          {/* Móvil: toggle panel */}
          <button
            onClick={() => setPanelOpen(v => !v)}
            className="sm:hidden flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            <Menu size={14} />{panelOpen ? 'Cerrar' : 'Config'}
          </button>
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Save size={13} />
            <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
            {saving && <span className="sm:hidden">...</span>}
          </button>
        </div>
      </div>

      {/* ── Body: map + sidebar ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── MAP AREA ── */}
        <div className="flex-1 overflow-auto p-3 sm:p-6" ref={mapRef}>
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
            className="inline-block min-w-full"
          >
            {/* Escenario */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-block px-8 sm:px-16 py-2.5 bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-xl tracking-widest shadow">
                ESCENARIO
              </div>
            </div>

            {/* Leyenda sectores */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
              {config.sectors.map(s => (
                <div key={s.id} className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{s.name}</span>
                  <span className="text-xs text-gray-400">Bs {s.price}</span>
                </div>
              ))}
            </div>

            {/* Paint mode indicator */}
            {paintMode && selectedSpecialSector && (
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-semibold text-primary">
                  ✏️ Pintando: {config.sectors.find(s => s.id === selectedSpecialSector)?.name}
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: config.sectors.find(s => s.id === selectedSpecialSector)?.color }} />
                </span>
              </div>
            )}

            {/* Rows */}
            {config.rows.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Grid size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Añade filas en el panel de configuración</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedRows.map(row => {
                  const seatsPerCol = Math.ceil(row.seats / (row.columns || 1))
                  const cols = Array.from({ length: row.columns || 1 }, (_, ci) => {
                    const start = ci * seatsPerCol
                    return Array.from({ length: Math.min(seatsPerCol, row.seats - start) }, (_, i) => start + i)
                  })

                  return (
                    <div key={row.id} className="flex items-center gap-2">
                      {/* Row label */}
                      <div className="w-16 sm:w-20 text-right flex-shrink-0">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate block">{row.name}</span>
                      </div>

                      {/* Seats */}
                      <div className="flex gap-1 flex-wrap">
                        {cols.map((colSeats, ci) => (
                          <React.Fragment key={ci}>
                            <div className="flex gap-1">
                              {colSeats.map(seatIdx => {
                                const color = getSeatColor(row.id, seatIdx, row.sectorId)
                                const isHover = hoverSeat?.rowId === row.id && hoverSeat?.idx === seatIdx
                                const isSpecial = config.specialSeats.some(s => s.rowId === row.id && s.seatIndex === seatIdx)

                                return (
                                  <button
                                    key={seatIdx}
                                    onClick={() => toggleSpecialSeat(row.id, seatIdx)}
                                    onMouseEnter={() => setHoverSeat({ rowId: row.id, idx: seatIdx })}
                                    onMouseLeave={() => setHoverSeat(null)}
                                    title={`${row.name} - Asiento ${seatIdx + 1}`}
                                    className={`flex items-center justify-center rounded-md text-white text-[10px] font-bold border transition-all select-none ${
                                      paintMode ? 'cursor-cell hover:scale-125' : 'cursor-default'
                                    } ${isSpecial ? 'ring-2 ring-white ring-offset-1 shadow-md' : ''}`}
                                    style={{
                                      width: SEAT_SIZE,
                                      height: SEAT_SIZE,
                                      backgroundColor: color,
                                      borderColor: isHover && paintMode ? '#fff' : 'rgba(0,0,0,0.15)',
                                      opacity: isHover && paintMode ? 0.75 : 1,
                                    }}
                                  >
                                    {seatIdx + 1}
                                  </button>
                                )
                              })}
                            </div>
                            {/* Aisle divider */}
                            {ci < cols.length - 1 && (
                              <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-gray-300 dark:bg-gray-600 rounded" />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP: Sidebar fijo ── */}
        <div className="hidden sm:flex flex-col w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden">
          <PanelContent />
        </div>

        {/* ── MOBILE: Bottom sheet colapsable ── */}
        <div className={`sm:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 transition-transform duration-300 ease-in-out ${panelOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '65vh' }}
        >
          {/* Handle + close */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Configuración</span>
            </div>
            <button onClick={() => setPanelOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="h-full overflow-hidden">
            <PanelContent />
          </div>
        </div>

        {/* Overlay when panel open on mobile */}
        {panelOpen && (
          <div className="sm:hidden fixed inset-0 bg-black/30 z-20" onClick={() => setPanelOpen(false)} />
        )}
      </div>

      {/* ── Mobile: FAB panel toggle (visible when closed) ── */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="sm:hidden fixed bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-sm font-semibold"
        >
          <Settings size={16} /> Configurar
        </button>
      )}
    </div>
  )
}