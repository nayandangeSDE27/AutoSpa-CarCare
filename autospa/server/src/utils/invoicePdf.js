import PDFDocument from 'pdfkit'

/**
 * Render a professional, premium marketplace invoice into a pdfkit document.
 * The caller owns the stream: it creates the PDFDocument, pipes it, calls this, then doc.end().
 */
export function renderInvoice(doc, { booking, garage, customer, payment }) {
  // Using Rs. instead of ₹ to ensure compatibility with standard PDF fonts
  const money = (n) => `Rs. ${(n ?? 0).toFixed(2)}`
  
  // Premium Design System Constants
  const COLORS = {
    primary: '#0F8A6D',
    text: '#111827',
    muted: '#6B7280',
    border: '#E5E7EB',
    bg: '#F9FAFB',
    danger: '#EF4444',
    success: '#10B981'
  }
  
  const MARGIN = 50
  
  // Helper for drawing soft dividers
  const generateHr = (y) => {
    doc.strokeColor(COLORS.border).lineWidth(1).moveTo(MARGIN, y).lineTo(560, y).stroke()
  }

  // ==========================================
  // HEADER
  // ==========================================
  // Header Background Block
  doc.rect(0, 0, 612, 120).fill(COLORS.bg)
  
  // AutoSpa Brand (Left)
  doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.primary).text('AutoSpa', MARGIN, 40)
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text('Professional Car Care Marketplace', MARGIN, 70)
  
  // Invoice Details (Right)
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.text).text('INVOICE', 0, 35, { align: 'right', width: 560 })
  
  if (booking.paymentStatus === 'PAID') {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.success).text('PAID', 0, 62, { align: 'right', width: 560 })
  } else {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.danger).text('PENDING', 0, 62, { align: 'right', width: 560 })
  }
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text(`Invoice No: INV-${booking.bookingNumber}`, 0, 80, { align: 'right', width: 560 })
  doc.text(`Date: ${new Date(booking.updatedAt || Date.now()).toLocaleDateString()}`, 0, 95, { align: 'right', width: 560 })
  
  // ==========================================
  // BILLING INFORMATION
  // ==========================================
  let currentY = 150
  
  // Billed To (Customer)
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('BILLED TO', MARGIN, currentY)
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.text).text(customer?.name || 'Guest Customer', MARGIN, currentY + 15)
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text(customer?.email || 'No email provided', MARGIN, currentY + 32)
  doc.text(customer?.phone || 'No phone provided', MARGIN, currentY + 47)
  
  // Billed By (Garage)
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('SERVICE PROVIDED BY', 300, currentY)
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.text).text(garage?.name || 'AutoSpa Partner Garage', 300, currentY + 15)
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text(garage?.address || 'Address not provided', 300, currentY + 32, { width: 260 })
  doc.text(garage?.phone || 'No phone provided', 300, currentY + 62)
  
  currentY += 90
  
  // ==========================================
  // VEHICLE DETAILS (Rounded Card)
  // ==========================================
  doc.roundedRect(MARGIN, currentY, 510, 60, 6).fillAndStroke(COLORS.bg, COLORS.border)
  
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text).text('Vehicle Details', MARGIN + 20, currentY + 15)
  
  // Walk-in bookings may not have a linked Car document; fall back to inline fields.
  const isWalkIn = booking.bookingType === 'WALK_IN'
  const carMakeModel = booking.carId
    ? `${booking.carId.make} ${booking.carId.model}`
    : isWalkIn && (booking.vehicleBrand || booking.vehicleModel)
      ? `${booking.vehicleBrand || ''} ${booking.vehicleModel || ''}`.trim()
      : 'Not specified'
  const carReg = booking.carId?.licensePlate || booking.vehicleRegistrationNumber || 'N/A'
  const carColor = booking.carId?.color || (isWalkIn ? booking.vehicleType || 'N/A' : 'N/A')
  
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.muted)
     .text('Model:', MARGIN + 20, currentY + 35)
     .font('Helvetica').fillColor(COLORS.text).text(carMakeModel, MARGIN + 60, currentY + 35)
     
  doc.font('Helvetica-Bold').fillColor(COLORS.muted)
     .text('Registration:', 220, currentY + 35)
     .font('Helvetica').fillColor(COLORS.text).text(carReg, 290, currentY + 35)
     
  doc.font('Helvetica-Bold').fillColor(COLORS.muted)
     .text(isWalkIn ? 'Type:' : 'Color:', 400, currentY + 35)
     .font('Helvetica').fillColor(COLORS.text).text(carColor, 440, currentY + 35)
     
  currentY += 90
  
  // ==========================================
  // SERVICES TABLE
  // ==========================================
  // Table Header
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted)
  doc.text('SERVICE DESCRIPTION', MARGIN, currentY)
  doc.text('DURATION', 360, currentY)
  doc.text('AMOUNT', 460, currentY, { width: 100, align: 'right' })
  
  generateHr(currentY + 15)
  currentY += 25
  
  // Table Items
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text)
  booking.services.forEach((s) => {
    doc.text(s.nameAtBooking, MARGIN, currentY)
    doc.text(`${s.durationAtBooking} min`, 360, currentY)
    doc.text(money(s.priceAtBooking), 460, currentY, { width: 100, align: 'right' })
    currentY += 25
  })
  
  generateHr(currentY)
  currentY += 20
  
  // ==========================================
  // PRICING SUMMARY
  // ==========================================
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text('Subtotal', 360, currentY)
  doc.font('Helvetica-Bold').fillColor(COLORS.text).text(money(booking.subtotalAmount || booking.totalAmount), 460, currentY, { width: 100, align: 'right' })
  
  currentY += 20
  if (booking.taxAmount !== undefined) {
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted).text('GST (18%)', 360, currentY)
    doc.font('Helvetica-Bold').fillColor(COLORS.text).text(money(booking.taxAmount), 460, currentY, { width: 100, align: 'right' })
    currentY += 20
  }
  
  const commission = payment?.commission ?? 0
  if (commission > 0) {
    doc.font('Helvetica').fillColor(COLORS.muted).text('Platform Fee (Included)', 360, currentY)
    doc.font('Helvetica-Bold').fillColor(COLORS.text).text(money(commission), 460, currentY, { width: 100, align: 'right' })
    currentY += 20
  }
  
  generateHr(currentY)
  currentY += 15
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.text).text('Grand Total', 360, currentY)
  doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.primary).text(money(booking.totalAmount), 460, currentY - 4, { width: 100, align: 'right' })
  
  currentY += 50
  
  // ==========================================
  // PAYMENT & WORKER INFO
  // ==========================================
  doc.roundedRect(MARGIN, currentY, 510, 90, 6).fillAndStroke(COLORS.bg, COLORS.border)
  
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text).text('Payment Information', MARGIN + 20, currentY + 15)
  doc.font('Helvetica').fillColor(COLORS.muted).text(`Method: `, MARGIN + 20, currentY + 35, { continued: true }).fillColor(COLORS.text).text(payment?.method || 'CASH')
  doc.fillColor(COLORS.muted).text(`Status: `, MARGIN + 20, currentY + 50, { continued: true }).fillColor(COLORS.text).text(booking.paymentStatus)
  // Booking Source — Online vs Walk-in
  const sourceLabel = booking.bookingType === 'WALK_IN' ? 'Walk-in' : 'Online'
  doc.fillColor(COLORS.muted).text(`Booking Source: `, MARGIN + 20, currentY + 65, { continued: true }).fillColor(COLORS.text).text(sourceLabel)
  
  if (booking.workerId) {
    const workerName = typeof booking.workerId === 'object' ? booking.workerId.name : 'Assigned Expert'
    doc.font('Helvetica-Bold').fillColor(COLORS.text).text('Service Completed By', 300, currentY + 15)
    doc.font('Helvetica').fillColor(COLORS.muted).text(workerName, 300, currentY + 35)
    doc.text(`Duration: ${booking.services.reduce((a, s) => a + s.durationAtBooking, 0)} minutes`, 300, currentY + 50)
  }
  
  // ==========================================
  // FOOTER
  // ==========================================
  const footerY = 720
  generateHr(footerY)
  doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted)
     .text('support@autospa.com  ·  www.autospa.com  ·  +91 98765 43210', MARGIN, footerY + 15, { align: 'center', width: 510 })
     .text('This is a computer generated invoice and does not require a physical signature.', MARGIN, footerY + 30, { align: 'center', width: 510 })
}

export default { renderInvoice }
