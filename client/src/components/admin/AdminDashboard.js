import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box, Alert } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [approvingProperties, setApprovingProperties] = useState(false);

  const fetchPendingOwners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/admin/pending-owners', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPendingOwners(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending owners:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending owners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOwners();
  }, []);

  const handleApproveOwner = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/admin/approve-owner/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the approved owner from the list
      setPendingOwners(pendingOwners.filter(owner => owner._id !== userId));
      setSuccessMessage('Owner approved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error approving owner:', err);
      setError(err.response?.data?.message || 'Failed to approve owner');
    }
  };

  const handleApproveAllProperties = async () => {
    try {
      setApprovingProperties(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/properties/approve-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccessMessage(`Successfully approved ${response.data.data.modified} properties`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error approving properties:', err);
      setError(err.response?.data?.message || 'Failed to approve properties');
    } finally {
      setApprovingProperties(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom component="div">
          Pending Owner Approvals
        </Typography>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : pendingOwners.length === 0 ? (
          <Typography>No pending owner approvals.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingOwners.map((owner) => (
                  <TableRow key={owner._id}>
                    <TableCell>{owner.name}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleApproveOwner(owner._id)}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', mt: 4 }}>
        <Typography variant="h6" gutterBottom component="div">
          Property Management
        </Typography>
        
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" paragraph>
            Use this button to approve all pending properties in the system. This will make them visible to renters.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleApproveAllProperties}
            disabled={approvingProperties}
          >
            {approvingProperties ? 'Processing...' : 'Approve All Properties'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 