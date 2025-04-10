import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RenterDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/properties');
        
        console.log('Properties response:', res.data);
        
        if (res.data && res.data.data) {
          setProperties(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome {user?.name || 'Renter'}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <p className="mt-3 mb-6 text-lg text-gray-500">
          Browse available properties to find your perfect home.
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {properties.length === 0 && !loading && !error ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">No properties available at the moment</h3>
            <p className="mt-2 text-sm text-gray-500">Please check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property._id} className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="relative h-48 w-full">
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-md">
                    ${property.price}/month
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {property.location.city}, {property.location.state} {property.location.zipCode}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                      <span>•</span>
                      <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                      <span>•</span>
                      <span>{property.area} sqft</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      to={`/properties/${property._id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Get Info
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenterDashboard; 