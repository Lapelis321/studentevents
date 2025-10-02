import sgMail from '@sendgrid/mail';
import { TicketWithDetails } from '../models/Ticket';
import { generateTicketPDF } from '../utils/pdfGenerator';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const msg: any = {
        to: options.to,
        from: {
          email: process.env.FROM_EMAIL!,
          name: process.env.FROM_NAME!
        },
        subject: options.subject,
        html: options.html,
        ...(options.attachments && { attachments: options.attachments })
      };

      await sgMail.send(msg);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendTicketEmail(ticket: TicketWithDetails): Promise<void> {
    try {
      // Generate PDF ticket
      const pdfBuffer = await generateTicketPDF(ticket);
      const pdfBase64 = pdfBuffer.toString('base64');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Event Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎟️ Your Event Ticket</h1>
              <p>Thank you for your purchase!</p>
            </div>
            <div class="content">
              <p>Hi ${ticket.user_name},</p>
              
              <p>Your ticket for <strong>${ticket.event_title}</strong> has been confirmed! Please find your ticket attached as a PDF.</p>
              
              <div class="ticket-info">
                <h3>Event Details</h3>
                <p><strong>Event:</strong> ${ticket.event_title}</p>
                <p><strong>Date:</strong> ${new Date(ticket.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Location:</strong> ${ticket.event_location}</p>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Amount Paid:</strong> $${ticket.amount_paid.toFixed(2)}</p>
              </div>
              
              <h3>Important Information:</h3>
              <ul>
                <li>Please bring this ticket (digital or printed) to the event</li>
                <li>Your ticket contains a unique QR code for entry</li>
                <li>Arrive early to avoid queues at the entrance</li>
                <li>This ticket is valid for one-time entry only</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <div class="footer">
                <p>StudentEvents Team<br>
                support@studentevents.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail({
        to: ticket.user_email,
        subject: `Your ticket for ${ticket.event_title}`,
        html: emailHtml,
        attachments: [
          {
            content: pdfBase64,
            filename: `ticket-${ticket.id}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }
        ]
      });
    } catch (error) {
      console.error('❌ Error sending ticket email:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to StudentEvents</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to StudentEvents!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>Welcome to StudentEvents! We're excited to have you join our community of students who love great events.</p>
            
            <p>With your account, you can:</p>
            <ul>
              <li>Browse and discover amazing student events</li>
              <li>Purchase tickets securely</li>
              <li>Manage your tickets in one place</li>
              <li>Get updates about upcoming events</li>
            </ul>
            
            <p>Start exploring events and make the most of your student life!</p>
            
            <div class="footer">
              <p>StudentEvents Team<br>
              support@studentevents.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to StudentEvents!',
      html: emailHtml
    });
  }

  static async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <p>You requested a password reset for your StudentEvents account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <div class="footer">
              <p>StudentEvents Team<br>
              support@studentevents.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Reset Your StudentEvents Password',
      html: emailHtml
    });
  }
}
