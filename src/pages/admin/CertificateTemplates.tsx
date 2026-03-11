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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewHtml, _setPreviewHtml] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewData, _setPreviewData] = useState<CertificatePreviewData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null)

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
    console.log('📝 Botón Editar presionado. Template completo:', template)
    console.log('📝 Template ID:', template.id)
    console.log('📝 Template name:', template.name)
    console.log('📝 Template type:', (template as any).type, 'VERIFICAR')
    console.log('📝 Template description:', (template as any).description || template.descripcion)
    console.log('📝 Template content length:', ((template as any).content || '').length)
    console.log('📝 Todas las propiedades del template:', Object.keys(template))

    if (!(template as any).type) {
      console.warn('⚠️ Template.type es undefined! Usando tipo por defecto')
    setEditingTemplate(template)
      setEditorContent((template as any).content || '')
      setEditorMode('visual')
      return
    }

    // Guardamos la plantilla seleccionada para pasarla al editor
    setEditingTemplate(template)
    setEditorContent((template as any).content || '')
    setEditorMode('visual')
  }

  const handleNewTemplate = () => {
    // Limpiar estado para nueva plantilla
    setEditingTemplate(null)
    setEditorContent('')
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

  const handleSaveVisual = async (templateData: {
    name: string
    type: CertificateTemplateType
    description: string
    content: string
  }) => {
    console.log('📝 Datos recibidos del CertificateEditor:', templateData)
    console.log('🔍 editingTemplate:', editingTemplate)
    console.log('🔍 editingTemplate?.id:', editingTemplate?.id)

    if (!templateData.content || templateData.content.trim() === '') {
      alert('El contenido del certificado no puede estar vacío. Por favor selecciona una plantilla o agrega contenido.')
      return
    }

    if (!templateData.name || templateData.name.trim() === '') {
      alert('El nombre de la plantilla no puede estar vacío')
      return
    }

    console.log('✅ Validación pasada. Guardando plantilla:', templateData)

    try {
      if (editingTemplate) {
        console.log('📌 Actualizando plantilla existente con ID:', editingTemplate.id)
        // Actualizar plantilla existente
        await certificateService.updateTemplate(editingTemplate.id, templateData as any)
        alert(`Plantilla "${templateData.name}" actualizada exitosamente`)
      } else {
        console.log('🆕 Creando NUEVA plantilla')
        // Crear nueva plantilla
        await certificateService.createTemplate(templateData as any)
        alert(`Plantilla "${templateData.name}" guardada exitosamente`)
      }

      setEditorMode('list')
      setEditorContent('')
      setEditingTemplate(null) // Limpiar estado de edición
      await loadTemplates()
    } catch (error: any) {
      console.error('❌ Error guardando plantilla:', error)
      alert(`Error al guardar la plantilla: ${error.message || 'Error desconocido'}`)
    }
  }

  // Vista de Editor Visual
  if (editorMode === 'visual') {
    return (
      <div>
        <CertificateEditor
          content={editorContent}
          onChange={setEditorContent}
          onSave={handleSaveVisual}
          initialName={editingTemplate?.name}
          initialType={editingTemplate ? (editingTemplate as any).type as CertificateTemplateType : undefined}
          initialDescription={editingTemplate?.descripcion}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas de Certificado</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las plantillas para enviar certificados a los asistentes
          </p>
        </div>
        <Button
          onClick={handleNewTemplate}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Grid de Plantillas Existentes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plantillas Guardadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden w-full">
              <div
                className="relative overflow-hidden aspect-video"
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
                <div className="flex flex-col sm:flex-row gap-2">
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
              onClick={handleNewTemplate}
              className="w-full sm:w-auto"
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
