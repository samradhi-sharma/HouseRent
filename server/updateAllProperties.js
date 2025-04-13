const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

const updateAllProperties = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/houseRentDB';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected!');

    // Find and update all properties
    console.log('Updating all properties...');
    const result = await Property.updateMany(
      {}, // Update all properties
      { 
        isApproved: true, 
        status: 'available' 
      }
    );

    console.log('Update result:', result);
    console.log(`Updated ${result.modifiedCount || result.nModified || 0} properties`);

    // Verify all properties are now approved and available
    const properties = await Property.find();
    console.log(`Total properties in database: ${properties.length}`);
    properties.forEach(p => {
      console.log(`Property: ${p.title}, isApproved: ${p.isApproved}, status: ${p.status}`);
    });

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the function
updateAllProperties(); 