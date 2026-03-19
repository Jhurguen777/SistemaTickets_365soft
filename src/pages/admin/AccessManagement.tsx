import { useState, useEffect, useRef } from 'react'
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
  Edit,
  UserX,
  CheckCircle,
  XCircle,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react'
import adminService from '@/services/adminService'
import { Admin, CreateAdminDTO, AuditLog, ActiveSession, AdminRole, AuditAction, User } from '@/types/admin'

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editForm, setEditForm] = useState({ nombre: '', email: '', rol: 'GESTOR_EVENTOS' as AdminRole, estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO', password: '' })
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null)
  const [asignarRol, setAsignarRol] = useState<AdminRole>('GESTOR_EVENTOS')
  const [filterAdmin, setFilterAdmin] = useState<string>('todos')
  const [filterAction, setFilterAction] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' })
  const [confirm, setConfirm] = useState<{ show: boolean; message: string; onConfirm: () => void } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, type, message })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
  }

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirm({ show: true, message, onConfirm })
  }

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
      showToast('error', 'Por favor completa todos los campos')
      return
    }

    try {
      await adminService.createAdmin(newAdmin)
      await loadData()
      setShowCreateModal(false)
      setNewAdmin({ nombre: '', email: '', password: '', rol: 'GESTOR_EVENTOS' })
      showToast('success', 'Administrador creado exitosamente')
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear administrador')
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    showConfirm('¿Estás seguro de eliminar este administrador?', async () => {
      try {
        await adminService.deleteAdmin(id)
        await loadData()
        showToast('success', 'Administrador eliminado')
      } catch (error: any) {
        showToast('error', error.message || 'Error al eliminar administrador')
      }
    })
  }

  const handleOpenAsignar = async () => {
    try {
      const data = await adminService.getUsersList()
      setUsuarios(data)
    } catch {
      setUsuarios([])
    }
    setSelectedUsuario(null)
    setUsuarioSearch('')
    setAsignarRol('GESTOR_EVENTOS')
    setShowAsignarModal(true)
  }

  const handleAsignarRol = async () => {
    if (!selectedUsuario) {
      showToast('error', 'Selecciona un usuario')
      return
    }
    try {
      await adminService.promoverUsuario(selectedUsuario.id, asignarRol)
      await loadData()
      setShowAsignarModal(false)
      showToast('success', `Rol asignado a ${selectedUsuario.nombre} exitosamente`)
    } catch (error: any) {
      showToast('error', error.message || 'Error al asignar rol')
    }
  }

  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setEditForm({ nombre: admin.nombre, email: admin.email, rol: admin.rol, estado: admin.estado, password: '' })
    setShowEditModal(true)
  }

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return
    try {
      await adminService.updateAdmin(editingAdmin.id, {
        nombre: editForm.nombre,
        email: editForm.email,
        rol: editForm.rol,
        estado: editForm.estado,
        ...(editForm.password ? { password: editForm.password } : {})
      })
      await loadData()
      setShowEditModal(false)
      setEditingAdmin(null)
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar administrador')
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    showConfirm('¿Estás seguro de cerrar esta sesión?', async () => {
      try {
        await adminService.closeSession(sessionId)
        await loadData()
        showToast('success', 'Sesión cerrada exitosamente')
      } catch (error: any) {
        showToast('error', error.message || 'Error al cerrar sesión')
      }
    })
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
        <nav className="flex lg:justify-center gap-4 lg:gap-8 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'admins'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield size={16} />
            <span className="hidden lg:inline">ADMINISTRADORES</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'audit'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <History size={16} />
            <span className="hidden lg:inline">HISTORIAL DE ACTIVIDAD</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'sessions'
                ? 'border-gray-900 dark:border-gray-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Activity size={16} />
            <span className="hidden lg:inline">SESIONES ACTIVAS ({sessions.length})</span>
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

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={handleOpenAsignar}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Shield size={16} />
              ASIGNAR ROL A USUARIO EXISTENTE
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <UserPlus size={16} />
              CREAR ADMINISTRADOR
            </button>
          </div>

          {/* Desktop: Admins Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
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
                          <button onClick={() => handleOpenEdit(admin)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Editar">
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

          {/* Mobile: Admins Cards */}
          <div className="md:hidden space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Card header */}
                <div className="flex gap-3 p-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm flex-shrink-0">
                    {admin.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{admin.nombre}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${
                        admin.estado === 'ACTIVO'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {admin.estado === 'ACTIVO' ? (
                          <><CheckCircle size={10} /> Activo</>
                        ) : (
                          <><XCircle size={10} /> Inactivo</>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={11} />
                      {admin.email}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">Rol</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ROLE_LABELS[admin.rol]}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">Último Acceso</p>
                    {admin.ultimoAcceso ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(admin.ultimoAcceso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Nunca</p>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => handleOpenEdit(admin)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Edit size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <UserX size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
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
                        <p className="text-xs text-gray-600 dark:text-gray-300">{ACTION_LABELS[log.accion as AuditAction] ?? log.accion}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{log.detalles}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(log.createdAt).toLocaleString('es-ES')}
                        </span>
                        {log.ip && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            {log.ip}
                          </span>
                        )}
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
                        {session.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">{session.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                          <Mail size={12} />
                          {session.email}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-2">
                          {ROLE_LABELS[session.tipoRol as AdminRole] ?? session.tipoRol}
                        </span>
                        {session.ultimoAcceso && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Clock size={13} />
                            <span>Último acceso: {new Date(session.ultimoAcceso).toLocaleString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      <LogOut size={14} />
                      Suspender Acceso
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

      {/* Asignar Rol a Usuario Existente Modal */}
      {showAsignarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Asignar Rol a Usuario Existente</h2>
              <button onClick={() => setShowAsignarModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Buscador de usuarios */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Buscar Usuario Registrado</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Nombre o email..."
                    value={usuarioSearch}
                    onChange={(e) => { setUsuarioSearch(e.target.value); setSelectedUsuario(null) }}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                  />
                </div>

                {/* Lista filtrada */}
                {usuarioSearch.length > 0 && !selectedUsuario && (
                  <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {usuarios
                      .filter(u =>
                        u.hasPassword !== false &&
                        !admins.some(a => a.email === u.email) &&
                        (u.nombre.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(usuarioSearch.toLowerCase()))
                      )
                      .map(u => (
                        <button
                          key={u.id}
                          onClick={() => { setSelectedUsuario(u); setUsuarioSearch(u.nombre) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.nombre}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                          </div>
                        </button>
                      ))
                    }
                    {usuarios.filter(u =>
                      u.hasPassword !== false &&
                      (u.nombre.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(usuarioSearch.toLowerCase()))
                    ).length === 0 && (
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">No se encontraron usuarios disponibles</p>
                    )}
                  </div>
                )}

                {/* Usuario seleccionado */}
                {selectedUsuario && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                      {selectedUsuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUsuario.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUsuario.email}</p>
                    </div>
                    <button onClick={() => { setSelectedUsuario(null); setUsuarioSearch('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Selector de rol */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Rol a Asignar</label>
                <select
                  value={asignarRol}
                  onChange={(e) => setAsignarRol(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                Las cuentas registradas con Google no se muestran aquí ya que no tienen contraseña para acceder al panel admin. Para darles acceso, usa <span className="font-semibold">"Crear Administrador"</span>.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAsignarModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarRol}
                disabled={!selectedUsuario}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar Rol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Administrador</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Rol</label>
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm({ ...editForm, rol: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Estado</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Nueva Contraseña <span className="normal-case font-normal text-gray-400">(dejar en blanco para no cambiar)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <p className="font-medium text-gray-900 dark:text-white text-xs mb-1">Permisos del rol seleccionado:</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {editForm.rol === 'SUPER_ADMIN' && 'Acceso total a todos los módulos'}
                  {editForm.rol === 'GESTOR_EVENTOS' && 'Solo Asistencia → Registrar Asistencia'}
                  {editForm.rol === 'GESTOR_REPORTES' && 'Solo módulo de Reportes (ver, exportar)'}
                  {editForm.rol === 'GESTOR_ASISTENCIA' && 'Solo módulo de Asistencia (escanear QR, marcar, plantillas)'}
                  {editForm.rol === 'GESTOR_USUARIOS' && 'Solo módulo de Usuarios (ver, bloquear)'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAdmin}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
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

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAdmin}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Crear Administrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificación */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle size={18} className="flex-shrink-0" />
            : <XCircle size={18} className="flex-shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(t => ({ ...t, show: false }))} className="ml-2 opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirm?.show && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{confirm.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { confirm.onConfirm(); setConfirm(null) }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
