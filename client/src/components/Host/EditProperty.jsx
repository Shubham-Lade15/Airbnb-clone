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
  const [loading, setLoading] = useState(true);
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
    images.forEach(image => data.append('images', image));
    // If no new images are selected, send back the existing image URLs
    if (images.length === 0 && existingImages.length > 0) {
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
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
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
        {/* Add all other form fields similarly, pre-filled with formData values */}
        {/* ... rest of the form ... */}
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

        {/* A full set of fields would be here for a complete edit form */}
        <p>A full edit form would have all fields from CreateProperty.jsx here, pre-filled with the fetched data.</p>

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Updating...' : 'Update Property'}
        </button>
      </form>
    </div>
  );
}

export default EditProperty;