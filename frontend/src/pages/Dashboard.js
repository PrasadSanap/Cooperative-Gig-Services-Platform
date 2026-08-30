// Cooperative federation admin dashboard (stub — extend with charts/tables)
import React, { useEffect, useState } from 'react';
import { getBookings } from '../services/api';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getBookings()
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Dashboard — All Bookings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Service</th><th>Status</th><th>Scheduled</th><th>Emergency</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.serviceType}</td>
              <td>{b.status}</td>
              <td>{new Date(b.scheduledAt).toLocaleString()}</td>
              <td>{b.isEmergency ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;