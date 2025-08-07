import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams).toString();
    navigate(`/?${params}`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '20px' }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: 3 }}>
          <label style={{ display: 'block' }}>Location</label>
          <input type="text" name="location" value={searchParams.location} onChange={onChange} placeholder="Anywhere" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block' }}>Check-in</label>
          <input type="date" name="checkIn" value={searchParams.checkIn} onChange={onChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block' }}>Check-out</label>
          <input type="date" name="checkOut" value={searchParams.checkOut} onChange={onChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block' }}>Guests</label>
          <input type="number" name="guests" value={searchParams.guests} onChange={onChange} min="1" style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#ff5a5f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;