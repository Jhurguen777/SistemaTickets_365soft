import { Editor } from '@tiptap/react'
import { CERTIFICATE_BASE_TEMPLATES } from '@/lib/tiptap/templates'
import { FileText, Award, Trophy, File } from 'lucide-react'

interface TemplateSelectorProps {
  editor?: Editor | null
  onTemplateSelect: (content: string) => void
}

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const templates = CERTIFICATE_BASE_TEMPLATES

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'asistencia':
        return FileText
      case 'finalizacion':
        return Award
      case 'excelencia':
        return Trophy
      default:
        return File
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Plantillas Base
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Selecciona una plantilla para comenzar
        </p>
      </div>

      <div className="p-4 space-y-3">
        {templates.map((template) => {
          const Icon = getTemplateIcon(template.type)

          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template.content)}
              className="w-full text-left p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all hover:shadow-md group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${
                  template.type === 'asistencia' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  template.type === 'finalizacion' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  template.type === 'excelencia' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Nota:</strong> Al seleccionar una plantilla, reemplazarás todo el contenido actual del editor.
          </p>
        </div>
      </div>
    </div>
  )
}
