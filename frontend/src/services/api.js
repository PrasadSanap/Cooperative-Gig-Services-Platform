import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createBooking = (bookingData) =>
  api.post('/bookings', bookingData);

export const getBookings = (params) =>
  api.get('/bookings', { params });

export const getMyBookings = () =>
  api.get('/bookings/my-bookings');

export const submitFeedback = (bookingId, feedbackData) =>
  api.post(`/bookings/${bookingId}/feedback`, feedbackData);

export const markPaymentAsPaid = (bookingId) =>
  api.patch(`/bookings/${bookingId}/payment`);

// Admin APIs
export const getAdminStats = () =>
  api.get('/admin/stats');

export const getAdminWorkers = () =>
  api.get('/admin/workers');

export const verifyWorker = (workerId) =>
  api.put(`/admin/workers/${workerId}/verify`);

export const getAdminBookings = () =>
  api.get('/admin/bookings');

export const assignWorker = (bookingId, workerId) =>
  api.patch(`/admin/bookings/${bookingId}/assign`, {
    workerId
  });

export const updateAdminBookingStatus = (bookingId, status) =>
  api.patch(`/admin/bookings/${bookingId}/status`, {
    status
  });

export default api;