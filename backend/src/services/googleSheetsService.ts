import { google } from 'googleapis';
import { TicketWithDetails } from '../models/Ticket';

export class GoogleSheetsService {
  private static sheets: any;
  private static auth: any;

  static async initialize(): Promise<void> {
    try {
      if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
        console.log('⚠️ Google Sheets credentials not provided, skipping initialization');
        return;
      }

      this.auth = new google.auth.JWT({
        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      await this.auth.authorize();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('✅ Google Sheets service initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets service:', error);
    }
  }

  static async addTicketToSheet(ticket: TicketWithDetails): Promise<void> {
    try {
      if (!this.sheets || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        console.log('⚠️ Google Sheets not configured, skipping ticket sync');
        return;
      }

      const values = [
        [
          ticket.id,
          ticket.user_name,
          ticket.user_email,
          ticket.event_title,
          new Date(ticket.event_date).toISOString(),
          ticket.event_location,
          ticket.qr_code,
          ticket.status,
          ticket.amount_paid,
          new Date(ticket.purchase_date).toISOString(),
          ticket.used_date ? new Date(ticket.used_date).toISOString() : '',
          ticket.stripe_payment_intent_id || ''
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A:L',
        valueInputOption: 'RAW',
        resource: {
          values
        }
      });

      console.log(`✅ Ticket ${ticket.id} synced to Google Sheets`);
    } catch (error) {
      console.error('❌ Error adding ticket to Google Sheets:', error);
    }
  }

  static async updateTicketStatus(ticketId: number, status: string, usedDate?: Date): Promise<void> {
    try {
      if (!this.sheets || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        console.log('⚠️ Google Sheets not configured, skipping status update');
        return;
      }

      // Find the row with the ticket ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A:L'
      });

      const rows = response.data.values;
      if (!rows) return;

      let rowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] == ticketId) {
          rowIndex = i + 1; // Sheets are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        console.log(`⚠️ Ticket ${ticketId} not found in Google Sheets`);
        return;
      }

      // Update status and used_date
      const updates = [
        {
          range: `Tickets!H${rowIndex}`,
          values: [[status]]
        }
      ];

      if (usedDate) {
        updates.push({
          range: `Tickets!K${rowIndex}`,
          values: [[usedDate.toISOString()]]
        });
      }

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log(`✅ Ticket ${ticketId} status updated in Google Sheets`);
    } catch (error) {
      console.error('❌ Error updating ticket status in Google Sheets:', error);
    }
  }

  static async createHeaderRow(): Promise<void> {
    try {
      if (!this.sheets || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        console.log('⚠️ Google Sheets not configured, skipping header creation');
        return;
      }

      const headers = [
        'Ticket ID',
        'User Name',
        'User Email',
        'Event Title',
        'Event Date',
        'Event Location',
        'QR Code',
        'Status',
        'Amount Paid',
        'Purchase Date',
        'Used Date',
        'Stripe Payment Intent ID'
      ];

      // Check if header already exists
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A1:L1'
      });

      if (response.data.values && response.data.values.length > 0) {
        console.log('✅ Header row already exists in Google Sheets');
        return;
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A1:L1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      console.log('✅ Header row created in Google Sheets');
    } catch (error) {
      console.error('❌ Error creating header row in Google Sheets:', error);
    }
  }

  static async syncAllTickets(tickets: TicketWithDetails[]): Promise<void> {
    try {
      if (!this.sheets || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        console.log('⚠️ Google Sheets not configured, skipping bulk sync');
        return;
      }

      // Clear existing data (except header)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A2:L'
      });

      if (tickets.length === 0) {
        console.log('✅ No tickets to sync');
        return;
      }

      const values = tickets.map(ticket => [
        ticket.id,
        ticket.user_name,
        ticket.user_email,
        ticket.event_title,
        new Date(ticket.event_date).toISOString(),
        ticket.event_location,
        ticket.qr_code,
        ticket.status,
        ticket.amount_paid,
        new Date(ticket.purchase_date).toISOString(),
        ticket.used_date ? new Date(ticket.used_date).toISOString() : '',
        ticket.stripe_payment_intent_id || ''
      ]);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Tickets!A2:L',
        valueInputOption: 'RAW',
        resource: {
          values
        }
      });

      console.log(`✅ ${tickets.length} tickets synced to Google Sheets`);
    } catch (error) {
      console.error('❌ Error syncing tickets to Google Sheets:', error);
    }
  }
}
