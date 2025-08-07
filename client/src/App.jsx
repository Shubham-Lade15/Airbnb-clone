import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Home from './components/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import HostDashboard from './components/Host/HostDashboard';
import CreateProperty from './components/Host/CreateProperty';
import EditProperty from './components/Host/EditProperty';
import PropertyDetail from './components/Property/PropertyDetail';
import Trips from './components/User/Trips';

// Component for conditional navigation links
function AuthNav() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-sky-600">Airbnb Clone</Link>
        {isAuthenticated && user && user.role === 'host' && (
          <Link to="/host/dashboard" className="text-gray-600 hover:text-sky-600 font-medium">Host Dashboard</Link>
        )}
        {isAuthenticated && user && user.role === 'guest' && (
          <Link to="/trips" className="text-gray-600 hover:text-sky-600 font-medium">Trips</Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {!isAuthenticated && (
          <>
            <Link to="/register" className="text-gray-600 hover:text-sky-600 font-medium">Register</Link>
            <Link to="/login" className="text-gray-600 hover:text-sky-600 font-medium">Login</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span className="text-gray-800 font-semibold hidden md:block">Welcome, {user.firstName}!</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// Dummy Dashboard component
function Dashboard() {
  const { user, token } = useAuth();
  return (
    <div className="container mx-auto px-4 mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      {user && (
        <p className="text-lg text-gray-600">Hello, {user.username} ({user.role})! This is a placeholder dashboard for any authenticated user.</p>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthNav />
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/properties/new" element={<CreateProperty />} />
              <Route path="/host/properties/edit/:id" element={<EditProperty />} />
            </Route>

            <Route path="*" element={<h1 className="text-center text-4xl font-bold mt-20 text-gray-800">404 Not Found</h1>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;