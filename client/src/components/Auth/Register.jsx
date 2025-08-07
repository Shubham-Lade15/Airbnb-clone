import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'guest', // Default role
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { username, email, password, firstName, lastName, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const res = await apiClient.post('/users/register', formData);
      setMessage(res.data.message);
      setSubmitting(false);
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name:</label>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={onChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={onChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Register As:</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="guest">Guest</option>
              <option value="host">Host</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-sky-600 text-white font-medium py-3 px-6 rounded-md shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;