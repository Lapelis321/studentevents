// =====================================================
// TICKET GENERATION SERVICE
// =====================================================

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate PDF ticket with QR code
 */
async function generateTicketPDF(ticketData) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        event_name,
        event_date,
        event_location,
        attendee_name,
        attendee_email,
        ticket_number,
        quantity,
        total_amount,
        min_age,
        dress_code
      } = ticketData;
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString('base64'));
      });
      
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      
      // Add border
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
         .strokeColor('#E5E7EB')
         .lineWidth(1)
         .stroke();
      
      // Header
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#4F46E5')
         .text('STUDENT EVENTS', 0, 50, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#6B7280')
         .text('E-TICKET', 0, 85, { align: 'center' });
      
      // Event Details Section
      let yPos = 130;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('EVENT DETAILS', 60, yPos);
      
      yPos += 25;
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(event_name, 60, yPos);
      
      yPos += 25;
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#374151');
      
      const formattedDate = new Date(event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.text(`📅 Date: ${formattedDate}`, 60, yPos);
      
      yPos += 20;
      doc.text(`📍 Location: ${event_location}`, 60, yPos);
      
      if (min_age) {
        yPos += 20;
        doc.text(`🔞 Age Restriction: ${min_age}+`, 60, yPos);
      }
      
      if (dress_code) {
        yPos += 20;
        doc.text(`👔 Dress Code: ${dress_code}`, 60, yPos);
      }
      
      // Attendee Details Section
      yPos += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('ATTENDEE INFORMATION', 60, yPos);
      
      yPos += 25;
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#374151');
      
      doc.text(`Name: ${attendee_name}`, 60, yPos);
      
      yPos += 20;
      doc.text(`Email: ${attendee_email}`, 60, yPos);
      
      yPos += 20;
      doc.text(`Tickets: ${quantity}`, 60, yPos);
      
      yPos += 20;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total: €${parseFloat(total_amount).toFixed(2)}`, 60, yPos);
      
      // Ticket Number Section
      yPos += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('TICKET NUMBER', 60, yPos);
      
      yPos += 25;
      doc.fontSize(13)
         .font('Helvetica-Bold')
         .fillColor('#4F46E5')
         .text(ticket_number, 60, yPos);
      
      // Generate QR Code
      const qrData = JSON.stringify({
        ticket_number,
        attendee_name,
        event_name
      });
      
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Add QR Code to PDF
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, pageWidth - 210, yPos - 30, { width: 150, height: 150 });
      
      // Valid Ticket Badge
      yPos += 70;
      doc.rect(60, yPos, 200, 40)
         .fillAndStroke('#10B981', '#10B981');
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#FFFFFF')
         .text('✓ VALID TICKET', 60, yPos + 12, { width: 200, align: 'center' });
      
      // Important Notes
      yPos = pageHeight - 150;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('IMPORTANT INFORMATION', 60, yPos);
      
      yPos += 20;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#374151');
      
      const notes = [
        '• This ticket is valid only for the named attendee',
        '• Bring this ticket (digital or printed) to the event',
        '• Ticket will be scanned at entry',
        '• Valid ID may be required'
      ];
      
      notes.forEach(note => {
        doc.text(note, 60, yPos);
        yPos += 15;
      });
      
      // Footer
      yPos = pageHeight - 50;
      doc.fontSize(8)
         .fillColor('#9CA3AF')
         .text('StudentEvents © 2024 | For support: support@studentevents.com', 0, yPos, { 
           align: 'center',
           width: pageWidth
         });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate pending ticket PDF with watermark
 */
async function generatePendingTicketPDF(ticketData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate regular ticket first
      const regularPDF = await generateTicketPDF(ticketData);
      
      // For now, return the same PDF
      // TODO: Add "PENDING PAYMENT" watermark overlay
      resolve(regularPDF);
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateTicketPDF,
  generatePendingTicketPDF
};


