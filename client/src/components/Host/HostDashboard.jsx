import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../../context/AuthContext';

function HostDashboard() {
  const { user } = useAuth();
  const location = useLocation(); // Get the location object
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Optionally clear the message after some time
      const timer = setTimeout(() => {
        setSuccessMessage('');
        // Clear the state from location history to prevent it from reappearing on back/forward
        window.history.replaceState({}, document.title);
      }, 5000); // Message disappears after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [location.state]); // Re-run effect when location state changes

  if (!user || user.role !== 'host') {
    return <p>You must be a host to view this page.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Host Dashboard</h1>
      <p>Welcome, {user.firstName} {user.lastName}!</p>

      {successMessage && (
        <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          {successMessage}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Your Listings</h3>
        {/* Placeholder for future host listings */}
        <p>You have no active listings yet.</p>
        <Link to="/host/properties/new" style={{
          display: 'inline-block', padding: '10px 20px', backgroundColor: '#28a745', color: 'white',
          textDecoration: 'none', borderRadius: '5px', marginTop: '10px'
        }}>
          List a New Property
        </Link>
      </div>
      {/* Other host management sections */}
    </div>
  );
}

export default HostDashboard;