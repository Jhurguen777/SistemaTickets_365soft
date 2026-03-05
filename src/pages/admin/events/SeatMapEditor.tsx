import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, ChevronUp, ChevronDown, Pencil, Check, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import api from '@/services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constantes ───────────────────────────────────────────────────────────────

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

// ─── SeatMap auto-escalado ────────────────────────────────────────────────────
// Componente separado que mide su contenedor y calcula el tamaño óptimo
// de cada asiento para que todo el mapa quepa sin scroll horizontal.

interface SeatMapProps {
  sortedRows: Row[]
  sortedActiveRows: Row[]
  sectors: Sector[]
  activeSector: { id: string; name: string; color: string; price: number } | null
  specialSeats: SpecialSeat[]
  getSpecialSeat: (rowId: string, seatIndex: number) => SpecialSeat | undefined
  onSeatClick: (rowId: string, seatIndex: number) => void
}

const SeatMap: React.FC<SeatMapProps> = ({
  sortedRows, sortedActiveRows, sectors, activeSector,
  specialSeats, getSpecialSeat, onSeatClick,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [seatPx, setSeatPx] = useState(28)

  const allRows = useMemo(() => [...sortedRows, ...sortedActiveRows], [sortedRows, sortedActiveRows])

  // Calcula cuántos "slots" de ancho ocupa la fila más larga.
  // Cada pasillo entre columnas cuenta como 0.6 slots.
  const maxSlots = useMemo(() => {
    if (allRows.length === 0) return 0
    return Math.max(...allRows.map(row => {
      const cols = row.columns || 1
      return row.seats + (cols - 1) * 0.6
    }))
  }, [allRows])

  const LABEL_PX = 60  // ancho reservado para "Fila X"
  const GAP_RATIO = 0.14 // gap = seatPx * GAP_RATIO

  const recalc = useCallback(() => {
    if (!wrapperRef.current || maxSlots === 0) return
    const avail = wrapperRef.current.clientWidth - LABEL_PX - 16
    // avail = maxSlots * seatPx + (maxSlots - 1) * seatPx * GAP_RATIO
    //       = seatPx * (maxSlots + (maxSlots-1)*GAP_RATIO)
    const divisor = maxSlots + (maxSlots - 1) * GAP_RATIO
    const size = Math.floor(avail / divisor)
    setSeatPx(Math.max(10, Math.min(32, size)))
  }, [maxSlots])

  useEffect(() => {
    recalc()
    const ro = new ResizeObserver(recalc)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [recalc])

  const gap = Math.max(2, Math.round(seatPx * GAP_RATIO))
  const fontSize = seatPx < 16 ? '7px' : seatPx < 20 ? '8px' : seatPx < 26 ? '9px' : '10px'
  const labelFontSize = seatPx < 16 ? '8px' : '11px'

  const renderRow = (row: Row, draft = false) => {
    const sector = sectors.find(s => s.id === row.sectorId)
    const cols = row.columns || 1
    const spc = Math.ceil(row.seats / cols)
    const columns = Array.from({ length: cols }, (_, ci) => {
      const start = ci * spc
      return Array.from({ length: Math.min(spc, row.seats - start) }, (_, i) => start + i)
    })
    const aisleW = Math.round(seatPx * 0.6)

    return (
      <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap, opacity: draft ? 0.6 : 1 }}>
        {/* Label fila */}
        <span style={{
          width: LABEL_PX, flexShrink: 0, textAlign: 'right',
          fontSize: labelFontSize, fontWeight: 500, color: '#6B7280',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          paddingRight: 4,
        }}>
          {row.name}
        </span>

        {/* Asientos */}
        <div style={{ display: 'flex', alignItems: 'center', gap }}>
          {columns.map((colSeats, ci) => (
            <React.Fragment key={ci}>
              <div style={{ display: 'flex', gap }}>
                {colSeats.map(si => {
                  if (draft) {
                    return (
                      <div key={si} style={{
                        width: seatPx, height: seatPx, flexShrink: 0,
                        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize, fontWeight: 500,
                        border: `2px dashed ${activeSector?.color ?? '#999'}`,
                        color: activeSector?.color ?? '#999',
                        backgroundColor: (activeSector?.color ?? '#999') + '15',
                      }}>
                        {seatPx >= 14 ? si + 1 : ''}
                      </div>
                    )
                  }

                  const sp = getSpecialSeat(row.id, si)
                  const bg = sp?.color || (sector?.color ?? '#E5E7EB')
                  const border = sp?.color || (sector?.color ?? '#D1D5DB')
                  const color = sp?.color || (sector ? '#fff' : '#6B7280')

                  return (
                    <div
                      key={si}
                      onClick={() => onSeatClick(row.id, si)}
                      title={`${row.name} · Asiento ${si + 1}`}
                      style={{
                        width: seatPx, height: seatPx, flexShrink: 0,
                        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize, fontWeight: 500, cursor: 'pointer',
                        backgroundColor: bg,
                        border: `${sp ? 2 : 1}px solid ${border}`,
                        color,
                        boxShadow: sp ? '0 0 0 2px rgba(0,0,0,.15)' : undefined,
                        position: 'relative',
                        transition: 'filter .15s, transform .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = '')}
                    >
                      {seatPx >= 14 ? si + 1 : ''}
                      {sp && (
                        <div style={{
                          position: 'absolute', top: -3, right: -3,
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#FBBF24', border: '1px solid #fff',
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pasillo */}
              {ci < columns.length - 1 && (
                <div style={{ width: aisleW, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 1, height: seatPx * 0.6, background: '#D1D5DB', borderRadius: 1 }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (allRows.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} />
        </div>
        <span style={{ fontSize: 14, textAlign: 'center', padding: '0 16px' }}>
          Añade sectores y filas para ver la vista previa
        </span>
      </div>
    )
  }

  // Leyenda
  const legendSectors = [...sectors]
  const uniqueSpecial = new Map<string, { name: string; color: string; price?: number }>()
  specialSeats.forEach(s => {
    if (s.sectorName && !uniqueSpecial.has(s.sectorName))
      uniqueSpecial.set(s.sectorName, { name: s.sectorName, color: s.color ?? '#999', price: s.price })
  })

  return (
    <div ref={wrapperRef} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px 12px 12px', overflow: 'hidden' }}>

      {/* Escenario */}
      <div style={{ textAlign: 'center', marginBottom: Math.max(8, seatPx * 0.5) }}>
        <span style={{
          display: 'inline-block', padding: '4px 24px',
          background: '#1F2937', color: '#fff',
          fontSize: Math.max(9, seatPx * 0.38), fontWeight: 700,
          borderRadius: 6, letterSpacing: '0.12em',
        }}>
          ESCENARIO
        </span>
      </div>

      {/* Filas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: Math.max(3, gap) }}>
        {sortedRows.map(row => renderRow(row, false))}

        {activeSector && sortedActiveRows.length > 0 && (
          <>
            {sortedRows.length > 0 && (
              <div style={{ borderTop: '1px dashed #E5E7EB', margin: '4px 0' }} />
            )}
            <div style={{ marginBottom: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 99, color: '#fff',
                backgroundColor: activeSector.color + 'bb',
              }}>
                {activeSector.name || 'Nuevo sector'} — borrador
              </span>
            </div>
            {sortedActiveRows.map(row => renderRow(row, true))}
          </>
        )}
      </div>

      {/* Leyenda */}
      {(legendSectors.length > 0 || uniqueSpecial.size > 0) && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Leyenda</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {legendSectors.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#4B5563' }}>{s.name} — Bs {s.price}</span>
              </div>
            ))}
            {Array.from(uniqueSpecial.values()).map(cs => (
              <div key={cs.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: cs.color, border: `2px solid ${cs.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#4B5563' }}>{cs.name} — Bs {cs.price}</span>
              </div>
            ))}
            {activeSector && sortedActiveRows.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, border: `2px dashed ${activeSector.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#6B7280' }}>{activeSector.name || 'Borrador'} (sin confirmar)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PanelInner — EXTERNO para evitar re-mount en cada keystroke ──────────────

interface PanelInnerProps {
  eventTitle: string
  sectors: Sector[]
  sortedRows: Row[]
  sortedActiveRows: Row[]
  activeRows: Row[]
  activeSector: { id: string; name: string; color: string; price: number } | null
  editingSectorId: string | null
  showColorPicker: boolean
  showBulkGenerator: boolean
  bulkRows: number
  bulkSeats: number
  bulkColumns: number
  saving: boolean
  onNavigateBack: () => void
  onSetEditingSectorId: (id: string | null) => void
  onRemoveSector: (id: string) => void
  onRowChange: (rowId: string, field: keyof Row, value: any) => void
  onMoveRowUp: (rowId: string) => void
  onMoveRowDown: (rowId: string) => void
  onRemoveRow: (rowId: string) => void
  onSetActiveSector: (s: { id: string; name: string; color: string; price: number } | null) => void
  onSetShowColorPicker: (v: boolean) => void
  onAddActiveRow: () => void
  onSetShowBulkGenerator: (v: boolean) => void
  onSetBulkRows: (v: number) => void
  onSetBulkSeats: (v: number) => void
  onSetBulkColumns: (v: number) => void
  onGenerateBulkRows: () => void
  onActiveRowChange: (rowId: string, field: keyof Row, value: any) => void
  onMoveActiveRowUp: (index: number) => void
  onMoveActiveRowDown: (index: number) => void
  onRemoveActiveRow: (rowId: string) => void
  onAddSectorToList: () => void
  onStartNewSector: () => void
  onSaveAndReturn: () => void
}

const PanelInner: React.FC<PanelInnerProps> = ({
  eventTitle, sectors, sortedRows, sortedActiveRows, activeRows,
  activeSector, editingSectorId, showColorPicker, showBulkGenerator,
  bulkRows, bulkSeats, bulkColumns, saving,
  onNavigateBack, onSetEditingSectorId, onRemoveSector,
  onRowChange, onMoveRowUp, onMoveRowDown, onRemoveRow,
  onSetActiveSector, onSetShowColorPicker,
  onAddActiveRow, onSetShowBulkGenerator,
  onSetBulkRows, onSetBulkSeats, onSetBulkColumns,
  onGenerateBulkRows, onActiveRowChange,
  onMoveActiveRowUp, onMoveActiveRowDown, onRemoveActiveRow,
  onAddSectorToList, onStartNewSector, onSaveAndReturn,
}) => (
  <div className="p-4 sm:p-6 flex-1 pt-4 flex flex-col">

    {/* Header — solo desktop */}
    <div className="mb-4 hidden sm:block">
      <button onClick={onNavigateBack} className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-3 text-sm gap-1">
        <ArrowLeft size={15} /> Volver
      </button>
      <h1 className="text-xl font-bold text-gray-900">Editor de Mapa de Asientos</h1>
      <p className="text-xs text-gray-500 mt-0.5">{eventTitle}</p>
    </div>

    {/* Sectores confirmados */}
    {sectors.length > 0 && (
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Sectores añadidos</p>
        <div className="space-y-2">
          {sectors.map((sector) => {
            const sectorRows = sortedRows.filter(r => r.sectorId === sector.id)
            const isEditing = editingSectorId === sector.id
            return (
              <div key={sector.id} className="rounded-xl border overflow-hidden" style={{ borderColor: sector.color + '50' }}>
                <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: sector.color + '18' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sector.color }} />
                    <span className="text-sm font-semibold text-gray-800 truncate">{sector.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">Bs {sector.price} · {sector.total} asientos</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button onClick={() => onSetEditingSectorId(isEditing ? null : sector.id)}
                      className="p-1.5 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-700 transition-colors">
                      {isEditing ? <Check size={13} /> : <Pencil size={13} />}
                    </button>
                    <button onClick={() => onRemoveSector(sector.id)}
                      className="p-1.5 rounded-lg hover:bg-white/70 text-red-400 hover:text-red-600 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>
                {isEditing && (
                  <div className="px-3 py-3 space-y-1.5 bg-white">
                    {sectorRows.map((row, index) => (
                      <div key={row.id} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="text" value={row.name}
                          onChange={(e) => onRowChange(row.id, 'name', e.target.value)}
                          className="text-xs font-medium text-gray-900 border border-gray-200 rounded px-1.5 py-1 w-20" />
                        <input type="number" value={row.seats}
                          onChange={(e) => onRowChange(row.id, 'seats', parseInt(e.target.value) || 0)}
                          className="text-xs text-gray-600 border border-gray-200 rounded px-1.5 py-1 w-14" min="1" />
                        <span className="text-xs text-gray-400">asientos</span>
                        <input type="number" value={row.columns || 1}
                          onChange={(e) => onRowChange(row.id, 'columns', parseInt(e.target.value) || 1)}
                          className="text-xs text-gray-600 border border-gray-200 rounded px-1.5 py-1 w-12" min="1" max="10" />
                        <span className="text-xs text-gray-400">cols</span>
                        <div className="flex items-center ml-auto gap-0.5 flex-shrink-0">
                          <button onClick={() => onMoveRowUp(row.id)} disabled={index === 0}
                            className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp size={12} /></button>
                          <button onClick={() => onMoveRowDown(row.id)} disabled={index === sectorRows.length - 1}
                            className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown size={12} /></button>
                          <button onClick={() => onRemoveRow(row.id)}
                            className="p-0.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><X size={12} /></button>
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

    {/* Formulario sector activo */}
    {activeSector ? (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {sectors.length === 0 ? 'Configura tu primer sector' : 'Nuevo sector'}
        </p>

        {/* Color + Nombre */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <button type="button" onClick={() => onSetShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded-xl border-2 border-white shadow-md ring-1 ring-gray-200 hover:ring-gray-400 transition-all"
              style={{ backgroundColor: activeSector.color }} />
            {showColorPicker && (
              <div className="absolute left-0 top-12 z-30 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xl">
                <p className="text-[10px] text-gray-400 mb-2 font-medium uppercase tracking-wide">Color del sector</p>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((c) => (
                    <button key={c.value} type="button" title={c.name}
                      onClick={() => { onSetActiveSector({ ...activeSector, color: c.value }); onSetShowColorPicker(false) }}
                      className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${activeSector.color === c.value ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="text" value={activeSector.name}
            onChange={(e) => onSetActiveSector({ ...activeSector, name: e.target.value })}
            className="flex-1 text-sm font-medium border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="Nombre del sector (ej: General, VIP...)" />
        </div>

        {/* Precio */}
        <div className="flex items-center gap-2 mb-5">
          <label className="text-xs text-gray-500 w-12 flex-shrink-0">Precio</label>
          <input type="number" value={activeSector.price || ''}
            onChange={(e) => onSetActiveSector({ ...activeSector, price: parseFloat(e.target.value) || 0 })}
            className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="0" min="0" />
          <span className="text-xs text-gray-400 flex-shrink-0">Bs / asiento</span>
        </div>

        {/* Filas */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Filas de asientos</p>
            <div className="flex gap-1">
              <button type="button" onClick={onAddActiveRow}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Plus size={11} /> +1
              </button>
              <button type="button" onClick={() => onSetShowBulkGenerator(!showBulkGenerator)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                ⚡ Generar
              </button>
            </div>
          </div>

          {showBulkGenerator && (
            <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs font-semibold text-purple-800 mb-2">Generar múltiples filas</p>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 block mb-0.5">Nº filas</label>
                  <input type="number" value={bulkRows} onChange={(e) => onSetBulkRows(parseInt(e.target.value) || 0)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5" min="1" max="50" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 block mb-0.5">Asientos</label>
                  <input type="number" value={bulkSeats} onChange={(e) => onSetBulkSeats(parseInt(e.target.value) || 0)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5" min="1" max="50" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 block mb-0.5">Columnas</label>
                  <input type="number" value={bulkColumns} onChange={(e) => onSetBulkColumns(parseInt(e.target.value) || 0)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5" min="1" max="10" />
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={onGenerateBulkRows}
                  className="flex-1 text-xs py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                  Generar {bulkRows} × {bulkSeats} × {bulkColumns} cols ({bulkRows * bulkSeats} total)
                </button>
                <button type="button" onClick={() => onSetShowBulkGenerator(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
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
                  <input type="text" value={row.name}
                    onChange={(e) => onActiveRowChange(row.id, 'name', e.target.value)}
                    className="text-xs font-medium text-gray-900 border border-gray-200 rounded-lg px-1.5 py-1 w-20" />
                  <input type="number" value={row.seats}
                    onChange={(e) => onActiveRowChange(row.id, 'seats', parseInt(e.target.value) || 0)}
                    className="text-xs text-gray-600 border border-gray-200 rounded-lg px-1.5 py-1 w-14" min="1" />
                  <span className="text-xs text-gray-400">asientos</span>
                  <input type="number" value={row.columns}
                    onChange={(e) => onActiveRowChange(row.id, 'columns', parseInt(e.target.value) || 1)}
                    className="text-xs text-gray-600 border border-gray-200 rounded-lg px-1.5 py-1 w-12" min="1" max="10" />
                  <span className="text-xs text-gray-400">cols</span>
                  <div className="flex items-center ml-auto gap-0.5 flex-shrink-0">
                    <button onClick={() => onMoveActiveRowUp(index)} disabled={index === 0}
                      className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronUp size={13} /></button>
                    <button onClick={() => onMoveActiveRowDown(index)} disabled={index === activeRows.length - 1}
                      className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronDown size={13} /></button>
                    <button onClick={() => onRemoveActiveRow(row.id)}
                      className="p-0.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><X size={13} /></button>
                  </div>
                </div>
              ))}
              <div className="text-right text-[11px] text-gray-400 pt-0.5 pr-1">
                {activeRows.length} fila{activeRows.length !== 1 ? 's' : ''} · {activeRows.reduce((s, r) => s + r.seats, 0)} asientos en total
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={onAddSectorToList}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
          style={{ backgroundColor: activeSector.color }}>
          + Añadir sector "{activeSector.name || '...'}"
        </button>
      </div>
    ) : (
      <button type="button" onClick={onStartNewSector}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Añadir otro sector
      </button>
    )}

    {/* Guardar */}
    <div className="mt-auto pt-5 border-t border-gray-100 space-y-2">
      <Button onClick={onSaveAndReturn} disabled={saving || sectors.length === 0} className="bg-green-600 hover:bg-green-700 w-full">
        {saving ? 'Guardando...' : <><Save size={15} className="mr-2" /> Guardar y volver</>}
      </Button>
      <Button type="button" variant="outline" onClick={onNavigateBack} disabled={saving} className="w-full">
        Cancelar
      </Button>
    </div>
  </div>
)

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SeatMapEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [eventTitle, setEventTitle] = useState('')

  const [sectors, setSectors] = useState<Sector[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [activeSector, setActiveSector] = useState<{ id: string; name: string; color: string; price: number } | null>(newSectorForm(0))
  const [activeRows, setActiveRows] = useState<Row[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null)
  const [showBulkGenerator, setShowBulkGenerator] = useState(false)
  const [bulkRows, setBulkRows] = useState(5)
  const [bulkSeats, setBulkSeats] = useState(10)
  const [bulkColumns, setBulkColumns] = useState(2)
  const [specialSeats, setSpecialSeats] = useState<SpecialSeat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<{ rowId: string; seatIndex: number } | null>(null)
  const [showSeatPanel, setShowSeatPanel] = useState(false)
  const [editingSpecialSeat, setEditingSpecialSeat] = useState<SpecialSeat | null>(null)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  const sectorNameRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)

  const getSpecialSeat = useCallback((rowId: string, seatIndex: number) =>
    specialSeats.find(s => s.rowId === rowId && s.seatIndex === seatIndex), [specialSeats])

  const handleSeatClick = useCallback((rowId: string, seatIndex: number) => {
    const existing = specialSeats.find(s => s.rowId === rowId && s.seatIndex === seatIndex)
    setSelectedSeat({ rowId, seatIndex })
    setEditingSpecialSeat(existing || { rowId, seatIndex, status: 'available' })
    setShowSeatPanel(true)
  }, [specialSeats])

  const handleSaveSpecialSeat = (data: Partial<SpecialSeat>, closePanel = false) => {
    if (!selectedSeat) return
    setEditingSpecialSeat(prev => prev ? { ...prev, ...data } : null)
    const idx = specialSeats.findIndex(s => s.rowId === selectedSeat.rowId && s.seatIndex === selectedSeat.seatIndex)
    if (idx >= 0) {
      const updated = [...specialSeats]; updated[idx] = { ...updated[idx], ...data }; setSpecialSeats(updated)
    } else {
      setSpecialSeats([...specialSeats, { rowId: selectedSeat.rowId, seatIndex: selectedSeat.seatIndex, status: 'available', ...data }])
    }
    if (closePanel) { setShowSeatPanel(false); setSelectedSeat(null); setEditingSpecialSeat(null) }
  }

  const handleRemoveSpecialSeat = () => {
    if (!selectedSeat) return
    setSpecialSeats(specialSeats.filter(s => !(s.rowId === selectedSeat.rowId && s.seatIndex === selectedSeat.seatIndex)))
    setShowSeatPanel(false); setSelectedSeat(null); setEditingSpecialSeat(null)
  }

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await api.get(`/eventos/${id}`)
        const evt = response.data.data
        setEventTitle(evt.titulo || '')
        if (evt.seatMapConfig) {
          const cfg = evt.seatMapConfig
          if (cfg.sectors?.length > 0) setSectors(cfg.sectors)
          if (cfg.rows?.length > 0) setRows(cfg.rows)
          if (cfg.specialSeats?.length > 0) setSpecialSeats(cfg.specialSeats)
          setActiveSector(null)
        } else {
          setSectors([]); setRows([]); setSpecialSeats([]); setActiveSector(null)
        }
      } catch (error) {
        console.error('Error al cargar evento:', error)
      } finally { setLoading(false) }
    }
    loadEvent()
  }, [id])

  const handleGenerateBulkRows = () => {
    if (bulkRows < 1 || bulkSeats < 1 || bulkColumns < 1) { alert('Ingresa valores válidos'); return }
    const offset = rows.length + activeRows.length
    const newRows: Row[] = Array.from({ length: bulkRows }, (_, i) => ({
      id: `row-${Date.now()}-${i}`,
      name: `Fila ${String.fromCharCode(65 + offset + i)}`,
      seats: bulkSeats, columns: bulkColumns, order: activeRows.length + i,
    }))
    setActiveRows([...activeRows, ...newRows])
    setShowBulkGenerator(false); setBulkRows(5); setBulkSeats(10); setBulkColumns(2)
  }

  const handleAddActiveRow = () => {
    const offset = rows.length + activeRows.length
    setActiveRows([...activeRows, {
      id: `row-${Date.now()}`,
      name: `Fila ${String.fromCharCode(65 + offset)}`,
      seats: 10, columns: 2, order: activeRows.length,
    }])
  }

  const handleRemoveActiveRow = (rowId: string) => {
    const updated = activeRows.filter(r => r.id !== rowId)
    updated.forEach((r, i) => (r.order = i)); setActiveRows(updated)
  }

  const handleActiveRowChange = (rowId: string, field: keyof Row, value: any) =>
    setActiveRows(activeRows.map(r => r.id === rowId ? { ...r, [field]: value } : r))

  const handleMoveActiveRowUp = (index: number) => {
    if (index === 0) return
    const nr = [...activeRows];[nr[index - 1], nr[index]] = [nr[index], nr[index - 1]]
    nr[index - 1].order = index - 1; nr[index].order = index; setActiveRows(nr)
  }

  const handleMoveActiveRowDown = (index: number) => {
    if (index === activeRows.length - 1) return
    const nr = [...activeRows];[nr[index + 1], nr[index]] = [nr[index], nr[index + 1]]
    nr[index + 1].order = index + 1; nr[index].order = index; setActiveRows(nr)
  }

  const handleAddSectorToList = () => {
    if (!activeSector) return
    if (!activeSector.name.trim()) { alert('Por favor ingresa un nombre para el sector'); return }
    if (activeSector.price <= 0) { alert('Por favor ingresa un precio válido'); return }
    if (activeRows.length === 0) { alert('Por favor agrega al menos una fila'); return }
    const totalSeats = activeRows.reduce((sum, r) => sum + r.seats, 0)
    setSectors([...sectors, { ...activeSector, total: totalSeats, available: totalSeats }])
    setRows([...rows, ...activeRows.map((r, i) => ({ ...r, sectorId: activeSector.id, order: rows.length + i }))])
    setActiveRows([]); setActiveSector(null); setShowColorPicker(false)
  }

  const handleStartNewSector = () => {
    setActiveSector(newSectorForm(sectors.length)); setActiveRows([]); setShowColorPicker(false)
  }

  const handleRemoveSector = (sectorId: string) => {
    setSectors(sectors.filter(s => s.id !== sectorId))
    setRows(rows.filter(r => r.sectorId !== sectorId))
    if (editingSectorId === sectorId) setEditingSectorId(null)
  }

  const handleRemoveRow = (rowId: string) => {
    const updated = rows.filter(r => r.id !== rowId); updated.forEach((r, i) => (r.order = i)); setRows(updated)
  }

  const handleRowChange = (rowId: string, field: keyof Row, value: any) =>
    setRows(rows.map(r => r.id === rowId ? { ...r, [field]: value } : r))

  const handleMoveRowUp = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId); if (index <= 0) return
    const nr = [...rows];[nr[index - 1], nr[index]] = [nr[index], nr[index - 1]]
    nr[index - 1].order = index - 1; nr[index].order = index; setRows(nr)
  }

  const handleMoveRowDown = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId); if (index === rows.length - 1) return
    const nr = [...rows];[nr[index + 1], nr[index]] = [nr[index], nr[index + 1]]
    nr[index + 1].order = index + 1; nr[index].order = index; setRows(nr)
  }

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
      const seatMapConfig = {
        sectors: sectors.map(s => ({ id: s.id, name: s.name, color: s.color, price: s.price })),
        rows: rows.map(r => ({ id: r.id, name: r.name, seats: r.seats, columns: r.columns, order: r.order, sectorId: r.sectorId })),
        specialSeats,
      }
      await api.put(`/eventos/${id}`, { sectores: sectorsData, seatMapConfig })
      navigate(`/admin/eventos/${id}/editar`)
    } catch (error: any) {
      alert('Error al guardar: ' + (error.response?.data?.error || error.message))
    } finally { setSaving(false) }
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

  const panelProps: PanelInnerProps = {
    eventTitle, sectors, sortedRows, sortedActiveRows, activeRows,
    activeSector, editingSectorId, showColorPicker, showBulkGenerator,
    bulkRows, bulkSeats, bulkColumns, saving,
    onNavigateBack: () => navigate(-1),
    onSetEditingSectorId: setEditingSectorId,
    onRemoveSector: handleRemoveSector,
    onRowChange: handleRowChange,
    onMoveRowUp: handleMoveRowUp,
    onMoveRowDown: handleMoveRowDown,
    onRemoveRow: handleRemoveRow,
    onSetActiveSector: setActiveSector,
    onSetShowColorPicker: setShowColorPicker,
    onAddActiveRow: handleAddActiveRow,
    onSetShowBulkGenerator: setShowBulkGenerator,
    onSetBulkRows: setBulkRows,
    onSetBulkSeats: setBulkSeats,
    onSetBulkColumns: setBulkColumns,
    onGenerateBulkRows: handleGenerateBulkRows,
    onActiveRowChange: handleActiveRowChange,
    onMoveActiveRowUp: handleMoveActiveRowUp,
    onMoveActiveRowDown: handleMoveActiveRowDown,
    onRemoveActiveRow: handleRemoveActiveRow,
    onAddSectorToList: handleAddSectorToList,
    onStartNewSector: handleStartNewSector,
    onSaveAndReturn: handleSaveAndReturn,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row items-start -mx-4 sm:-mx-8 -mt-6">

      {/* ── Header móvil ── */}
      <div className="sm:hidden w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Editor de Mapa</h1>
            {eventTitle && <p className="text-xs text-gray-400 leading-tight truncate max-w-[160px]">{eventTitle}</p>}
          </div>
        </div>
        <button onClick={() => setMobilePanelOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-sm">
          <Settings size={14} />
          Configurar
          {sectors.length > 0 && (
            <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{sectors.length}</span>
          )}
        </button>
      </div>

      {/* ── Panel desktop ── */}
      <div className="hidden sm:flex w-[500px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm flex-col">
        <PanelInner {...panelProps} />
      </div>

      {/* ── Drawer móvil ── */}
      {mobilePanelOpen && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm" onClick={() => setMobilePanelOpen(false)} />
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                <span className="text-sm font-semibold text-gray-700">Configuración del mapa</span>
              </div>
              <button onClick={() => setMobilePanelOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <PanelInner {...panelProps} />
            </div>
          </div>
        </>
      )}

      {/* ── Vista previa — SeatMap auto-escalado ── */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: 0, height: '100vh', overflow: 'hidden' }}>
        <div className="px-3 sm:px-6 pt-4 pb-0 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Vista Previa del Mapa</h3>
        </div>
        <SeatMap
          sortedRows={sortedRows}
          sortedActiveRows={sortedActiveRows}
          sectors={sectors}
          activeSector={activeSector}
          specialSeats={specialSeats}
          getSpecialSeat={getSpecialSeat}
          onSeatClick={handleSeatClick}
        />
      </div>

      {/* ── Panel asiento especial ── */}
      {showSeatPanel && selectedSeat && editingSpecialSeat && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
            onClick={() => { setShowSeatPanel(false); setSelectedSeat(null); setEditingSpecialSeat(null) }} />
          <div className="
            fixed sm:sticky inset-x-0 bottom-0 sm:inset-auto sm:bottom-auto sm:top-0
            z-40 sm:z-auto sm:w-80 sm:flex-shrink-0 sm:h-screen
            bg-white border-t sm:border-t-0 sm:border-l border-gray-200 shadow-xl overflow-y-auto
            rounded-t-2xl sm:rounded-none max-h-[85vh] sm:max-h-none
          ">
            <div className="p-4 sm:p-6">
              <div className="sm:hidden flex justify-center mb-3">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Asiento Especial</h3>
                <button onClick={() => { setShowSeatPanel(false); setSelectedSeat(null); setEditingSpecialSeat(null) }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold text-purple-600">{selectedSeat.seatIndex + 1}</span>
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

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Tipo de sector</label>
                  <input ref={sectorNameRef} type="text" defaultValue={editingSpecialSeat?.sectorName}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSpecialSeat({ sectorName: (e.target as HTMLInputElement).value.trim() }) }}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                    placeholder="Ej: VIP, Super VIP, Platea..." />
                  <p className="text-[10px] text-gray-400 mt-1">Presiona Enter para guardar</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Color del asiento</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((color) => (
                      <button key={color.value} type="button"
                        onClick={() => handleSaveSpecialSeat({ color: color.value })}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 transition-all hover:scale-110 ${editingSpecialSeat?.color === color.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }} title={color.name} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Precio individual (Bs)</label>
                  <input ref={priceRef} type="number" defaultValue={editingSpecialSeat?.price}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSpecialSeat({ price: parseFloat((e.target as HTMLInputElement).value) || 0 }) }}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                    placeholder="Ej: 500" />
                  <p className="text-[10px] text-gray-400 mt-1">Presiona Enter para guardar</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Estado</label>
                  <div className="space-y-1.5">
                    {[
                      { value: 'available', label: 'Disponible', color: 'bg-green-100 text-green-700' },
                      { value: 'reserved',  label: 'Reservado',  color: 'bg-yellow-100 text-yellow-700' },
                      { value: 'sold',      label: 'Vendido',    color: 'bg-red-100 text-red-700' },
                    ].map((status) => (
                      <button key={status.value} type="button"
                        onClick={() => handleSaveSpecialSeat({ status: status.value as any })}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${editingSpecialSeat?.status === status.value ? status.color : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(editingSpecialSeat?.sectorName || editingSpecialSeat?.price || editingSpecialSeat?.color) && (
                  <button type="button" onClick={handleRemoveSpecialSeat}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors">
                    Quitar personalización
                  </button>
                )}

                <button type="button"
                  onClick={() => {
                    const updates: Partial<SpecialSeat> = {}
                    if (sectorNameRef.current?.value.trim()) updates.sectorName = sectorNameRef.current.value.trim()
                    if (priceRef.current?.value) updates.price = parseFloat(priceRef.current.value) || 0
                    if (Object.keys(updates).length > 0) {
                      handleSaveSpecialSeat(updates, true)
                    } else {
                      setShowSeatPanel(false); setSelectedSeat(null); setEditingSpecialSeat(null)
                    }
                  }}
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                  Guardar y cerrar
                </button>

                <div className="pt-4 border-t">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Los asientos especiales se sobrescriben sobre la configuración de la fila. Tienen su propio color, precio y estado independientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}