import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Home from './components/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Host Components
import HostDashboard from './components/Host/HostDashboard';
import CreateProperty from './components/Host/CreateProperty';
import EditProperty from './components/Host/EditProperty'; 

// Property Components
import PropertyDetail from './components/Property/PropertyDetail'; // Import PropertyDetail

import Trips from './components/User/Trips'

// Dashboard (from previous step, can reuse for demonstration)
function Dashboard() {
  const { user, token } = useAuth();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiClient = (await import('./utils/axiosConfig')).default;
        const response = await apiClient.get('/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users in dashboard:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to fetch users.');
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);


  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;

  return (
    <div>
      <h2>Dashboard - Protected Content</h2>
      {user && <p>Hello, {user.username} ({user.role})! This content is only visible to logged-in users.</p>}

      <h3>Registered Users (from protected API)</h3>
      {users.length > 0 ? (
        <ul>
          {users.map(u => (
            <li key={u.user_id}>
              {u.username} ({u.email}) - {u.role}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users fetched yet or database is empty.</p>
      )}
    </div>
  );
}


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
        {isAuthenticated && (
          <div>
            <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link> 
            <Link to="/" >Home</Link>
            {/* Show Host Dashboard link only if user is a host */}
            {user && user.role === 'host' && (<Link to="/host/dashboard">Host Dashboard</Link>)}
            {user && user.role === 'guest' && (<Link to="/trips">Trips</Link>)} {/* Add Trips link for guests */}
            {user && user.role !== 'guest' && user.role !== 'host' && (<Link to="/dashboard">Dashboard</Link>)}
            {user && <span>Welcome, {user.username}!</span>}
          </div>
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
      <AuthProvider>
        <AuthNav />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Property Detail Route (Publicly Accessible) */}
            <Route path="/properties/:id" element={<PropertyDetail />} />

            {/* Protected Routes Group - Accessible by any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trips" element={<Trips />} /> 
            </Route>

            {/* Host Specific Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/properties/new" element={<CreateProperty />} />
              <Route path="/host/properties/edit/:id" element={<EditProperty />} />
              {/* Future host routes */}
            </Route>

            {/* Catch-all for 404 - Optional */}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;