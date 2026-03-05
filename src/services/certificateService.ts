import { Attendee } from '@/types/admin'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ============================================
// TIPOS
// ============================================

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
  tipo?: string
  descripcion?: string
  contenido?: string
  createdAt: Date
  updatedAt: Date
  cantidadCertificados?: number
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

// ============================================
// SERVICIO
// ============================================

class CertificateService {
  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Obtener todas las plantillas
  async getTemplates(): Promise<CertificateTemplate[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificados/plantillas`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Mapeo inverso del enum del backend al enum del frontend
      const tipoReverseMap: Record<string, string> = {
        'PERSONALIZADO': 'personalizado',
        'ASISTENCIA_ESTANDAR': 'asistencia',
        'FINALIZACION': 'finalizacion',
        'EXCELENCIA': 'excelencia'
      }

      const result = await response.json()
      return result.data.map((t: any) => ({
        ...t,
        name: t.nombre,  // ← Mapear nombre del backend a name del frontend
        type: tipoReverseMap[t.tipo] || 'personalizado',  // ← Mapear tipo del backend a type del frontend
        titulo: t.nombre,
        subtitulo: t.descripcion || '',
        content: t.contenido,
        descripcion: t.descripcion,
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
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      // Fallback a localStorage si falla el backend
      return this.getStoredTemplates()
    }
  }

  // Obtener una plantilla por ID
  async getTemplate(id: string): Promise<CertificateTemplate | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificados/plantillas/${id}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      // Mapeo inverso del enum del backend al enum del frontend
      const tipoReverseMap: Record<string, string> = {
        'PERSONALIZADO': 'personalizado',
        'ASISTENCIA_ESTANDAR': 'asistencia',
        'FINALIZACION': 'finalizacion',
        'EXCELENCIA': 'excelencia'
      }

      const result = await response.json()
      return {
        ...result.data,
        name: result.data.nombre,  // ← Mapear nombre del backend a name del frontend
        type: tipoReverseMap[result.data.tipo] || 'personalizado',  // ← Mapear tipo del backend a type del frontend
        titulo: result.data.nombre,
        subtitulo: result.data.descripcion || '',
        content: result.data.contenido,
        descripcion: result.data.descripcion,
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
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt)
      }
    } catch (error: any) {
      console.error('Error fetching template:', error)
      return null
    }
  }

  // Crear una nueva plantilla
  async createTemplate(template: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'cantidadCertificados'>): Promise<CertificateTemplate> {
    // El CertificateEditor envía 'content' pero el CertificateTemplate espera 'contenido'
    const contenido = (template as any).content || template.contenido || ''
    const descripcion = template.descripcion || (template as any).description || ''

    // Mapear el tipo del frontend al enum del backend
    // Los valores del enum del backend tienen guiones bajos (ASISTENCIA_ESTANDAR)
    // Los valores del frontend están sin guiones (asistencia)
    const tipoMap: Record<string, string> = {
      'personalizado': 'PERSONALIZADO',
      'asistencia': 'ASISTENCIA_ESTANDAR',
      'finalizacion': 'FINALIZACION',
      'excelencia': 'EXCELENCIA'
    }
    const tipoBackend = tipoMap[(template as any).type] || 'PERSONALIZADO'

    console.log('🔧 Mapeando tipo:', (template as any).type, '->', tipoBackend)
    console.log('🔧 Enviando al backend:', {
      nombre: template.name,
      tipo: tipoBackend,
      descripcion,
      contenido
    })

    const response = await fetch(`${API_BASE_URL}/certificados/plantillas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        nombre: template.name,
        tipo: tipoBackend,
        descripcion,
        contenido
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error del backend:', error)
      throw new Error(error.message || 'Error al crear plantilla')
    }

    const result = await response.json()
    console.log('✅ Respuesta del backend:', result)
    return {
      ...result.data,
      titulo: result.data.nombre,
      subtitulo: result.data.descripcion || '',
      createdAt: new Date(result.data.createdAt),
      updatedAt: new Date(result.data.updatedAt)
    }
  }

  // Actualizar una plantilla
  async updateTemplate(id: string, updates: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    // Mapear campos del frontend al backend
    const contenido = (updates as any).content || updates.contenido || ''
    const descripcion = updates.descripcion || (updates as any).subtitulo || (updates as any).description || ''

    // Mapear el tipo del frontend al enum del backend
    const tipoMap: Record<string, string> = {
      'personalizado': 'PERSONALIZADO',
      'asistencia': 'ASISTENCIA_ESTANDAR',
      'finalizacion': 'FINALIZACION',
      'excelencia': 'EXCELENCIA'
    }
    const tipoBackend = (updates as any).type ? tipoMap[(updates as any).type] : undefined

    console.log('🔧 Enviando actualización al backend:', {
      id,
      nombre: updates.name,
      tipo: tipoBackend,
      descripcion,
      contenido
    })

    const response = await fetch(`${API_BASE_URL}/certificados/plantillas/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        nombre: updates.name,
        descripcion,
        contenido,
        ...(tipoBackend && { tipo: tipoBackend }) // Enviar el tipo solo si se está actualizando
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar plantilla')
    }

    const result = await response.json()
    return {
      ...result.data,
      titulo: result.data.nombre,
      subtitulo: result.data.descripcion || '',
      content: result.data.contenido, // ← Mapear contenido a content
      descripcion: result.data.descripcion,
      createdAt: new Date(result.data.createdAt),
      updatedAt: new Date(result.data.updatedAt)
    }
  }

  // Eliminar una plantilla
  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/certificados/plantillas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar plantilla')
    }
  }

  // Generar certificado PDF
  async generateCertificate(attendee: Attendee, template: CertificateTemplate, eventName: string, eventDate: string): Promise<string> {
    // Llamar al backend para generar el certificado
    const response = await fetch(`${API_BASE_URL}/certificados/generar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        plantillaId: template.id,
        usuarioId: attendee.id
      })
    })

    if (!response.ok) {
      throw new Error('Error al generar certificado')
    }

    const result = await response.json()
    return result.data.urlArchivo
  }

  // Enviar certificados por email
  async sendCertificates(request: CertificateSendRequest): Promise<CertificateSendResult> {
    const response = await fetch(`${API_BASE_URL}/certificados/enviar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        plantillaId: request.templateId,
        eventoId: request.eventId,
        compraIds: request.attendeeIds
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al enviar certificados')
    }

    const result = await response.json()

    return {
      success: true,
      sent: result.data.estadisticas.enviados,
      failed: result.data.estadisticas.errores,
      errors: result.data.historial.error ? [result.data.historial.error] : []
    }
  }

  // Obtener historial de envíos
  async getSendHistory(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/certificados/historial`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener historial')
    }

    const result = await response.json()
    return result.data
  }

  // Previsualizar certificado (HTML para preview)
  previewCertificate(attendee: Attendee, template: CertificateTemplate, eventName: string, eventDate: string): string {
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

  // ============================================
  // MÉTODOS DE FALLBACK (localStorage)
  // ============================================

  private getStoredTemplates(): CertificateTemplate[] {
    const stored = localStorage.getItem('certificate_templates')
    if (stored) {
      return JSON.parse(stored).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    }
    return []
  }
}

const certificateService = new CertificateService()

export default certificateService
