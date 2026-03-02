/**
 * Tipos para el sistema de certificados
 */

export type CertificateTemplateType = 'asistencia' | 'finalizacion' | 'excelencia' | 'personalizado'

export interface CertificateVariable {
  key: string
  label: string
  category: 'asistente' | 'evento' | 'otro'
  description: string
}

export const CERTIFICATE_VARIABLES: CertificateVariable[] = [
  {
    key: 'nombre_completo',
    label: 'Nombre Completo',
    category: 'asistente',
    description: 'Nombre completo del asistente'
  },
  {
    key: 'ci',
    label: 'Cédula de Identidad',
    category: 'asistente',
    description: 'CI del asistente'
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    category: 'asistente',
    description: 'Teléfono del asistente'
  },
  {
    key: 'oficina_alfa',
    label: 'Oficina Alfa',
    category: 'asistente',
    description: 'Oficina Alfa del asistente'
  },
  {
    key: 'fecha',
    label: 'Fecha',
    category: 'evento',
    description: 'Fecha del evento'
  },
  {
    key: 'evento',
    label: 'Evento',
    category: 'evento',
    description: 'Nombre del evento'
  },
  {
    key: 'mensaje',
    label: 'Mensaje Opcional',
    category: 'otro',
    description: 'Mensaje personalizado'
  }
]

export interface CertificateTemplate {
  id: string
  name: string
  description?: string
  type: CertificateTemplateType
  content: string // HTML con las variables
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CertificatePreviewData {
  nombre_completo: string
  ci: string
  telefono: string
  oficina_alfa: string
  fecha: string
  evento: string
  mensaje?: string
  [key: string]: string | undefined
}
