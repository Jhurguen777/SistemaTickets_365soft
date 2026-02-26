import { useState, useEffect } from 'react'
import {
  Palette,
  Globe,
  Share2,
  CreditCard,
  Facebook,
  X,
  Instagram,
  Youtube,
  Eye,
  Sun,
  Moon,
  Check,
  Loader2,
  CheckCircle2,
  Wallet,
  Smartphone,
  Building2,
  QrCode,
  Landmark
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import adminService from '@/services/adminService'
import { Config } from '@/types/admin'
import { useTheme } from '@/contexts/ThemeContext'

export default function Settings() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'apariencia' | 'sitio' | 'redes' | 'pagos'>('apariencia')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    loadConfig()
  }, [])

  // Auto-guardado con debounce
  useEffect(() => {
    if (!config || loading) return

    const timeoutId = setTimeout(async () => {
      try {
        setSaveStatus('saving')
        await adminService.updateConfig(config)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Error auto-guardando:', error)
        setSaveStatus('idle')
      }
    }, 1000) // Guardar después de 1 segundo de inactividad

    return () => clearTimeout(timeoutId)
  }, [config, loading])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Personaliza la plataforma</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('apariencia')}
              className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'apariencia'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {activeTab === 'apariencia' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"></div>
              )}
              <Palette size={16} className={`transition-colors ${
                activeTab === 'apariencia' ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              }`} />
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                activeTab === 'apariencia' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}>APARIENCIA</span>
            </button>

            <button
              onClick={() => setActiveTab('sitio')}
              className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'sitio'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {activeTab === 'sitio' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"></div>
              )}
              <Globe size={16} className={`transition-colors ${
                activeTab === 'sitio' ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              }`} />
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                activeTab === 'sitio' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}>SITIO</span>
            </button>

            <button
              onClick={() => setActiveTab('redes')}
              className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'redes'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {activeTab === 'redes' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"></div>
              )}
              <Share2 size={16} className={`transition-colors ${
                activeTab === 'redes' ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              }`} />
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                activeTab === 'redes' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}>REDES SOCIALES</span>
            </button>

            <button
              onClick={() => setActiveTab('pagos')}
              className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'pagos'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {activeTab === 'pagos' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"></div>
              )}
              <CreditCard size={16} className={`transition-colors ${
                activeTab === 'pagos' ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              }`} />
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                activeTab === 'pagos' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}>PAGOS</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Apariencia */}
          {activeTab === 'apariencia' && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Apariencia</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza el tema visual de la plataforma</p>
                </div>

                {/* Tema - Botones Pequeños Elegantes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Modo de visualización</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('claro')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        theme === 'claro'
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Sun size={16} />
                      Light
                      {theme === 'claro' && <Check size={16} className="ml-1" />}
                    </button>
                    <button
                      onClick={() => setTheme('oscuro')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        theme === 'oscuro'
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Moon size={16} />
                      Dark
                      {theme === 'oscuro' && <Check size={16} className="ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Auto-guardado</h4>
                      <p className="text-xs text-blue-700">
                        Los cambios se aplican y guardan automáticamente.
                        Verás el indicador de estado en la esquina superior derecha.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datos del Sitio */}
          {activeTab === 'sitio' && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Datos del Sitio</h3>
                  <p className="text-sm text-gray-500">Configura la información básica de tu plataforma</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      value={config.nombre}
                      onChange={(e) => updateConfig({ nombre: e.target.value })}
                      placeholder="SistemaTickets 365soft"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Logo
                    </label>
                    <input
                      type="text"
                      value={config.logo}
                      onChange={(e) => updateConfig({ logo: e.target.value })}
                      placeholder="/logo.png"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {config.logo && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                        <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                    <input
                      type="text"
                      value={config.slogan}
                      onChange={(e) => updateConfig({ slogan: e.target.value })}
                      placeholder="Tu mejor opción para entradas de eventos"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={config.emailContacto}
                      onChange={(e) => updateConfig({ emailContacto: e.target.value })}
                      placeholder="contacto@365soft.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redes Sociales */}
          {activeTab === 'redes' && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Redes Sociales</h3>
                  <p className="text-sm text-gray-500">Conecta tus redes sociales para que los clientes puedan seguirte</p>
                </div>

                <div className="space-y-3">
                  {/* Facebook */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Facebook size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={config.redesSociales.facebook || ''}
                        onChange={(e) =>
                          updateConfig({
                            redesSociales: { ...config.redesSociales, facebook: e.target.value }
                          })
                        }
                        placeholder="https://facebook.com/tu-pagina"
                        className="w-full px-0 py-1.5 border-0 border-b-2 border-gray-200 focus:border-primary focus:ring-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Twitter/X */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <X size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Twitter / X</label>
                      <input
                        type="url"
                        value={config.redesSociales.twitter || ''}
                        onChange={(e) =>
                          updateConfig({
                            redesSociales: { ...config.redesSociales, twitter: e.target.value }
                          })
                        }
                        placeholder="https://twitter.com/tu-usuario"
                        className="w-full px-0 py-1.5 border-0 border-b-2 border-gray-200 focus:border-primary focus:ring-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Instagram size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={config.redesSociales.instagram || ''}
                        onChange={(e) =>
                          updateConfig({
                            redesSociales: { ...config.redesSociales, instagram: e.target.value }
                          })
                        }
                        placeholder="https://instagram.com/tu-usuario"
                        className="w-full px-0 py-1.5 border-0 border-b-2 border-gray-200 focus:border-primary focus:ring-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Youtube size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">YouTube</label>
                      <input
                        type="url"
                        value={config.redesSociales.youtube || ''}
                        onChange={(e) =>
                          updateConfig({
                            redesSociales: { ...config.redesSociales, youtube: e.target.value }
                          })
                        }
                        placeholder="https://youtube.com/@tu-canal"
                        className="w-full px-0 py-1.5 border-0 border-b-2 border-gray-200 focus:border-primary focus:ring-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">TT</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">TikTok</label>
                      <input
                        type="url"
                        value={config.redesSociales.tiktok || ''}
                        onChange={(e) =>
                          updateConfig({
                            redesSociales: { ...config.redesSociales, tiktok: e.target.value }
                          })
                        }
                        placeholder="https://tiktok.com/@tu-usuario"
                        className="w-full px-0 py-1.5 border-0 border-b-2 border-gray-200 focus:border-primary focus:ring-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Pago */}
          {activeTab === 'pagos' && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Métodos de Pago</h3>
                  <p className="text-sm text-gray-500">Selecciona los métodos de pago disponibles para tus clientes</p>
                </div>

                <div className="space-y-3">
                  {/* Visa */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">Visa</span>
                      <p className="text-xs text-gray-500">Tarjetas de crédito y débito Visa</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.visa}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, visa: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.visa ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.visa ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>

                  {/* Mastercard */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wallet size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">Mastercard</span>
                      <p className="text-xs text-gray-500">Tarjetas de crédito y débito Mastercard</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.mastercard}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, mastercard: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.mastercard ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.mastercard ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>

                  {/* American Express */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Landmark size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">American Express</span>
                      <p className="text-xs text-gray-500">Tarjetas American Express</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.amex}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, amex: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.amex ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.amex ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>

                  {/* QR Simple */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <QrCode size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">QR Simple</span>
                      <p className="text-xs text-gray-500">Pagos mediante código QR</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.qrSimple}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, qrSimple: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.qrSimple ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.qrSimple ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>

                  {/* BaniPay */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">BaniPay</span>
                      <p className="text-xs text-gray-500">Billetera digital BaniPay</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.baniPay}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, baniPay: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.baniPay ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.baniPay ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>

                  {/* TIGO MONEY */}
                  <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Smartphone size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">TIGO MONEY</span>
                      <p className="text-xs text-gray-500">Billetera móvil TIGO MONEY</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.metodosPago.tigoMoney}
                        onChange={(e) => updateConfig({
                          metodosPago: { ...config.metodosPago, tigoMoney: e.target.checked }
                        })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        config.metodosPago.tigoMoney ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          config.metodosPago.tigoMoney ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-sm mb-1">Configuración de Pagos</h4>
                      <p className="text-xs text-amber-700">
                        Asegúrate de configurar correctamente las credenciales de cada método de pago en el archivo de entorno del backend antes de activarlos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
