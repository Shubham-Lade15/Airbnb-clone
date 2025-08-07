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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    setSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    if (images.length > 0) {
        images.forEach(image => data.append('images', image));
    } else {
        data.append('images', JSON.stringify(existingImages));
    }

    try {
      const res = await apiClient.put(`/properties/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitting(false);
      navigate('/host/dashboard', { state: { successMessage: res.data.message } });
    } catch (err) {
      console.error('Error updating property:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update property.');
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading property details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Property</h2>
      {submitting && <p className="text-sky-600 text-center mb-4">Updating property, please wait...</p>}

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
          <div className="col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700 space-x-2">
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={onChange} className="form-checkbox h-5 w-5 text-sky-600 rounded" />
              <span>Is Available</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700">Property Images (Replacing Existing):</label>
            {existingImages.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((img, index) => (
                      <img key={index} src={img} alt="Existing" className="w-full h-24 object-cover rounded-md" />
                  ))}
              </div>
            )}
            <input type="file" name="images" multiple accept="image/*" onChange={onImageChange} className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer file:bg-sky-50 file:border-0 file:text-sky-700 hover:file:bg-sky-100" />
            {images.length > 0 && <p className="mt-1 text-sm text-gray-500">{images.length} new file(s) selected. These will replace the existing images.</p>}
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-sky-600 text-white font-medium py-3 px-6 rounded-md shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
          {submitting ? 'Updating...' : 'Update Property'}
        </button>
      </form>
    </div>
  );
}

export default EditProperty;