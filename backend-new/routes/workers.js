// =====================================================
// WORKERS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { requireAdmin, requireWorker, verifyToken } = require('../middleware/auth');

// =====================================================
// GET /api/workers - List all workers (admin only)
// =====================================================
router.get('/', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const result = await pool.query(
      `SELECT w.*, e.name as event_name 
       FROM workers w 
       LEFT JOIN events e ON w.assigned_event_id = e.id
       ORDER BY w.created_at DESC`
    );
    
    // Remove password hashes from response
    const workers = result.rows.map(({ password_hash, ...worker }) => worker);
    
    res.json(workers);
    
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// =====================================================
// GET /api/workers/:id - Get single worker (admin only)
// =====================================================
router.get('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT w.*, e.name as event_name 
       FROM workers w 
       LEFT JOIN events e ON w.assigned_event_id = e.id
       WHERE w.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    const { password_hash, ...worker } = result.rows[0];
    
    res.json(worker);
    
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

// =====================================================
// POST /api/workers - Create worker (admin only)
// =====================================================
router.post('/', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const {
      full_name,
      email,
      password,
      role,
      assigned_event_id
    } = req.body;
    
    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate role
    if (!['worker', 'supervisor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "worker" or "supervisor"' });
    }
    
    // Check if email already exists
    const existingWorker = await pool.query(
      'SELECT id FROM workers WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (existingWorker.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO workers 
      (full_name, email, password_hash, role, assigned_event_id, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, full_name, email, role, assigned_event_id, is_active, created_at`,
      [full_name, email.toLowerCase().trim(), passwordHash, role, assigned_event_id || null]
    );
    
    res.status(201).json({
      message: 'Worker created successfully',
      worker: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// =====================================================
// PUT /api/workers/:id - Update worker (admin only)
// =====================================================
router.put('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    const {
      full_name,
      email,
      password,
      role,
      assigned_event_id,
      is_active
    } = req.body;
    
    // Check if worker exists
    const checkResult = await pool.query(
      'SELECT id FROM workers WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (full_name) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }
    
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email.toLowerCase().trim());
    }
    
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }
    
    if (role) {
      if (!['worker', 'supervisor'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }
    
    if (assigned_event_id !== undefined) {
      updates.push(`assigned_event_id = $${paramIndex++}`);
      params.push(assigned_event_id);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const query = `
      UPDATE workers 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, full_name, email, role, assigned_event_id, is_active, created_at, updated_at
    `;
    
    const result = await pool.query(query, params);
    
    res.json({
      message: 'Worker updated successfully',
      worker: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// =====================================================
// DELETE /api/workers/:id - Delete worker (admin only)
// =====================================================
router.delete('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM workers WHERE id = $1 RETURNING id, full_name, email, role',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    res.json({
      message: 'Worker deleted successfully',
      worker: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// =====================================================
// POST /api/workers/verify-ticket - Verify ticket (worker/supervisor)
// =====================================================
router.post('/verify-ticket', verifyToken, requireWorker, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { ticket_number } = req.body;
    
    if (!ticket_number) {
      return res.status(400).json({ error: 'Ticket number required' });
    }
    
    // Query booking with event details
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.location as event_location
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.ticket_number = $1`,
      [ticket_number.trim().toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        valid: false,
        message: 'Ticket not found'
      });
    }
    
    const booking = result.rows[0];
    
    // Check if ticket is paid
    if (booking.payment_status !== 'paid') {
      return res.json({
        valid: false,
        message: 'Ticket not paid',
        booking: {
          ticket_number: booking.ticket_number,
          name: `${booking.first_name} ${booking.last_name}`,
          status: booking.payment_status
        }
      });
    }
    
    // Check if worker is assigned to this event (only for workers, not supervisors)
    if (req.user.role === 'worker' && req.user.assignedEventId) {
      if (booking.event_id !== req.user.assignedEventId) {
        return res.json({
          valid: false,
          message: 'Ticket not for your assigned event'
        });
      }
    }
    
    // Ticket is valid
    res.json({
      valid: true,
      message: 'Ticket is valid',
      booking: {
        ticket_number: booking.ticket_number,
        name: `${booking.first_name} ${booking.last_name}`,
        email: booking.email,
        phone: booking.phone,
        quantity: booking.quantity,
        event: {
          name: booking.event_name,
          date: booking.event_date,
          location: booking.event_location
        },
        additional_attendees: booking.additional_attendees
      }
    });
    
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ error: 'Failed to verify ticket' });
  }
});

// =====================================================
// GET /api/workers/export/all - Export all workers (admin only)
// =====================================================
router.get('/export/all', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const result = await pool.query(
      `SELECT w.id, w.full_name, w.email, w.role, e.name as event_name, w.is_active, w.created_at
       FROM workers w 
       LEFT JOIN events e ON w.assigned_event_id = e.id
       ORDER BY w.created_at DESC`
    );
    
    // Return as CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=workers.csv');
    
    const csvHeader = 'ID,Full Name,Email,Role,Assigned Event,Active,Created At\n';
    const csvRows = result.rows.map(worker => 
      `${worker.id},"${worker.full_name}",${worker.email},${worker.role},"${worker.event_name || 'None'}",${worker.is_active},${worker.created_at}`
    ).join('\n');
    
    res.send(csvHeader + csvRows);
    
  } catch (error) {
    console.error('Error exporting workers:', error);
    res.status(500).json({ error: 'Failed to export workers' });
  }
});

module.exports = router;


