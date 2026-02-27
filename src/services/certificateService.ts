import { Attendee } from '@/types/admin'

// Tipos para certificados
export interface CertificateTemplate {
  id: string
  name: string
  titulo: string
  subtitulo: string
  incluirFecha: boolean
  incluirEvento: boolean
  incluirDuracion: boolean
  incluirCodigo: boolean
  mensajePersonalizado?: string
  fondoUrl?: string
  logoUrl?: string
  firma1?: {
    nombre: string
    cargo: string
  }
  firma2?: {
    nombre: string
    cargo: string
  }
  colores: {
    primario: string
    secundario: string
    texto: string
    fondo: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CertificateSendRequest {
  attendeeIds: string[]
  templateId: string
  eventId: string
  subject?: string
  message?: string
}

export interface CertificateSendResult {
  success: boolean
  sent: number
  failed: number
  errors: string[]
}

// Plantillas por defecto
const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Certificado Estándar',
    titulo: 'CERTIFICADO DE ASISTENCIA',
    subtitulo: 'Se otorga el presente certificado a',
    incluirFecha: true,
    incluirEvento: true,
    incluirDuracion: false,
    incluirCodigo: true,
    colores: {
      primario: '#1E40AF',
      secundario: '#3B82F6',
      texto: '#1F2937',
      fondo: '#FFFFFF'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tpl-2',
    name: 'Certificado elegante',
    titulo: 'CERTIFICADO DE PARTICIPACIÓN',
    subtitulo: 'Por haber asistido exitosamente a',
    incluirFecha: true,
    incluirEvento: true,
    incluirDuracion: true,
    incluirCodigo: true,
    colores: {
      primario: '#7C3AED',
      secundario: '#A78BFA',
      texto: '#1F2937',
      fondo: '#FEF3C7'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Funciones de almacenamiento
const getStoredTemplates = (): CertificateTemplate[] => {
  const stored = localStorage.getItem('certificate_templates')
  if (stored) {
    return JSON.parse(stored).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt)
    }))
  }
  return DEFAULT_TEMPLATES
}

const saveTemplates = (templates: CertificateTemplate[]) => {
  localStorage.setItem('certificate_templates', JSON.stringify(templates))
}

// Servicio de certificados
const certificateService = {
  // Obtener todas las plantillas
  getTemplates: async (): Promise<CertificateTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return getStoredTemplates()
  },

  // Obtener una plantilla por ID
  getTemplate: async (id: string): Promise<CertificateTemplate | null> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const templates = getStoredTemplates()
    return templates.find(t => t.id === id) || null
  },

  // Crear una nueva plantilla
  createTemplate: async (template: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CertificateTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const templates = getStoredTemplates()
    const newTemplate: CertificateTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    templates.push(newTemplate)
    saveTemplates(templates)

    return newTemplate
  },

  // Actualizar una plantilla
  updateTemplate: async (id: string, updates: Partial<CertificateTemplate>): Promise<CertificateTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const templates = getStoredTemplates()
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) {
      throw new Error('Plantilla no encontrada')
    }

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date()
    }

    saveTemplates(templates)
    return templates[index]
  },

  // Eliminar una plantilla
  deleteTemplate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const templates = getStoredTemplates()
    const filtered = templates.filter(t => t.id !== id)

    if (filtered.length === templates.length) {
      throw new Error('Plantilla no encontrada')
    }

    saveTemplates(filtered)
  },

  // Generar certificado PDF (simulado)
  generateCertificate: async (attendee: Attendee, template: CertificateTemplate, eventName: string, eventDate: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    // En producción, aquí se generaría el PDF real
    // Por ahora, simulamos la generación devolviendo una URL
    const certData = {
      attendee: attendee.nombre,
      event: eventName,
      date: eventDate,
      template: template.name,
      timestamp: Date.now()
    }

    // Simular una URL del certificado
    return `https://certificados.365soft.com/${btoa(JSON.stringify(certData))}.pdf`
  },

  // Enviar certificados por email
  sendCertificates: async (request: CertificateSendRequest): Promise<CertificateSendResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    // En producción, esto llamaría a tu API backend
    // Por ahora, simulamos el envío
    const results: CertificateSendResult = {
      success: true,
      sent: request.attendeeIds.length,
      failed: 0,
      errors: []
    }

    // Simular algunos errores aleatorios para realismo
    if (Math.random() < 0.1) {
      results.failed = 1
      results.sent -= 1
      results.errors.push('Error al enviar a un destinatario')
    }

    // Guardar registro de envíos en localStorage
    const sendLog = {
      id: `send-${Date.now()}`,
      timestamp: new Date().toISOString(),
      templateId: request.templateId,
      eventId: request.eventId,
      attendeeIds: request.attendeeIds,
      sent: results.sent,
      failed: results.failed
    }

    const logs = JSON.parse(localStorage.getItem('certificate_sends') || '[]')
    logs.push(sendLog)
    localStorage.setItem('certificate_sends', JSON.stringify(logs))

    return results
  },

  // Obtener historial de envíos
  getSendHistory: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return JSON.parse(localStorage.getItem('certificate_sends') || '[]')
  },

  // Previsualizar certificado (HTML para preview)
  previewCertificate: (attendee: Attendee, template: CertificateTemplate, eventName: string, eventDate: string): string => {
    const codigo = `CERT-${attendee.id.substring(0, 8).toUpperCase()}`

    return `
      <div style="
        width: 800px;
        height: 600px;
        padding: 40px;
        background: ${template.colores.fondo};
        font-family: 'Georgia', serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 10px solid ${template.colores.primario};
        position: relative;
      ">
        <div style="text-align: center;">
          <h1 style="
            color: ${template.colores.primario};
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
          ">${template.titulo}</h1>

          <p style="
            color: ${template.colores.texto};
            font-size: 18px;
            margin-bottom: 30px;
            font-style: italic;
          ">${template.subtitulo}</p>

          <h2 style="
            color: ${template.colores.secundario};
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 30px;
          ">${attendee.nombre}</h2>

          ${template.incluirEvento ? `
            <p style="
              color: ${template.colores.texto};
              font-size: 20px;
              margin-bottom: 15px;
            ">por su participación en</p>
            <p style="
              color: ${template.colores.texto};
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            ">${eventName}</p>
          ` : ''}

          ${template.incluirFecha ? `
            <p style="
              color: ${template.colores.texto};
              font-size: 16px;
              margin-bottom: 10px;
            ">${eventDate}</p>
          ` : ''}

          ${template.incluirCodigo ? `
            <p style="
              color: ${template.colores.texto};
              font-size: 12px;
              margin-top: 30px;
              font-family: monospace;
            ">Código: ${codigo}</p>
          ` : ''}

          ${template.mensajePersonalizado ? `
            <p style="
              color: ${template.colores.texto};
              font-size: 14px;
              margin-top: 20px;
              font-style: italic;
            ">${template.mensajePersonalizado}</p>
          ` : ''}
        </div>

        <div style="
          position: absolute;
          bottom: 20px;
          width: calc(100% - 80px);
          display: flex;
          justify-content: space-around;
        ">
          ${template.firma1 ? `
            <div style="text-align: center;">
              <div style="
                width: 150px;
                border-top: 2px solid ${template.colores.texto};
                margin-bottom: 5px;
              "></div>
              <p style="
                color: ${template.colores.texto};
                font-size: 14px;
                font-weight: bold;
                margin: 0;
              ">${template.firma1.nombre}</p>
              <p style="
                color: ${template.colores.texto};
                font-size: 12px;
                margin: 0;
              ">${template.firma1.cargo}</p>
            </div>
          ` : ''}

          ${template.firma2 ? `
            <div style="text-align: center;">
              <div style="
                width: 150px;
                border-top: 2px solid ${template.colores.texto};
                margin-bottom: 5px;
              "></div>
              <p style="
                color: ${template.colores.texto};
                font-size: 14px;
                font-weight: bold;
                margin: 0;
              ">${template.firma2.nombre}</p>
              <p style="
                color: ${template.colores.texto};
                font-size: 12px;
                margin: 0;
              ">${template.firma2.cargo}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }
}

export default certificateService
