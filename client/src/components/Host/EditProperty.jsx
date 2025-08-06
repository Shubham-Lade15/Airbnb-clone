import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '', description: '', address: '', city: '', state: '', zipCode: '', country: '',
    latitude: '', longitude: '', pricePerNight: '', numGuests: '', numBedrooms: '',
    numBeds: '', numBathrooms: '', propertyType: '', amenities: '', isAvailable: true
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/properties/${id}`);
        const property = res.data;
        setFormData({
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zip_code,
          country: property.country,
          latitude: property.latitude || '',
          longitude: property.longitude || '',
          pricePerNight: property.price_per_night,
          numGuests: property.num_guests,
          numBedrooms: property.num_bedrooms,
          numBeds: property.num_beds,
          numBathrooms: property.num_bathrooms,
          propertyType: property.property_type,
          amenities: (property.amenities || []).join(', '),
          isAvailable: property.is_available
        });
        setExistingImages(property.images || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property:', err.response?.data || err);
        setError('Failed to load property details.');
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const onImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // Append new image files. These will replace existing ones on the backend.
    if (images.length > 0) {
        images.forEach(image => data.append('images', image));
    } else {
        // If no new images are selected, send the existing image URLs back as a JSON string.
        // Our backend PUT route is designed to handle this.
        data.append('images', JSON.stringify(existingImages));
    }

    try {
      const res = await apiClient.put(`/properties/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
      setSubmitting(false);
      navigate('/host/dashboard', { state: { successMessage: res.data.message } });
    } catch (err) {
      console.error('Error updating property:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update property.');
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading property details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba' }}>
      <h2>Edit Property</h2>
      {message && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>{message}</p>}
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      {submitting && <p style={{ color: '#007bff' }}>Updating property, please wait...</p>}

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
          <label htmlFor="isAvailable" style={labelStyle}>Is Available:</label>
          <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={onChange} />
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
          <label htmlFor="images" style={labelStyle}>Property Images (Replacing Existing):</label>
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {existingImages.map((img, index) => (
                    <img key={index} src={img} alt="Existing" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                ))}
            </div>
          )}
          <input type="file" id="images" name="images" multiple accept="image/*" onChange={onImageChange} style={fileInputStyle} />
          {images.length > 0 && <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>{images.length} new file(s) selected. These will replace the existing images.</p>}
        </div>
        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Updating...' : 'Update Property'}
        </button>
      </form>
    </div>
  );
}

export default EditProperty;