// =====================================================
// SETTINGS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// =====================================================
// GET /api/settings - Get all settings
// =====================================================
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM settings';
    const params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY category, key';
    
    const result = await pool.query(query, params);
    
    // Convert to key-value object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// =====================================================
// GET /api/settings/:key - Get specific setting
// =====================================================
router.get('/:key', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { key } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({
      key: result.rows[0].key,
      value: result.rows[0].value
    });
    
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// =====================================================
// PUT /api/settings - Update settings (admin only)
// =====================================================
router.put('/', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    const updated = [];
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const result = await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()
         RETURNING *`,
        [key, value]
      );
      
      updated.push(result.rows[0]);
    }
    
    res.json({
      message: 'Settings updated successfully',
      updated: updated.length
    });
    
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =====================================================
// GET /api/settings/backup - Download system backup (admin only)
// =====================================================
router.get('/backup', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    // Create backup data
    const eventsBackup = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    const bookingsBackup = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    const workersBackup = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
    const settingsBackup = await pool.query('SELECT * FROM settings');
    const policiesBackup = await pool.query('SELECT * FROM policies');
    
    const backup = {
      timestamp: new Date().toISOString(),
      events: eventsBackup.rows,
      bookings: bookingsBackup.rows,
      workers: workersBackup.rows,
      settings: settingsBackup.rows,
      policies: policiesBackup.rows
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=system-backup-${Date.now()}.json`);
    
    res.json(backup);
    
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// =====================================================
// POST /api/settings/reset - Reset system (admin only)
// =====================================================
router.post('/reset', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    // Create backup data
    const eventsBackup = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    const bookingsBackup = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    const workersBackup = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
    
    const backup = {
      timestamp: new Date().toISOString(),
      events: eventsBackup.rows,
      bookings: bookingsBackup.rows,
      workers: workersBackup.rows
    };
    
    // Delete all data (except admin and settings)
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    await pool.query('DELETE FROM workers');
    
    res.json({
      message: 'System reset successfully',
      backup,
      note: 'Download this backup data before closing'
    });
    
  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

module.exports = router;


