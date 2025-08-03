import axios from 'axios';

// Create a custom Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Use your frontend environment variable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to headers if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Optional, for handling token expiration etc.
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     // Example: if 401 Unauthorized and not a login request, try to refresh token or redirect
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       // Potentially redirect to login or attempt token refresh
//       // If you want to redirect to login on 401:
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;