import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        console.log('Fetching properties for Home page');
        const res = await axios.get('/api/properties');
        console.log('Home properties response:', res.data);
        
        if (res.data && res.data.data) {
          console.log(`Found ${res.data.data.length} properties to display`);
          res.data.data.forEach(p => console.log(`Property: ${p.title}, isApproved: ${p.isApproved}, status: ${p.status}`));
          setProperties(res.data.data);
        } else {
          console.warn('Unexpected API response format:', res.data);
        }
        setError('');
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Background Image */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Luxury Home"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Find Your Perfect</span>
                  <span className="block text-indigo-400">Rental Home</span>
                </h1>
                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the perfect rental property that matches your lifestyle. Browse through our extensive collection of houses, apartments, and rooms available for rent.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Featured Properties</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Discover Your Dream Home
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Property 1 */}
              <div className="group relative">
                <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75">
                  <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Modern House"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Modern Villa</h3>
                    <p className="mt-1 text-sm text-gray-500">3 Beds • 2 Baths</p>
                  </div>
                  <p className="text-lg font-medium text-indigo-600">$2,500/mo</p>
                </div>
              </div>

              {/* Property 2 */}
              <div className="group relative">
                <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Luxury Apartment"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Luxury Apartment</h3>
                    <p className="mt-1 text-sm text-gray-500">2 Beds • 2 Baths</p>
                  </div>
                  <p className="text-lg font-medium text-indigo-600">$1,800/mo</p>
                </div>
              </div>

              {/* Property 3 */}
              <div className="group relative">
                <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Family Home"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Family Home</h3>
                    <p className="mt-1 text-sm text-gray-500">4 Beds • 3 Baths</p>
                  </div>
                  <p className="text-lg font-medium text-indigo-600">$3,200/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to find your next home
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  🏠
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Wide Selection</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Browse through a vast collection of properties across different locations and price ranges.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  🔍
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Advanced Search</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Find exactly what you're looking for with our powerful search and filter options.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  📱
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Easy Contact</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Connect directly with property owners and schedule viewings with just a few clicks.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  ⭐
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Verified Listings</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  All properties are verified to ensure you have a safe and reliable renting experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 