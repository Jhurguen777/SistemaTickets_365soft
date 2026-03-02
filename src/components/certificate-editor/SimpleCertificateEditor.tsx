/**
 * Editor Simplificado de Certificados
 * Este componente mantiene el enfoque original basado en formularios
 */

import { useState } from 'react'
import {
  Eye,
  Save,
  X,
  FileText,
  Palette
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CertificateTemplate } from '@/services/certificateService'

interface SimpleCertificateEditorProps {
  template?: CertificateTemplate | null
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  onPreview: () => void
}

export default function SimpleCertificateEditor({
  template,
  onSave,
  onCancel,
  onPreview
}: SimpleCertificateEditorProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: template?.name || '',
    titulo: template?.titulo || 'CERTIFICADO DE ASISTENCIA',
    subtitulo: template?.subtitulo || 'Se otorga el presente certificado a',
    incluirFecha: template?.incluirFecha ?? true,
    incluirEvento: template?.incluirEvento ?? true,
    incluirDuracion: template?.incluirDuracion ?? false,
    incluirCodigo: template?.incluirCodigo ?? true,
    mensajePersonalizado: template?.mensajePersonalizado || '',
    firma1Nombre: template?.firma1?.nombre || '',
    firma1Cargo: template?.firma1?.cargo || '',
    firma2Nombre: template?.firma2?.nombre || '',
    firma2Cargo: template?.firma2?.cargo || '',
    colores: template?.colores || {
      primario: '#1E40AF',
      secundario: '#3B82F6',
      texto: '#1F2937',
      fondo: '#FFFFFF'
    }
  })

  const handleSave = async () => {
    try {
      setLoading(true)

      const templateData = {
        ...formData,
        firma1: formData.firma1Nombre ? {
          nombre: formData.firma1Nombre,
          cargo: formData.firma1Cargo
        } : undefined,
        firma2: formData.firma2Nombre ? {
          nombre: formData.firma2Nombre,
          cargo: formData.firma2Cargo
        } : undefined
      }

      await onSave(templateData)
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error al guardar la plantilla')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personaliza el diseño de tus certificados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onPreview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Editor Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Plantilla
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ej: Certificado Estándar"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="CERTIFICADO DE ASISTENCIA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitulo}
                      onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Se otorga el presente a"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje Personalizado (opcional)
                  </label>
                  <textarea
                    value={formData.mensajePersonalizado}
                    onChange={(e) => setFormData({ ...formData, mensajePersonalizado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="Mensaje adicional que aparecerá en el certificado"
                  />
                </div>
              </div>
            </div>

            {/* Campos a incluir */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campos a Incluir</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.incluirFecha}
                    onChange={(e) => setFormData({ ...formData, incluirFecha: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fecha del evento</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.incluirEvento}
                    onChange={(e) => setFormData({ ...formData, incluirEvento: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Nombre del evento</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.incluirDuracion}
                    onChange={(e) => setFormData({ ...formData, incluirDuracion: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Duración</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.incluirCodigo}
                    onChange={(e) => setFormData({ ...formData, incluirCodigo: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Código de verificación</span>
                </label>
              </div>
            </div>

            {/* Colores */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colores.primario}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, primario: e.target.value }
                      })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.colores.primario}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, primario: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colores.secundario}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, secundario: e.target.value }
                      })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.colores.secundario}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, secundario: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colores.texto}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, texto: e.target.value }
                      })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.colores.texto}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, texto: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fondo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colores.fondo}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, fondo: e.target.value }
                      })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.colores.fondo}
                      onChange={(e) => setFormData({
                        ...formData,
                        colores: { ...formData.colores, fondo: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Firmas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Firmas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Firma 1 (opcional)</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.firma1Nombre}
                      onChange={(e) => setFormData({ ...formData, firma1Nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Nombre del firmante"
                    />
                    <input
                      type="text"
                      value={formData.firma1Cargo}
                      onChange={(e) => setFormData({ ...formData, firma1Cargo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Cargo"
                    />
                  </div>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Firma 2 (opcional)</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.firma2Nombre}
                      onChange={(e) => setFormData({ ...formData, firma2Nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Nombre del firmante"
                    />
                    <input
                      type="text"
                      value={formData.firma2Cargo}
                      onChange={(e) => setFormData({ ...formData, firma2Cargo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Cargo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
