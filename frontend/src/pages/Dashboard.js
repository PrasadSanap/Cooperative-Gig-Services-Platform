import React, { useEffect, useState } from 'react';
import {
  getAdminWorkers,
  getAdminBookings,
  assignWorker
} from '../services/api';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setMessage('');

      const [bookingsResponse, workersResponse] = await Promise.all([
        getAdminBookings(),
        getAdminWorkers()
      ]);

      const bookingsData = Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : [];

      const workersData = Array.isArray(workersResponse.data)
        ? workersResponse.data
        : [];

      console.log('Admin bookings:', bookingsData);
      console.log('Admin workers:', workersData);

      setBookings(bookingsData);
      setWorkers(workersData);
    } catch (error) {
      console.error(
        'Error loading admin dashboard:',
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
        'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleWorkerSelection = (bookingId, workerId) => {
    setSelectedWorkers((previous) => ({
      ...previous,
      [bookingId]: workerId
    }));
  };

  const handleAssignWorker = async (bookingId) => {
    const workerId = selectedWorkers[bookingId];

    if (!workerId) {
      alert('Please select a worker first');
      return;
    }

    try {
      setAssigning(bookingId);

      const response = await assignWorker(
        bookingId,
        workerId
      );

      alert(
        response.data.message ||
        'Worker assigned successfully'
      );

      setSelectedWorkers((previous) => {
        const updated = { ...previous };
        delete updated[bookingId];
        return updated;
      });

      await fetchDashboardData();
    } catch (error) {
      console.error(
        'Error assigning worker:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        'Failed to assign worker'
      );
    } finally {
      setAssigning(null);
    }
  };

  const getMatchingWorkers = (serviceType) => {
    if (!serviceType) {
      return [];
    }

    return workers.filter((worker) =>
      worker.skills?.some(
        (skill) =>
          skill.toLowerCase() === serviceType.toLowerCase()
      )
    );
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '3rem auto',
        padding: '0 1rem'
      }}
    >
      <h1>Admin Dashboard</h1>

      {loading && <p>Loading dashboard...</p>}

      {message && (
        <p style={{ color: 'red' }}>
          {message}
        </p>
      )}

      {!loading && !message && (
        <>
          <h2>All Bookings</h2>

          {bookings.length === 0 && (
            <p>No bookings found.</p>
          )}

          {bookings.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table
                border="1"
                cellPadding="10"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '1rem'
                }}
              >
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Worker</th>
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Assign Worker</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const matchingWorkers =
                      getMatchingWorkers(
                        booking.serviceType
                      );

                    return (
                      <tr key={booking._id}>
                        <td>
                          {booking.serviceType || 'N/A'}
                        </td>

                        <td>
                          {booking.customer?.name ||
                            'Unknown'}
                        </td>

                        <td>
                          {booking.worker?.user?.name ||
                            'Not Assigned'}
                        </td>

                        <td>
                          {booking.location?.address ||
                            'N/A'}
                        </td>

                        <td>
                          ₹{booking.payment?.amount || 0}
                        </td>

                        <td>
                          {booking.payment?.status ||
                            'unpaid'}
                        </td>

                        <td>
                          {booking.status || 'pending'}
                        </td>

                        <td>
                          {!booking.worker ? (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                minWidth: '200px'
                              }}
                            >
                              <select
                                value={
                                  selectedWorkers[
                                    booking._id
                                  ] || ''
                                }
                                onChange={(e) =>
                                  handleWorkerSelection(
                                    booking._id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select Worker
                                </option>

                                {matchingWorkers.length > 0 ? (
                                  matchingWorkers.map(
                                    (worker) => (
                                      <option
                                        key={worker._id}
                                        value={worker._id}
                                      >
                                        {worker.user?.name ||
                                          'Unnamed Worker'}
                                        {' - '}
                                        {worker.availability}
                                        {' - '}
                                        {worker.isVerified
                                          ? 'Verified'
                                          : 'Not Verified'}
                                      </option>
                                    )
                                  )
                                ) : (
                                  <option disabled>
                                    No worker for this service
                                  </option>
                                )}
                              </select>

                              <button
                                onClick={() =>
                                  handleAssignWorker(
                                    booking._id
                                  )
                                }
                                disabled={
                                  !selectedWorkers[
                                    booking._id
                                  ] ||
                                  assigning === booking._id
                                }
                              >
                                {assigning === booking._id
                                  ? 'Assigning...'
                                  : 'Assign Worker'}
                              </button>

                              {matchingWorkers.length > 0 && (
                                <small>
                                  {
                                    matchingWorkers.length
                                  } worker
                                  {matchingWorkers.length !==
                                  1
                                    ? 's'
                                    : ''}{' '}
                                  available for this
                                  service
                                </small>
                              )}
                            </div>
                          ) : (
                            <strong>Assigned</strong>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;