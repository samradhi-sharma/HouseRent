import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PropertyDetail = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    message: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { propertyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        console.log('Fetching property with ID:', propertyId);
        const res = await axios.get(`/api/properties/${propertyId}`);
        
        console.log('Property response:', res.data);
        
        if (res.data && res.data.data) {
          setProperty(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    // If we have user info, pre-fill the form
    if (user && user.name && user.email) {
      setBookingForm(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          name: user.name || prev.contactInfo.name,
          email: user.email || prev.contactInfo.email
        }
      }));
    }
  }, [user]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingForm({
        ...bookingForm,
        [parent]: {
          ...bookingForm[parent],
          [child]: value
        }
      });
    } else {
      setBookingForm({
        ...bookingForm,
        [name]: value
      });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setBookingError('');
    setSubmitting(true);
    
    if (!isAuthenticated) {
      console.log('User not authenticated');
      setBookingError('Please login to submit a booking request');
      setSubmitting(false);
      // Redirect to login page
      navigate('/login', { state: { from: `/properties/${propertyId}` } });
      return;
    }
    
    try {
      // Validate form
      const { contactInfo, message, preferredDate, preferredTime } = bookingForm;
      
      if (!contactInfo.name || !contactInfo.email || !contactInfo.phone || !message || !preferredDate || !preferredTime) {
        console.log('Form validation failed: missing fields');
        setBookingError('Please fill in all fields');
        setSubmitting(false);
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        setBookingError('Authentication token not found. Please login again.');
        setSubmitting(false);
        // Redirect to login page
        navigate('/login', { state: { from: `/properties/${propertyId}` } });
        return;
      }
      
      const bookingData = {
        propertyId,
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        message,
        preferredDate,
        preferredTime
      };
      
      console.log('Submitting booking request with data:', JSON.stringify(bookingData, null, 2));
      
      // Use axios instead of fetch for better error handling
      console.log('Making API call to submit booking');
      const response = await axios({
        method: 'post',
        url: '/api/bookings',
        data: bookingData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        validateStatus: function (status) {
          return status < 500; // Don't reject if status is not a server error
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.status !== 201) {
        throw new Error(response.data?.message || `Error: ${response.status}`);
      }
      
      if (response.data && response.data.success) {
        console.log('Booking was successful');
        setBookingSuccess(true);
        setBookingForm({
          contactInfo: {
            name: '',
            email: '',
            phone: ''
          },
          message: '',
          preferredDate: '',
          preferredTime: ''
        });
      }
    } catch (err) {
      console.error('Error submitting booking request:', err);
      setBookingError(err.message || 'Failed to submit booking request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Property not found</h3>
          <p className="mt-2 text-sm text-gray-500">The property you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            &larr; Back to All Properties
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Image Gallery */}
          <div className="relative bg-gray-900 h-96">
            <img
              src={property.photos[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-white">{property.title}</h1>
                  <p className="text-lg text-gray-300">
                    {property.location.city}, {property.location.state} {property.location.zipCode}
                  </p>
                </div>
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xl font-bold">
                  ${property.price}/month
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-bold text-gray-900">About this property</h2>
                  <p className="mt-4 text-gray-600">{property.description}</p>
                </div>

                <div className="py-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Details</h2>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-500">Property Type:</span>
                      <span className="ml-2 text-gray-900">{property.propertyType}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">Bedrooms:</span>
                      <span className="ml-2 text-gray-900">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">Bathrooms:</span>
                      <span className="ml-2 text-gray-900">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">Square Footage:</span>
                      <span className="ml-2 text-gray-900">{property.area} sqft</span>
                    </div>
                  </div>
                </div>

                <div className="py-6">
                  <h2 className="text-2xl font-bold text-gray-900">Features</h2>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
                <div className="mt-4">
                  <p className="text-gray-700"><strong>Owner:</strong> {property.owner.name}</p>
                  <p className="text-gray-700"><strong>Email:</strong> {property.owner.email}</p>
                  <p className="text-gray-700"><strong>Address:</strong> {property.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Request Form - Only visible to renters */}
        {user?.role === 'renter' && (
          <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900">Request a Viewing</h2>
              <p className="mt-2 text-gray-600">
                Fill out the form below to schedule a viewing of this property.
              </p>

              {bookingSuccess ? (
                <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                  <p className="font-medium">Booking request sent successfully!</p>
                  <p>The property owner will be in touch with you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="mt-6 space-y-6">
                  {bookingError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                      <p>{bookingError}</p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Your Contact Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label htmlFor="contactInfo.name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="contactInfo.name"
                          id="contactInfo.name"
                          value={bookingForm.contactInfo.name}
                          onChange={handleBookingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="contactInfo.email"
                          id="contactInfo.email"
                          value={bookingForm.contactInfo.email}
                          onChange={handleBookingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="contactInfo.phone"
                          id="contactInfo.phone"
                          value={bookingForm.contactInfo.phone}
                          onChange={handleBookingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Viewing Preferences */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Viewing Preferences</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          name="preferredDate"
                          id="preferredDate"
                          value={bookingForm.preferredDate}
                          onChange={handleBookingChange}
                          min={new Date().toISOString().split('T')[0]} // Today or later
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                          Preferred Time
                        </label>
                        <select
                          name="preferredTime"
                          id="preferredTime"
                          value={bookingForm.preferredTime}
                          onChange={handleBookingChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select a time</option>
                          <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                          <option value="Afternoon (12PM - 5PM)">Afternoon (12PM - 5PM)</option>
                          <option value="Evening (5PM - 8PM)">Evening (5PM - 8PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message to Owner
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={bookingForm.message}
                      onChange={handleBookingChange}
                      placeholder="Please include any questions or additional information about your visit."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Viewing Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail; 