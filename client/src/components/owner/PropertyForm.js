import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    photos: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    features: [],
    propertyType: 'Apartment'
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get(`/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data && res.data.data) {
        // Format data for form
        const property = res.data.data;
        setFormData({
          title: property.title || '',
          description: property.description || '',
          address: property.address || '',
          location: {
            city: property.location?.city || '',
            state: property.location?.state || '',
            zipCode: property.location?.zipCode || ''
          },
          price: property.price || '',
          bedrooms: property.bedrooms || '',
          bathrooms: property.bathrooms || '',
          area: property.area || '',
          photos: property.photos || ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
          features: property.features || [],
          propertyType: property.propertyType || 'Apartment'
        });
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like location.city
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFeatureChange = (e) => {
    const value = e.target.value;
    let updatedFeatures = [...formData.features];
    
    if (e.target.checked) {
      updatedFeatures.push(value);
    } else {
      updatedFeatures = updatedFeatures.filter(feature => feature !== value);
    }
    
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      setImageError('Please enter a valid URL');
      return;
    }
    
    // Simple URL validation
    try {
      new URL(newImageUrl);
    } catch (e) {
      setImageError('Please enter a valid URL');
      return;
    }
    
    setFormData({
      ...formData,
      photos: [...formData.photos, newImageUrl]
    });
    
    setNewImageUrl('');
    setImageError('');
  };
  
  const handleRemoveImage = (index) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos.splice(index, 1);
    
    // Make sure we have at least one photo
    if (updatedPhotos.length === 0) {
      updatedPhotos.push('https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg');
    }
    
    setFormData({
      ...formData,
      photos: updatedPhotos
    });
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setImageError('');
    
    try {
      // For now, we'll use a client-side method to convert images to data URLs
      // In a production app, you would upload to a server or cloud storage service
      
      const filePromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          if (!file.type.match('image.*')) {
            reject(new Error(`File ${file.name} is not an image`));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      
      const imageUrls = await Promise.all(filePromises);
      
      setFormData({
        ...formData,
        photos: [...formData.photos, ...imageUrls]
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setImageError('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Convert string values to appropriate types
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area)
      };
      
      // API call based on create or edit
      if (isEditMode) {
        await axios.put(`/api/properties/${id}`, propertyData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Property updated successfully!');
      } else {
        await axios.post('/api/properties', propertyData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Property created successfully!');
      }
      
      // Redirect after a slight delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting property:', err);
      setError(err.response?.data?.message || 'Failed to save property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p>{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Property Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                    Property Type*
                  </label>
                  <select
                    name="propertyType"
                    id="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Studio">Studio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                      City*
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      id="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                      State*
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      id="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700">
                      Zip Code*
                    </label>
                    <input
                      type="text"
                      name="location.zipCode"
                      id="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Property Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Monthly Rent Price ($)*
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    Square Footage*
                  </label>
                  <input
                    type="number"
                    name="area"
                    id="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                    Bedrooms*
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    id="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                    Bathrooms*
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    id="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.5"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Add new section for Property Photos before the Features section */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Property Photos</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="photos" className="block text-sm font-medium text-gray-700">
                    Current Photos
                  </label>
                  
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Property ${index + 1}`} 
                          className="h-40 w-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newImageUrl" className="block text-sm font-medium text-gray-700">
                    Add New Image
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="newImageUrl"
                      id="newImageUrl"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                  {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Paste URLs for your property images. For best results, use images with a 4:3 aspect ratio.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">
                    Upload Images from Device
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="fileUpload"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload multiple images from your device. Supported formats: JPG, PNG, WebP.
                  </p>
                  {uploading && (
                    <div className="mt-2 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Features</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {['Parking', 'Pool', 'Gym', 'Balcony', 'Elevator', 'Furnished', 'Pets Allowed', 'Laundry', 'Air Conditioning', 'Heating', 'Dishwasher', 'Security'].map((feature) => (
                  <div className="flex items-center" key={feature}>
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      name="features"
                      value={feature}
                      checked={formData.features.includes(feature)}
                      onChange={handleFeatureChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`feature-${feature}`} className="ml-2 block text-sm text-gray-700">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm; 