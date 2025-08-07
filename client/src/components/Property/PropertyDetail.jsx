import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    totalGuests: 1,
  });
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await apiClient.get(`/properties/${id}`);
        setProperty(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property details:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to load property details.');
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Effect to calculate nights and total price whenever dates change
  useEffect(() => {
    if (bookingData.checkInDate && bookingData.checkOutDate && property) {
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      if (checkOut > checkIn) {
        const oneDay = 24 * 60 * 60 * 1000;
        const numberOfNights = Math.round(Math.abs((checkOut - checkIn) / oneDay));
        setNights(numberOfNights);
        setTotalPrice(numberOfNights * property.price_per_night);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    }
  }, [bookingData.checkInDate, bookingData.checkOutDate, property]);

  const onBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const onBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage('');
    setBookingError('');
    setSubmitting(true);

    if (!isAuthenticated) {
      setBookingError('You must be logged in to book a property.');
      setSubmitting(false);
      return;
    }
    if (user && user.role === 'host') {
      setBookingError('Hosts cannot book their own properties.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await apiClient.post('/bookings', {
        propertyId: property.property_id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalGuests: bookingData.totalGuests,
      });
      setBookingMessage(res.data.message);
      setSubmitting(false);
      navigate('/trips', { state: { bookingMessage: res.data.message } }); // Redirect to a future trips page
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err);
      setBookingError(err.response?.data?.message || 'Failed to create booking.');
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading property details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!property) return <p>Property not found.</p>;

  // Basic styling for the form elements
  const bookingFormStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
  const buttonStyle = { padding: '12px', backgroundColor: '#ff5a5f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer', marginTop: '10px' };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
      <h1>{property.title}</h1>
      <p style={{ color: '#555', fontSize: '1.1em' }}>{property.city}, {property.state}, {property.country}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginTop: '20px' }}>
        {property.images && property.images.map((imgUrl, index) => (
          <img key={index} src={imgUrl} alt={`${property.title} image ${index + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <div style={{ flex: 2, marginRight: '30px' }}>
          <h2>About this space</h2>
          <p>{property.description}</p>
          <p><strong>Property Type:</strong> {property.property_type}</p>
          <p><strong>Max Guests:</strong> {property.num_guests}</p>
          <p><strong>Bedrooms:</strong> {property.num_bedrooms}</p>
          <p><strong>Beds:</strong> {property.num_beds}</p>
          <p><strong>Bathrooms:</strong> {property.num_bathrooms}</p>

          <h3>Amenities</h3>
          {property.amenities && property.amenities.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {property.amenities.map((amenity, index) => (
                <li key={index} style={{ marginBottom: '5px', paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✅</span> {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <p>No specific amenities listed.</p>
          )}
        </div>

        <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <form onSubmit={onBookingSubmit} style={bookingFormStyle}>
            <h3>₹{property.price_per_night} / night</h3>
            
            {bookingMessage && <p style={{ color: 'green', marginBottom: '10px' }}>{bookingMessage}</p>}
            {bookingError && <p style={{ color: 'red', marginBottom: '10px' }}>{bookingError}</p>}
            
            <div style={inputGroupStyle}>
              <label>Check-in</label>
              <input type="date" name="checkInDate" value={bookingData.checkInDate} onChange={onBookingChange} required style={{ padding: '8px' }} />
            </div>
            <div style={inputGroupStyle}>
              <label>Check-out</label>
              <input type="date" name="checkOutDate" value={bookingData.checkOutDate} onChange={onBookingChange} required style={{ padding: '8px' }} />
            </div>
            <div style={inputGroupStyle}>
              <label>Guests</label>
              <input type="number" name="totalGuests" value={bookingData.totalGuests} onChange={onBookingChange} min="1" max={property.num_guests} required style={{ padding: '8px' }} />
            </div>
            
            {nights > 0 && <p style={{ fontWeight: 'bold' }}>Total: ₹{totalPrice} for {nights} night(s)</p>}
            
            <button type="submit" disabled={submitting || nights <= 0} style={buttonStyle}>
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
            
          </form>
        </div>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Hosted by {property.host_first_name} {property.host_last_name}</h3>
        {property.host_profile_picture_url && (
          <img src={property.host_profile_picture_url} alt="Host Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
        )}
        <p>{property.host_bio || 'No bio available.'}</p>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Reviews (Coming Soon)</h3>
        <p>No reviews yet.</p>
      </div>
    </div>
  );
}

export default PropertyDetail;