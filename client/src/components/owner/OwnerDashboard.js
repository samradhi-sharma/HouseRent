import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('properties');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      try {
        setLoading(true);
        console.log('Fetching owner properties');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found in localStorage');
          throw new Error('Authentication token not found');
        }
        
        console.log('Making API request to /api/properties/mine');
        const res = await axios.get('/api/properties/mine', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Owner properties response status:', res.status);
        console.log('Owner properties response data:', JSON.stringify(res.data, null, 2));
        
        if (res.data && res.data.data) {
          console.log(`Found ${res.data.data.length} properties`);
          setProperties(res.data.data);
        } else {
          console.warn('Response data is missing expected structure:', res.data);
        }
      } catch (err) {
        console.error('Error fetching owner properties:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
        console.error('Error status:', err.response ? err.response.status : 'No status');
        setError('Failed to load your properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookingRequests = async () => {
      try {
        setBookingsLoading(true);
        console.log('Fetching booking requests for owner');
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Try the new endpoint first, fall back to old endpoint if it fails
        try {
          const res = await axios.get('/api/bookings/for-owner', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Owner bookings response from for-owner endpoint:', res.data);
          
          if (res.data && res.data.data) {
            setBookings(res.data.data);
          }
        } catch (forOwnerErr) {
          console.log('for-owner endpoint failed, trying fallback endpoint');
          // Try fallback to the original endpoint
          const res = await axios.get('/api/bookings/owner', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Owner bookings response from owner endpoint:', res.data);
          
          if (res.data && res.data.data) {
            setBookings(res.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching booking requests:', err);
        setError('Failed to load booking requests. Please try again later.');
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchOwnerProperties();
    fetchBookingRequests();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Use PATCH instead of PUT for partial updates
      await axios.patch(
        `/api/bookings/${bookingId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
      
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
    }
  };

  const getPendingBookingsCount = () => {
    return bookings.filter(booking => booking.status === 'pending').length;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (deleteConfirmation === propertyId) {
        // User has confirmed deletion
        await axios.delete(`/api/properties/${propertyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove property from state
        setProperties(properties.filter(property => property._id !== propertyId));
        setDeleteConfirmation(null);
      } else {
        // First click - ask for confirmation
        setDeleteConfirmation(propertyId);
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again later.');
    }
  };

  if (loading && bookingsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Property Owner Dashboard</h1>
            <button 
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="mt-1 text-gray-500">Welcome back, {user?.name || 'Owner'}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
            <div className="mt-2">
              <button 
                onClick={async () => {
                  try {
                    // Test auth endpoint to diagnose issues
                    const token = localStorage.getItem('token');
                    const response = await axios.get('/api/properties/test-auth', {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    console.log('Auth test response:', response.data);
                    
                    // If auth works, try fetching properties again
                    const fetchOwnerProperties = async () => {
                      try {
                        setLoading(true);
                        console.log('Retrying fetch owner properties');
                        
                        const res = await axios.get('/api/properties/mine', {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        
                        console.log('Retry response:', res.data);
                        
                        if (res.data && res.data.data) {
                          setProperties(res.data.data);
                          setError('');
                        }
                      } catch (err) {
                        console.error('Retry failed:', err);
                        setError('Authentication is working but property fetch still failed. Try logging out and back in.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    
                    fetchOwnerProperties();
                  } catch (err) {
                    console.error('Auth test failed:', err);
                    setError('Authentication issue detected. Please try logging out and back in.');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh Properties
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <Link
            to="/properties/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add New Property
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Booking Requests 
                {getPendingBookingsCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {getPendingBookingsCount()} pending
                  </span>
                )}
              </button>
            </nav>
          </div>

          {activeTab === 'properties' && (
            <div className="p-4">
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-48 w-full relative">
                        <img
                          src={property.photos[0] || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={property.title}
                          className="h-full w-full object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-sm font-bold">
                          ${property.price}/month
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {property.location.city}, {property.location.state}
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-700 mb-3">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span>{property.area} sqft</span>
                        </div>
                        <div className="flex justify-between mt-4">
                          <Link
                            to={`/properties/${property._id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </Link>
                          <div className="space-x-2">
                            <Link
                              to={`/properties/edit/${property._id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property._id)}
                              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                                deleteConfirmation === property._id
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-gray-600 hover:bg-gray-700'
                              }`}
                            >
                              {deleteConfirmation === property._id ? 'Confirm' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't added any properties yet.</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Click on "Add New Property" to get started.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="p-4">
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Renter
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={booking.property?.photos?.[0] || "https://via.placeholder.com/40?text=Property"}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.property?.title || 'Property unavailable'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.property?.location?.city}, {booking.property?.location?.state}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.renter?.name || booking.contactInfo?.name || 'Unknown user'}
                            </div>
                            <div className="text-sm text-gray-500">{booking.renter?.email || booking.contactInfo?.email}</div>
                            <div className="text-sm text-gray-500">{booking.contactInfo?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {booking.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(booking.preferredDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">{booking.preferredTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {booking.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <select
                                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                  value={booking.status}
                                  onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approve</option>
                                  <option value="rejected">Reject</option>
                                  <option value="cancelled">Cancel</option>
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">Current: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                                <button
                                  onClick={() => {
                                    const newStatus = window.prompt(
                                      `Change status from "${booking.status}" to:`, 
                                      "Type 'pending', 'approved', 'rejected', or 'cancelled'"
                                    );
                                    if (newStatus && ['pending', 'approved', 'rejected', 'cancelled'].includes(newStatus.toLowerCase())) {
                                      handleStatusUpdate(booking._id, newStatus.toLowerCase());
                                    }
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Change
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any booking requests yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard; 