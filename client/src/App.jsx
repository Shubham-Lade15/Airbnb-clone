import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Home from './components/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute'; // Import ProtectedRoute

// Dummy Dashboard component
function Dashboard() {
  const { user, token } = useAuth();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Example of an authenticated API call using the configured axios instance
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Import the configured axios instance
        const apiClient = (await import('./utils/axiosConfig')).default;
        const response = await apiClient.get('/users'); // This will automatically include the token
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users in dashboard:', err.response?.data || err);
        setError(err.response?.data?.message || 'Failed to fetch users.');
        setLoading(false);
      }
    };

    if (token) { // Only fetch if authenticated (token exists)
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
          <>
            <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
            {user && <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>Welcome, {user.username || user.firstName}!</span>}
          </>
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

            {/* Protected Routes Group */}
            <Route element={<ProtectedRoute />}>
              {/* Routes nested here will require authentication */}
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Future routes like /properties/create, /bookings, /profile etc. will go here */}
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;