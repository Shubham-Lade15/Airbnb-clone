import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';
import PropertyCard from './Property/PropertyCard';
import SearchBar from './SearchBar';

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
  }, [searchParams]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading properties...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 mt-8">
      <SearchBar />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Available Properties</h1>
      {properties.length === 0 ? (
        <p className="text-center text-gray-500">No properties match your search criteria. Please try different dates or locations.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.property_id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;