// =====================================================
// EMAIL SERVICE
// =====================================================

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@studentevents.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'StudentEvents';

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmation(booking, event) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️  SendGrid not configured - Email not sent');
    return { sent: false, error: 'SendGrid not configured' };
  }
  
  try {
    const msg = {
      to: booking.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: `Booking Confirmation - ${event.name}`,
      text: `
Hello ${booking.first_name},

Your booking has been confirmed!

Event: ${event.name}
Date: ${new Date(event.date).toLocaleString()}
Location: ${event.location}
Tickets: ${booking.quantity}
Total Amount: €${parseFloat(booking.total_amount).toFixed(2)}

Booking Reference: ${booking.ticket_number}
Payment Reference: ${booking.payment_reference}

Please complete your payment within 24 hours to secure your tickets.

Thank you for choosing StudentEvents!

Best regards,
StudentEvents Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello ${booking.first_name},</p>
      <p>Your booking has been successfully confirmed!</p>
      
      <div class="booking-details">
        <h2 style="margin-top: 0;">Booking Details</h2>
        <div class="detail-row">
          <span><strong>Event:</strong></span>
          <span>${event.name}</span>
        </div>
        <div class="detail-row">
          <span><strong>Date:</strong></span>
          <span>${new Date(event.date).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span><strong>Location:</strong></span>
          <span>${event.location}</span>
        </div>
        <div class="detail-row">
          <span><strong>Tickets:</strong></span>
          <span>${booking.quantity}</span>
        </div>
        <div class="detail-row">
          <span><strong>Total Amount:</strong></span>
          <span><strong>€${parseFloat(booking.total_amount).toFixed(2)}</strong></span>
        </div>
        <div class="detail-row">
          <span><strong>Booking Reference:</strong></span>
          <span>${booking.ticket_number}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span><strong>Payment Reference:</strong></span>
          <span>${booking.payment_reference}</span>
        </div>
      </div>
      
      <p><strong>Important:</strong> Please complete your payment within 24 hours to secure your tickets.</p>
      
      <p>Thank you for choosing StudentEvents!</p>
    </div>
    <div class="footer">
      <p>StudentEvents Team<br>
      ${FROM_EMAIL}</p>
    </div>
  </div>
</body>
</html>
      `
    };
    
    await sgMail.send(msg);
    console.log(`✅ Booking confirmation email sent to ${booking.email}`);
    return { sent: true };
    
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { sent: false, error: error.message };
  }
}

/**
 * Send ticket email with PDF attachments
 */
async function sendTicketEmail(booking, event, ticketPDFs) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️  SendGrid not configured - Email not sent');
    return { sent: false, error: 'SendGrid not configured' };
  }
  
  try {
    const attachments = ticketPDFs.map((pdf, index) => ({
      content: pdf,
      filename: `ticket-${booking.ticket_number}-${index + 1}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }));
    
    const msg = {
      to: booking.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: `Your Tickets - ${event.name}`,
      text: `
Hello ${booking.first_name},

Your payment has been confirmed! Your tickets are attached to this email.

Event: ${event.name}
Date: ${new Date(event.date).toLocaleString()}
Location: ${event.location}
Tickets: ${booking.quantity}

Important:
- Bring your ticket(s) to the event (digital or printed)
- Ticket check-up will be conducted at entry
- Each ticket contains a unique QR code

See you at the event!

Best regards,
StudentEvents Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .ticket-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .important { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Tickets Are Here!</h1>
    </div>
    <div class="content">
      <p>Hello ${booking.first_name},</p>
      <p><strong>Your payment has been confirmed!</strong> Your tickets are attached to this email.</p>
      
      <div class="ticket-info">
        <h2 style="margin-top: 0;">Event Details</h2>
        <p><strong>${event.name}</strong></p>
        <p>📅 ${new Date(event.date).toLocaleString()}</p>
        <p>📍 ${event.location}</p>
        <p>🎫 ${booking.quantity} ticket(s)</p>
      </div>
      
      <div class="important">
        <h3 style="margin-top: 0;">Important Information</h3>
        <ul>
          <li>Bring your ticket(s) to the event (digital or printed)</li>
          <li>Ticket check-up will be conducted at entry</li>
          <li>Each ticket contains a unique QR code</li>
          <li>Valid tickets are required for event entry</li>
        </ul>
      </div>
      
      <p>See you at the event!</p>
    </div>
    <div class="footer">
      <p>StudentEvents Team<br>
      ${FROM_EMAIL}</p>
    </div>
  </div>
</body>
</html>
      `,
      attachments
    };
    
    await sgMail.send(msg);
    console.log(`✅ Ticket email sent to ${booking.email}`);
    return { sent: true };
    
  } catch (error) {
    console.error('❌ Error sending ticket email:', error);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmation,
  sendTicketEmail
};


