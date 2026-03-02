import { Editor } from '@tiptap/react'
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus
} from 'lucide-react'

interface CertificateToolbarProps {
  editor: Editor | null
}

export default function CertificateToolbar({ editor }: CertificateToolbarProps) {
  if (!editor) {
    return null
  }

  const fontFamilies = [
    { name: 'Times New Roman', value: "'Times New Roman', serif" },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Courier New', value: "'Courier New', monospace" }
  ]

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]

  return (
    <div className="certificate-toolbar">
      {/* Deshacer/Rehacer */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="toolbar-divider" />

      {/* Fuente */}
      <select
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        title="Tipo de fuente"
      >
        {fontFamilies.map((font) => (
          <option key={font.value} value={font.value}>
            {font.name}
          </option>
        ))}
      </select>

      {/* Tamaño de fuente */}
      <select
        onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}pt`).run()}
        title="Tamaño de fuente"
      >
        {fontSizes.map((size) => (
          <option key={size} value={size}>
            {size}pt
          </option>
        ))}
      </select>

      <div className="toolbar-divider" />

      {/* Estilos de texto */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Negrita"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Cursiva"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Subrayado"
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* Color de texto */}
      <input
        type="color"
        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
        title="Color de texto"
        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
      />

      <div className="toolbar-divider" />

      {/* Alineación */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        title="Alinear a la izquierda"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        title="Centrar"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        title="Alinear a la derecha"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
        title="Justificar"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="toolbar-divider" />

      {/* Listas */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Lista con viñetas"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Lista numerada"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="toolbar-divider" />

      {/* Línea horizontal */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Línea horizontal"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  )
}
