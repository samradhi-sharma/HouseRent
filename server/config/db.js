const mongoose = require('mongoose');

// Set connection options for better stability
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  connectTimeoutMS: 10000,
};

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

const connectDB = async () => {
  try {
    // Try different connection strings if the main one fails
    let connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/houseRentDB';
    console.log('Attempting to connect to MongoDB with URI:', connectionString);
    
    try {
      const conn = await mongoose.connect(connectionString, connectOptions);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`Failed to connect using ${connectionString}. Trying localhost...`);
      connectionString = 'mongodb://localhost:27017/houseRentDB';
      
      try {
        const conn = await mongoose.connect(connectionString, connectOptions);
        console.log(`MongoDB Connected using fallback: ${conn.connection.host}`);
        return conn;
      } catch (innerErr) {
        console.warn('Failed with localhost. Trying 127.0.0.1...');
        connectionString = 'mongodb://127.0.0.1:27017/houseRentDB';
        
        const conn = await mongoose.connect(connectionString, connectOptions);
        console.log(`MongoDB Connected using IP: ${conn.connection.host}`);
        return conn;
      }
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    
    // Don't exit the process in development to allow server to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else if (process.env.MOCK_MODE === 'true') {
      console.warn('Running in MOCK_MODE. Mock data will be used instead of database.');
      return null;
    } else {
      console.warn('Running in development mode without database connection. Some features may not work.');
      return null;
    }
  }
};

module.exports = connectDB; 