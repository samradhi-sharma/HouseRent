import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Set up axios interceptors for token handling
  useEffect(() => {
    // Add a request interceptor to include the token in all outgoing requests
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // Add a response interceptor to handle token-related errors
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // If we get a 401 Unauthorized error, log the user out
        if (error.response && error.response.status === 401) {
          console.log('Authentication error detected, logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Auth context initializing. Token exists:', !!token);
    
    if (token) {
      try {
        setIsAuthenticated(true);
        
        // Set user data if available
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('User data from localStorage:', parsedUser);
            
            // Validate user data has required fields
            if (!parsedUser || !parsedUser.id || !parsedUser.role) {
              console.error('Invalid user data in localStorage:', parsedUser);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setIsAuthenticated(false);
              setUser(null);
            } else {
              setUser(parsedUser);
            }
          } catch (error) {
            console.error('Error parsing user data, clearing auth state:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('No user data in localStorage, but token exists');
          // If we have a token but no user data, try to fetch the user
          axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => {
              if (res.data && res.data.data) {
                console.log('User data fetched from API:', res.data.data);
                const userData = {
                  id: res.data.data._id,
                  name: res.data.data.name,
                  email: res.data.data.email,
                  role: res.data.data.role
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
              }
            })
            .catch(err => {
              console.error('Failed to fetch user data, clearing auth state:', err);
              localStorage.removeItem('token');
              setIsAuthenticated(false);
            });
        }
      } catch (err) {
        console.error('Error in auth initialization:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      console.log('No authentication token found');
      localStorage.removeItem('user'); // Clean up any orphaned user data
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    console.log('Login called with token:', !!token);
    console.log('Login called with userData:', userData);
    
    if (!token) {
      console.error('No token provided to login function');
      return;
    }
    
    localStorage.setItem('token', token);
    
    // Save user data
    if (userData) {
      try {
        const userDataString = JSON.stringify(userData);
        localStorage.setItem('user', userDataString);
        console.log('User data saved to localStorage:', userDataString);
        setUser(userData);
      } catch (err) {
        console.error('Error storing user data:', err);
      }
    } else {
      console.warn('No user data provided during login');
    }
    
    // Set authentication state
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout,
        role: user?.role || null,
        isRenter: user?.role === 'renter',
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 