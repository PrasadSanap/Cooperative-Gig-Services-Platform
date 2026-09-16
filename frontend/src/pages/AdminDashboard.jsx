import React, { useEffect, useState } from 'react';
import {
  getAdminStats,
  getAdminWorkers,
  verifyWorker,
  getAdminBookings,
  assignWorker,
  updateAdminBookingStatus
} from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, workersRes, bookingsRes] = await Promise.all([
        getAdminStats(),
        getAdminWorkers(),
        getAdminBookings()
      ]);

      console.log('ADMIN WORKERS RESPONSE:', workersRes.data);
      console.log('ADMIN BOOKINGS RESPONSE:', bookingsRes.data);

      const workerData = Array.isArray(workersRes.data)
        ? workersRes.data
        : workersRes.data.workers || [];

      const bookingData = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data.bookings || [];

      setStats(statsRes.data);
      setWorkers(workerData);
      setBookings(bookingData);
    } catch (err) {
      console.error(
        'Admin dashboard error:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load admin dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleVerifyWorker = async (workerId) => {
    try {
      setMessage('');
      setError('');

      const res = await verifyWorker(workerId);

      setMessage(
        res.data.message || 'Worker verified successfully'
      );

      await loadDashboardData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to verify worker'
      );
    }
  };

  const handleWorkerSelection = (bookingId, workerId) => {
    setSelectedWorkers((previous) => ({
      ...previous,
      [bookingId]: workerId
    }));
  };

  const handleAssignWorker = async (bookingId) => {
    const workerId = selectedWorkers[bookingId];

    if (!workerId) {
      setError('Please select a worker first.');
      setMessage('');
      return;
    }

    try {
      setAssigning(bookingId);
      setMessage('');
      setError('');

      const res = await assignWorker(
        bookingId,
        workerId
      );

      setMessage(
        res.data.message || 'Worker assigned successfully'
      );

      setSelectedWorkers((previous) => ({
        ...previous,
        [bookingId]: ''
      }));

      await loadDashboardData();
    } catch (err) {
      console.error(
        'Assign worker error:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to assign worker'
      );
    } finally {
      setAssigning('');
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      setMessage('');
      setError('');

      const res = await updateAdminBookingStatus(
        bookingId,
        status
      );

      setMessage(
        res.data.message ||
        'Booking status updated successfully'
      );

      await loadDashboardData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update booking status'
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '3rem auto',
          padding: '0 1rem'
        }}
      >
        <h1>Admin Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}
    >
      <h1>Admin Dashboard</h1>

      {error && (
        <div
          style={{
            margin: '1rem 0',
            padding: '12px',
            background: '#ffe5e5',
            color: '#b00020',
            borderRadius: '6px'
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            margin: '1rem 0',
            padding: '12px',
            background: '#e8f5e9',
            color: '#176b2c',
            borderRadius: '6px'
          }}
        >
          {message}
        </div>
      )}

      <h2>Platform Statistics</h2>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '35px'
          }}
        >
          <div>
            <strong>Total Users:</strong>{' '}
            {stats.totalUsers}
          </div>

          <div>
            <strong>Customers:</strong>{' '}
            {stats.totalCustomers}
          </div>

          <div>
            <strong>Workers:</strong>{' '}
            {stats.totalWorkers}
          </div>

          <div>
            <strong>Total Bookings:</strong>{' '}
            {stats.totalBookings}
          </div>

          <div>
            <strong>Confirmed:</strong>{' '}
            {stats.confirmedBookings}
          </div>

          <div>
            <strong>In Progress:</strong>{' '}
            {stats.inProgressBookings}
          </div>

          <div>
            <strong>Completed:</strong>{' '}
            {stats.completedBookings}
          </div>

          <div>
            <strong>Cancelled:</strong>{' '}
            {stats.cancelledBookings}
          </div>

          <div>
            <strong>Paid Bookings:</strong>{' '}
            {stats.paidBookings}
          </div>

          <div>
            <strong>Unpaid Bookings:</strong>{' '}
            {stats.unpaidBookings}
          </div>

          <div>
            <strong>Total Revenue:</strong>{' '}
            ₹{stats.totalRevenue}
          </div>

          <div>
            <strong>Available Workers:</strong>{' '}
            {stats.availableWorkers}
          </div>

          <div>
            <strong>Verified Workers:</strong>{' '}
            {stats.verifiedWorkers}
          </div>
        </div>
      )}

      <h2>Worker Management</h2>

      <div
        style={{
          overflowX: 'auto',
          marginBottom: '40px'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Name
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Skills
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Experience
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Availability
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Verified
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    textAlign: 'center'
                  }}
                >
                  No workers found.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker._id}>
                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.user?.name || 'Unknown'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.skills?.length > 0
                      ? worker.skills.join(', ')
                      : 'No services selected'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.experienceYears || 0} years
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.availability}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.isVerified
                      ? 'Yes ✓'
                      : 'No'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {worker.isVerified ? (
                      <span>Already Verified</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleVerifyWorker(worker._id)
                        }
                      >
                        Verify Worker
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2>All Bookings</h2>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Service
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Customer
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Worker
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Address
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Amount
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Payment
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Status
              </th>

              <th style={{ border: '1px solid #ccc', padding: '10px' }}>
                Assign Worker
              </th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    textAlign: 'center'
                  }}
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {booking.serviceType || 'N/A'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {booking.customer?.name || 'Unknown'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {booking.worker?.user?.name || 'Not Assigned'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {booking.location?.address || 'N/A'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    ₹{booking.payment?.amount || 0}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    {booking.payment?.status || 'unpaid'}
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  >
                    <select
                      value={booking.status || 'pending'}
                      onChange={(e) =>
                        handleStatusChange(
                          booking._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </td>

                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      minWidth: '220px'
                    }}
                  >
                    {booking.worker ? (
                      <strong>Assigned</strong>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <select
                          value={
                            selectedWorkers[booking._id] || ''
                          }
                          onChange={(e) =>
                            handleWorkerSelection(
                              booking._id,
                              e.target.value
                            )
                          }
                          style={{
                            padding: '6px',
                            width: '100%'
                          }}
                        >
                          <option value="">
                            Select Worker
                          </option>

                          {workers.map((worker) => (
                            <option
                              key={worker._id}
                              value={worker._id}
                            >
                              {worker.user?.name || 'Unknown Worker'}
                              {' - '}
                              {worker.availability || 'offline'}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={
                            !selectedWorkers[booking._id] ||
                            assigning === booking._id
                          }
                          onClick={() =>
                            handleAssignWorker(
                              booking._id
                            )
                          }
                        >
                          {assigning === booking._id
                            ? 'Assigning...'
                            : 'Assign Worker'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;