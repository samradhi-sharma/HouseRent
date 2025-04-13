require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const resetAdminPassword = async () => {
  try {
    // Find the admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('Admin user not found. Please run seedAdmin.js first.');
      mongoose.connection.close();
      return;
    }
    
    // Reset password
    admin.password = 'adminpassword';
    await admin.save();
    
    console.log('Admin password reset successfully to "adminpassword"');
    console.log('Admin details:');
    console.log('- Email: admin@example.com');
    console.log('- Password: adminpassword');
    console.log('- ID:', admin._id);
    console.log('- Role:', admin.role);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting admin password:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword(); 