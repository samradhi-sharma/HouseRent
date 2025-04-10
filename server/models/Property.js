const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    }
  },
  price: {
    type: Number,
    required: [true, 'Please add a monthly rental price']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please add number of bedrooms']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please add number of bathrooms']
  },
  area: {
    type: Number,
    required: [true, 'Please add square footage']
  },
  photos: {
    type: [String],
    default: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg']
  },
  features: {
    type: [String],
    default: []
  },
  propertyType: {
    type: String,
    required: [true, 'Please add property type'],
    enum: ['Apartment', 'House', 'Condo', 'Townhouse', 'Studio', 'Other']
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'pending', 'maintenance'],
    default: 'pending'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', PropertySchema); 