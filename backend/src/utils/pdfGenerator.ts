import PDFDocument from 'pdfkit';
import { TicketWithDetails } from '../models/Ticket';
import { generateQRCodeBuffer } from './qrGenerator';

export const generateTicketPDF = async (ticket: TicketWithDetails): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generate QR code
      const qrCodeBuffer = await generateQRCodeBuffer(ticket.qr_code);

      // Header
      doc.fontSize(24)
         .fillColor('#6366f1')
         .text('StudentEvents', 50, 50);

      doc.fontSize(18)
         .fillColor('#1f2937')
         .text('Event Ticket', 50, 80);

      // Ticket details
      const startY = 130;
      
      doc.fontSize(20)
         .fillColor('#111827')
         .text(ticket.event_title, 50, startY);

      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Event Details', 50, startY + 40);

      doc.fontSize(14)
         .fillColor('#374151')
         .text(`Date: ${new Date(ticket.event_date).toLocaleDateString('en-US', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, 50, startY + 60);

      doc.text(`Location: ${ticket.event_location}`, 50, startY + 80);
      doc.text(`Ticket Holder: ${ticket.user_name}`, 50, startY + 100);
      doc.text(`Email: ${ticket.user_email}`, 50, startY + 120);

      // Ticket info
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Ticket Information', 50, startY + 160);

      doc.fontSize(14)
         .fillColor('#374151')
         .text(`Ticket ID: ${ticket.id}`, 50, startY + 180);

      doc.text(`QR Code: ${ticket.qr_code}`, 50, startY + 200);
      doc.text(`Amount Paid: $${ticket.amount_paid.toFixed(2)}`, 50, startY + 220);
      doc.text(`Purchase Date: ${new Date(ticket.purchase_date).toLocaleDateString()}`, 50, startY + 240);
      doc.text(`Status: ${ticket.status.toUpperCase()}`, 50, startY + 260);

      // QR Code
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Scan this QR code at the event:', 350, startY + 160);

      doc.image(qrCodeBuffer, 350, startY + 180, {
        width: 150,
        height: 150
      });

      // Footer
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text('This ticket is valid for one-time entry only.', 50, 700);

      doc.text('Please present this ticket (digital or printed) at the event entrance.', 50, 715);
      doc.text('For support, contact: support@studentevents.com', 50, 730);

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .stroke('#e5e7eb');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
