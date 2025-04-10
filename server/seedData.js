require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Sample owner user
const createOwner = async () => {
  try {
    // Check if owner already exists
    const ownerExists = await User.findOne({ email: 'owner@example.com' });
    
    if (ownerExists) {
      console.log('Owner user already exists');
      return ownerExists;
    }
    
    // Create owner user
    const owner = await User.create({
      name: 'John Property Owner',
      email: 'owner@example.com',
      password: 'password123',
      role: 'owner'
    });
    
    console.log('Owner user created');
    return owner;
  } catch (error) {
    console.error('Error creating owner:', error);
    process.exit(1);
  }
};

// Sample properties
const sampleProperties = [
  {
    title: 'Modern Apartment in Downtown',
    description: 'Beautiful modern apartment in the heart of downtown. Fully furnished with high-end appliances and amenities.',
    address: '123 Main Street, Apt 4B',
    location: {
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    price: 2500,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    photos: [
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg'
    ],
    features: ['Air Conditioning', 'In-unit Laundry', 'Fitness Center', 'Roof Deck'],
    propertyType: 'Apartment',
    status: 'available',
    isApproved: true
  },
  {
    title: 'Spacious Family House with Garden',
    description: 'Large family home with beautiful garden. Perfect for families who need space and privacy.',
    address: '456 Oak Avenue',
    location: {
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    },
    price: 3200,
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    photos: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'
    ],
    features: ['Backyard', 'Garage', 'Fireplace', 'Hardwood Floors'],
    propertyType: 'House',
    status: 'available',
    isApproved: true
  },
  {
    title: 'Luxury Condo with Ocean View',
    description: 'High-end condo with stunning ocean views. Comes with access to building amenities including pool and gym.',
    address: '789 Beachfront Drive, Unit 12',
    location: {
      city: 'Miami',
      state: 'FL',
      zipCode: '33101'
    },
    price: 4000,
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1800,
    photos: [
      'https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg',
      'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg'
    ],
    features: ['Ocean View', 'Pool', 'Gym', 'Doorman', 'Balcony'],
    propertyType: 'Condo',
    status: 'available',
    isApproved: true
  },
  {
    title: 'Cozy Studio in Historic District',
    description: 'Charming studio apartment in a historic building. Walking distance to restaurants, shops, and public transportation.',
    address: '101 Heritage Lane, Unit 3',
    location: {
      city: 'Boston',
      state: 'MA',
      zipCode: '02108'
    },
    price: 1500,
    bedrooms: 0,
    bathrooms: 1,
    area: 500,
    photos: [
      'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg',
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg'
    ],
    features: ['Historic Building', 'High Ceilings', 'Exposed Brick', 'Updated Kitchen'],
    propertyType: 'Studio',
    status: 'available',
    isApproved: true
  }
];

// Seed properties
const seedProperties = async () => {
  try {
    // Clear existing properties
    await Property.deleteMany({});
    console.log('Properties cleared');
    
    // Get or create owner
    const owner = await createOwner();
    
    // Add owner to each property
    const propertiesWithOwner = sampleProperties.map(property => ({
      ...property,
      owner: owner._id
    }));
    
    // Insert properties
    await Property.insertMany(propertiesWithOwner);
    console.log('Properties seeded successfully');
    
    // Exit process
    process.exit();
  } catch (error) {
    console.error('Error seeding properties:', error);
    process.exit(1);
  }
};

// Run the seeder
seedProperties(); 