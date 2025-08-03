import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Auth/Register'; // We'll create this soon
import Login from './components/Auth/Login';     // We'll create this soon
import Home from './components/Home';           // A simple home page

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
        <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
        <Link to="/login">Login</Link>
      </nav>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Add more routes here later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;