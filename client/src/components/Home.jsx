import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';
import PropertyCard from './Property/PropertyCard';
import SearchBar from './SearchBar'; // Import the new SearchBar component

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/properties', {
          params: {
            location: searchParams.get('location'),
            checkIn: searchParams.get('checkIn'),
            checkOut: searchParams.get('checkOut'),
            guests: searchParams.get('guests'),
          },
        });
        setProperties(res.data);
      } catch (err) {
        console.error('Error fetching properties:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchParams]); // Re-fetch whenever search parameters change

  if (loading) return <p>Loading properties...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <SearchBar /> {/* Place the search bar at the top */}
      <h1>Available Properties</h1>
      {properties.length === 0 ? (
        <p>No properties match your search criteria. Please try different dates or locations.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {properties.map(property => (
            <PropertyCard key={property.property_id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;