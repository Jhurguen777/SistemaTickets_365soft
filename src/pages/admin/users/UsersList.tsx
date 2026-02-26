import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Search,
  Lock,
  Unlock,
  History,
  Filter,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import { User as UserType, UserPurchase } from '@/types/admin'
import adminService from '@/services/adminService'

export default function UsersList() {
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'bloqueado'>('todos')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([])
  const [showPurchases, setShowPurchases] = useState(false)
  const [loadingPurchases, setLoadingPurchases] = useState(false)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsersList()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filtro por estado
    if (statusFilter === 'activo') {
      filtered = filtered.filter(u => u.estado === 'ACTIVO')
    } else if (statusFilter === 'bloqueado') {
      filtered = filtered.filter(u => u.estado === 'BLOQUEADO')
    }

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.ci.includes(term)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleViewPurchases = async (user: UserType) => {
    setSelectedUser(user)
    setShowPurchases(true)
    setLoadingPurchases(true)

    try {
      const purchases = await adminService.getUserPurchases(user.id)
      setUserPurchases(purchases)
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoadingPurchases(false)
    }
  }

  const handleBlockUser = async (id: string) => {
    if (!confirm('¿Estás seguro de bloquear este usuario?')) return

    try {
      await adminService.blockUser(id)
      await loadUsers()
      alert('Usuario bloqueado exitosamente')
    } catch (error) {
      alert('Error al bloquear usuario')
    }
  }

  const handleUnblockUser = async (id: string) => {
    if (!confirm('¿Estás seguro de desbloquear este usuario?')) return

    try {
      await adminService.unblockUser(id)
      await loadUsers()
      alert('Usuario desbloqueado exitosamente')
    } catch (error) {
      alert('Error al desbloquear usuario')
    }
  }

  const toggleExpanded = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Gestión de Usuarios</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra los usuarios registrados en el sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-500 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{users.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <User className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-500 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {users.filter(u => u.estado === 'ACTIVO').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Unlock className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-red-500 dark:border-red-500 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Usuarios Bloqueados</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {users.filter(u => u.estado === 'BLOQUEADO').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Lock className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Compras
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Total Gastado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{user.nombre}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CI: {user.ci}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <Mail size={12} />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <Phone size={12} />
                          <span className="text-xs">{user.telefono}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {user.ciudad && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="text-xs">{user.ciudad}</span>
                        </div>
                      )}
                      {user.direccion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.direccion}</p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        user.estado === 'ACTIVO'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {user.estado === 'ACTIVO' ? (
                          <><Unlock size={12} /> Activo</>
                        ) : (
                          <><Lock size={12} /> Bloqueado</>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                        {user.totalCompras}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Bs {user.totalGastado.toLocaleString()}</p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleExpanded(user.id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Ver más detalles"
                        >
                          {expandedUser === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={() => handleViewPurchases(user)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Ver historial de compras"
                        >
                          <History size={16} />
                        </button>
                        {user.estado === 'ACTIVO' ? (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Bloquear usuario"
                          >
                            <Lock size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Desbloquear usuario"
                          >
                            <Unlock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Último Acceso</p>
                            <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2 text-sm">
                              <Calendar size={14} />
                              {user.ultimoAcceso
                                ? new Date(user.ultimoAcceso).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'Nunca'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Miembro Desde</p>
                            <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2 text-sm">
                              <Calendar size={14} />
                              {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promedio por Compra</p>
                            <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2 text-sm">
                              <CreditCard size={14} />
                              Bs {user.totalCompras > 0
                                ? Math.round(user.totalGastado / user.totalCompras).toLocaleString()
                                : '0'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <User size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchases Modal */}
      {showPurchases && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Compras</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedUser.nombre}</p>
              </div>
              <button
                onClick={() => setShowPurchases(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingPurchases ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-gray-500"></div>
                </div>
              ) : userPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <History size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay compras registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPurchases.map((purchase) => (
                    <div key={purchase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{purchase.eventTitle}</h3>
                          <div className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <Calendar size={13} />
                              <span>
                                {new Date(purchase.eventDate).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard size={13} />
                              <span>{purchase.cantidad} entrada(s)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Comprado el:</span>
                              <span>
                                {new Date(purchase.fechaCompra).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bs {purchase.totalPagado.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mt-1 ${
                            purchase.estadoPago === 'PAGADO'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {purchase.estadoPago}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
              <button
                onClick={() => setShowPurchases(false)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
