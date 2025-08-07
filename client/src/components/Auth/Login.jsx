import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await apiClient.post('/users/login', formData);
      login(res.data.token, res.data.user);
      setMessage(res.data.message);
      navigate('/');
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
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
          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-medium py-3 px-6 rounded-md shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;