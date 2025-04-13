require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

// Initialize express
const app = express();

// Connect to database
try {
  connectDB();
} catch (err) {
  logger.error('Failed to connect to database', err);
  logger.warn('Server will continue without database connection. Mock data will be used.');
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

// Request logger middleware
app.use((req, res, next) => {
  logger.request(req);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

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
    address: "123 Main St, San Francisco, CA 94105",
    price: 1500,
    location: {
      city: "San Francisco",
      state: "CA",
      zipCode: "94105"
    },
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    photos: ["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg"],
    features: ["Parking", "Pool", "Gym", "Dishwasher", "Central AC"],
    propertyType: "Apartment",
    status: "available",
    isApproved: true,
    owner: {
      _id: "owner123",
      name: "Property Manager",
      email: "manager@example.com"
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: "mock456",
    title: "Cozy Suburban Home",
    description: "Perfect family home in a quiet neighborhood",
    address: "456 Oak St, Austin, TX 78704",
    price: 2200,
    location: {
      city: "Austin",
      state: "TX",
      zipCode: "78704"
    },
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1800,
    photos: ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"],
    features: ["Backyard", "Garage", "Fireplace", "Patio", "Fenced yard"],
    propertyType: "House",
    status: "available",
    isApproved: true,
    owner: {
      _id: "owner456",
      name: "Jane Smith",
      email: "jane@example.com"
    },
    createdAt: new Date().toISOString()
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
    console.log('Looking for mock property with ID:', req.params.id);
    const property = mockProperties.find(p => p._id === req.params.id);
    if (property) {
      console.log('Found mock property:', property.title);
      return res.json({
        success: true,
        data: property
      });
    } else {
      console.log('Mock property not found, returning first mock property');
      // If no matching property, return the first one (for demo purposes)
      return res.json({
        success: true,
        data: mockProperties[0]
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

// Add a test route specifically for property details
app.get('/api/test/property-detail', (req, res) => {
  // Return the first mock property
  const testProperty = {
    _id: "testproperty123",
    title: "Test Property for Debugging",
    description: "This is a test property created specifically for debugging the property detail page",
    address: "123 Test Street, Test City, TS 12345",
    price: 1500,
    location: {
      city: "Test City",
      state: "TS",
      zipCode: "12345"
    },
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    photos: ["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg"],
    features: ["Test Feature 1", "Test Feature 2", "Test Feature 3"],
    propertyType: "House",
    status: "available",
    isApproved: true,
    owner: {
      _id: "testowner123",
      name: "Test Owner",
      email: "testowner@example.com"
    },
    createdAt: new Date().toISOString()
  };
  
  res.status(200).json({
    success: true,
    message: "Test property for debugging",
    data: testProperty
  });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Monitor MongoDB connection and retry if needed
let isDbConnected = false;
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
  isDbConnected = true;
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  isDbConnected = false;
  
  // Try to reconnect if not shutting down
  if (!isShuttingDown) {
    logger.info('Attempting to reconnect to MongoDB...');
    setTimeout(() => {
      try {
        connectDB();
      } catch (err) {
        logger.error('Failed to reconnect to MongoDB', err);
      }
    }, 5000); // Try to reconnect after 5 seconds
  }
});

// Before process.on handlers in index.js
let isShuttingDown = false;

// In the SIGTERM and SIGINT handlers
process.on('SIGTERM', () => {
  isShuttingDown = true;
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
    
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  isShuttingDown = true;
  logger.info('SIGINT received. Shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
    
    logger.info('Process terminated');
  });
}); 