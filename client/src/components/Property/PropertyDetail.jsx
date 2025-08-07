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
  }, [id, reviewSubmitted]);

  useEffect(() => {
    if (isAuthenticated && user.role === 'guest' && !reviewSubmitted) {
      const checkEligibility = async () => {
        try {
          const res = await apiClient.get(`/bookings/check-review-eligibility/${id}`);
          setReviewEligibility(res.data);
        } catch (err) {
          console.error('Error checking review eligibility:', err);
          setReviewEligibility(null);
        }
      };
      checkEligibility();
    }
  }, [id, isAuthenticated, user, reviewSubmitted]);

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
        setReviewSubmitted(true);
        setReviewForm({ rating: 0, comment: '' });
    } catch (err) {
        console.error('Error submitting review:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
        setSubmittingReview(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading property details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!property) return <p className="text-center mt-10 text-gray-500">Property not found.</p>;

  const averageRating = parseFloat(property.average_rating).toFixed(2);
  const displayRating = property.review_count > 0 ? `${averageRating} ★ (${property.review_count})` : 'New';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {property.images && property.images.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`${property.title} image ${index + 1}`} className="w-full h-64 object-cover" />
          ))}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{property.title}</h1>
              <p className="text-lg text-gray-600">{property.city}, {property.state}, {property.country}</p>
            </div>
            <span className="text-lg font-medium text-gray-600">{displayRating}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">About this space</h2>
              <p className="text-gray-700 mb-4">{property.description}</p>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <p><strong>Property Type:</strong> {property.property_type}</p>
                <p><strong>Max Guests:</strong> {property.num_guests}</p>
                <p><strong>Bedrooms:</strong> {property.num_bedrooms}</p>
                <p><strong>Beds:</strong> {property.num_beds}</p>
                <p><strong>Bathrooms:</strong> {property.num_bathrooms}</p>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Amenities</h3>
              {property.amenities && property.amenities.length > 0 ? (
                <ul className="grid grid-cols-2 gap-1 text-gray-700 list-disc list-inside">
                  {property.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific amenities listed.</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-inner md:col-span-1">
              <form onSubmit={onBookingSubmit}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">₹{property.price_per_night} / night</h3>
                {bookingMessage && <p className="text-green-500 mb-4">{bookingMessage}</p>}
                {bookingError && <p className="text-red-500 mb-4">{bookingError}</p>}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in</label>
                      <input type="date" name="checkInDate" value={bookingData.checkInDate} onChange={onBookingChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out</label>
                      <input type="date" name="checkOutDate" value={bookingData.checkOutDate} onChange={onBookingChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Guests</label>
                    <input type="number" name="totalGuests" value={bookingData.totalGuests} onChange={onBookingChange} min="1" max={property.num_guests} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  {nights > 0 && <p className="text-lg font-semibold mt-4">Total: ₹{totalPrice} for {nights} night(s)</p>}
                  <button type="submit" disabled={submittingBooking || nights <= 0} className="w-full bg-sky-600 text-white font-medium py-3 rounded-md shadow-md hover:bg-sky-700 transition-colors disabled:opacity-50">
                    {submittingBooking ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reviews</h3>
            {isAuthenticated && user.role === 'guest' && reviewEligibility && !reviewSubmitted && (
              <form onSubmit={onReviewSubmit} className="bg-gray-50 p-6 rounded-xl shadow-inner mb-6">
                <h4 className="text-lg font-semibold mb-4">Leave a Review</h4>
                <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Rating:</label>
                    <select name="rating" value={reviewForm.rating} onChange={onReviewChange} required className="p-2 border rounded-md">
                        <option value="0">Select</option>
                        <option value="1">1 ★</option>
                        <option value="2">2 ★</option>
                        <option value="3">3 ★</option>
                        <option value="4">4 ★</option>
                        <option value="5">5 ★</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Comment:</label>
                    <textarea name="comment" value={reviewForm.comment} onChange={onReviewChange} className="mt-1 block w-full p-2 border rounded-md min-h-[100px]"></textarea>
                </div>
                <button type="submit" disabled={submittingReview} className="bg-sky-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-sky-700 transition-colors disabled:opacity-50">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            {reviews.length === 0 ? (
              <p className="text-gray-500">Be the first to leave a review!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.review_id} className="border-b pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <img src={review.profile_picture_url || 'https://via.placeholder.com/40'} alt={`${review.first_name}`} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-gray-800">{review.first_name} {review.last_name}</p>
                        <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{'★'.repeat(review.rating)}</p>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;