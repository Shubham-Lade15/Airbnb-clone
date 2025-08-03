import React, { useEffect, useState } from 'react';
import apiClient from '../utils/axiosConfig'; // Your configured axios instance
import PropertyCard from './Property/PropertyCard'; // Import the PropertyCard

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await apiClient.get('/properties'); // Fetch all properties
        setProperties(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to load properties.');
        setLoading(false);
      }
    };

    fetchProperties();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) return <p>Loading properties...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (properties.length === 0) return <p>No properties listed yet. Be the first to list one!</p>;

  return (
    <div>
      <h1>Available Properties</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Responsive grid
        gap: '20px',
        marginTop: '20px'
      }}>
        {properties.map(property => (
          <PropertyCard key={property.property_id} property={property} />
        ))}
      </div>
    </div>
  );
}

export default Home;