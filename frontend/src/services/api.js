// Centralized Axios instance for calling the backend API
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

// Sample function consumed by BookingForm component
export const createBooking = (bookingData) => api.post('/bookings', bookingData);

export const getBookings = (params) => api.get('/bookings', { params });

export default api;