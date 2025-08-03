import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To get ID from URL
import apiClient from '../../utils/axiosConfig'; // Your configured axios instance

function PropertyDetail() {
  const { id } = useParams(); // Get the 'id' from the URL
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [id]); // Re-fetch if ID changes

  if (loading) return <p>Loading property details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!property) return <p>Property not found.</p>; // Should be caught by 404 from API, but good fallback

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
      <h1>{property.title}</h1>
      <p style={{ color: '#555', fontSize: '1.1em' }}>{property.city}, {property.state}, {property.country}</p>

      {/* Image Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginTop: '20px' }}>
        {property.images && property.images.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={`${property.title} image ${index + 1}`}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
          />
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
          <h3>Price: ₹{property.price_per_night} / night</h3>
          {/* Booking form will go here later */}
          <button style={{ width: '100%', padding: '12px', backgroundColor: '#ff5a5f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer', marginTop: '20px' }}>
            Check Availability (Coming Soon)
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Hosted by {property.host_first_name} {property.host_last_name}</h3>
        {property.host_profile_picture_url && (
          <img src={property.host_profile_picture_url} alt="Host Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
        )}
        <p>{property.host_bio || 'No bio available.'}</p>
      </div>

      {/* Reviews section will go here later */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Reviews (Coming Soon)</h3>
        <p>No reviews yet.</p>
      </div>
    </div>
  );
}

export default PropertyDetail;