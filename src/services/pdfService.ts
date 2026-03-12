import jsPDF from 'jspdf'

const AZ  = { r: 35,  g: 60,  b: 122 }   // AZUL ALFA  #233C7A
const AZ2 = { r: 20,  g: 38,  b: 85  }   // azul oscuro variante
const RJ  = { r: 224, g: 8,   b: 29  }   // ROJO ALFA  #E0081D
const AM  = { r: 250, g: 185, b: 14  }   // AMARILLO   #FAB90E
const WH  = { r: 255, g: 255, b: 255 }   // blanco
const GR  = { r: 245, g: 245, b: 245 }   // GRIS NEUTRO #F5F5F5
const NG  = { r: 33,  g: 33,  b: 33  }   // NEGRO ELEGANTE #212121
const GR2 = { r: 100, g: 110, b: 130 }   // gris texto secundario

const rgb = (c: { r: number; g: number; b: number }) =>
  [c.r, c.g, c.b] as [number, number, number]

async function loadImage(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob()
    return await new Promise<string>(resolve => {
      const r = new FileReader()
      r.onloadend = () => resolve(r.result as string)
      r.readAsDataURL(blob)
    })
  } catch { return null }
}

function drawBadge(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFontSize(7)
  const lw = doc.getTextWidth(label) + 6
  const vw = doc.getTextWidth(value.toUpperCase()) + 8
  doc.setFillColor(...rgb(AZ))
  doc.roundedRect(x, y, lw, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...rgb(WH))
  doc.text(label, x + lw / 2, y + 5.2, { align: 'center' })
  doc.setFillColor(...rgb(WH))
  doc.setDrawColor(...rgb(AZ))
  doc.setLineWidth(0.5)
  doc.roundedRect(x + lw, y, vw, 8, 1.5, 1.5, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...rgb(AZ))
  doc.text(value.toUpperCase(), x + lw + vw / 2, y + 5.2, { align: 'center' })
  return lw + vw + 4
}

export const generateTicketPDF = async (ticketData: {
  purchaseId: string
  eventName: string
  eventDate: string
  eventTime: string
  eventDoorsOpen?: string
  eventLocation: string
  eventAddress: string
  eventCategory?: string
  eventDescription?: string
  attendees: Array<{ nombre: string; asiento: string; sector: string; ci: string; qrCode: string }>
  totalPaid: number
  purchaseDate: string
  qrDataUrls?: (string | null)[]
}) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()

  const logoUrl = await loadImage('/assets/alfa-negativo.png')

  for (let idx = 0; idx < ticketData.attendees.length; idx++) {
    const attendee = ticketData.attendees[idx]
    const qrImg   = ticketData.qrDataUrls?.[idx] ?? null

    if (idx > 0) doc.addPage()

    // ── FONDO ────────────────────────────────────────────────
    doc.setFillColor(...rgb(GR))
    doc.rect(0, 0, pw, ph, 'F')

    // ── HEADER AZUL ──────────────────────────────────────────
    const hH = 52
    doc.setFillColor(...rgb(AZ))
    doc.rect(0, 0, pw, hH, 'F')

    if (logoUrl) doc.addImage(logoUrl, 'PNG', 8, 6, 16, 12)
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(WH))
    doc.text('ALFA BOLIVIA', 27, 10)
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 210, 235)
    doc.text('Sistema de Tickets', 27, 15)

    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 195, 230)
    doc.text('VAS A VER', pw / 2, 26, { align: 'center' })

    doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(WH))
    const evLine = doc.splitTextToSize(ticketData.eventName.toUpperCase(), pw - 20)[0] ?? ''
    doc.text(evLine, pw / 2, 38, { align: 'center' })

    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 195, 230)
    const locText = [ticketData.eventLocation, ticketData.eventDate, ticketData.eventTime]
      .filter(Boolean).join('  ·  ')
    doc.text(locText, pw / 2, 47, { align: 'center' })

    // ── TARJETA DEL BOLETO ───────────────────────────────────
    const hasExtra = !!(ticketData.eventDoorsOpen || ticketData.eventCategory || ticketData.eventDescription)
    const cX = 10, cY = 58, cW = pw - 20, cH = hasExtra ? 100 : 78
    const stripW = 20

    doc.setFillColor(210, 215, 230)
    doc.roundedRect(cX + 1.5, cY + 1.5, cW, cH, 5, 5, 'F')
    doc.setFillColor(...rgb(WH))
    doc.roundedRect(cX, cY, cW, cH, 5, 5, 'F')

    // Tira azul izquierda
    doc.setFillColor(...rgb(AZ))
    doc.roundedRect(cX, cY, stripW, cH, 5, 5, 'F')
    doc.rect(cX + stripW - 5, cY, 5, cH, 'F')

    // "ALFA BOLIVIA" rotado
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(WH))
    doc.text('ALFA BOLIVIA', cX + stripW / 2, cY + cH - 8, { angle: 90, align: 'center' })

    // Logo abajo en la tira
    if (logoUrl) doc.addImage(logoUrl, 'PNG', cX + 3, cY + cH - 20, 13, 10)

    // Barcode simulado
    const bars = [14,6,10,6,16,6,10,6,14,6,10]
    doc.setFillColor(...rgb(WH))
    bars.forEach((h, bi) => doc.rect(cX + 4 + bi * 1.3, cY + 6, 0.7, h, 'F'))

    // ── Contenido ──────────────────────────────────────────
    const bX = cX + stripW + 4

    doc.setDrawColor(225, 228, 240)
    doc.setLineWidth(0.3)
    doc.line(cX + stripW, cY + 22, cX + cW, cY + 22)

    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.setTextColor(...rgb(GR2))
    doc.text('VAS A VER', bX, cY + 10)

    doc.setFontSize(13); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(AZ))
    const eName = doc.splitTextToSize(ticketData.eventName.toUpperCase(), cW - stripW - 45)[0] ?? ''
    doc.text(eName, bX, cY + 18)

    if (ticketData.eventLocation) {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
      doc.setTextColor(...rgb(GR2))
      doc.text(
        `${ticketData.eventLocation}${ticketData.eventAddress ? ', ' + ticketData.eventAddress : ''}`,
        bX, cY + 26
      )
    }

    const dY = cY + 34
    const col2X = bX + (cW - stripW - 45) / 2

    const drawField = (label: string, val: string, x: number, y: number) => {
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...rgb(AZ))
      doc.text(label, x, y)
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...rgb(GR2))
      doc.text(val || '—', x, y + 5.5)
    }

    drawField('NOMBRE', attendee.nombre || 'Asistente', bX, dY)
    drawField('FECHA', ticketData.eventDate || '—', col2X, dY)
    drawField('HORA DEL EVENTO', ticketData.eventTime || '—', bX, dY + 13)
    if (ticketData.eventDoorsOpen) {
      drawField('APERTURA DE PUERTAS', ticketData.eventDoorsOpen, col2X, dY + 13)
    }
    if (ticketData.eventCategory) {
      drawField('CATEGORÍA', ticketData.eventCategory, bX, dY + 26)
    }
    if (ticketData.eventDescription) {
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...rgb(AZ))
      doc.text('DESCRIPCIÓN', bX, dY + (ticketData.eventCategory ? 39 : 26))
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...rgb(GR2))
      const descLines = doc.splitTextToSize(ticketData.eventDescription, cW - stripW - 50)
      doc.text(descLines.slice(0, 2), bX, dY + (ticketData.eventCategory ? 44 : 31))
    }

    // QR mini
    if (qrImg) {
      const qMini = 28
      doc.setFillColor(...rgb(WH))
      doc.rect(cX + cW - qMini - 5, cY + 5, qMini + 2, qMini + 2, 'F')
      doc.addImage(qrImg, 'PNG', cX + cW - qMini - 4, cY + 6, qMini, qMini)
    }

    // Separador dashed
    doc.setDrawColor(210, 215, 230)
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.setLineWidth(0.3)
    doc.line(cX + stripW, cY + 56, cX + cW, cY + 56)
    doc.setLineDashPattern([], 0)

    // Badge SEC únicamente
    const badgeY = cY + 62
    drawBadge(doc, 'SEC', attendee.sector || 'GEN', bX, badgeY)

    // ── SECCIÓN QR ───────────────────────────────────────────
    const qcY = cY + cH + 10
    const qcH = ph - qcY - 10
    const qSize = Math.min(qcH - 52, 75)
    const qImgX = (pw - qSize) / 2

    doc.setFillColor(210, 215, 230)
    doc.roundedRect(cX + 1.5, qcY + 1.5, cW, qcH, 5, 5, 'F')
    doc.setFillColor(...rgb(WH))
    doc.roundedRect(cX, qcY, cW, qcH, 5, 5, 'F')

    doc.setFillColor(...rgb(AZ))
    doc.roundedRect(cX, qcY, cW, 14, 5, 5, 'F')
    doc.rect(cX, qcY + 7, cW, 7, 'F')

    doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(WH))
    doc.text('TU CÓDIGO QR DE ACCESO', pw / 2, qcY + 9, { align: 'center' })

    const qrStartY = qcY + 18

    if (qrImg) {
      doc.setFillColor(...rgb(WH))
      doc.setDrawColor(225, 228, 240)
      doc.setLineWidth(0.5)
      doc.roundedRect(qImgX - 3, qrStartY, qSize + 6, qSize + 6, 3, 3, 'FD')
      doc.addImage(qrImg, 'PNG', qImgX, qrStartY + 3, qSize, qSize)
    }

    const instrY = qrStartY + qSize + 14
    doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgb(NG))
    doc.text('PRESENTA ESTE QR PARA INGRESAR AL EVENTO', pw / 2, instrY, { align: 'center' })
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
    doc.setTextColor(...rgb(GR2))
    doc.text('Este código es único e intransferible  ·  Alfa Bolivia', pw / 2, instrY + 6, { align: 'center' })
  }

  const fileName = `Entrada-${ticketData.eventName.replace(/\s+/g, '-').slice(0, 30)}-${ticketData.purchaseId.slice(-8)}.pdf`
  doc.save(fileName)
  return fileName
}

export const generateMultipleTicketsPDF = (tickets: any[]) => {
  const doc = new jsPDF()
  tickets.forEach((_t, i) => { if (i > 0) doc.addPage() })
  return doc
}

export default { generateTicketPDF, generateMultipleTicketsPDF }
