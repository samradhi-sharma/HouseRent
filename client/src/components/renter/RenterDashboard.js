import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RenterDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('properties');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('RenterDashboard rendered. User:', user);

  useEffect(() => {
    console.log('RenterDashboard useEffect triggered');
    let isMounted = true;
    
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties for RenterDashboard');
        const res = await axios.get('/api/properties');
        
        console.log('Properties response:', res.data);
        
        if (isMounted) {
          if (res.data && Array.isArray(res.data.data)) {
            setProperties(res.data.data);
          } else {
            console.error('Unexpected properties response format:', res.data);
            setProperties([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        if (isMounted) {
          setError('Failed to load properties. Please try again later.');
          setLoading(false);
        }
      }
    };

    const fetchBookings = async () => {
      try {
        setBookingsLoading(true);
        console.log('Fetching booking requests for renter');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('No token found when fetching bookings');
          if (isMounted) {
            setBookingsLoading(false);
            setBookings([]);
          }
          return;
        }
        
        const res = await axios.get('/api/bookings/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Bookings response:', res.data);
        
        if (isMounted) {
          if (res.data && Array.isArray(res.data.data)) {
            setBookings(res.data.data);
          } else {
            console.error('Unexpected bookings response format:', res.data);
            setBookings([]);
          }
          setBookingsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        if (isMounted) {
          // Don't show error for bookings failure, just set empty array
          setBookings([]);
          setBookingsLoading(false);
        }
      }
    };

    fetchProperties();
    fetchBookings();
    
    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
    navigate('/');
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

  // Only show loading if both properties and bookings are loading
  if (loading && bookingsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Renter Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="mt-1 text-gray-500">Welcome back, {user?.name || 'Renter'}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

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
                Available Properties {!loading && properties.length > 0 && `(${properties.length})`}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Booking Requests {!bookingsLoading && bookings.length > 0 && `(${bookings.length})`}
              </button>
            </nav>
          </div>

          {activeTab === 'properties' && (
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <div key={property._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 w-full relative">
                          <img
                            src={property.photos?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
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
                            {property.location?.city || 'Unknown location'}, {property.location?.state || ''}
                          </p>
                          <div className="flex space-x-4 text-sm text-gray-700 mb-3">
                            <span>{property.bedrooms} bed</span>
                            <span>{property.bathrooms} bath</span>
                            <span>{property.area} sqft</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {property.description || 'No description available'}
                          </p>
                          <Link
                            to={`/properties/${property._id}`}
                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No properties available at the moment.</p>
                    </div>
                  )}
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
                                  {booking.property?.location?.city || ''}, {booking.property?.location?.state || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'No date'}
                            </div>
                            <div className="text-sm text-gray-500">{booking.preferredTime || 'No time specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.property?._id ? (
                              <Link
                                to={`/properties/${booking.property._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Property
                              </Link>
                            ) : (
                              <span className="text-gray-400">Property Unavailable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't made any booking requests yet.</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Browse available properties and request a viewing to get started.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RenterDashboard; 