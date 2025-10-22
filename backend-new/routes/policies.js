// =====================================================
// POLICIES ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// =====================================================
// GET /api/policies - Get all policies
// =====================================================
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const result = await pool.query(
      'SELECT * FROM policies WHERE is_published = true ORDER BY type'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// =====================================================
// GET /api/policies/:type - Get specific policy
// =====================================================
router.get('/:type', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { type } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM policies WHERE type = $1',
      [type]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// =====================================================
// PUT /api/policies/:type - Update policy (admin only)
// =====================================================
router.put('/:type', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { type } = req.params;
    const { title, content, is_published } = req.body;
    
    // Check if policy exists
    const checkResult = await pool.query(
      'SELECT id FROM policies WHERE type = $1',
      [type]
    );
    
    let result;
    
    if (checkResult.rows.length === 0) {
      // Create new policy
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      result = await pool.query(
        `INSERT INTO policies (type, title, content, is_published)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [type, title, content, is_published !== undefined ? is_published : true]
      );
    } else {
      // Update existing policy
      result = await pool.query(
        `UPDATE policies 
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             is_published = COALESCE($3, is_published),
             updated_at = NOW()
         WHERE type = $4
         RETURNING *`,
        [title, content, is_published, type]
      );
    }
    
    res.json({
      message: 'Policy updated successfully',
      policy: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// =====================================================
// GET /api/policies/:type/pdf - Download policy as PDF
// =====================================================
router.get('/:type/pdf', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { type } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM policies WHERE type = $1',
      [type]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    const policy = result.rows[0];
    
    // TODO: Generate PDF using PDFKit
    // For now, return plain text
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-policy.txt`);
    
    res.send(`${policy.title}\n\n${policy.content}`);
    
  } catch (error) {
    console.error('Error downloading policy:', error);
    res.status(500).json({ error: 'Failed to download policy' });
  }
});

module.exports = router;


