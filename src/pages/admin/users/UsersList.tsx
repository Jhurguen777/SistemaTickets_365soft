import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Search,
  Lock,
  Unlock,
  Eye,
  History,
  Filter,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administra los usuarios registrados en el sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.estado === 'ACTIVO').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Unlock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Bloqueados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.estado === 'BLOQUEADO').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Compras
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.nombre}</p>
                          <p className="text-sm text-gray-500">CI: {user.ci}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{user.telefono}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.ciudad && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{user.ciudad}</span>
                        </div>
                      )}
                      {user.direccion && (
                        <p className="text-xs text-gray-500 mt-1">{user.direccion}</p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.estado === 'ACTIVO'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.estado === 'ACTIVO' ? (
                          <><Unlock size={12} /> Activo</>
                        ) : (
                          <><Lock size={12} /> Bloqueado</>
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                        {user.totalCompras}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      Bs {user.totalGastado.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleExpanded(user.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver más detalles"
                        >
                          {expandedUser === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                          onClick={() => handleViewPurchases(user)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver historial de compras"
                        >
                          <History size={18} />
                        </button>
                        {user.estado === 'ACTIVO' ? (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Bloquear usuario"
                          >
                            <Lock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Desbloquear usuario"
                          >
                            <Unlock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Último Acceso</p>
                            <p className="font-semibold text-gray-900 mt-1 flex items-center gap-2">
                              <Calendar size={16} />
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
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Miembro Desde</p>
                            <p className="font-semibold text-gray-900 mt-1 flex items-center gap-2">
                              <Calendar size={16} />
                              {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Promedio por Compra</p>
                            <p className="font-semibold text-gray-900 mt-1 flex items-center gap-2">
                              <CreditCard size={16} />
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
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchases Modal */}
      {showPurchases && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historial de Compras</h2>
                <p className="text-sm text-gray-600">{selectedUser.nombre}</p>
              </div>
              <button
                onClick={() => setShowPurchases(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingPurchases ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <History size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay compras registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPurchases.map((purchase) => (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{purchase.eventTitle}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
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
                              <CreditCard size={14} />
                              <span>{purchase.cantidad} entrada(s)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Comprado el:</span>
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
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            Bs {purchase.totalPagado.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold mt-1 ${
                            purchase.estadoPago === 'PAGADO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
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
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowPurchases(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
