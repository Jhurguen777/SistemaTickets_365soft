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
  ChevronDown
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
    } catch (error) {
      alert('Error al crear administrador')
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return

    try {
      await adminService.deleteAdmin(id)
      await loadData()
      alert('Administrador eliminado')
    } catch (error) {
      alert('Error al eliminar administrador')
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de cerrar esta sesión?')) return

    try {
      await adminService.closeSession(sessionId)
      await loadData()
      alert('Sesión cerrada exitosamente')
    } catch (error) {
      alert('Error al cerrar sesión')
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Accesos</h1>
        <p className="text-gray-600 mt-1">Administra permisos, auditoría y sesiones</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield size={18} />
            Administradores
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={18} />
            Historial de Actividad
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity size={18} />
            Sesiones Activas ({sessions.length})
          </button>
        </nav>
      </div>

      {/* Tab: Administradores */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{admins.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {admins.filter(a => a.estado === 'ACTIVO').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Super Admins</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {admins.filter(a => a.rol === 'SUPER_ADMIN').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserPlus className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Admin Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <UserPlus size={18} />
              Crear Administrador
            </Button>
          </div>

          {/* Admins Table */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lista de Administradores</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Administrador</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Último Acceso</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {admin.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{admin.nombre}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={12} />
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            {ROLE_LABELS[admin.rol]}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.estado === 'ACTIVO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {admin.estado === 'ACTIVO' ? (
                              <><CheckCircle size={12} /> Activo</>
                            ) : (
                              <><XCircle size={12} /> Inactivo</>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-sm text-gray-600">
                          {admin.ultimoAcceso ? (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(admin.ultimoAcceso).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            'Nunca'
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <UserX size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Historial de Actividad */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por administrador o acción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-400" />
                  <select
                    value={filterAdmin}
                    onChange={(e) => setFilterAdmin(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="todos">Todos los Admins</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.nombre}</option>
                    ))}
                  </select>

                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="todos">Todas las Acciones</option>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registro de Auditoría</h3>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {log.adminNombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{log.adminNombre}</p>
                            <p className="text-sm text-gray-600">{ACTION_LABELS[log.accion]}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{log.detalles}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(log.fecha).toLocaleString('es-ES')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Monitor size={12} />
                            {log.dispositivo} - {log.navegador}
                          </span>
                          <span className="flex items-center gap-1">
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
                <div className="text-center py-12 text-gray-500">
                  <History size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No se encontraron registros de actividad</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Sesiones Activas */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Sessions List */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Sesiones Activas</h3>
                <span className="text-sm text-gray-600">{sessions.length} sesiones activas</span>
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                          {session.adminNombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{session.adminNombre}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={14} />
                            {session.adminEmail}
                          </p>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>
                                Inicio: {new Date(session.inicioSesion).toLocaleString('es-ES')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{session.ubicacion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor size={14} />
                              <span>{session.dispositivo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              IP: {session.ip}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCloseSession(session.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay sesiones activas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Crear Administrador</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newAdmin.nombre}
                  onChange={(e) => setNewAdmin({ ...newAdmin, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={newAdmin.rol}
                  onChange={(e) => setNewAdmin({ ...newAdmin, rol: e.target.value as AdminRole })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Permisos del rol seleccionado:</p>
                <p className="text-blue-700">
                  {newAdmin.rol === 'SUPER_ADMIN' && 'Acceso total a todos los módulos'}
                  {newAdmin.rol === 'GESTOR_EVENTOS' && 'Solo módulo de Eventos (crear, editar, eliminar)'}
                  {newAdmin.rol === 'GESTOR_REPORTES' && 'Solo módulo de Reportes (ver, exportar)'}
                  {newAdmin.rol === 'GESTOR_ASISTENCIA' && 'Solo módulo de Asistencia (escanear QR, marcar)'}
                  {newAdmin.rol === 'GESTOR_USUARIOS' && 'Solo módulo de Usuarios (ver, bloquear)'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
