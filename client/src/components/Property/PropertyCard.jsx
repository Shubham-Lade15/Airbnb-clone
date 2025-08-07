import React from 'react';
import { Link } from 'react-router-dom';

function PropertyCard({ property }) {
  if (!property) return null;

  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const averageRating = parseFloat(property.average_rating).toFixed(2);
  const displayRating = property.review_count > 0 ? `${averageRating} ★ (${property.review_count})` : 'New';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md transition-transform duration-200 hover:scale-105">
      <Link to={`/properties/${property.property_id}`} className="block">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <p className="text-gray-600 mb-1">{property.city}, {property.country}</p>
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-gray-900">
              ₹{property.price_per_night} / night
            </p>
            <p className="text-sm text-gray-500">
              {displayRating}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {property.num_guests} guests · {property.num_bedrooms} beds · {property.num_bathrooms} baths
          </p>
        </div>
      </Link>
    </div>
  );
}

export default PropertyCard;