import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cgp-backend.onrender.com'
});

export const createBooking = (bookingData) =>
  api.post('/api/bookings', bookingData);

export const getBookings = (params) =>
  api.get('/api/bookings', { params });

export default api;