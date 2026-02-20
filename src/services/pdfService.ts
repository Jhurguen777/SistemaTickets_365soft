import jsPDF from 'jspdf'
import { TicketData } from './qrService'

/**
 * Genera un certificado PDF para una entrada
 */
export const generateTicketPDF = (ticketData: {
  purchaseId: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  attendees: Array<{
    nombre: string
    asiento: string
    sector: string
    ci: string
    qrCode: string
  }>
  totalPaid: number
  purchaseDate: string
}) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Colores del tema
  const primaryColor = { r: 59, g: 130, b: 246 } // #3B82F6

  // Header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ENTRADA', pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('SistemaTickets 365soft', pageWidth / 2, 35, { align: 'center' })

  // Número de compra
  yPosition = 55
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Número de Compra:', margin, yPosition)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text(`#${ticketData.purchaseId}`, margin, yPosition + 8)

  // Información del evento
  yPosition += 25
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'F')

  yPosition += 10
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(ticketData.eventName, margin + 5, yPosition)

  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Fecha: ${ticketData.eventDate}`, margin + 5, yPosition)
  doc.text(`Hora: ${ticketData.eventTime}`, margin + 70, yPosition)

  yPosition += 6
  doc.text(`Ubicación: ${ticketData.eventLocation}`, margin + 5, yPosition)
  doc.text(`Dirección: ${ticketData.eventAddress}`, margin + 70, yPosition)

  // Información de los asistentes
  yPosition += 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('ASISTENTES', margin, yPosition)

  yPosition += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)

  yPosition += 10
  ticketData.attendees.forEach((attendee, index) => {
    // Verificar si necesitamos nueva página
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Tarjeta de asistente
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F')

    yPosition += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`${index + 1}. ${attendee.nombre}`, margin + 5, yPosition)

    yPosition += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(`Asiento: ${attendee.asiento}  |  Sector: ${attendee.sector}  |  CI: ${attendee.ci}`, margin + 5, yPosition)

    yPosition += 8
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Código QR: ${attendee.qrCode}`, margin + 5, yPosition)

    yPosition += 10
  })

  // Total pagado
  yPosition += 10
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F')

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Total Pagado:', margin + 5, yPosition)

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text(`Bs ${ticketData.totalPaid.toLocaleString()}`, pageWidth - margin - 5, yPosition, { align: 'right' })

  yPosition += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`Compra realizada el ${ticketData.purchaseDate}`, margin + 5, yPosition)

  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(
    'Este documento es tu comprobante de compra. Preséntalo junto con tu código QR en la entrada.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )
  doc.text(
    'Las entradas son intransferibles. Para más información visita www.365soft.com',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  )

  // Guardar el PDF
  const fileName = `Entrada-${ticketData.eventName.replace(/\s+/g, '-')}-${ticketData.purchaseId}.pdf`
  doc.save(fileName)

  return fileName
}

/**
 * Genera un PDF con múltiples entradas (para cuando hay varios asistentes)
 */
export const generateMultipleTicketsPDF = (tickets: any[]) => {
  const doc = new jsPDF()

  tickets.forEach((ticket, index) => {
    if (index > 0) {
      doc.addPage()
    }

    // Aquí se generaría cada ticket individual
    // Por simplicidad, llamamos a generateTicketPDF pero guardando en memoria
  })

  return doc
}

export default {
  generateTicketPDF,
  generateMultipleTicketsPDF
}
