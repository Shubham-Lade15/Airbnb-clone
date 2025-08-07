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

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading your trips...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Your Trips</h1>
      {bookingMessage && (
        <p className="bg-green-100 text-green-700 p-4 rounded-md mb-6 transition-opacity duration-500">
          {bookingMessage}
        </p>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">You have no upcoming trips. Start exploring and book your first stay! <Link to="/" className="text-sky-600 hover:text-sky-700">Browse properties</Link></p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <div key={booking.booking_id} className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={booking.property_images[0]}
                alt={booking.property_title}
                className="w-full md:w-56 h-40 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1">
                <Link to={`/properties/${booking.property_id}`} className="text-xl font-semibold text-gray-800 hover:text-sky-600">
                  {booking.property_title}
                </Link>
                <p className="text-gray-600">{booking.property_city}, {booking.property_country}</p>
                <div className="mt-2 text-gray-700">
                  <p className="text-sm">Check-in: <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span></p>
                  <p className="text-sm">Check-out: <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span></p>
                  <p className="text-sm mt-1">Total Guests: {booking.total_guests}</p>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-800">Total Price: ₹{booking.total_price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trips;