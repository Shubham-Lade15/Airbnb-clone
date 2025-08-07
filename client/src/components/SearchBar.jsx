import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SearchBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(formData).toString();
    navigate(`/?${params}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end">
        <div className="w-full md:w-auto flex-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Anywhere"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full md:w-auto flex-1">
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            id="checkIn"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full md:w-auto flex-1">
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            id="checkOut"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full md:w-auto flex-1">
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Guests</label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto flex-shrink-0 px-6 py-2 bg-sky-600 text-white font-medium rounded-md shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;