import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    checkInDate: '', checkOutDate: '', totalGuests: 1,
  });
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);

  // Fetch property details and reviews
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const propertyRes = await apiClient.get(`/properties/${id}`);
        setProperty(propertyRes.data);
        const reviewsRes = await apiClient.get(`/reviews/property/${id}`);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Error fetching property details:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [id, reviewSubmitted]); // Refetch when a new review is submitted

  // Check review eligibility for logged-in guest
  useEffect(() => {
    if (isAuthenticated && user.role === 'guest' && !reviewSubmitted) {
      const checkEligibility = async () => {
        try {
          const res = await apiClient.get(`/bookings/check-review-eligibility/${id}`);
          setReviewEligibility(res.data);
        } catch (err) {
          console.error('Error checking review eligibility:', err);
          // If no completed booking, backend returns 404, we'll just set eligibility to null
          setReviewEligibility(null);
        }
      };
      checkEligibility();
    }
  }, [id, isAuthenticated, user, reviewSubmitted]);

  // Booking form logic
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
    setSubmittingBooking(true);

    if (!isAuthenticated) { setBookingError('You must be logged in to book.'); setSubmittingBooking(false); return; }
    if (user.role === 'host') { setBookingError('Hosts cannot book their own properties.'); setSubmittingBooking(false); return; }

    try {
      const res = await apiClient.post('/bookings', { propertyId: property.property_id, ...bookingData });
      setBookingMessage(res.data.message);
      setSubmittingBooking(false);
      navigate('/trips', { state: { bookingMessage: res.data.message } });
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err);
      setBookingError(err.response?.data?.message || 'Failed to create booking.');
      setSubmittingBooking(false);
    }
  };

  // Review form logic
  const onReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });
  };

  const onReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
        await apiClient.post('/reviews', {
            propertyId: property.property_id,
            bookingId: reviewEligibility.bookingId,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
        });
        setReviewSubmitted(true); // Trigger refetch of reviews
        setReviewForm({ rating: 0, comment: '' }); // Clear form
    } catch (err) {
        console.error('Error submitting review:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
        setSubmittingReview(false);
    }
  };

  if (loading) return <p>Loading property details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!property) return <p>Property not found.</p>;

  const bookingFormStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
  const buttonStyle = { padding: '12px', backgroundColor: '#ff5a5f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer', marginTop: '10px' };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
      <h1>{property.title}</h1>
      <p style={{ color: '#555', fontSize: '1.1em' }}>{property.city}, {property.state}, {property.country}</p>

      {/* ... (Existing Image Gallery) ... */}
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
            <button type="submit" disabled={submittingBooking || nights <= 0} style={buttonStyle}>
              {submittingBooking ? 'Booking...' : 'Book Now'}
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
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Reviews
          <span style={{ fontSize: '1.2em' }}>{property.review_count > 0 ? `${parseFloat(property.average_rating).toFixed(2)} ★ (${property.review_count})` : 'New'}</span>
        </h3>
        
        {/* Review Submission Form */}
        {isAuthenticated && user.role === 'guest' && reviewEligibility && !reviewSubmitted && (
          <form onSubmit={onReviewSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>Leave a Review</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label>Rating:</label>
                <select name="rating" value={reviewForm.rating} onChange={onReviewChange} required>
                    <option value="0">Select</option>
                    <option value="1">1 ★</option>
                    <option value="2">2 ★</option>
                    <option value="3">3 ★</option>
                    <option value="4">4 ★</option>
                    <option value="5">5 ★</option>
                </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Comment:</label>
                <textarea name="comment" value={reviewForm.comment} onChange={onReviewChange} style={{ width: '100%', minHeight: '80px' }}></textarea>
            </div>
            <button type="submit" disabled={submittingReview} style={{ padding: '8px 15px', backgroundColor: '#ff5a5f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
        
        {/* Display existing reviews */}
        {reviews.length === 0 ? (
          <p>Be the first to leave a review!</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {reviews.map(review => (
              <div key={review.review_id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <img src={review.profile_picture_url || 'https://via.placeholder.com/40'} alt={`${review.first_name}`} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{review.first_name} {review.last_name}</p>
                    <span style={{ fontSize: '0.9em', color: '#777' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0 0 10px 0' }}>{'★'.repeat(review.rating)}</p>
                <p style={{ margin: 0 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetail;