import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';

function Trips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get('/bookings/guest');
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching trips:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to load your trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    if (location.state && location.state.bookingMessage) {
      setBookingMessage(location.state.bookingMessage);
      const timer = setTimeout(() => {
        setBookingMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (loading) return <p>Loading your trips...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Your Trips</h1>
      {bookingMessage && (
        <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          {bookingMessage}
        </p>
      )}

      {bookings.length === 0 ? (
        <p>You have no upcoming trips. Start exploring and book your first stay! <Link to="/">Browse properties</Link></p>
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
                style={{ width: '250px', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '15px' }}>
                <Link to={`/properties/${booking.property_id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{booking.property_title}</h4>
                </Link>
                <p style={{ margin: '0 0 5px 0' }}>{booking.property_city}, {booking.property_country}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
                  Check-in: {new Date(booking.check_in_date).toLocaleDateString()} &mdash; Check-out: {new Date(booking.check_out_date).toLocaleDateString()}
                </p>
                <p style={{ margin: '0', fontSize: '0.9em' }}>
                  Total Guests: {booking.total_guests} | Total Price: ₹{booking.total_price}
                </p>
                <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                  Hosted by {booking.host_first_name} {booking.host_last_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trips;