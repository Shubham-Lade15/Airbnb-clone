import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Home from './components/Home';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth

// Component for conditional navigation links
function AuthNav() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
        {!isAuthenticated && (
          <>
            <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {isAuthenticated && user && (
          <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>Welcome, {user.username || user.firstName}!</span>
        )}
      </div>
      {isAuthenticated && (
        <button
          onClick={logout}
          style={{
            padding: '8px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire application with AuthProvider */}
        <AuthNav /> {/* Use the new conditional navigation component */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* More routes will go here */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;