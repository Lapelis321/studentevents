// =====================================================
// IMAGE UPLOAD ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Configure multer for memory storage (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// =====================================================
// UPLOAD IMAGE TO CLOUDINARY
// =====================================================
// POST /api/upload/image
router.post('/image', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary using buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'student-events',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' }, // Limit max size
          { quality: 'auto' } // Auto quality optimization
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image' });
        }

        // Return the secure URL
        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    );

    // Pipe the buffer to upload stream
    const bufferStream = require('stream').Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// =====================================================
// DELETE IMAGE FROM CLOUDINARY
// =====================================================
// DELETE /api/upload/image/:publicId
router.delete('/image/:publicId', requireAdmin, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Image deletion failed' });
  }
});

module.exports = router;

