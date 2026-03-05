import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Search, Lock, Unlock, History,
  Filter, MapPin, Calendar, CreditCard, ChevronDown, ChevronUp, X
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

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { filterUsers() }, [users, searchTerm, statusFilter])

  const loadUsers = async () => {
    try { setLoading(true); setUsers(await adminService.getUsersList()) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const filterUsers = () => {
    let f = [...users]
    if (statusFilter === 'activo') f = f.filter(u => u.estado === 'ACTIVO')
    else if (statusFilter === 'bloqueado') f = f.filter(u => u.estado === 'BLOQUEADO')
    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      f = f.filter(u =>
        u.nombre.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        u.ci.includes(t)
      )
    }
    setFilteredUsers(f)
  }

  const handleViewPurchases = async (user: UserType) => {
    setSelectedUser(user); setShowPurchases(true); setLoadingPurchases(true)
    try { setUserPurchases(await adminService.getUserPurchases(user.id)) }
    catch { console.error('Error') } finally { setLoadingPurchases(false) }
  }

  const handleBlockUser = async (id: string) => {
    if (!confirm('¿Bloquear este usuario?')) return
    try { await adminService.blockUser(id); await loadUsers() }
    catch { alert('Error al bloquear usuario') }
  }

  const handleUnblockUser = async (id: string) => {
    if (!confirm('¿Desbloquear este usuario?')) return
    try { await adminService.unblockUser(id); await loadUsers() }
    catch { alert('Error al desbloquear usuario') }
  }

  const fmtDate = (d: any) =>
    d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Nunca'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )

  const statCards = [
    { label: 'Total Usuarios', value: users.length, border: 'border-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30', icon: User, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Activos', value: users.filter(u => u.estado === 'ACTIVO').length, border: 'border-green-500', iconBg: 'bg-green-50 dark:bg-green-900/30', icon: Unlock, color: 'text-green-600 dark:text-green-400' },
    { label: 'Bloqueados', value: users.filter(u => u.estado === 'BLOQUEADO').length, border: 'border-red-500', iconBg: 'bg-red-50 dark:bg-red-900/30', icon: Lock, color: 'text-red-600 dark:text-red-400' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Gestión de Usuarios</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Administra los usuarios registrados</p>
      </div>

      {/* ── Stats — FIXED: en móvil solo número + label + icono pequeño, sin flex-row que desborda ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {statCards.map(({ label, value, border, iconBg, icon: Icon, color }) => (
          <div key={label} className={`bg-white dark:bg-gray-800 border-2 ${border} rounded-xl overflow-hidden`}>
            {/* MÓVIL: layout vertical compacto */}
            <div className="sm:hidden p-2.5">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-none mb-1 truncate">
                {label === 'Total Usuarios' ? 'Total' : label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <div className={`inline-flex items-center justify-center w-5 h-5 ${iconBg} rounded mt-1.5`}>
                <Icon className={color} size={11} />
              </div>
            </div>
            {/* DESKTOP: layout horizontal */}
            <div className="hidden sm:flex items-center justify-between gap-2 p-5">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={color} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o CI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                {['Usuario', 'Contacto', 'Ubicación', 'Estado', 'Compras', 'Total Gastado', 'Acciones'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide ${
                    h === 'Estado' ? 'text-center' : ['Compras', 'Total Gastado', 'Acciones'].includes(h) ? 'text-right' : 'text-left'
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map(user => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-semibold text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{user.nombre}</p>
                          <p className="text-xs text-gray-500">CI: {user.ci}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><Mail size={11} />{user.email}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5"><Phone size={11} />{user.telefono}</div>
                    </td>
                    <td className="px-4 py-3">
                      {user.ciudad && <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300"><MapPin size={11} />{user.ciudad}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        user.estado === 'ACTIVO' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {user.estado === 'ACTIVO' ? <><Unlock size={11} />Activo</> : <><Lock size={11} />Bloqueado</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {user.totalCompras}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Bs {user.totalGastado.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          {expandedUser === user.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button onClick={() => handleViewPurchases(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><History size={15} /></button>
                        {user.estado === 'ACTIVO'
                          ? <button onClick={() => handleBlockUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Lock size={15} /></button>
                          : <button onClick={() => handleUnblockUser(user.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Unlock size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                  {expandedUser === user.id && (
                    <tr key={`${user.id}-exp`}>
                      <td colSpan={7} className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: 'Último Acceso', value: fmtDate(user.ultimoAcceso) },
                            { label: 'Miembro Desde', value: fmtDate(user.createdAt) },
                            { label: 'Promedio Compra', value: `Bs ${user.totalCompras > 0 ? (user.totalGastado / user.totalCompras).toFixed(2).toLocaleString() : '0'}` },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                              <p className="font-medium text-sm text-gray-900 dark:text-white mt-0.5">{value}</p>
                            </div>
                          ))}
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
              <User size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <User size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : filteredUsers.map(user => (
          <div key={user.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

            {/* Info principal */}
            <div className="p-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-sm flex-shrink-0">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">{user.nombre}</p>
                    {/* Badge estado — compacto con text corto */}
                    <span className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                      user.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.estado === 'ACTIVO' ? <><Unlock size={9} />Activo</> : <><Lock size={9} />Bloq.</>}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user.email}</p>
                  <p className="text-[11px] text-gray-400">CI: {user.ci}</p>
                </div>
              </div>
              {(user.ciudad || user.telefono) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 pl-[50px]">
                  {user.ciudad && <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={9} />{user.ciudad}</span>}
                  {user.telefono && <span className="flex items-center gap-1 text-[11px] text-gray-400"><Phone size={9} />{user.telefono}</span>}
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
              <div className="px-2 py-2 text-center">
                <p className="text-[10px] text-gray-400 leading-none">Compras</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{user.totalCompras}</p>
              </div>
              <div className="px-2 py-2 text-center">
                <p className="text-[10px] text-gray-400 leading-none">Gastado</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">Bs {user.totalGastado.toLocaleString()}</p>
              </div>
              <div className="px-2 py-2 text-center">
                <p className="text-[10px] text-gray-400 leading-none">Promedio</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  Bs {user.totalCompras > 0 ? (user.totalGastado / user.totalCompras).toFixed(2).toLocaleString() : '0'}
                </p>
              </div>
            </div>

            {/* Expanded */}
            {expandedUser === user.id && (
              <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-3 py-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Último Acceso</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{fmtDate(user.ultimoAcceso)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Miembro desde</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{fmtDate(user.createdAt)}</p>
                  </div>
                  {user.direccion && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Dirección</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user.direccion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {expandedUser === user.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expandedUser === user.id ? 'Menos' : 'Más'}
              </button>
              <button onClick={() => handleViewPurchases(user)}
                className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                <History size={13} /> Compras
              </button>
              {user.estado === 'ACTIVO'
                ? <button onClick={() => handleBlockUser(user.id)} className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"><Lock size={13} />Bloquear</button>
                : <button onClick={() => handleUnblockUser(user.id)} className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"><Unlock size={13} />Activar</button>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal Compras ── */}
      {showPurchases && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Historial de Compras</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedUser.nombre}</p>
              </div>
              <button onClick={() => setShowPurchases(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {loadingPurchases ? (
                <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" /></div>
              ) : userPurchases.length === 0 ? (
                <div className="text-center py-12"><History size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No hay compras</p></div>
              ) : (
                <div className="space-y-3">
                  {userPurchases.map(purchase => (
                    <div key={purchase.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{purchase.eventTitle}</p>
                          <div className="mt-1.5 space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><Calendar size={11} />{new Date(purchase.eventDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="flex items-center gap-1.5"><CreditCard size={11} />{purchase.cantidad} entrada(s)</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold text-gray-900 dark:text-white">Bs {purchase.totalPagado.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${purchase.estadoPago === 'PAGADO' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {purchase.estadoPago}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <button onClick={() => setShowPurchases(false)} className="w-full sm:w-auto px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}