import axios from 'axios';

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://cgp-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL
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

// ======================================================
// BOOKING APIs
// ======================================================

export const createBooking = (bookingData) =>
  api.post('/bookings', bookingData);

export const getBookings = (params) =>
  api.get('/bookings', { params });

export const getMyBookings = () =>
  api.get('/bookings/my-bookings');

export const submitFeedback = (
  bookingId,
  feedbackData
) =>
  api.post(
    `/bookings/${bookingId}/feedback`,
    feedbackData
  );

export const markPaymentAsPaid = (bookingId) =>
  api.patch(`/bookings/${bookingId}/payment`);

// ======================================================
// ADMIN APIs
// ======================================================

export const getAdminStats = () =>
  api.get('/admin/stats');

export const getAdminWorkers = () =>
  api.get('/admin/workers');

export const verifyWorker = (workerId) =>
  api.put(`/admin/workers/${workerId}/verify`);

export const unverifyWorker = (workerId) =>
  api.put(`/admin/workers/${workerId}/unverify`);

// Update worker availability
export const updateWorkerAvailability = (
  workerId,
  availability
) =>
  api.put(
    `/admin/workers/${workerId}/availability`,
    {
      availability
    }
  );

export const getAdminBookings = () =>
  api.get('/admin/bookings');

export const assignWorker = (
  bookingId,
  workerId
) =>
  api.patch(
    `/admin/bookings/${bookingId}/assign`,
    {
      workerId
    }
  );

export const updateAdminBookingStatus = (
  bookingId,
  status
) =>
  api.patch(
    `/admin/bookings/${bookingId}/status`,
    {
      status
    }
  );

// ======================================================
// NOTIFICATION APIs
// ======================================================

// Get all notifications
export const getNotifications = () =>
  api.get('/notifications');

// Get unread notification count
export const getUnreadNotificationCount = () =>
  api.get('/notifications/unread-count');

// Mark one notification as read
export const markNotificationAsRead = (
  notificationId
) =>
  api.patch(
    `/notifications/${notificationId}/read`
  );

// Mark all notifications as read
export const markAllNotificationsAsRead = () =>
  api.patch('/notifications/read-all');

// Delete one notification
export const deleteNotification = (
  notificationId
) =>
  api.delete(
    `/notifications/${notificationId}`
  );

// ======================================================
// DEFAULT API
// ======================================================

export default api;