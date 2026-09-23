import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Booking from './pages/Booking';
import BookingDetails from './pages/BookingDetails';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './components/Notifications';

const App = () => (
  <BrowserRouter>
    <Navbar />

    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Booking />
          </ProtectedRoute>
        }
      />

      {/* Booking Details */}
      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute
            allowedRoles={[
              'customer',
              'worker',
              'admin'
            ]}
          >
            <BookingDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={[
              'customer',
              'worker',
              'admin'
            ]}
          >
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />
    </Routes>
  </BrowserRouter>
);

export default App;