require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize express
const app = express();

// Connect to database
try {
  connectDB();
} catch (err) {
  console.error('Failed to connect to database:', err.message);
  console.warn('Server will continue without database connection. Mock data will be used.');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));

// Add body parser middleware with limits
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid JSON in request body' 
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));

// Add these mock data routes after the existing routes
// Mock data for testing without database
const MOCK_MODE = process.env.MOCK_MODE === 'true';
let mockPropertiesEnabled = MOCK_MODE;
let mockBookingsEnabled = MOCK_MODE;

// Mock data
const mockProperties = [
  {
    _id: "mock123",
    title: "Luxury Downtown Apartment",
    description: "A beautiful apartment in the heart of downtown",
    price: 1500,
    location: {
      city: "San Francisco",
      state: "CA",
      zipCode: "94105"
    },
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    photos: ["https://via.placeholder.com/800x600?text=Property+Image"],
    amenities: ["Parking", "Pool", "Gym"],
    status: "available",
    isApproved: true
  },
  {
    _id: "mock456",
    title: "Cozy Suburban Home",
    description: "Perfect family home in a quiet neighborhood",
    price: 2200,
    location: {
      city: "Austin",
      state: "TX",
      zipCode: "78704"
    },
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1800,
    photos: ["https://via.placeholder.com/800x600?text=Property+Image"],
    amenities: ["Backyard", "Garage", "Fireplace"],
    status: "available",
    isApproved: true
  }
];

const mockBookings = [
  {
    _id: "bookingmock123",
    property: mockProperties[0],
    renter: {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com"
    },
    contactInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234"
    },
    message: "I'm interested in viewing this property",
    preferredDate: new Date().toISOString(),
    preferredTime: "Afternoon (12PM - 5PM)",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

// Mock data route for properties
app.get('/api/properties/mock', (req, res) => {
  mockPropertiesEnabled = true;
  res.json({
    success: true,
    message: 'Mock properties enabled',
    data: mockProperties
  });
});

// Mock data route for turning off mock properties
app.get('/api/properties/nomock', (req, res) => {
  mockPropertiesEnabled = false;
  res.json({
    success: true,
    message: 'Mock properties disabled'
  });
});

// Intercept properties route for mock data
app.get('/api/properties', (req, res, next) => {
  if (mockPropertiesEnabled) {
    console.log('Using mock properties data');
    return res.json({
      success: true,
      count: mockProperties.length,
      data: mockProperties
    });
  }
  next();
});

// Intercept property by ID route for mock data
app.get('/api/properties/:id', (req, res, next) => {
  if (mockPropertiesEnabled) {
    const property = mockProperties.find(p => p._id === req.params.id);
    if (property) {
      return res.json({
        success: true,
        data: property
      });
    }
  }
  next();
});

// Intercept bookings route for mock data
app.get('/api/bookings/me', (req, res, next) => {
  if (mockBookingsEnabled) {
    console.log('Using mock bookings data');
    return res.json({
      success: true,
      count: mockBookings.length,
      data: mockBookings
    });
  }
  next();
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!' 
  });
});

// Add a debug route
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      mockMode: process.env.MOCK_MODE,
      currentMockState: {
        properties: mockPropertiesEnabled,
        bookings: mockBookingsEnabled
      }
    },
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      properties: '/api/properties',
      bookings: '/api/bookings',
      test: '/api/test',
      mock: {
        enableProperties: '/api/properties/mock',
        disableProperties: '/api/properties/nomock'
      }
    }
  });
});

// Enable mock mode by default for easier testing
mockPropertiesEnabled = true;
mockBookingsEnabled = true;

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Check if headers are already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Send detailed error response in development, generic in production
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message || 'Something went wrong!'
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 