import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function AuthError() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const errorMessage = searchParams.get('message') || 'Error en la autenticación'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>

        <Card>
          <CardContent className="p-8">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error en la autenticación
              </h1>
              <p className="text-gray-600">
                {errorMessage}
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-900">
                Hubo un problema al autenticarte con Google. Por favor, intenta nuevamente.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full"
              >
                Intentar nuevamente
              </Button>
              <Button
                onClick={() => navigate('/')}
                size="lg"
                variant="outline"
                className="w-full"
              >
                Ir al inicio
              </Button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-center text-gray-500">
              Si el problema persiste, contacta al soporte técnico
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
