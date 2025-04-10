import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Troubleshoot = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [tokenStatus, setTokenStatus] = useState('Checking...');
  const [userData, setUserData] = useState(null);
  const [propertiesStatus, setPropertiesStatus] = useState('Checking...');
  const [bookingsStatus, setBookingsStatus] = useState('Checking...');
  
  useEffect(() => {
    // Check server status
    axios.get('/api/test')
      .then(res => {
        console.log('Server test response:', res.data);
        setServerStatus('Online');
      })
      .catch(err => {
        console.error('Server test error:', err);
        setServerStatus('Offline or unreachable');
      });
    
    // Check token status
    const token = localStorage.getItem('token');
    if (token) {
      setTokenStatus('Present');
      
      // Try to verify token with server
      axios.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Token verification response:', res.data);
          setUserData(res.data.data);
          setTokenStatus('Valid');
        })
        .catch(err => {
          console.error('Token verification error:', err);
          setTokenStatus('Invalid or expired');
        });
        
      // Check properties endpoint
      axios.get('/api/properties')
        .then(res => {
          console.log('Properties test response:', res.data);
          setPropertiesStatus(`Success (${res.data.data?.length || 0} properties)`);
        })
        .catch(err => {
          console.error('Properties test error:', err);
          setPropertiesStatus('Error: ' + (err.response?.data?.message || err.message));
        });
        
      // Check bookings endpoint
      axios.get('/api/bookings/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Bookings test response:', res.data);
          setBookingsStatus(`Success (${res.data.data?.length || 0} bookings)`);
        })
        .catch(err => {
          console.error('Bookings test error:', err);
          setBookingsStatus('Error: ' + (err.response?.data?.message || err.message));
        });
    } else {
      setTokenStatus('Not found');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">System Diagnostics</h1>
            
            <div className="mb-6">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-900 mr-4">Go to Login</Link>
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-900 mr-4">Go to Dashboard</Link>
              <Link to="/renter/dashboard" className="text-indigo-600 hover:text-indigo-900">Go to Renter Dashboard</Link>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Server Status</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  serverStatus === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {serverStatus}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Status</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <span className="font-medium">Loading:</span> {loading ? 'True' : 'False'}
                  </li>
                  <li>
                    <span className="font-medium">Authenticated:</span> {isAuthenticated ? 'True' : 'False'}
                  </li>
                  <li>
                    <span className="font-medium">User in Context:</span> {user ? 'Present' : 'Not present'}
                  </li>
                  <li>
                    <span className="font-medium">User Role:</span> {user?.role || 'N/A'}
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Token Status</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  tokenStatus === 'Valid' ? 'bg-green-100 text-green-800' : 
                  tokenStatus === 'Present' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {tokenStatus}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">API Endpoints</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <span className="font-medium">Properties:</span> {propertiesStatus}
                  </li>
                  <li>
                    <span className="font-medium">Bookings:</span> {bookingsStatus}
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Local Storage</h2>
                <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify({
                    token: localStorage.getItem('token') ? '[TOKEN PRESENT]' : 'null',
                    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'null'
                  }, null, 2)}</pre>
                </div>
              </div>
              
              {userData && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Server-side User Data</h2>
                  <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Troubleshoot; 