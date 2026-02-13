import React, { useState, useEffect } from 'react'
import { Download, Calendar, MapPin, QrCode } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface Purchase {
  id: string
  eventoId: string
  eventoTitulo: string
  eventoFecha: string
  eventoHora: string
  eventoUbicacion: string
  asientos: Array<{
    fila: string
    numero: number
  }>
  monto: number
  estadoPago: 'PAGADO' | 'PENDIENTE' | 'REEMBOLSADO' | 'FALLIDO'
  qrCode: string
  certificadoUrl?: string
  createdAt: string
}

export default function MisCompras() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true)
        const response = await api.get('/users/me/purchases')
        setPurchases(response.data)
      } catch (error) {
        console.error('Error loading purchases:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadPurchases()
    }
  }, [user])

  const downloadTicket = async (purchase: Purchase) => {
    try {
      // Download PDF
      if (purchase.certificadoUrl) {
        window.open(purchase.certificadoUrl, '_blank')
      } else {
        // Generate QR code download
        alert('Generando certificado...')
      }
    } catch (error) {
      console.error('Error downloading ticket:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REEMBOLSADO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FALLIDO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <QrCode size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para ver tus compras
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Mis Compras</h1>
          <p className="text-white/80 mt-2">
            Gestiona tus entradas y certificados
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <QrCode size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">Aún no tienes compras</h2>
              <p className="text-gray-600 mb-6">
                Explora nuestros eventos y compra tus primeras entradas
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Explorar eventos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total compras</p>
                  <p className="text-3xl font-bold text-primary">{purchases.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total gastado</p>
                  <p className="text-3xl font-bold text-green-600">
                    Bs {purchases.reduce((sum, p) => sum + p.monto, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Próximo evento</p>
                  <p className="text-xl font-bold">
                    {purchases.length > 0
                      ? new Date(purchases[0].eventoFecha).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : '-'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Purchases List */}
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Event Info */}
                    <div className="flex-grow mb-4 lg:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {purchase.eventoTitulo}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 text-primary" />
                              <span>
                                {formatDate(purchase.eventoFecha)} - {purchase.eventoHora}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2 text-primary" />
                              <span>{purchase.eventoUbicacion}</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            getStatusColor(purchase.estadoPago)
                          }`}
                        >
                          {purchase.estadoPago}
                        </span>
                      </div>

                      {/* Seats */}
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Asientos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {purchase.asientos.map((asiento, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm font-mono"
                            >
                              {asiento.fila}{asiento.numero}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Purchase Date */}
                      <p className="text-xs text-gray-500">
                        Comprado el {formatDate(purchase.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3 lg:min-w-[200px]">
                      <div className="text-center lg:text-right mb-2">
                        <p className="text-sm text-gray-600">Total pagado</p>
                        <p className="text-2xl font-bold text-primary">
                          Bs {purchase.monto.toFixed(2)}
                        </p>
                      </div>

                      {purchase.estadoPago === 'PAGADO' && (
                        <Button
                          onClick={() => downloadTicket(purchase)}
                          className="w-full"
                        >
                          <Download size={18} className="mr-2" />
                          Descargar entrada
                        </Button>
                      )}

                      {purchase.certificadoUrl && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(purchase.certificadoUrl, '_blank')}
                          className="w-full"
                        >
                          <QrCode size={18} className="mr-2" />
                          Ver QR
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
