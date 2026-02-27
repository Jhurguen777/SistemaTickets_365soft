import { useState } from 'react'
import {
  ScanLine,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  User as UserIcon
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

  // Estado simulado - en producción vendría de la API
  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: '1',
      purchaseId: 'pur-001',
      eventId: 'evt-001',
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      ci: '12345678',
      asiento: 'A1',
      sector: 'VIP',
      asistencia: 'ASISTIO',
      horaCheckIn: new Date('2024-02-27T19:30:00'),
      qrCode: 'QR001'
    },
    {
      id: '2',
      purchaseId: 'pur-002',
      eventId: 'evt-001',
      nombre: 'María González',
      email: 'maria@email.com',
      ci: '87654321',
      asiento: 'B2',
      sector: 'General',
      asistencia: 'PENDIENTE',
      qrCode: 'QR002'
    },
    {
      id: '3',
      purchaseId: 'pur-003',
      eventId: 'evt-001',
      nombre: 'Carlos López',
      email: 'carlos@email.com',
      ci: '11223344',
      asiento: 'C3',
      sector: 'General',
      asistencia: 'NO_SHOW',
      qrCode: 'QR003'
    }
  ])

  const events = [
    { id: 'evt-001', title: 'Concierto de Rock 2024' },
    { id: 'evt-002', title: 'Conferencia Tech' }
  ]

  // Filtrado de asistentes
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch =
      attendee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.ci.includes(searchTerm)

    const matchesStatus = statusFilter === 'TODOS' || attendee.asistencia === statusFilter

    return matchesSearch && matchesStatus
  })

  // Estadísticas
  const stats = {
    total: attendees.length,
    asistieron: attendees.filter(a => a.asistencia === 'ASISTIO').length,
    pendientes: attendees.filter(a => a.asistencia === 'PENDIENTE').length,
    noShows: attendees.filter(a => a.asistencia === 'NO_SHOW').length
  }

  const handleScanQR = (qrCode: string) => {
    // Simular escaneo de QR
    const attendee = attendees.find(a => a.qrCode === qrCode)
    if (attendee) {
      if (attendee.asistencia === 'ASISTIO') {
        alert(`Ya registró entrada: ${attendee.nombre}`)
      } else {
        setAttendees(prev =>
          prev.map(a =>
            a.id === attendee.id
              ? { ...a, asistencia: 'ASISTIO', horaCheckIn: new Date() }
              : a
          )
        )
        alert(`Asistencia registrada: ${attendee.nombre}`)
      }
    } else {
      alert('Código QR no encontrado')
    }
  }

  const handleSelectAll = () => {
    if (selectedAttendees.size === filteredAttendees.length) {
      setSelectedAttendees(new Set())
    } else {
      setSelectedAttendees(new Set(filteredAttendees.map(a => a.id)))
    }
  }

  const handleSelectAttendee = (id: string) => {
    const newSelected = new Set(selectedAttendees)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAttendees(newSelected)
  }

  const getStatusBadge = (status: AsistenciaStatus) => {
    const styles = {
      ASISTIO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      CONFIRMADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
    return styles[status] || styles.PENDIENTE
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Control de Asistencia</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registra la entrada de asistentes y envía certificados
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Evento:
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar evento...</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asistieron</p>
                <p className="text-3xl font-bold text-green-600">{stats.asistieron}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No Shows</p>
                <p className="text-3xl font-bold text-red-600">{stats.noShows}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'scanner'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4" />
              Escáner QR
            </div>
          </button>
          <button
            onClick={() => setActiveTab('lista')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'lista'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Lista de Asistentes
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'scanner' && (
        <Card>
          <CardContent className="p-8">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Escanear Código QR
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Apunta la cámara al código QR del boleto del asistente
              </p>

              {/* Simulación de input de QR */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingresa código QR (ej: QR001)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleScanQR((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
                <Button onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement
                  if (input.value) {
                    handleScanQR(input.value)
                    input.value = ''
                  }
                }}>
                  Escanear
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Prueba con:</strong> QR001, QR002, QR003
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'lista' && (
        <Card>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o CI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AsistenciaStatus | 'TODOS')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ASISTIO">Asistieron</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="NO_SHOW">No Shows</option>
              </select>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.size === filteredAttendees.length && filteredAttendees.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Asistente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CI</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Asiento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Sector</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map(attendee => (
                    <tr key={attendee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.has(attendee.id)}
                          onChange={() => handleSelectAttendee(attendee.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{attendee.nombre}</p>
                          <p className="text-sm text-gray-500">{attendee.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{attendee.ci}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{attendee.asiento}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{attendee.sector}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(attendee.asistencia)}`}>
                          {attendee.asistencia}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {attendee.horaCheckIn ? new Date(attendee.horaCheckIn).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron asistentes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
