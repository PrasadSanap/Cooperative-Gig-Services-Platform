import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const availableServices = [
  {
    value: 'electrician',
    label: '⚡ Electrician'
  },
  {
    value: 'plumber',
    label: '🔧 Plumber'
  },
  {
    value: 'carpenter',
    label: '🪚 Carpenter'
  },
  {
    value: 'painter',
    label: '🎨 Painter'
  },
  {
    value: 'helper',
    label: '🧰 Helper'
  },
  {
    value: 'caregiver',
    label: '❤️ Caregiver'
  },
  {
    value: 'driver',
    label: '🚗 Driver'
  },
  {
    value: 'gardener',
    label: '🌱 Gardener'
  },
  {
    value: 'cleaner',
    label: '🧹 Cleaner'
  },
  {
    value: 'technician',
    label: '🛠️ Technician'
  }
];

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState('offline');
  const [experienceYears, setExperienceYears] = useState(0);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] =
    useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchWorkerProfile = async () => {
    try {
      setProfileLoading(true);
      setError('');

      const response = await api.get('/workers/me');

      const workerData = response.data.worker;

      setWorker(workerData);
      setSkills(workerData.skills || []);
      setAvailability(workerData.availability || 'offline');
      setExperienceYears(workerData.experienceYears || 0);
      setBio(workerData.bio || '');
    } catch (error) {
      console.error(
        'Error loading worker profile:',
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          'Failed to load worker profile'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAssignedBookings = async () => {
    try {
      setLoading(true);

      const response = await api.get('/bookings/assigned');

      console.log(
        'Assigned bookings response:',
        response.data
      );

      const assignedBookings = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || [];

      setBookings(assignedBookings);
    } catch (error) {
      console.error(
        'Error loading assigned bookings:',
        error.response?.data || error.message
      );

      setBookings([]);

      setError(
        error.response?.data?.message ||
          'Failed to load bookings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== 'worker') {
        navigate('/');
        return;
      }

      fetchWorkerProfile();
      fetchAssignedBookings();
    } catch (error) {
      console.error('Invalid user data:', error);

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      navigate('/login');
    }
  }, [navigate]);

  const toggleSkill = (skill) => {
    setSkills((previous) => {
      if (previous.includes(skill)) {
        return previous.filter(
          (item) => item !== skill
        );
      }

      return [...previous, skill];
    });
  };

  const saveProfile = async () => {
    if (skills.length === 0) {
      setError(
        'Please select at least one service you provide.'
      );
      return;
    }

    try {
      setSavingProfile(true);
      setMessage('');
      setError('');

      const response = await api.patch(
        '/workers/me',
        {
          skills,
          experienceYears,
          bio
        }
      );

      setWorker(response.data.worker);

      setMessage(
        'Services and worker profile updated successfully.'
      );
    } catch (error) {
      console.error(
        'Error updating worker profile:',
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          'Failed to update worker profile'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changeAvailability = async (newAvailability) => {
    try {
      setUpdatingAvailability(true);
      setMessage('');
      setError('');

      const response = await api.patch(
        '/workers/availability',
        {
          availability: newAvailability
        }
      );

      setAvailability(response.data.availability);

      setWorker((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          availability: response.data.availability
        };
      });

      setMessage(
        `Your availability is now ${newAvailability}.`
      );
    } catch (error) {
      console.error(
        'Error updating availability:',
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          'Failed to update availability'
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      setMessage('');
      setError('');

      await api.patch(
        `/bookings/${bookingId}/status`,
        {
          status
        }
      );

      await fetchAssignedBookings();

      setMessage(
        'Booking status updated successfully.'
      );
    } catch (error) {
      console.error(
        'Error updating booking:',
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          'Failed to update booking status'
      );
    }
  };

  const renderFeedback = (booking) => {
    if (booking.status !== 'completed') {
      return 'Available after completion';
    }

    if (!booking.feedback?.rating) {
      return 'Customer has not submitted feedback yet';
    }

    return (
      <div>
        <strong>
          ⭐ {booking.feedback.rating}/5
        </strong>

        {booking.feedback.comment && (
          <p
            style={{
              margin: '8px 0 0',
              maxWidth: '250px'
            }}
          >
            {booking.feedback.comment}
          </p>
        )}
      </div>
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleString('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return 'Pending';
    }

    if (status === 'in_progress') {
      return 'In Progress';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const renderCancellationInfo = (booking) => {
    if (
      booking.status !== 'cancelled' ||
      !booking.cancellation
    ) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: '8px',
          background: '#fff1f1',
          border: '1px solid #f0b5b5',
          color: '#8a1c1c',
          minWidth: '240px'
        }}
      >
        <strong>❌ Cancellation Information</strong>

        <p style={{ margin: '8px 0 4px' }}>
          <strong>Cancelled by:</strong>{' '}
          {booking.cancellation.cancelledBy?.name ||
            'Customer'}
        </p>

        {booking.cancellation.reason && (
          <p style={{ margin: '4px 0' }}>
            <strong>Reason:</strong>{' '}
            {booking.cancellation.reason}
          </p>
        )}

        {booking.cancellation.cancelledAt && (
          <p style={{ margin: '4px 0' }}>
            <strong>Cancelled at:</strong>{' '}
            {formatDateTime(
              booking.cancellation.cancelledAt
            )}
          </p>
        )}
      </div>
    );
  };

  const renderRescheduleHistory = (booking) => {
    if (
      !booking.rescheduleHistory ||
      booking.rescheduleHistory.length === 0
    ) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: '8px',
          background: '#f3f7ff',
          border: '1px solid #b8ccef',
          color: '#24446f',
          minWidth: '260px'
        }}
      >
        <strong>🔄 Reschedule History</strong>

        {booking.rescheduleHistory.map(
          (history, index) => (
            <div
              key={index}
              style={{
                marginTop: '10px',
                paddingTop:
                  index === 0 ? '0' : '10px',
                borderTop:
                  index === 0
                    ? 'none'
                    : '1px solid #d6e0f2'
              }}
            >
              <p style={{ margin: '4px 0' }}>
                <strong>Previous:</strong>{' '}
                {formatDateTime(
                  history.previousScheduledAt
                )}
              </p>

              <p style={{ margin: '4px 0' }}>
                <strong>New:</strong>{' '}
                {formatDateTime(
                  history.newScheduledAt
                )}
              </p>

              {history.reason && (
                <p style={{ margin: '4px 0' }}>
                  <strong>Reason:</strong>{' '}
                  {history.reason}
                </p>
              )}

              {history.changedAt && (
                <p style={{ margin: '4px 0' }}>
                  <strong>Changed at:</strong>{' '}
                  {formatDateTime(
                    history.changedAt
                  )}
                </p>
              )}
            </div>
          )
        )}
      </div>
    );
  };

  if (profileLoading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '3rem auto',
          padding: '0 1rem'
        }}
      >
        <h1>Worker Dashboard</h1>
        <p>Loading worker profile...</p>
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
      <h1>Worker Dashboard</h1>

      {error && (
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #ffb3b3',
            color: '#b00020',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: '#ecfff3',
            border: '1px solid #9de5b7',
            color: '#16733a',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {message}
        </div>
      )}

      {/* Worker Profile */}
      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          background: '#fff'
        }}
      >
        <h2>My Worker Profile</h2>

        {worker && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '25px'
            }}
          >
            <div>
              <strong>Name</strong>
              <p>
                {worker.user?.name || 'N/A'}
              </p>
            </div>

            <div>
              <strong>Email</strong>
              <p>
                {worker.user?.email || 'N/A'}
              </p>
            </div>

            <div>
              <strong>Phone</strong>
              <p>
                {worker.user?.phone || 'N/A'}
              </p>
            </div>

            <div>
              <strong>Cooperative ID</strong>
              <p>
                {worker.cooperativeId || 'N/A'}
              </p>
            </div>

            <div>
              <strong>Verification</strong>
              <p>
                {worker.isVerified
                  ? '✅ Verified'
                  : '⏳ Waiting for Admin Verification'}
              </p>
            </div>

            <div>
              <strong>Rating</strong>
              <p>
                ⭐ {worker.rating?.average || 0}/5
              </p>
            </div>
          </div>
        )}

        <h3>Services I Provide</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '25px'
          }}
        >
          {availableServices.map((service) => {
            const selected = skills.includes(
              service.value
            );

            return (
              <button
                key={service.value}
                type="button"
                onClick={() =>
                  toggleSkill(service.value)
                }
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: selected
                    ? '2px solid #1f7a35'
                    : '1px solid #ccc',
                  background: selected
                    ? '#e9f8ee'
                    : '#fff',
                  cursor: 'pointer',
                  fontWeight: selected
                    ? 'bold'
                    : 'normal',
                  textAlign: 'left'
                }}
              >
                {service.label}

                {selected && (
                  <span
                    style={{
                      float: 'right',
                      color: '#1f7a35'
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          <div>
            <label>
              <strong>Experience (Years)</strong>
            </label>

            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) =>
                setExperienceYears(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label>
              <strong>Short Bio</strong>
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              maxLength="500"
              rows="4"
              placeholder="Tell customers about your experience..."
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '8px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={savingProfile}
          style={{
            marginTop: '20px',
            padding: '12px 22px',
            border: 'none',
            borderRadius: '8px',
            background: '#1f7a35',
            color: '#fff',
            cursor: savingProfile
              ? 'not-allowed'
              : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {savingProfile
            ? 'Saving...'
            : 'Save Services & Profile'}
        </button>
      </section>

      {/* Availability */}
      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          background: '#fff'
        }}
      >
        <h2>My Availability</h2>

        <p>
          Choose whether customers and the automatic
          matching system can assign new bookings to you.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() =>
              changeAvailability('available')
            }
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border:
                availability === 'available'
                  ? '2px solid #1f7a35'
                  : '1px solid #ccc',
              background:
                availability === 'available'
                  ? '#e9f8ee'
                  : '#fff',
              cursor: 'pointer',
              fontWeight:
                availability === 'available'
                  ? 'bold'
                  : 'normal'
            }}
          >
            🟢 Available
          </button>

          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() =>
              changeAvailability('busy')
            }
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border:
                availability === 'busy'
                  ? '2px solid #d98200'
                  : '1px solid #ccc',
              background:
                availability === 'busy'
                  ? '#fff4df'
                  : '#fff',
              cursor: 'pointer',
              fontWeight:
                availability === 'busy'
                  ? 'bold'
                  : 'normal'
            }}
          >
            🟠 Busy
          </button>

          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() =>
              changeAvailability('offline')
            }
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border:
                availability === 'offline'
                  ? '2px solid #666'
                  : '1px solid #ccc',
              background:
                availability === 'offline'
                  ? '#f1f1f1'
                  : '#fff',
              cursor: 'pointer',
              fontWeight:
                availability === 'offline'
                  ? 'bold'
                  : 'normal'
            }}
          >
            ⚫ Offline
          </button>
        </div>

        <p style={{ marginTop: '15px' }}>
          Current status:{' '}
          <strong>{availability}</strong>
        </p>

        {!worker?.isVerified && (
          <p
            style={{
              color: '#b00020',
              fontWeight: 'bold'
            }}
          >
            ⚠️ Your profile must be verified by an
            admin before you can receive automatic
            bookings.
          </p>
        )}
      </section>

      {/* Assigned Bookings */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}
        >
          <div>
            <h2 style={{ marginBottom: '5px' }}>
              My Assigned Bookings
            </h2>

            <p
              style={{
                marginTop: 0,
                color: '#666'
              }}
            >
              Manage your assigned customer service requests.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAssignedBookings}
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #1f7a35',
              background: '#fff',
              color: '#1f7a35',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Bookings
          </button>
        </div>

        {loading && (
          <p>Loading bookings...</p>
        )}

        {!loading &&
          !error &&
          bookings.length === 0 && (
            <p>No bookings assigned yet.</p>
          )}

        {!loading &&
          bookings.length > 0 && (
            <div
              style={{
                overflowX: 'auto'
              }}
            >
              <table
                border="1"
                cellPadding="10"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#fff'
                }}
              >
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Scheduled</th>
                    <th>Emergency</th>
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Update Status</th>
                    <th>Booking Changes</th>
                    <th>Customer Feedback</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>
                          {booking.serviceType ||
                            'N/A'}
                        </strong>
                      </td>

                      <td>
                        {booking.customer?.name ||
                          'Unknown'}
                      </td>

                      <td>
                        {booking.customer?.phone ||
                          'N/A'}
                      </td>

                      <td>
                        {formatDateTime(
                          booking.scheduledAt
                        )}
                      </td>

                      <td>
                        {booking.isEmergency ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '8px 12px',
                              borderRadius: '20px',
                              background: '#ffe8ed',
                              color: '#d71920',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🚨 Emergency
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#666'
                            }}
                          >
                            Normal
                          </span>
                        )}
                      </td>

                      <td>
                        {booking.location?.address ||
                          'N/A'}
                      </td>

                      <td>
                        ₹
                        {booking.payment?.amount ||
                          0}
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              booking.payment?.status ===
                              'paid'
                                ? '#16733a'
                                : '#b36b00'
                          }}
                        >
                          {booking.payment?.status ===
                          'paid'
                            ? 'Paid'
                            : 'Unpaid'}
                        </strong>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            background:
                              booking.status ===
                              'completed'
                                ? '#e7f1ff'
                                : booking.status ===
                                  'cancelled'
                                ? '#ffecec'
                                : booking.status ===
                                  'in_progress'
                                ? '#fff4df'
                                : '#e9f8ee',
                            color:
                              booking.status ===
                              'completed'
                                ? '#1769aa'
                                : booking.status ===
                                  'cancelled'
                                ? '#b00020'
                                : booking.status ===
                                  'in_progress'
                                ? '#a35a00'
                                : '#16733a'
                          }}
                        >
                          {getStatusLabel(
                            booking.status
                          )}
                        </span>
                      </td>

                      <td>
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            updateStatus(
                              booking._id,
                              e.target.value
                            )
                          }
                          disabled={
                            booking.status ===
                              'completed' ||
                            booking.status ===
                              'cancelled'
                          }
                          style={{
                            padding: '8px',
                            borderRadius: '7px',
                            border:
                              '1px solid #ccc',
                            cursor:
                              booking.status ===
                                'completed' ||
                              booking.status ===
                                'cancelled'
                                ? 'not-allowed'
                                : 'pointer'
                          }}
                        >
                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="completed">
                            Completed
                          </option>
                        </select>
                      </td>

                      <td
                        style={{
                          minWidth: '280px',
                          verticalAlign: 'top'
                        }}
                      >
                        {booking.status ===
                          'cancelled' &&
                          renderCancellationInfo(
                            booking
                          )}

                        {renderRescheduleHistory(
                          booking
                        )}

                        {booking.status !==
                          'cancelled' &&
                          (!booking.rescheduleHistory ||
                            booking.rescheduleHistory
                              .length === 0) && (
                            <span
                              style={{
                                color: '#777'
                              }}
                            >
                              No booking changes
                            </span>
                          )}
                      </td>

                      <td>
                        {renderFeedback(
                          booking
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/booking/${booking._id}`
                            )
                          }
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#1f7a35',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
};

export default WorkerDashboard;