const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Submit a booking request
// @route   POST /api/bookings
// @access  Private (Renter only)
router.post('/', protect, async (req, res) => {
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

// @desc    Get bookings for the logged-in renter
// @route   GET /api/bookings/me
// @access  Private (Renter only)
router.get('/me', protect, async (req, res) => {
  try {
    // Check if user is a renter
    if (req.user.role !== 'renter') {
      return res.status(403).json({ message: 'Only renters can access their bookings' });
    }

    // Find all bookings for this renter
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('property', 'title address location price photos')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching renter bookings:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router; 