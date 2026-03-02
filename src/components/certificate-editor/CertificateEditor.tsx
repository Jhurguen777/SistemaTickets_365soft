import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { Eye, FileText, Save } from 'lucide-react'
import { CertificateVariable } from '@/lib/tiptap/extensions/CertificateVariable'
import CertificateToolbar from './CertificateToolbar'
import VariablesSidebar from './VariablesSidebar'
import TemplateSelector from './TemplateSelector'
import CertificatePreview from './CertificatePreview'
import { CertificatePreviewData, CertificateTemplateType } from '@/types/certificate'
import '@/lib/tiptap/certificate-editor.css'

// Extensión personalizada para tamaño de fuente
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: any) => element.style.fontSize.replace(/['"]+/g, ''),
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`
          }
        },
      },
    }
  },
})

interface CertificateEditorProps {
  content: string
  onChange: (content: string) => void
  onPreview?: (html: string, data: CertificatePreviewData) => void
  onSave?: (templateData: {
    name: string
    type: CertificateTemplateType
    description: string
    content: string
  }) => void
}

export default function CertificateEditor({ content, onChange, onPreview, onSave }: CertificateEditorProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'variables'>('templates')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewData, setPreviewData] = useState<CertificatePreviewData | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Estado para mantener el HTML original sin procesar
  const [rawHtmlContent, setRawHtmlContent] = useState(content)

  // Función para hacer las variables editables en el HTML
  const makeVariablesEditable = (html: string): string => {
    return html.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return `<span class="certificate-variable-editable" data-variable="${variableName}" contenteditable="true" style="background: #fef08a; border: 2px dashed #ca8a04; padding: 2px 8px; border-radius: 4px; cursor: pointer;">{{${variableName}}}</span>`
    })
  }

  // Función para insertar una variable en el HTML
  const insertVariable = (variableKey: string) => {
    const variableTag = `{{${variableKey}}}`
    const newHtml = rawHtmlContent + `<p><span class="certificate-variable-editable" data-variable="${variableKey}" contenteditable="true" style="background: #fef08a; border: 2px dashed #ca8a04; padding: 2px 8px; border-radius: 4px; cursor: pointer;">{{${variableKey}}}</span></p>`
    setRawHtmlContent(newHtml)
    onChange(newHtml)
  }

  // Estados para la información básica de la plantilla
  const [templateName, setTemplateName] = useState('')
  const [templateType, setTemplateType] = useState<CertificateTemplateType>('personalizado')
  const [templateDescription, setTemplateDescription] = useState('')

  // Sincronizar rawHtmlContent cuando cambia el prop content
  useEffect(() => {
    if (content) {
      setRawHtmlContent(content)
    }
  }, [content])

  // Manejar cambios en las variables editables
  const handleVariableChange = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('certificate-variable-editable')) {
      const variableName = target.getAttribute('data-variable')
      const newValue = target.innerText || ''

      // Reemplazar la variable en el HTML original
      const newHtml = rawHtmlContent.replace(
        new RegExp(`\\{\\{${variableName}\\}\\}`, 'g'),
        newValue
      )
      setRawHtmlContent(newHtml)
      onChange(newHtml)
    }
  }

  // Agregar event listeners cuando se monta el componente
  useEffect(() => {
    const editableElements = document.querySelectorAll('.certificate-variable-editable')
    editableElements.forEach(el => {
      el.addEventListener('input', handleVariableChange)
    })

    return () => {
      editableElements.forEach(el => {
        el.removeEventListener('input', handleVariableChange)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawHtmlContent])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      CertificateVariable
    ],
    content: '', // Inicializar vacío para no procesar el HTML
    onUpdate: ({ editor }) => {
      // Solo actualizar si NO hay rawHtmlContent
      // Esto permite que el editor TipTap funcione para ediciones manuales
      // pero no sobrescribe el HTML original
      if (!rawHtmlContent) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: 'certificate-editor prose max-w-none focus:outline-none',
        'data-placeholder': 'Empieza a escribir tu certificado...'
      }
    }
  })

  const handleTemplateSelect = (templateContent: string) => {
    // Mantener el HTML original SIN procesar por TipTap
    console.log('📄 Plantilla seleccionada, longitud:', templateContent.length)
    console.log('🎨 Contiene estilos inline:', templateContent.includes('style='))
    console.log('🖼️ Contiene div con estilos:', templateContent.includes('<div style='))
    setRawHtmlContent(templateContent)
    onChange(templateContent)

    // NO pasar por TipTap porque elimina los estilos
    // TipTap solo se usará para insertar variables, no para procesar el HTML
  }

  const handlePreview = () => {
    if (!rawHtmlContent) return

    const html = rawHtmlContent

    // Datos de ejemplo para la vista previa
    const data: CertificatePreviewData = {
      nombre_completo: 'Juan Pérez García',
      ci: '12345678',
      telefono: '+591 77712345',
      oficina_alfa: 'Oficina Central - La Paz',
      fecha: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      evento: 'Seminario Anual de Tecnología 2025',
      mensaje: 'Felicitaciones por su destacada participación y compromiso durante todo el evento.'
    }

    // Reemplazar variables con datos de ejemplo
    let processedHtml = html
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      processedHtml = processedHtml.replace(regex, value || '')
    })

    setPreviewHtml(processedHtml)
    setPreviewData(data)
    setShowPreview(true)

    if (onPreview) {
      onPreview(processedHtml, data)
    }
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Por favor, ingresa un nombre para la plantilla')
      return
    }

    if (!rawHtmlContent.trim()) {
      alert('El contenido del certificado no puede estar vacío')
      return
    }

    if (onSave) {
      onSave({
        name: templateName,
        type: templateType,
        description: templateDescription,
        content: rawHtmlContent
      })
    }
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando editor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Información Básica */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nueva Plantilla
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Diseña tu certificado inteligente
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>

        {/* Campos de información básica */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Nombre de la Plantilla
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: Certificado de Asistencia Estándar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Certificado
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as CertificateTemplateType)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="personalizado">Personalizado</option>
                <option value="asistencia">Certificado de Asistencia</option>
                <option value="finalizacion">Certificado de Finalización</option>
                <option value="excelencia">Certificado de Excelencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Breve descripción de la plantilla"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor con Sidebar */}
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'variables'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Variables
            </button>
          </div>

          {/* Contenido del sidebar */}
          <div className="h-[calc(100%-52px)] overflow-y-auto">
            {activeTab === 'templates' ? (
              <TemplateSelector onTemplateSelect={handleTemplateSelect} />
            ) : (
              <VariablesSidebar editor={editor} onInsertVariable={insertVariable} />
            )}
          </div>
        </div>

        {/* Editor Principal */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar + Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg">
            <CertificateToolbar editor={editor} />

            {/* Action Buttons */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => editor.commands.clearContent()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Limpiar Editor
              </button>
            </div>
          </div>

          {/* Área de Edición - Vista previa del certificado con escala */}
          <div className="certificate-editor-container flex-1">
            {rawHtmlContent ? (
              <div
                style={{
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left',
                  width: '11in',
                  minHeight: '8.5in',
                  margin: '0'
                }}
                dangerouslySetInnerHTML={{ __html: makeVariablesEditable(rawHtmlContent) }}
              />
            ) : (
              <div style={{
                transform: 'scale(0.6)',
                transformOrigin: 'top center',
                width: '11in',
                minHeight: '8.5in',
                margin: '0 auto'
              }}>
                <EditorContent editor={editor} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && previewData && (
        <CertificatePreview
          html={previewHtml}
          data={previewData}
          onClose={() => setShowPreview(false)}
          onSave={onPreview ? () => {
            setShowPreview(false)
            onPreview(previewHtml, previewData)
          } : undefined}
        />
      )}
    </div>
  )
}
