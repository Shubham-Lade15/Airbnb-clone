import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/axiosConfig';

function HostDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
        if (!user || user.role !== 'host') {
            setLoading(false);
            return;
        }
        try {
            const propertiesRes = await apiClient.get('/properties/host');
            setProperties(propertiesRes.data);
            
            const bookingsRes = await apiClient.get('/bookings/host');
            setBookings(bookingsRes.data);
        } catch (err) {
            console.error('Error fetching host data:', err.response?.data || err);
            setError(err.response?.data?.message || 'Failed to load your host data.');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [user]);

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        try {
            await apiClient.delete(`/properties/${propertyId}`);
            setProperties(properties.filter(p => p.property_id !== propertyId));
            setSuccessMessage('Property deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error deleting property:', err.response?.data || err);
            setError(err.response?.data?.message || 'Failed to delete property.');
        }
    }
  };

  if (!user || user.role !== 'host') {
    return <p className="text-center mt-10 text-red-500">You must be a host to view this page.</p>;
  }
  if (loading) return <p className="text-center mt-10 text-gray-500">Loading your host data...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Host Dashboard</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome, {user.firstName} {user.lastName}!</p>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6 transition-opacity duration-500">
          {successMessage}
        </div>
      )}

      {/* Bookings Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Incoming Bookings</h3>
        {bookings.length === 0 ? (
            <p className="text-gray-500">You have no incoming bookings yet.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map(booking => (
                    <div key={booking.booking_id} className="bg-white rounded-xl shadow-md p-6 flex space-x-4">
                        <img
                            src={booking.property_images[0]}
                            alt={booking.property_title}
                            className="w-28 h-28 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">Booking for: {booking.property_title}</h4>
                            <p className="text-sm text-gray-600">Guest: {booking.guest_first_name} {booking.guest_last_name}</p>
                            <p className="text-sm text-gray-600">Dates: {new Date(booking.check_in_date).toLocaleDateString()} — {new Date(booking.check_out_date).toLocaleDateString()}</p>
                            <p className="text-sm font-medium text-gray-800 mt-2">Total Price: ₹{booking.total_price}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Properties Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Your Active Listings</h3>
          <Link to="/host/properties/new" className="bg-sky-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-sky-700 transition-colors">
            List a New Property
          </Link>
        </div>
        {properties.length === 0 ? (
          <p className="text-gray-500">You have no active listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map(property => (
              <div key={property.property_id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img src={property.images[0]} alt={property.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800 truncate">{property.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">₹{property.price_per_night} / night</p>
                  <div className="flex space-x-2">
                    <Link to={`/host/properties/edit/${property.property_id}`} className="flex-1 text-center bg-sky-100 text-sky-700 font-medium py-2 rounded-md hover:bg-sky-200 transition-colors">
                        Edit
                    </Link>
                    <button onClick={() => handleDelete(property.property_id)} className="flex-1 text-center bg-red-100 text-red-700 font-medium py-2 rounded-md hover:bg-red-200 transition-colors">
                        Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostDashboard;