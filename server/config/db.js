const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI || 'No URI provided');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    
    // Don't exit the process in development to allow server to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Running in development mode without database connection. Some features may not work.');
    }
    
    return null;
  }
};

module.exports = connectDB; 