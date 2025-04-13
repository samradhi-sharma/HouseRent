const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize, requireApprovedOwner } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/properties');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'property-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files per upload
  }
});

// @desc    Get all approved and available properties
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({
      isApproved: true,
      status: 'available'
    }).populate({
      path: 'owner',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Debug request headers
// @route   GET /api/properties/debug-headers
// @access  Public
router.get('/debug-headers', (req, res) => {
  console.log('DEBUG HEADERS ENDPOINT HIT');
  console.log('Request headers:', req.headers);
  
  return res.status(200).json({
    success: true,
    headers: req.headers,
    authHeader: req.headers.authorization || 'No authorization header found'
  });
});

// @desc    Test authentication
// @route   GET /api/properties/test-auth
// @access  Private
router.get('/test-auth', protect, async (req, res) => {
  try {
    console.log('TEST AUTH ENDPOINT HIT');
    console.log('User from token:', req.user);
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error in test auth endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth test'
    });
  }
});

// @desc    Get owner's properties
// @route   GET /api/properties/mine
// @access  Private (Owner only)
router.get('/mine', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    console.log('GET /api/properties/mine route hit');
    console.log('User:', req.user ? `${req.user.id} (${req.user.role})` : 'No user found');
    
    // Get all properties owned by the user
    console.log(`Finding properties for owner ID: ${req.user.id}`);
    const properties = await Property.find({ owner: req.user.id });
    console.log(`Found ${properties.length} properties for owner`);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching owner properties:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate({
      path: 'owner',
      select: 'name email'
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
router.post('/', protect, authorize('owner', 'admin'), requireApprovedOwner, async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;
    
    // Auto-approve properties created by approved owners
    // and set status to available so they show up in listings
    req.body.isApproved = true;
    req.body.status = 'available';

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Approve all pending properties
// @route   POST /api/properties/approve-all
// @access  Private (Admin only)
router.post('/approve-all', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can perform this action' 
      });
    }

    // Find all properties that are not approved or not available
    const result = await Property.updateMany(
      { $or: [{ isApproved: false }, { status: 'pending' }] },
      { isApproved: true, status: 'available' }
    );

    // Handle both old and new MongoDB driver response format
    const modifiedCount = result.modifiedCount || result.nModified || 0;
    const matchedCount = result.matchedCount || result.n || 0;
    
    console.log('Approve all properties result:', result);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${modifiedCount} properties`,
      data: {
        matched: matchedCount,
        modified: modifiedCount
      }
    });
  } catch (error) {
    console.error('Error approving properties:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Upload property images
// @route   POST /api/properties/upload-images
// @access  Private (Owner only)
router.post('/upload-images', protect, upload.array('images', 10), async (req, res) => {
  try {
    // Check if user is owner or admin
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only owners can upload property images' 
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No images uploaded' 
      });
    }
    
    // Generate URLs for the uploaded images
    const imageUrls = req.files.map(file => {
      // In production, this would be your domain or CDN URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com'
        : `http://localhost:${process.env.PORT || 5001}`;
      
      return `${baseUrl}/uploads/properties/${file.filename}`;
    });
    
    res.status(200).json({
      success: true,
      count: imageUrls.length,
      data: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router; 