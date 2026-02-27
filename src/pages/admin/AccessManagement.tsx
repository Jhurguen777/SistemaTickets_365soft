import { useState, useEffect } from 'react'
import {
  Shield,
  UserPlus,
  History,
  Activity,
  LogOut,
  Mail,
  Clock,
  MapPin,
  Monitor,
  Filter,
  Search,
  Trash2,
  Edit,
  UserX,
  CheckCircle,
  XCircle,
  Calendar,
  X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import adminService from '@/services/adminService'
import { Admin, CreateAdminDTO, AuditLog, ActiveSession, AdminRole, AuditAction } from '@/types/admin'

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  GESTOR_EVENTOS: 'Gestor de Eventos',
  GESTOR_REPORTES: 'Gestor de Reportes',
  GESTOR_ASISTENCIA: 'Gestor de Asistencia',
  GESTOR_USUARIOS: 'Gestor de Usuarios'
}

const ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: 'Inicio de Sesión',
  LOGOUT: 'Cierre de Sesión',
  CREAR_EVENTO: 'Crear Evento',
  MODIFICAR_EVENTO: 'Modificar Evento',
  ELIMINAR_EVENTO: 'Eliminar Evento',
  BLOQUEAR_USUARIO: 'Bloquear Usuario',
  DESBLOQUEAR_USUARIO: 'Desbloquear Usuario',
  MARCAR_ASISTENCIA: 'Marcar Asistencia',
  CREAR_ADMIN: 'Crear Administrador',
  MODIFICAR_CONFIG: 'Modificar Configuración'
}

export default function AccessManagement() {
  const [activeTab, setActiveTab] = useState<'admins' | 'audit' | 'sessions'>('admins')
  const [admins, setAdmins] = useState<Admin[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState<CreateAdminDTO>({
    nombre: '',
    email: '',
    password: '',
    rol: 'GESTOR_EVENTOS'
  })
  const [filterAdmin, setFilterAdmin] = useState<string>('todos')
  const [filterAction, setFilterAction] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [adminsData, logsData, sessionsData] = await Promise.all([
        adminService.getAdmins(),
        adminService.getAuditLogs(),
        adminService.getActiveSessions()
      ])
      setAdmins(adminsData)
      setAuditLogs(logsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading access data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!newAdmin.nombre || !newAdmin.email || !newAdmin.password) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      await adminService.createAdmin(newAdmin)
      await loadData()
      setShowCreateModal(false)
      setNewAdmin({
        nombre: '',
        email: '',
        password: '',
        rol: 'GESTOR_EVENTOS'
      })
      alert('Administrador creado exitosamente')
    } catch (error: any) {
      alert(error.message || 'Error al crear administrador')
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return

    try {
      await adminService.deleteAdmin(id)
      await loadData()
      alert('Administrador eliminado')
    } catch (error: any) {
      alert(error.message || 'Error al eliminar administrador')
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de cerrar esta sesión?')) return

    try {
      await adminService.closeSession(sessionId)
      await loadData()
      alert('Sesión cerrada exitosamente')
    } catch (error: any) {
      alert(error.message || 'Error al cerrar sesión')
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesAdmin = filterAdmin === 'todos' || log.adminId === filterAdmin
    const matchesAction = filterAction === 'todos' || log.accion === filterAction
    const matchesSearch = searchTerm === '' ||
      log.adminNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAdmin && matchesAction && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Gestión de Accesos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra permisos, auditoría y sesiones del sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield size={16} />
            ADMINISTRADORES
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <History size={16} />
            HISTORIAL DE ACTIVIDAD
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Activity size={16} />
            SESIONES ACTIVAS ({sessions.length})
          </button>
        </nav>
      </div>

      {/* Tab: Administradores */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Admins</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{admins.length}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Shield className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Activos</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {admins.filter(a => a.estado === 'ACTIVO').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Super Admins</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                    {admins.filter(a => a.rol === 'SUPER_ADMIN').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <UserPlus className="text-gray-600 dark:text-gray-300" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Create Admin Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <UserPlus size={16} />
              CREAR ADMINISTRADOR
            </button>
          </div>

          {/* Admins Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Lista de Administradores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Administrador</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Rol</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Último Acceso</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm">
                            {admin.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{admin.nombre}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail size={11} />
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {ROLE_LABELS[admin.rol]}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          admin.estado === 'ACTIVO'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {admin.estado === 'ACTIVO' ? (
                            <><CheckCircle size={12} /> Activo</>
                          ) : (
                            <><XCircle size={12} /> Inactivo</>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {admin.ultimoAcceso ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock size={13} />
                            {new Date(admin.ultimoAcceso).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Nunca</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Editar">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Historial de Actividad */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por administrador o acción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400 dark:text-gray-500" />
                <select
                  value={filterAdmin}
                  onChange={(e) => setFilterAdmin(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800"
                >
                  <option value="todos">Todos los Admins</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.nombre}</option>
                  ))}
                </select>

                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800"
                >
                  <option value="todos">Todas las Acciones</option>
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Registro de Auditoría</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm flex-shrink-0">
                      {log.adminNombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{log.adminNombre}</p>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{ACTION_LABELS[log.accion]}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{log.detalles}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(log.fecha).toLocaleString('es-ES')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Monitor size={12} />
                          {log.dispositivo} - {log.navegador}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {log.ip}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-16">
                <History size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron registros de actividad</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Sesiones Activas */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Sessions List */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Sesiones Activas</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{sessions.length} sesiones activas</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm flex-shrink-0">
                        {session.adminNombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">{session.adminNombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                          <Mail size={12} />
                          {session.adminEmail}
                        </p>
                        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock size={13} />
                            <span>
                              Inicio: {new Date(session.inicioSesion).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} />
                            <span>{session.ubicacion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor size={13} />
                            <span>{session.dispositivo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 dark:text-gray-500">IP:</span>
                            <span>{session.ip}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                    >
                      <LogOut size={14} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-16">
                <Activity size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay sesiones activas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crear Administrador</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newAdmin.nombre}
                  onChange={(e) => setNewAdmin({ ...newAdmin, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                  placeholder="admin@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Rol
                </label>
                <select
                  value={newAdmin.rol}
                  onChange={(e) => setNewAdmin({ ...newAdmin, rol: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 dark:text-white text-xs mb-1">Permisos del rol seleccionado:</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {newAdmin.rol === 'SUPER_ADMIN' && 'Acceso total a todos los módulos'}
                  {newAdmin.rol === 'GESTOR_EVENTOS' && 'Solo módulo de Eventos (crear, editar, eliminar)'}
                  {newAdmin.rol === 'GESTOR_REPORTES' && 'Solo módulo de Reportes (ver, exportar)'}
                  {newAdmin.rol === 'GESTOR_ASISTENCIA' && 'Solo módulo de Asistencia (escanear QR, marcar)'}
                  {newAdmin.rol === 'GESTOR_USUARIOS' && 'Solo módulo de Usuarios (ver, bloquear)'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Crear Administrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
