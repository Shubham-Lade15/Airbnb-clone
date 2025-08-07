import React, { useState } from 'react';
import apiClient from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function CreateProperty() {
  const { user } = useAuth();
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
    propertyType: 'Apartment',
    amenities: '',
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    if (!user || user.role !== 'host') {
      setError('You must be logged in as a host to list a property.');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    images.forEach((image) => {
      data.append('images', image);
    });

    try {
      const res = await apiClient.post('/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
      setSubmitting(false);
      navigate('/host/dashboard', { state: { successMessage: res.data.message } });
    } catch (err) {
      console.error('Error creating property:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to list property. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">List a New Property</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {submitting && <p className="text-sky-600 text-center mb-4">Listing property, please wait...</p>}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title:</label>
            <input type="text" name="title" value={formData.title} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description:</label>
            <textarea name="description" value={formData.description} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address:</label>
            <input type="text" name="address" value={formData.address} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City:</label>
            <input type="text" name="city" value={formData.city} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State:</label>
            <input type="text" name="state" value={formData.state} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Zip Code:</label>
            <input type="text" name="zipCode" value={formData.zipCode} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country:</label>
            <input type="text" name="country" value={formData.country} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per Night (₹):</label>
            <input type="number" step="0.01" name="pricePerNight" value={formData.pricePerNight} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Guests:</label>
            <input type="number" name="numGuests" value={formData.numGuests} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms:</label>
            <input type="number" name="numBedrooms" value={formData.numBedrooms} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Beds:</label>
            <input type="number" name="numBeds" value={formData.numBeds} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms:</label>
            <input type="number" step="0.5" name="numBathrooms" value={formData.numBathrooms} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type:</label>
            <select name="propertyType" value={formData.propertyType} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500">
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Villa">Villa</option>
              <option value="Cabin">Cabin</option>
              <option value="Bungalow">Bungalow</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amenities (comma-separated):</label>
            <input type="text" name="amenities" value={formData.amenities} onChange={onChange} placeholder="e.g., WiFi, AC, Pool" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Property Images (Max 10):</label>
            <input type="file" name="images" multiple accept="image/*" onChange={onImageChange} required className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer file:bg-sky-50 file:border-0 file:text-sky-700 hover:file:bg-sky-100" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-sky-600 text-white font-medium py-3 px-6 rounded-md shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
          {submitting ? 'Listing...' : 'List Property'}
        </button>
      </form>
    </div>
  );
}

export default CreateProperty;