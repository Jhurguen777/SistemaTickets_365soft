import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { RegisteredUser } from '@/types/admin'
import adminService from '@/services/adminService'

export default function EventClientsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [clients, setClients] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(false)
  const [eventTitle, setEventTitle] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadClients()
    }
  }, [id])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await adminService.getEventUsers(id!)
      setClients(data)
      // Obtener el título del evento si está disponible en los datos
      if (data.length > 0 && data[0].eventoTitulo) {
        setEventTitle(data[0].eventoTitulo)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </button>
      </div>

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Clientes Registrados</h1>
        {eventTitle && (
          <p className="text-lg text-gray-600 mt-1">{eventTitle}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No hay clientes registrados para este evento</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <div className="flex items-center gap-2"><User size={16} />Cliente</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <div className="flex items-center gap-2"><Mail size={16} />Contacto</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <div className="flex items-center gap-2"><MapPin size={16} />Sector</div>
                </th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Cantidad
                </th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <div className="flex items-center gap-2 justify-end"><CreditCard size={16} />Total</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <div className="flex items-center gap-2"><Calendar size={16} />Fecha</div>
                </th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Asientos
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr
                  key={client.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {client.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{client.nombre}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{client.telefono}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {client.sector}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                      {client.cantidad}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-gray-900">
                      Bs {client.totalPagado.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(client.fechaCompra).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      client.estadoPago === 'PAGADO'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {client.estadoPago === 'PAGADO' ? (
                        <><CheckCircle size={12} />Pagado</>
                      ) : (
                        <><Clock size={12} />Pendiente</>
                      )}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {client.asientos && client.asientos.length > 0 ? (
                        client.asientos.map((asiento, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-700"
                          >
                            {asiento}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}