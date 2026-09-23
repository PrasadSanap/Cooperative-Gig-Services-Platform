import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const availableServices = [
  'electrician',
  'plumber',
  'carpenter',
  'painter',
  'helper',
  'caregiver',
  'driver',
  'gardener',
  'cleaner',
  'technician'
];

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    skills: [],
    experienceYears: '',
    bio: ''
  });

  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // --------------------------------------------------
  // Check worker authentication
  // --------------------------------------------------

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'worker') {
      navigate('/login');
      return;
    }

    fetchWorkerProfile();
    fetchAssignedBookings();
  }, [navigate]);

  // --------------------------------------------------
  // Fetch worker profile
  // --------------------------------------------------

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/workers/me');

      const workerData = response.data.worker || response.data;

      setWorker(workerData);

      setProfileForm({
        skills: workerData.skills || [],
        experienceYears:
          workerData.experienceYears !== undefined
            ? workerData.experienceYears
            : '',
        bio: workerData.bio || ''
      });
    } catch (error) {
      console.error('Fetch worker profile error:', error);

      setError(
        error.response?.data?.message ||
          'Failed to load worker profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Fetch assigned bookings
  // --------------------------------------------------

  const fetchAssignedBookings = async () => {
    try {
      setBookingsLoading(true);

      const response = await api.get('/bookings/assigned');

      setBookings(
        response.data.bookings ||
          response.data ||
          []
      );
    } catch (error) {
      console.error('Fetch assigned bookings error:', error);

      setError(
        error.response?.data?.message ||
          'Failed to load assigned bookings.'
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  // --------------------------------------------------
  // Profile form change
  // --------------------------------------------------

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // --------------------------------------------------
  // Toggle worker skill
  // --------------------------------------------------

  const toggleSkill = (service) => {
    setProfileForm((prev) => {
      const alreadySelected =
        prev.skills.includes(service);

      return {
        ...prev,
        skills: alreadySelected
          ? prev.skills.filter(
              (skill) => skill !== service
            )
          : [...prev.skills, service]
      };
    });
  };

  // --------------------------------------------------
  // Update worker profile
  // --------------------------------------------------

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setSuccess('');
      setError('');

      const response = await api.patch(
        '/workers/me',
        {
          skills: profileForm.skills,
          experienceYears: Number(
            profileForm.experienceYears
          ),
          bio: profileForm.bio
        }
      );

      const updatedWorker =
        response.data.worker ||
        response.data;

      setWorker(updatedWorker);

      setProfileForm({
        skills: updatedWorker.skills || [],
        experienceYears:
          updatedWorker.experienceYears !== undefined
            ? updatedWorker.experienceYears
            : '',
        bio: updatedWorker.bio || ''
      });

      setEditingProfile(false);

      setSuccess(
        'Worker profile updated successfully.'
      );
    } catch (error) {
      console.error(
        'Update worker profile error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Failed to update worker profile.'
      );
    }
  };

  // --------------------------------------------------
  // Update availability
  // --------------------------------------------------

  const handleAvailabilityChange = async (
    newAvailability
  ) => {
    try {
      setUpdatingAvailability(true);
      setSuccess('');
      setError('');

      const response = await api.patch(
        '/workers/availability',
        {
          availability: newAvailability
        }
      );

      const updatedWorker =
        response.data.worker ||
        response.data;

      setWorker((prev) => ({
        ...prev,
        ...updatedWorker,
        availability:
          updatedWorker.availability ||
          newAvailability
      }));

      setSuccess(
        `Availability changed to ${newAvailability}.`
      );
    } catch (error) {
      console.error(
        'Update availability error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Failed to update availability.'
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // --------------------------------------------------
  // Update booking status
  // --------------------------------------------------

  const handleBookingStatusUpdate = async (
    bookingId,
    status
  ) => {
    try {
      setUpdatingBookingId(bookingId);
      setSuccess('');
      setError('');

      await api.patch(
        `/bookings/${bookingId}/status`,
        {
          status
        }
      );

      setSuccess(
        `Booking status updated to ${formatStatus(
          status
        )}.`
      );

      await fetchAssignedBookings();
    } catch (error) {
      console.error(
        'Update booking status error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Failed to update booking status.'
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // --------------------------------------------------
  // Format service name
  // --------------------------------------------------

  const formatServiceName = (service) => {
    if (!service) return 'N/A';

    return service
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // --------------------------------------------------
  // Format booking status
  // --------------------------------------------------

  const formatStatus = (status) => {
    if (!status) return 'N/A';

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // --------------------------------------------------
  // Status style
  // --------------------------------------------------

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          background: '#fff7ed',
          color: '#c2410c'
        };

      case 'confirmed':
        return {
          background: '#eff6ff',
          color: '#1d4ed8'
        };

      case 'in_progress':
        return {
          background: '#fefce8',
          color: '#a16207'
        };

      case 'completed':
        return {
          background: '#f0fdf4',
          color: '#15803d'
        };

      case 'cancelled':
        return {
          background: '#fef2f2',
          color: '#b91c1c'
        };

      default:
        return {
          background: '#f3f4f6',
          color: '#374151'
        };
    }
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <h2>Loading Worker Dashboard...</h2>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px 20px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '25px'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: '6px'
            }}
          >
            Worker Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280'
            }}
          >
            Manage your services, availability and
            assigned bookings.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔔 Notifications
          </button>

          <button
            onClick={fetchAssignedBookings}
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0'
          }}
        >
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      )}

      {/* Worker Profile */}
      {worker && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '25px',
            boxShadow:
              '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                Worker Profile
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#6b7280'
                }}
              >
                Manage your professional information.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingProfile(
                  !editingProfile
                )
              }
              style={{
                padding: '9px 16px',
                border: 'none',
                borderRadius: '8px',
                background: '#111827',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {editingProfile
                ? 'Cancel'
                : '✏️ Edit Profile'}
            </button>
          </div>

          {!editingProfile ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}
            >
              <div>
                <strong>Name</strong>
                <p>{worker.user?.name || 'N/A'}</p>
              </div>

              <div>
                <strong>Email</strong>
                <p>{worker.user?.email || 'N/A'}</p>
              </div>

              <div>
                <strong>Phone</strong>
                <p>{worker.user?.phone || 'N/A'}</p>
              </div>

              <div>
                <strong>Cooperative ID</strong>
                <p>
                  {worker.cooperativeId || 'N/A'}
                </p>
              </div>

              <div>
                <strong>Experience</strong>
                <p>
                  {worker.experienceYears !==
                  undefined
                    ? `${worker.experienceYears} years`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <strong>Rating</strong>
                <p>
                  ⭐{' '}
                  {typeof worker.rating === 'object'
                    ? worker.rating?.average ?? 0
                    : worker.rating ?? 0}
                </p>
              </div>

              <div>
                <strong>Verification</strong>
                <p>
                  {worker.isVerified ? (
                    <span
                      style={{
                        color: '#15803d',
                        fontWeight: '600'
                      }}
                    >
                      ✓ Verified
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#b45309',
                        fontWeight: '600'
                      }}
                    >
                      ⏳ Verification Pending
                    </span>
                  )}
                </p>
              </div>

              <div>
                <strong>Availability</strong>
                <p
                  style={{
                    textTransform: 'capitalize',
                    fontWeight: '600'
                  }}
                >
                  {worker.availability ||
                    'unavailable'}
                </p>
              </div>

              <div
                style={{
                  gridColumn:
                    '1 / -1'
                }}
              >
                <strong>Skills</strong>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '8px'
                  }}
                >
                  {(worker.skills || []).length >
                  0 ? (
                    worker.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          style={{
                            padding:
                              '6px 10px',
                            borderRadius:
                              '20px',
                            background:
                              '#eff6ff',
                            color:
                              '#1d4ed8',
                            fontSize:
                              '14px',
                            fontWeight:
                              '600'
                          }}
                        >
                          {formatServiceName(
                            skill
                          )}
                        </span>
                      )
                    )
                  ) : (
                    <span>
                      No skills added.
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  gridColumn:
                    '1 / -1'
                }}
              >
                <strong>Bio</strong>
                <p
                  style={{
                    whiteSpace:
                      'pre-wrap',
                    color: '#4b5563'
                  }}
                >
                  {worker.bio ||
                    'No bio added.'}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                handleProfileUpdate
              }
            >
              <div
                style={{
                  marginBottom: '20px'
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom:
                      '10px'
                  }}
                >
                  Services / Skills
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}
                >
                  {availableServices.map(
                    (service) => {
                      const selected =
                        profileForm.skills.includes(
                          service
                        );

                      return (
                        <button
                          type="button"
                          key={service}
                          onClick={() =>
                            toggleSkill(
                              service
                            )
                          }
                          style={{
                            padding:
                              '8px 12px',
                            borderRadius:
                              '20px',
                            border:
                              selected
                                ? '2px solid #2563eb'
                                : '1px solid #d1d5db',
                            background:
                              selected
                                ? '#eff6ff'
                                : '#fff',
                            color:
                              selected
                                ? '#1d4ed8'
                                : '#374151',
                            cursor:
                              'pointer',
                            fontWeight:
                              '600'
                          }}
                        >
                          {selected
                            ? '✓ '
                            : ''}
                          {formatServiceName(
                            service
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div
                style={{
                  marginBottom: '20px'
                }}
              >
                <label
                  htmlFor="experienceYears"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom:
                      '8px'
                  }}
                >
                  Experience (Years)
                </label>

                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={
                    profileForm.experienceYears
                  }
                  onChange={
                    handleProfileChange
                  }
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxSizing:
                      'border-box'
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: '20px'
                }}
              >
                <label
                  htmlFor="bio"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom:
                      '8px'
                  }}
                >
                  Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={profileForm.bio}
                  onChange={
                    handleProfileChange
                  }
                  placeholder="Tell customers about your experience and services..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius: '8px',
                    resize: 'vertical',
                    boxSizing:
                      'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#16a34a',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save Profile
              </button>
            </form>
          )}
        </div>
      )}

      {/* Availability */}
      {worker && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '25px',
            boxShadow:
              '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2
            style={{
              marginTop: 0
            }}
          >
            Availability
          </h2>

          <p
            style={{
              color: '#6b7280'
            }}
          >
            Set whether you are currently available
            to receive new service requests.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <button
              disabled={
                updatingAvailability
              }
              onClick={() =>
                handleAvailabilityChange(
                  'available'
                )
              }
              style={{
                padding:
                  '10px 18px',
                border: 'none',
                borderRadius:
                  '8px',
                background:
                  worker.availability ===
                  'available'
                    ? '#16a34a'
                    : '#e5e7eb',
                color:
                  worker.availability ===
                  'available'
                    ? '#fff'
                    : '#374151',
                cursor:
                  updatingAvailability
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight:
                  '600'
              }}
            >
              🟢 Available
            </button>

            <button
              disabled={
                updatingAvailability
              }
              onClick={() =>
                handleAvailabilityChange(
                  'unavailable'
                )
              }
              style={{
                padding:
                  '10px 18px',
                border: 'none',
                borderRadius:
                  '8px',
                background:
                  worker.availability ===
                  'unavailable'
                    ? '#dc2626'
                    : '#e5e7eb',
                color:
                  worker.availability ===
                  'unavailable'
                    ? '#fff'
                    : '#374151',
                cursor:
                  updatingAvailability
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight:
                  '600'
              }}
            >
              🔴 Unavailable
            </button>

            <button
              disabled={
                updatingAvailability
              }
              onClick={() =>
                handleAvailabilityChange(
                  'busy'
                )
              }
              style={{
                padding:
                  '10px 18px',
                border: 'none',
                borderRadius:
                  '8px',
                background:
                  worker.availability ===
                  'busy'
                    ? '#d97706'
                    : '#e5e7eb',
                color:
                  worker.availability ===
                  'busy'
                    ? '#fff'
                    : '#374151',
                cursor:
                  updatingAvailability
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight:
                  '600'
              }}
            >
              🟠 Busy
            </button>
          </div>
        </div>
      )}

      {/* Assigned Bookings */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow:
            '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Assigned Bookings
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#6b7280'
              }}
            >
              Manage bookings assigned to you.
            </p>
          </div>

          <span
            style={{
              padding: '7px 12px',
              borderRadius: '20px',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: '600'
            }}
          >
            {bookings.length} Booking
            {bookings.length !== 1
              ? 's'
              : ''}
          </span>
        </div>

        {bookingsLoading ? (
          <div
            style={{
              padding: '30px',
              textAlign: 'center'
            }}
          >
            Loading assigned bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '10px'
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '10px'
              }}
            >
              📋
            </div>

            <h3>
              No Assigned Bookings
            </h3>

            <p
              style={{
                color: '#6b7280'
              }}
            >
              New bookings assigned to you will
              appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
                minWidth:
                  '1100px'
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      '#f9fafb'
                  }}
                >
                  <th
                    style={tableHeaderStyle}
                  >
                    Service
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Customer
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Phone
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Scheduled
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Emergency
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Address
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Amount
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Payment
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Status
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Update Status
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Booking Changes
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Feedback
                  </th>

                  <th
                    style={tableHeaderStyle}
                  >
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(
                  (booking) => {
                    const statusStyle =
                      getStatusStyle(
                        booking.status
                      );

                    return (
                      <tr
                        key={
                          booking._id
                        }
                        style={{
                          borderBottom:
                            '1px solid #e5e7eb'
                        }}
                      >
                        {/* Service */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <strong>
                            {formatServiceName(
                              booking.serviceType
                            )}
                          </strong>
                        </td>

                        {/* Customer */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {booking.customer
                            ?.name ||
                            booking.customerName ||
                            'N/A'}
                        </td>

                        {/* Phone */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {booking.customer
                            ?.phone ||
                            booking.customerPhone ||
                            'N/A'}
                        </td>

                        {/* Scheduled */}
                        <td
                          style={{
                            ...tableCellStyle,
                            minWidth:
                              '160px'
                          }}
                        >
                          {formatDate(
                            booking.scheduledAt
                          )}
                        </td>

                        {/* Emergency */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {booking.isEmergency ? (
                            <span
                              style={{
                                color:
                                  '#dc2626',
                                fontWeight:
                                  '700'
                              }}
                            >
                              🚨 Yes
                            </span>
                          ) : (
                            <span
                              style={{
                                color:
                                  '#6b7280'
                              }}
                            >
                              No
                            </span>
                          )}
                        </td>

                        {/* Address */}
                        <td
                          style={{
                            ...tableCellStyle,
                            maxWidth:
                              '220px'
                          }}
                        >
                          {booking.location
                            ?.address ||
                            'Address not available'}
                        </td>

                        {/* Amount */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          ₹
                          {booking.payment
                            ?.amount ??
                            booking.amount ??
                            0}
                        </td>

                        {/* Payment */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              fontWeight:
                                '600',
                              color:
                                booking.payment
                                  ?.status ===
                                'paid'
                                  ? '#15803d'
                                  : '#b45309'
                            }}
                          >
                            {booking.payment
                              ?.status ||
                              'unpaid'}
                          </span>
                        </td>

                        {/* Status */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              ...statusStyle,
                              display:
                                'inline-block',
                              padding:
                                '6px 10px',
                              borderRadius:
                                '20px',
                              fontSize:
                                '13px',
                              fontWeight:
                                '600',
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </span>
                        </td>

                        {/* Update Status */}
                        <td
                          style={{
                            ...tableCellStyle,
                            minWidth:
                              '180px'
                          }}
                        >
                          <select
                            value={
                              booking.status
                            }
                            disabled={
                              updatingBookingId ===
                              booking._id ||
                              booking.status ===
                                'completed' ||
                              booking.status ===
                                'cancelled'
                            }
                            onChange={(
                              e
                            ) =>
                              handleBookingStatusUpdate(
                                booking._id,
                                e.target
                                  .value
                              )
                            }
                            style={{
                              padding:
                                '8px',
                              border:
                                '1px solid #d1d5db',
                              borderRadius:
                                '6px',
                              background:
                                '#fff',
                              cursor:
                                'pointer'
                            }}
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

                        {/* Booking Changes */}
                        <td
                          style={{
                            ...tableCellStyle,
                            minWidth:
                              '220px'
                          }}
                        >
                          {booking.cancellation ? (
                            <div
                              style={{
                                marginBottom:
                                  '10px'
                              }}
                            >
                              <strong
                                style={{
                                  color:
                                    '#b91c1c'
                                }}
                              >
                                Cancellation
                              </strong>

                              <div
                                style={{
                                  fontSize:
                                    '13px',
                                  marginTop:
                                    '4px'
                                }}
                              >
                                Reason:{' '}
                                {booking
                                  .cancellation
                                  .reason ||
                                  'No reason provided'}
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    '12px',
                                  color:
                                    '#6b7280',
                                  marginTop:
                                    '3px'
                                }}
                              >
                                {formatDate(
                                  booking
                                    .cancellation
                                    .cancelledAt
                                )}
                              </div>
                            </div>
                          ) : null}

                          {booking.rescheduleHistory
                            ?.length > 0 ? (
                            <div>
                              <strong
                                style={{
                                  color:
                                    '#1d4ed8'
                                }}
                              >
                                Reschedule History
                              </strong>

                              {booking.rescheduleHistory.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    style={{
                                      marginTop:
                                        '6px',
                                      fontSize:
                                        '13px'
                                    }}
                                  >
                                    <div>
                                      {formatDate(
                                        item.previousScheduledAt
                                      )}{' '}
                                      →{' '}
                                      {formatDate(
                                        item.newScheduledAt
                                      )}
                                    </div>

                                    {item.reason && (
                                      <div
                                        style={{
                                          color:
                                            '#6b7280'
                                        }}
                                      >
                                        Reason:{' '}
                                        {
                                          item.reason
                                        }
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : null}

                          {!booking.cancellation &&
                            !booking.rescheduleHistory
                              ?.length && (
                              <span
                                style={{
                                  color:
                                    '#6b7280'
                                }}
                              >
                                No changes
                              </span>
                            )}
                        </td>

                        {/* Feedback */}
                        <td
                          style={{
                            ...tableCellStyle,
                            minWidth:
                              '220px'
                          }}
                        >
                          {booking.feedback ? (
                            <div>
                              <div
                                style={{
                                  fontWeight:
                                    '700',
                                  marginBottom:
                                    '4px'
                                }}
                              >
                                {'⭐'.repeat(
                                  booking
                                    .feedback
                                    .rating ||
                                    0
                                )}
                                <span
                                  style={{
                                    marginLeft:
                                      '5px'
                                  }}
                                >
                                  {booking
                                    .feedback
                                    .rating ||
                                    0}
                                  /5
                                </span>
                              </div>

                              {booking.feedback
                                .comment && (
                                <div
                                  style={{
                                    color:
                                      '#4b5563',
                                    fontSize:
                                      '13px'
                                  }}
                                >
                                  "
                                  {
                                    booking
                                      .feedback
                                      .comment
                                  }
                                  "
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{
                                color:
                                  '#6b7280'
                              }}
                            >
                              No feedback yet
                            </span>
                          )}
                        </td>

                        {/* Details */}
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <button
                            onClick={() =>
                              navigate(
                                `/booking/${booking._id}`
                              )
                            }
                            style={{
                              padding:
                                '8px 12px',
                              border:
                                'none',
                              borderRadius:
                                '6px',
                              background:
                                '#2563eb',
                              color:
                                '#fff',
                              cursor:
                                'pointer',
                              fontWeight:
                                '600',
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --------------------------------------------------
// Table styles
// --------------------------------------------------

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '13px',
  fontWeight: '700',
  color: '#374151',
  whiteSpace: 'nowrap'
};

const tableCellStyle = {
  padding: '14px 12px',
  verticalAlign: 'top',
  fontSize: '14px',
  color: '#374151'
};

export default WorkerDashboard;