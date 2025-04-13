const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

// @desc    Submit a booking request
// @route   POST /api/bookings
// @access  Private (Renter only)
router.post('/', protect, authorize('renter'), async (req, res) => {
  try {
    console.log('------- New Booking Request -------');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? `${req.user.id} (${req.user.role})` : 'No user found');
    
    // Check if user is a renter
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'renter') {
      console.log('Request rejected: User is not a renter');
      return res.status(403).json({ 
        success: false,
        message: 'Only renters can submit booking requests' 
      });
    }

    // Validate all required fields
    if (!req.body) {
      console.log('Empty request body received');
      return res.status(400).json({
        success: false,
        message: 'Request body is empty'
      });
    }

    const { propertyId, contactInfo, message, preferredDate, preferredTime } = req.body;
    console.log('Extracted booking details:', { 
      propertyId, 
      contactInfo: contactInfo ? 'present' : 'missing', 
      message: message ? 'present' : 'missing',
      preferredDate: preferredDate ? 'present' : 'missing',
      preferredTime: preferredTime ? 'present' : 'missing'
    });
    
    // Validate propertyId
    if (!propertyId) {
      console.log('Missing propertyId');
      return res.status(400).json({ 
        success: false,
        message: 'Property ID is required' 
      });
    }
    
    // Validate contactInfo
    if (!contactInfo || typeof contactInfo !== 'object') {
      console.log('Missing or invalid contactInfo - not an object');
      return res.status(400).json({ 
        success: false,
        message: 'Contact information object is required' 
      });
    }
    
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      console.log('Missing required contactInfo fields:', {
        name: contactInfo.name ? 'present' : 'missing',
        email: contactInfo.email ? 'present' : 'missing',
        phone: contactInfo.phone ? 'present' : 'missing'
      });
      return res.status(400).json({ 
        success: false,
        message: 'Contact information must include name, email, and phone' 
      });
    }
    
    // Validate other fields
    if (!message) {
      console.log('Missing message');
      return res.status(400).json({ 
        success: false,
        message: 'Message is required' 
      });
    }
    
    if (!preferredDate) {
      console.log('Missing preferredDate');
      return res.status(400).json({ 
        success: false,
        message: 'Preferred date is required' 
      });
    }
    
    if (!preferredTime) {
      console.log('Missing preferredTime');
      return res.status(400).json({ 
        success: false,
        message: 'Preferred time is required' 
      });
    }

    // Check if property exists
    console.log('Finding property with ID:', propertyId);
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found');
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }

    // Check if property is available
    if (property.status !== 'available' || !property.isApproved) {
      console.log('Property not available. Status:', property.status, 'Approved:', property.isApproved);
      return res.status(400).json({ 
        success: false,
        message: 'Property is not available for booking' 
      });
    }

    // Create booking
    console.log('Creating booking...');
    const booking = await Booking.create({
      property: propertyId,
      renter: req.user.id,
      contactInfo: {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone
      },
      message,
      preferredDate: new Date(preferredDate),
      preferredTime,
      status: 'pending'
    });

    console.log('Booking created successfully:', booking._id);

    // Populate booking with property and renter details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address location price')
      .populate('renter', 'name email');

    console.log('Sending success response');
    return res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get all bookings for a user (renters see their requests, owners see requests for their properties)
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'renter') {
      // Renters see their booking requests
      bookings = await Booking.find({ renter: req.user.id })
        .populate('property', 'title address location price photos')
        .sort('-createdAt');
    } else if (req.user.role === 'owner') {
      // Owners see booking requests for their properties
      // First, find all properties owned by this user
      const properties = await Property.find({ owner: req.user.id });
      const propertyIds = properties.map(property => property._id);

      // Then find all bookings for these properties
      bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate('property', 'title address location price photos')
        .populate('renter', 'name email')
        .sort('-createdAt');
    } else if (req.user.role === 'admin') {
      // Admins can see all bookings
      bookings = await Booking.find({})
        .populate('property', 'title address location price photos')
        .populate('renter', 'name email')
        .sort('-createdAt');
    } else {
      return res.status(403).json({ message: 'Not authorized to view bookings' });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all bookings for current user (renters see their requests, owners see requests for their properties)
// @route   GET /api/bookings/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let bookings;
    console.log('GET /bookings/me - User role:', req.user.role);

    if (req.user.role === 'renter') {
      // Renters see their booking requests
      bookings = await Booking.find({ renter: req.user.id })
        .populate({
          path: 'property',
          select: 'title location photos price'
        })
        .sort('-createdAt');
      
      console.log(`Found ${bookings.length} bookings for renter ${req.user.id}`);
    } else if (req.user.role === 'owner') {
      // Owners see booking requests for their properties
      // First, find all properties owned by this user
      const properties = await Property.find({ owner: req.user.id });
      const propertyIds = properties.map(property => property._id);
      
      console.log(`Found ${properties.length} properties for owner ${req.user.id}`);

      // Then find all bookings for these properties
      bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate({
          path: 'property',
          select: 'title location photos price'
        })
        .populate({
          path: 'renter',
          select: 'name email'
        })
        .sort('-createdAt');
      
      console.log(`Found ${bookings.length} bookings for owner's properties`);
    } else if (req.user.role === 'admin') {
      // Admins can see all bookings
      bookings = await Booking.find({})
        .populate({
          path: 'property',
          select: 'title location photos price'
        })
        .populate({
          path: 'renter',
          select: 'name email'
        })
        .sort('-createdAt');
      
      console.log(`Admin: found ${bookings.length} total bookings`);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings'
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get bookings for the logged-in owner's properties
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
router.get('/owner', protect, async (req, res) => {
  try {
    // Check if user is an owner
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only owners can access this endpoint' 
      });
    }

    // Find all properties owned by this user
    const properties = await Property.find({ owner: req.user.id });
    const propertyIds = properties.map(property => property._id);

    // Find all bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title address location price photos')
      .populate('renter', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get bookings for the logged-in owner's properties (alias path)
// @route   GET /api/bookings/for-owner
// @access  Private (Owner only)
router.get('/for-owner', protect, async (req, res) => {
  try {
    // Check if user is an owner
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only owners can access this endpoint' 
      });
    }

    // Find all properties owned by this user
    const properties = await Property.find({ owner: req.user.id });
    const propertyIds = properties.map(property => property._id);

    // Find all bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title address location price photos')
      .populate('renter', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Owner: Update booking status (approve or reject)
// @route   PATCH /api/bookings/:id
// @access  Private (Owner only)
router.patch('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (approved, rejected, or cancelled)'
      });
    }
    
    // Find the booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // If user is an owner, check if they own the property
    if (req.user.role === 'owner') {
      // Get the property
      const property = await Property.findById(booking.property);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
      
      // Check if the logged-in user is the owner of the property
      if (property.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }
    }
    
    // Update booking status
    booking.status = status;
    await booking.save();
    
    // Return updated booking
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('property', 'title address location price photos')
      .populate('renter', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Renter: Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Renter only)
router.patch('/:id/cancel', protect, authorize('renter'), async (req, res) => {
  try {
    // Find the booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the logged-in user is the renter who made the booking
    if (booking.renter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Cannot cancel already approved/rejected bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}`
      });
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Return updated booking
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('property', 'title address location price photos');
    
    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 