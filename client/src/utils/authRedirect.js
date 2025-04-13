/**
 * Redirects the user to the appropriate dashboard based on their role
 * @param {Object} user - The user object with role information
 * @param {Function} navigate - React Router's navigate function
 */
export const redirectToDashboard = (user, navigate) => {
  if (!user || !user.role) {
    console.warn('No user or role information available for redirect');
    navigate('/login');
    return;
  }
  
  switch (user.role) {
    case 'renter':
      console.log('Redirecting to renter dashboard');
      navigate('/renter-dashboard');
      break;
    case 'owner':
      console.log('Redirecting to owner dashboard');
      navigate('/owner-dashboard');
      break;
    case 'admin':
      console.log('Redirecting to admin panel');
      navigate('/admin-panel');
      break;
    default:
      console.log('Unknown role, redirecting to generic dashboard');
      navigate('/dashboard');
  }
};

/**
 * Checks if a user has the required role(s) for a particular route
 * @param {Object} user - The user object with role information
 * @param {string|Array<string>} requiredRoles - Required role or array of roles
 * @returns {boolean} - Whether the user has permission
 */
export const hasRequiredRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
}; 