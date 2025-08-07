import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/axiosConfig';

function HostDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]); // New state for bookings
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
            // Fetch host's properties
            const propertiesRes = await apiClient.get('/properties/host');
            setProperties(propertiesRes.data);

            // Fetch host's bookings
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
    return <p>You must be a host to view this page.</p>;
  }
  if (loading) return <p>Loading your host data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Host Dashboard</h1>
      <p>Welcome, {user.firstName} {user.lastName}!</p>
      {successMessage && (
        <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          {successMessage}
        </div>
      )}

      {/* Bookings Section */}
      <div style={{ marginTop: '20px' }}>
        <h3>Incoming Bookings</h3>
        {bookings.length === 0 ? (
            <p>You have no incoming bookings yet.</p>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {bookings.map(booking => (
                    <div key={booking.booking_id} style={{
                        border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <img
                            src={booking.property_images[0]}
                            alt={booking.property_title}
                            style={{ width: '200px', height: '120px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 5px 0' }}>Booking for: {booking.property_title}</h4>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
                                Guest: {booking.guest_first_name} {booking.guest_last_name} ({booking.guest_email})
                            </p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
                                Dates: {new Date(booking.check_in_date).toLocaleDateString()} &mdash; {new Date(booking.check_out_date).toLocaleDateString()}
                            </p>
                            <p style={{ margin: '0', fontSize: '0.9em' }}>
                                Total Price: ₹{booking.total_price} | Status: {booking.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Properties Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Your Active Listings</h3>
          <Link to="/host/properties/new" style={{
            display: 'inline-block', padding: '10px 20px', backgroundColor: '#28a745', color: 'white',
            textDecoration: 'none', borderRadius: '5px'
          }}>
            List a New Property
          </Link>
        </div>
        {properties.length === 0 ? (
          <p>You have no active listings yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {properties.map(property => (
              <div key={property.property_id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <img src={property.images[0]} alt={property.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{property.title}</h4>
                  <p style={{ margin: '0 0 10px 0' }}>₹{property.price_per_night} / night</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/host/properties/edit/${property.property_id}`} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                        Edit
                    </Link>
                    <button onClick={() => handleDelete(property.property_id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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