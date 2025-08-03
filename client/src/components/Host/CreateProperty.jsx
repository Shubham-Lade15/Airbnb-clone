import React, { useState } from 'react';
import apiClient from '../../utils/axiosConfig'; // Your configured axios instance
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function CreateProperty() {
  const { user } = useAuth(); // To check if user is host
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: '',
    longitude: '',
    pricePerNight: '',
    numGuests: '',
    numBedrooms: '',
    numBeds: '',
    numBathrooms: '',
    propertyType: 'Apartment', // Default type
    amenities: '', // Comma-separated string
  });
  const [images, setImages] = useState([]); // State for selected files
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple styles for layout
  const formGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
  const textareaStyle = { ...inputStyle, minHeight: '80px' };
  const fileInputStyle = { ...inputStyle, padding: '5px' };
  const buttonStyle = {
    padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none',
    borderRadius: '5px', cursor: 'pointer', fontSize: '16px', width: '100%'
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    setImages(Array.from(e.target.files)); // Convert FileList to Array
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!user || user.role !== 'host') {
      setError('You must be logged in as a host to list a property.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    // Append all text fields
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    // Append image files
    images.forEach((image, index) => {
      data.append('images', image); // 'images' is the field name expected by Multer
    });

    try {
      const res = await apiClient.post('/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      setMessage(res.data.message);
      setLoading(false);
      // Clear form after successful submission
      setFormData({
        title: '', description: '', address: '', city: '', state: '', zipCode: '', country: '',
        latitude: '', longitude: '', pricePerNight: '', numGuests: '', numBedrooms: '',
        numBeds: '', numBathrooms: '', propertyType: 'Apartment', amenities: '',
      });
      setImages([]); // Clear selected images
      navigate('/host/dashboard', { state: { successMessage: res.data.message } }); // Redirect to host dashboard
    } catch (err) {
      console.error('Error creating property:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to list property. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
      <h2>List a New Property</h2>
      {message && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>{message}</p>}
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      {loading && <p style={{ color: '#007bff' }}>Listing property, please wait...</p>}

      <form onSubmit={onSubmit}>
        <div style={formGroupStyle}>
          <label htmlFor="title" style={labelStyle}>Title:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={onChange} required style={inputStyle} />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="description" style={labelStyle}>Description:</label>
          <textarea id="description" name="description" value={formData.description} onChange={onChange} required style={textareaStyle}></textarea>
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="address" style={labelStyle}>Address:</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={onChange} required style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={formGroupStyle}>
                <label htmlFor="city" style={labelStyle}>City:</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="state" style={labelStyle}>State:</label>
                <input type="text" id="state" name="state" value={formData.state} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="zipCode" style={labelStyle}>Zip Code:</label>
                <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="country" style={labelStyle}>Country:</label>
                <input type="text" id="country" name="country" value={formData.country} onChange={onChange} required style={inputStyle} />
            </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={formGroupStyle}>
                <label htmlFor="latitude" style={labelStyle}>Latitude (Optional):</label>
                <input type="number" step="any" id="latitude" name="latitude" value={formData.latitude} onChange={onChange} style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="longitude" style={labelStyle}>Longitude (Optional):</label>
                <input type="number" step="any" id="longitude" name="longitude" value={formData.longitude} onChange={onChange} style={inputStyle} />
            </div>
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="pricePerNight" style={labelStyle}>Price per Night (INR):</label>
          <input type="number" step="0.01" id="pricePerNight" name="pricePerNight" value={formData.pricePerNight} onChange={onChange} required style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <div style={formGroupStyle}>
                <label htmlFor="numGuests" style={labelStyle}>Max Guests:</label>
                <input type="number" id="numGuests" name="numGuests" value={formData.numGuests} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="numBedrooms" style={labelStyle}>Bedrooms:</label>
                <input type="number" id="numBedrooms" name="numBedrooms" value={formData.numBedrooms} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="numBeds" style={labelStyle}>Beds:</label>
                <input type="number" id="numBeds" name="numBeds" value={formData.numBeds} onChange={onChange} required style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label htmlFor="numBathrooms" style={labelStyle}>Bathrooms:</label>
                <input type="number" step="0.5" id="numBathrooms" name="numBathrooms" value={formData.numBathrooms} onChange={onChange} required style={inputStyle} />
            </div>
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="propertyType" style={labelStyle}>Property Type:</label>
          <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={onChange} required style={inputStyle}>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Villa">Villa</option>
            <option value="Cabin">Cabin</option>
            <option value="Bungalow">Bungalow</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="amenities" style={labelStyle}>Amenities (comma-separated):</label>
          <input type="text" id="amenities" name="amenities" value={formData.amenities} onChange={onChange} placeholder="e.g., WiFi, AC, Pool, Kitchen" style={inputStyle} />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="images" style={labelStyle}>Property Images (Max 10):</label>
          <input type="file" id="images" name="images" multiple accept="image/*" onChange={onImageChange} required style={fileInputStyle} />
          {images.length > 0 && <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>{images.length} file(s) selected.</p>}
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Submitting...' : 'List Property'}
        </button>
      </form>
    </div>
  );
}

export default CreateProperty;