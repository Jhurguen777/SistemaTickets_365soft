import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  FileText,
  Palette
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import certificateService, { CertificateTemplate } from '@/services/certificateService'

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: '',
    titulo: '',
    subtitulo: '',
    incluirFecha: true,
    incluirEvento: true,
    incluirDuracion: false,
    incluirCodigo: true,
    mensajePersonalizado: '',
    firma1Nombre: '',
    firma1Cargo: '',
    firma2Nombre: '',
    firma2Cargo: '',
    colores: {
      primario: '#1E40AF',
      secundario: '#3B82F6',
      texto: '#1F2937',
      fondo: '#FFFFFF'
    }
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await certificateService.getTemplates()
      setTemplates(loadedTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setFormData({
      name: '',
      titulo: 'CERTIFICADO DE ASISTENCIA',
      subtitulo: 'Se otorga el presente certificado a',
      incluirFecha: true,
      incluirEvento: true,
      incluirDuracion: false,
      incluirCodigo: true,
      mensajePersonalizado: '',
      firma1Nombre: '',
      firma1Cargo: '',
      firma2Nombre: '',
      firma2Cargo: '',
      colores: {
        primario: '#1E40AF',
        secundario: '#3B82F6',
        texto: '#1F2937',
        fondo: '#FFFFFF'
      }
    })
    setIsEditing(true)
  }

  const handleEdit = (template: CertificateTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      titulo: template.titulo,
      subtitulo: template.subtitulo,
      incluirFecha: template.incluirFecha,
      incluirEvento: template.incluirEvento,
      incluirDuracion: template.incluirDuracion,
      incluirCodigo: template.incluirCodigo,
      mensajePersonalizado: template.mensajePersonalizado || '',
      firma1Nombre: template.firma1?.nombre || '',
      firma1Cargo: template.firma1?.cargo || '',
      firma2Nombre: template.firma2?.nombre || '',
      firma2Cargo: template.firma2?.cargo || '',
      colores: template.colores
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return

    try {
      await certificateService.deleteTemplate(id)
      await loadTemplates()
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar la plantilla')
    }
  }

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

      if (selectedTemplate) {
        await certificateService.updateTemplate(selectedTemplate.id, templateData)
      } else {
        await certificateService.createTemplate(templateData)
      }

      await loadTemplates()
      setIsEditing(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error al guardar la plantilla')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    const mockAttendee = {
      id: 'preview',
      purchaseId: 'pur-preview',
      eventId: 'evt-preview',
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      ci: '12345678',
      asiento: 'A1',
      sector: 'VIP',
      asistencia: 'ASISTIO' as const,
      qrCode: 'PREVIEW'
    }

    const templateForPreview: CertificateTemplate = {
      id: 'preview',
      name: formData.name,
      titulo: formData.titulo,
      subtitulo: formData.subtitulo,
      incluirFecha: formData.incluirFecha,
      incluirEvento: formData.incluirEvento,
      incluirDuracion: formData.incluirDuracion,
      incluirCodigo: formData.incluirCodigo,
      mensajePersonalizado: formData.mensajePersonalizado,
      firma1: formData.firma1Nombre ? {
        nombre: formData.firma1Nombre,
        cargo: formData.firma1Cargo
      } : undefined,
      firma2: formData.firma2Nombre ? {
        nombre: formData.firma2Nombre,
        cargo: formData.firma2Cargo
      } : undefined,
      colores: formData.colores,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const html = certificateService.previewCertificate(
      mockAttendee,
      templateForPreview,
      'Evento de Ejemplo',
      '27 de Febrero, 2024'
    )

    setPreviewHtml(html)
    setShowPreview(true)
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Personaliza el diseño de tus certificados
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
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

              {/* Previsualizar */}
              <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handlePreview} variant="outline" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Previsualizar Certificado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Previsualización */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Previsualización</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas de Certificado</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las plantillas para enviar certificados a los asistentes
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Grid de Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div
              className="h-32 relative"
              style={{
                background: `linear-gradient(135deg, ${template.colores.primario} 0%, ${template.colores.secundario} 100%)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-lg font-bold">{template.titulo}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {template.incluirFecha && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">Fecha</span>
                )}
                {template.incluirEvento && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">Evento</span>
                )}
                {template.incluirDuracion && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">Duración</span>
                )}
                {template.incluirCodigo && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">Código</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Card para nueva plantilla */}
        <Card
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[250px] cursor-pointer hover:border-primary transition-colors"
          onClick={handleCreateNew}
        >
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Crear Nueva Plantilla</p>
            <p className="text-sm text-gray-500 mt-1">Personaliza tu certificado</p>
          </CardContent>
        </Card>
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay plantillas aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crea tu primera plantilla de certificado
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Plantilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
