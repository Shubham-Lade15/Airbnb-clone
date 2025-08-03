import React from 'react';
import { Link } from 'react-router-dom';

function PropertyCard({ property }) {
  if (!property) return null;

  const imageUrl = property.images && property.images.length > 0
    ? property.images[0] // Display the first image
    : 'https://via.placeholder.com/300x200?text=No+Image'; // Placeholder if no image

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
      }
    }}>
      <Link to={`/properties/${property.property_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={imageUrl}
          alt={property.title}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <div style={{ padding: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{property.title}</h3>
          <p style={{ margin: '0 0 5px 0', color: '#555' }}>{property.city}, {property.country}</p>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.1em' }}>
            ₹{property.price_per_night} / night
          </p>
          <p style={{ margin: '0', fontSize: '0.9em', color: '#777' }}>
            {property.num_guests} guests · {property.num_bedrooms} beds · {property.num_bathrooms} baths
          </p>
        </div>
      </Link>
    </div>
  );
}

export default PropertyCard;