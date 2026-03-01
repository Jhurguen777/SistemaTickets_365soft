import { Editor } from '@tiptap/react'
import { CERTIFICATE_VARIABLES } from '@/types/certificate'
import { User, Calendar, FileText, Plus } from 'lucide-react'

interface VariablesSidebarProps {
  editor?: Editor | null
  onInsertVariable?: (variableKey: string) => void
}

export default function VariablesSidebar({ editor, onInsertVariable }: VariablesSidebarProps) {
  const insertVariable = (key: string, label: string) => {
    // Primero intentar usar la función personalizada
    if (onInsertVariable) {
      onInsertVariable(key)
      return
    }

    // Si no, usar el editor TipTap
    if (editor) {
      editor.chain().focus().insertCertificateVariable({
        id: key,
        label: label
      }).run()
    }
  }

  const categories = {
    asistente: {
      title: 'Datos del Asistente',
      icon: User,
      color: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    evento: {
      title: 'Datos del Evento',
      icon: Calendar,
      color: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    otro: {
      title: 'Otros',
      icon: FileText,
      color: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Variables
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Haz clic para insertar en el editor
        </p>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(categories).map(([categoryKey, category]) => {
          const Icon = category.icon
          const variables = CERTIFICATE_VARIABLES.filter(v => v.category === categoryKey)

          return (
            <div key={categoryKey}>
              <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${category.color} px-3 py-2 rounded-lg ${category.borderColor} border`}>
                <Icon className="w-4 h-4" />
                {category.title}
              </h4>
              <div className="space-y-2">
                {variables.map((variable) => (
                  <button
                    key={variable.key}
                    onClick={() => insertVariable(variable.key, variable.label)}
                    className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {variable.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {variable.description}
                        </p>
                      </div>
                      <div className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-dashed border-yellow-600 dark:border-yellow-500 rounded text-xs text-yellow-800 dark:text-yellow-300 font-mono">
                        {`{{${variable.key}}}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Las variables se insertarán como chips amarillos que puedes ver en la vista previa con los datos reales.
          </p>
        </div>
      </div>
    </div>
  )
}
