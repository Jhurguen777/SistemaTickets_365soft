// Servicio para generar y validar QR codes

export interface TicketData {
  purchaseId: string
  eventId: string
  attendeeId: string
  nombre: string
  email: string
  ci: string
  asiento: string
  sector: string
  eventName: string
  eventDate: string
}

/**
 * Genera el string de datos para el QR code
 * Formato: TICKET|purchaseId|attendeeId|asiento|ci
 */
export const generateQRString = (ticketData: TicketData): string => {
  return `TICKET|${ticketData.purchaseId}|${ticketData.attendeeId}|${ticketData.asiento}|${ticketData.ci}`
}

/**
 * Decodifica un QR string y valida el formato
 */
export const decodeQRString = (qrString: string): TicketData | null => {
  try {
    const parts = qrString.split('|')

    if (parts.length < 5 || parts[0] !== 'TICKET') {
      return null
    }

    return {
      purchaseId: parts[1],
      attendeeId: parts[2],
      asiento: parts[3],
      ci: parts[4],
      eventId: '',
      nombre: '',
      email: '',
      sector: '',
      eventName: '',
      eventDate: ''
    }
  } catch (error) {
    console.error('Error decoding QR:', error)
    return null
  }
}

/**
 * Genera un QR code único basado en los datos del ticket
 * Este string se usará para generar la imagen QR
 */
export const generateTicketQRCode = (
  purchaseId: string,
  attendeeId: string,
  asiento: string,
  ci: string
): string => {
  return `TICKET|${purchaseId}|${attendeeId}|${asiento}|${ci}|${Date.now()}`
}

/**
 * Valida si un QR code es válido para un evento específico
 */
export const validateTicketQR = (
  qrString: string,
  eventId: string
): { valid: boolean; attendeeId?: string; message: string } => {
  const decoded = decodeQRString(qrString)

  if (!decoded) {
    return { valid: false, message: 'Código QR no válido' }
  }

  // Aquí se validaría contra la base de datos
  // Por ahora solo validamos el formato
  return {
    valid: true,
    attendeeId: decoded.attendeeId,
    message: 'Código QR válido'
  }
}

export default {
  generateQRString,
  decodeQRString,
  generateTicketQRCode,
  validateTicketQR
}
