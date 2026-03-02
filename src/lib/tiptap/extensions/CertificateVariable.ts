import { Node, mergeAttributes } from '@tiptap/core'

export interface ICertificateVariableOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    certificateVariable: {
      /**
       * Insert a certificate variable
       */
      insertCertificateVariable: (attributes: { id: string; label: string }) => ReturnType
    }
  }
}

/**
 * Extensión personalizada de Tiptap para insertar variables como chips no editables
 * Las variables se muestran como chips con fondo amarillo y borde punteado
 */
export const CertificateVariable = Node.create<ICertificateVariableOptions>({
  name: 'certificateVariable',

  group: 'inline',

  inline: true,

  atom: true, // Hace que el nodo sea indivisible

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'certificate-variable',
      },
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-variable-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-variable-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-variable-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-variable-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-id]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-variable-id': HTMLAttributes['data-variable-id'],
          'data-variable-label': HTMLAttributes['data-variable-label'],
          class: 'certificate-variable-chip',
        },
        this.options.HTMLAttributes
      ),
      `{{${HTMLAttributes['data-variable-label'] || node.attrs.id}}}`,
    ]
  },

  addCommands() {
    return {
      insertCertificateVariable:
        attributes =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },
})
