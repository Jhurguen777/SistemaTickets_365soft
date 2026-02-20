import { useState, useEffect } from 'react'
import {
  Palette,
  Globe,
  Share2,
  CreditCard,
  FileText,
  Save,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { Config } from '@/types/admin'

export default function Settings() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'apariencia' | 'sitio' | 'redes' | 'pagos' | 'legales'>('apariencia')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await adminService.getConfig()
      setConfig(data)
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)
      await adminService.updateConfig(config)
      alert('Configuración guardada exitosamente')
    } catch (error) {
      alert('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (updates: Partial<Config>) => {
    if (config) {
      setConfig({ ...config, ...updates })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Personaliza la plataforma</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Eye size={18} />
            {previewMode ? 'Editar' : 'Vista Previa'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('apariencia')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'apariencia'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette size={20} />
              <span className="font-medium">Apariencia</span>
            </button>
            <button
              onClick={() => setActiveTab('sitio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sitio'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Globe size={20} />
              <span className="font-medium">Datos del Sitio</span>
            </button>
            <button
              onClick={() => setActiveTab('redes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'redes'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Share2 size={20} />
              <span className="font-medium">Redes Sociales</span>
            </button>
            <button
              onClick={() => setActiveTab('pagos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'pagos'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={20} />
              <span className="font-medium">Métodos de Pago</span>
            </button>
            <button
              onClick={() => setActiveTab('legales')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'legales'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Textos Legales</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Apariencia */}
          {activeTab === 'apariencia' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Apariencia</h3>
                </div>

                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => !previewMode && updateConfig({ tema: 'claro' })}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                        config.tema === 'claro' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      disabled={previewMode}
                    >
                      <div className="text-center">
                        <div className="w-full h-20 bg-white border border-gray-300 rounded mb-2"></div>
                        <p className="font-medium">Claro</p>
                      </div>
                    </button>
                    <button
                      onClick={() => !previewMode && updateConfig({ tema: 'oscuro' })}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                        config.tema === 'oscuro' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      disabled={previewMode}
                    >
                      <div className="text-center">
                        <div className="w-full h-20 bg-gray-800 rounded mb-2"></div>
                        <p className="font-medium">Oscuro</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Color Primario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Primario
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={config.colorPrimario}
                      onChange={(e) => !previewMode && updateConfig({ colorPrimario: e.target.value })}
                      disabled={previewMode}
                      className="w-20 h-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colorPrimario}
                      onChange={(e) => !previewMode && updateConfig({ colorPrimario: e.target.value })}
                      disabled={previewMode}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datos del Sitio */}
          {activeTab === 'sitio' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del Sitio</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Sitio
                  </label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => !previewMode && updateConfig({ nombre: e.target.value })}
                    disabled={previewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Logo
                  </label>
                  <input
                    type="text"
                    value={config.logo}
                    onChange={(e) => !previewMode && updateConfig({ logo: e.target.value })}
                    disabled={previewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {config.logo && (
                    <div className="mt-2">
                      <img src={config.logo} alt="Logo" className="h-16 object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    value={config.slogan}
                    onChange={(e) => !previewMode && updateConfig({ slogan: e.target.value })}
                    disabled={previewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={config.emailContacto}
                    onChange={(e) => !previewMode && updateConfig({ emailContacto: e.target.value })}
                    disabled={previewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redes Sociales */}
          {activeTab === 'redes' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Redes Sociales</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook size={16} className="inline mr-2" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={config.redesSociales.facebook || ''}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        redesSociales: { ...config.redesSociales, facebook: e.target.value }
                      })
                    }
                    disabled={previewMode}
                    placeholder="https://facebook.com/tu-pagina"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter size={16} className="inline mr-2" />
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    value={config.redesSociales.twitter || ''}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        redesSociales: { ...config.redesSociales, twitter: e.target.value }
                      })
                    }
                    disabled={previewMode}
                    placeholder="https://twitter.com/tu-usuario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram size={16} className="inline mr-2" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={config.redesSociales.instagram || ''}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        redesSociales: { ...config.redesSociales, instagram: e.target.value }
                      })
                    }
                    disabled={previewMode}
                    placeholder="https://instagram.com/tu-usuario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube size={16} className="inline mr-2" />
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={config.redesSociales.youtube || ''}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        redesSociales: { ...config.redesSociales, youtube: e.target.value }
                      })
                    }
                    disabled={previewMode}
                    placeholder="https://youtube.com/@tu-canal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎵 TikTok
                  </label>
                  <input
                    type="url"
                    value={config.redesSociales.tiktok || ''}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        redesSociales: { ...config.redesSociales, tiktok: e.target.value }
                      })
                    }
                    disabled={previewMode}
                    placeholder="https://tiktok.com/@tu-usuario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Pago */}
          {activeTab === 'pagos' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Métodos de Pago</h3>
                  <p className="text-sm text-gray-600">Selecciona los métodos de pago disponibles</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'visa', label: 'Visa', icon: '💳' },
                    { key: 'mastercard', label: 'Mastercard', icon: '💳' },
                    { key: 'amex', label: 'American Express', icon: '💳' },
                    { key: 'qrSimple', label: 'QR Simple', icon: '📱' },
                    { key: 'baniPay', label: 'BaniPay', icon: '💰' },
                    { key: 'tigoMoney', label: 'TIGO MONEY', icon: '📱' }
                  ].map((method) => (
                    <label
                      key={method.key}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        config.metodosPago[method.key as keyof typeof config.metodosPago]
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.metodosPago[method.key as keyof typeof config.metodosPago]}
                        onChange={(e) => {
                          if (!previewMode) {
                            updateConfig({
                              metodosPago: {
                                ...config.metodosPago,
                                [method.key]: e.target.checked
                              }
                            })
                          }
                        }}
                        disabled={previewMode}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Textos Legales */}
          {activeTab === 'legales' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Textos Legales</h3>
                  <p className="text-sm text-gray-600">Edita los textos legales del sitio</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Términos y Condiciones
                  </label>
                  <textarea
                    value={config.textosLegales.terminosCondiciones}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        textosLegales: {
                          ...config.textosLegales,
                          terminosCondiciones: e.target.value
                        }
                      })
                    }
                    disabled={previewMode}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Privacidad
                  </label>
                  <textarea
                    value={config.textosLegales.politicaPrivacidad}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        textosLegales: {
                          ...config.textosLegales,
                          politicaPrivacidad: e.target.value
                        }
                      })
                    }
                    disabled={previewMode}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aviso Legal
                  </label>
                  <textarea
                    value={config.textosLegales.avisoLegal}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        textosLegales: {
                          ...config.textosLegales,
                          avisoLegal: e.target.value
                        }
                      })
                    }
                    disabled={previewMode}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Reembolso
                  </label>
                  <textarea
                    value={config.textosLegales.politicaReembolso}
                    onChange={(e) =>
                      !previewMode &&
                      updateConfig({
                        textosLegales: {
                          ...config.textosLegales,
                          politicaReembolso: e.target.value
                        }
                      })
                    }
                    disabled={previewMode}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
