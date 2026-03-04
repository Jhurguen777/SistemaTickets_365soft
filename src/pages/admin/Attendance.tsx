import { useState } from 'react'
import {
  ScanLine, Search, Download, CheckCircle, XCircle,
  Clock, QrCode, User as UserIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Attendee, AsistenciaStatus } from '@/types/admin'

type TabType = 'scanner' | 'lista'

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<TabType>('scanner')
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AsistenciaStatus | 'TODOS'>('TODOS')
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set())

  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: '1', purchaseId: 'pur-001', eventId: 'evt-001', nombre: 'Juan Pérez', email: 'juan@email.com', ci: '12345678', asiento: 'A1', sector: 'VIP', asistencia: 'ASISTIO', horaCheckIn: new Date('2024-02-27T19:30:00'), qrCode: 'QR001' },
    { id: '2', purchaseId: 'pur-002', eventId: 'evt-001', nombre: 'María González', email: 'maria@email.com', ci: '87654321', asiento: 'B2', sector: 'General', asistencia: 'PENDIENTE', qrCode: 'QR002' },
    { id: '3', purchaseId: 'pur-003', eventId: 'evt-001', nombre: 'Carlos López', email: 'carlos@email.com', ci: '11223344', asiento: 'C3', sector: 'General', asistencia: 'NO_SHOW', qrCode: 'QR003' },
  ])

  const events = [
    { id: 'evt-001', title: 'Concierto de Rock 2024' },
    { id: 'evt-002', title: 'Conferencia Tech' },
  ]

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()) || a.ci.includes(searchTerm)
    const matchesStatus = statusFilter === 'TODOS' || a.asistencia === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: attendees.length,
    asistieron: attendees.filter(a => a.asistencia === 'ASISTIO').length,
    pendientes: attendees.filter(a => a.asistencia === 'PENDIENTE').length,
    noShows: attendees.filter(a => a.asistencia === 'NO_SHOW').length,
  }

  const handleScanQR = (qrCode: string) => {
    const attendee = attendees.find(a => a.qrCode === qrCode)
    if (attendee) {
      if (attendee.asistencia === 'ASISTIO') { alert(`Ya registró entrada: ${attendee.nombre}`); return }
      setAttendees(prev => prev.map(a => a.id === attendee.id ? { ...a, asistencia: 'ASISTIO', horaCheckIn: new Date() } : a))
      alert(`✅ Asistencia registrada: ${attendee.nombre}`)
    } else { alert('Código QR no encontrado') }
  }

  const handleSelectAll = () => {
    setSelectedAttendees(selectedAttendees.size === filteredAttendees.length ? new Set() : new Set(filteredAttendees.map(a => a.id)))
  }

  const handleSelectAttendee = (id: string) => {
    const n = new Set(selectedAttendees)
    n.has(id) ? n.delete(id) : n.add(id)
    setSelectedAttendees(n)
  }

  const statusStyle: Record<AsistenciaStatus, { bg: string; label: string; icon: any }> = {
    ASISTIO: { bg: 'bg-green-100 text-green-800', label: 'Asistió', icon: CheckCircle },
    PENDIENTE: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: Clock },
    NO_SHOW: { bg: 'bg-red-100 text-red-800', label: 'No Show', icon: XCircle },
    CONFIRMADO: { bg: 'bg-blue-100 text-blue-800', label: 'Confirmado', icon: CheckCircle },
  }

  const StatusBadge = ({ status }: { status: AsistenciaStatus }) => {
    const { bg, label, icon: Icon } = statusStyle[status] || statusStyle.PENDIENTE
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}>
        <Icon size={10} />{label}
      </span>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Control de Asistencia</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">Registra la entrada de asistentes</p>
      </div>

      {/* ── Event Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">Evento:</label>
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar evento...</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {/* ── Stats Cards — 2 cols móvil, 4 desktop ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-50 dark:bg-gray-800', icon: UserIcon, iconColor: 'text-gray-400' },
          { label: 'Asistieron', value: stats.asistieron, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, iconColor: 'text-green-500' },
          { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: Clock, iconColor: 'text-yellow-500' },
          { label: 'No Shows', value: stats.noShows, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, iconColor: 'text-red-500' },
        ].map(({ label, value, color, bg, icon: Icon, iconColor }) => (
          <Card key={label} className={bg}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {[
            { key: 'scanner', label: 'Escáner QR', icon: ScanLine },
            { key: 'lista', label: 'Lista', icon: UserIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabType)}
              className={`flex items-center gap-2 py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Scanner Tab ── */}
      {activeTab === 'scanner' && (
        <Card>
          <CardContent className="p-4 sm:p-8">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 dark:bg-gray-800 rounded-xl mx-auto flex items-center justify-center mb-4">
                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Escanear Código QR</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-5">Apunta la cámara al código QR del boleto</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingresa código QR (ej: QR001)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  onKeyPress={e => { if (e.key === 'Enter') { handleScanQR((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' } }}
                />
                <Button size="sm" onClick={() => {
                  const input = document.querySelector('input[placeholder*="QR"]') as HTMLInputElement
                  if (input?.value) { handleScanQR(input.value); input.value = '' }
                }}>Escanear</Button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200"><strong>Prueba con:</strong> QR001, QR002, QR003</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Lista Tab ── */}
      {activeTab === 'lista' && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Buscar por nombre, email o CI..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                  <option value="TODOS">Todos</option>
                  <option value="ASISTIO">Asistieron</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="NO_SHOW">No Shows</option>
                </select>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs flex-shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </div>
            </div>

            {/* ── DESKTOP: Table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3">
                      <input type="checkbox" checked={selectedAttendees.size === filteredAttendees.length && filteredAttendees.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300" />
                    </th>
                    {['Asistente', 'CI', 'Asiento', 'Sector', 'Estado', 'Check-in'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map(a => (
                    <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-3"><input type="checkbox" checked={selectedAttendees.has(a.id)} onChange={() => handleSelectAttendee(a.id)} className="w-4 h-4 rounded border-gray-300" /></td>
                      <td className="py-3 px-3"><p className="font-medium text-gray-900 dark:text-white text-sm">{a.nombre}</p><p className="text-xs text-gray-500">{a.email}</p></td>
                      <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{a.ci}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{a.asiento}</td>
                      <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{a.sector}</td>
                      <td className="py-3 px-3"><StatusBadge status={a.asistencia} /></td>
                      <td className="py-3 px-3 text-xs text-gray-500">{a.horaCheckIn ? new Date(a.horaCheckIn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAttendees.length === 0 && (
                <div className="text-center py-12"><UserIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" /><p className="text-sm text-gray-500">No se encontraron asistentes</p></div>
              )}
            </div>

            {/* ── MOBILE: Cards ── */}
            <div className="sm:hidden space-y-2">
              {filteredAttendees.length === 0 ? (
                <div className="text-center py-10"><UserIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" /><p className="text-sm text-gray-500">No se encontraron asistentes</p></div>
              ) : filteredAttendees.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <input type="checkbox" checked={selectedAttendees.has(a.id)} onChange={() => handleSelectAttendee(a.id)} className="mt-1 w-4 h-4 rounded border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{a.email}</p>
                      </div>
                      <StatusBadge status={a.asistencia} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">CI: <strong className="text-gray-700 dark:text-gray-300">{a.ci}</strong></span>
                      <span className="text-xs text-gray-500">Asiento: <strong className="text-gray-700 dark:text-gray-300">{a.asiento}</strong></span>
                      <span className="text-xs text-purple-700 font-semibold">{a.sector}</span>
                      {a.horaCheckIn && <span className="text-xs text-gray-400">{new Date(a.horaCheckIn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}