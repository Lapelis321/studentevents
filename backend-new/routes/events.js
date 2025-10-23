// =====================================================
// EVENTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// =====================================================
// GET /api/events - List all events (public)
// =====================================================
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { status, limit, offset } = req.query;
    
    let query = 'SELECT * FROM events';
    const params = [];
    
    // Filter by status if provided
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    // Default ordering: upcoming events first
    query += ' ORDER BY date ASC';
    
    // Pagination
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset));
    }
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// =====================================================
// GET /api/events/:id - Get single event (public)
// =====================================================
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// =====================================================
// POST /api/events - Create event (admin only)
// =====================================================
router.post('/', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const {
      name,
      date,
      location,
      description,
      image_url,
      price,
      total_tickets,
      min_age,
      dress_code,
      status
    } = req.body;
    
    // Validate required fields
    if (!name || !date || !location || price === undefined || !total_tickets) {
      console.error('Validation failed. Received data:', {
        name: name ? 'OK' : 'MISSING',
        date: date ? 'OK' : 'MISSING',
        location: location ? 'OK' : 'MISSING',
        price: price !== undefined ? 'OK' : 'MISSING',
        total_tickets: total_tickets ? 'OK' : 'MISSING'
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name,
          date: !date,
          location: !location,
          price: price === undefined,
          total_tickets: !total_tickets
        }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO events 
      (name, date, location, description, image_url, price, total_tickets, min_age, dress_code, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        date,
        location,
        description || null,
        image_url || null,
        price,
        total_tickets,
        min_age || null,
        dress_code || null,
        status || 'active'
      ]
    );
    
    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// =====================================================
// PUT /api/events/:id - Update event (admin only)
// =====================================================
router.put('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    const {
      name,
      date,
      location,
      description,
      image_url,
      price,
      total_tickets,
      min_age,
      dress_code,
      status
    } = req.body;
    
    // Check if event exists
    const checkResult = await pool.query(
      'SELECT id FROM events WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const result = await pool.query(
      `UPDATE events 
      SET name = COALESCE($1, name),
          date = COALESCE($2, date),
          location = COALESCE($3, location),
          description = COALESCE($4, description),
          image_url = COALESCE($5, image_url),
          price = COALESCE($6, price),
          total_tickets = COALESCE($7, total_tickets),
          min_age = COALESCE($8, min_age),
          dress_code = COALESCE($9, dress_code),
          status = COALESCE($10, status),
          updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [name, date, location, description, image_url, price, total_tickets, min_age, dress_code, status, id]
    );
    
    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// =====================================================
// DELETE /api/events/:id - Delete event (admin only)
// =====================================================
router.delete('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    // Check if event has bookings
    const bookingsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE event_id = $1',
      [id]
    );
    
    const bookingsCount = parseInt(bookingsCheck.rows[0].count);
    
    if (bookingsCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete event with existing bookings',
        bookingsCount
      });
    }
    
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      message: 'Event deleted successfully',
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// =====================================================
// GET /api/events/export/all - Export all events (admin only)
// =====================================================
router.get('/export/all', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
    
    // Return as CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
    
    const csvHeader = 'ID,Name,Date,Location,Price,Total Tickets,Sold Tickets,Status\n';
    const csvRows = result.rows.map(event => 
      `${event.id},"${event.name}",${event.date},"${event.location}",${event.price},${event.total_tickets},${event.sold_tickets},${event.status}`
    ).join('\n');
    
    res.send(csvHeader + csvRows);
    
  } catch (error) {
    console.error('Error exporting events:', error);
    res.status(500).json({ error: 'Failed to export events' });
  }
});

module.exports = router;


