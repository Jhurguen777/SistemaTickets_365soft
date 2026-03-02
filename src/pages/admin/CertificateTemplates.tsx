import { useState, useEffect } from 'react'
import {
  Trash2,
  FileText,
  Wand2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import certificateService, { CertificateTemplate } from '@/services/certificateService'
import CertificateEditor from '@/components/certificate-editor/CertificateEditor'
import CertificatePreview from '@/components/certificate-editor/CertificatePreview'
import { CertificatePreviewData, CertificateTemplateType } from '@/types/certificate'

type EditorMode = 'visual' | 'list'

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [editorMode, setEditorMode] = useState<EditorMode>('list')
  const [editorContent, setEditorContent] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewData, setPreviewData] = useState<CertificatePreviewData | null>(null)
  const [showPreview, setShowPreview] = useState(false)

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

  const handleEditVisual = (template: CertificateTemplate) => {
    setEditorContent((template as any).content || '')
    setEditorMode('visual')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return

    try {
      await certificateService.deleteTemplate(id)
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error al eliminar la plantilla')
    }
  }

  const handleSaveVisual = (templateData: {
    name: string
    type: CertificateTemplateType
    description: string
    content: string
  }) => {
    if (!templateData.content.trim()) {
      alert('El contenido del certificado no puede estar vacío')
      return
    }

    console.log('Guardando plantilla visual:', templateData)
    alert(`Plantilla "${templateData.name}" guardada exitosamente (funcionalidad backend pendiente)`)
    setEditorMode('list')
    loadTemplates()
  }

  // Vista de Editor Visual
  if (editorMode === 'visual') {
    return (
      <div>
        <CertificateEditor
          content={editorContent}
          onChange={setEditorContent}
          onSave={handleSaveVisual}
        />

        {/* Modal de vista previa */}
        {showPreview && previewData && (
          <CertificatePreview
            html={previewHtml}
            data={previewData}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    )
  }

  // Vista principal - Lista de plantillas
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
        <Button
          onClick={() => {
            setEditorMode('visual')
            setEditorContent('')
          }}
          className="flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Grid de Plantillas Existentes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plantillas Guardadas</h2>
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
                    onClick={() => handleEditVisual(template)}
                    className="flex-1"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
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
        </div>
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
            <Button
              onClick={() => {
                setEditorMode('visual')
                setEditorContent('')
              }}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
