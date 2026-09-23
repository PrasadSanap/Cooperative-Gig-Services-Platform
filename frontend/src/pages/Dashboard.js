import React, { useEffect, useMemo, useState } from 'react';
import {
getAdminWorkers,
getAdminBookings,
verifyWorker,
unverifyWorker,
assignWorker,
updateAdminBookingStatus
} from '../services/api';

const Dashboard = () => {
const [bookings, setBookings] = useState([]);
const [workers, setWorkers] = useState([]);

const [selectedWorkers, setSelectedWorkers] = useState({});

const [message, setMessage] = useState('');
const [error, setError] = useState('');

const [loading, setLoading] = useState(true);
const [assigning, setAssigning] = useState(null);
const [verifying, setVerifying] = useState(null);

// Booking filters
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [serviceFilter, setServiceFilter] = useState('all');
const [paymentFilter, setPaymentFilter] = useState('all');

// Worker filters
const [workerSearch, setWorkerSearch] = useState('');
const [workerSkillFilter, setWorkerSkillFilter] =
useState('all');
const [workerAvailabilityFilter, setWorkerAvailabilityFilter] =
useState('all');
const [workerVerificationFilter, setWorkerVerificationFilter] =
useState('all');

// Selected booking for details modal
const [selectedBooking, setSelectedBooking] =
useState(null);

// ----------------------------------------------------
// Load dashboard data
// ----------------------------------------------------

const fetchDashboardData = async () => {
try {
setLoading(true);
setError('');

  const [
    bookingsResponse,
    workersResponse
  ] = await Promise.all([
    getAdminBookings(),
    getAdminWorkers()
  ]);

  const bookingsData = Array.isArray(
    bookingsResponse.data
  )
    ? bookingsResponse.data
    : bookingsResponse.data?.bookings || [];

  const workersData = Array.isArray(
    workersResponse.data
  )
    ? workersResponse.data
    : workersResponse.data?.workers || [];

  console.log(
    'Admin bookings:',
    bookingsData
  );

  console.log(
    'Admin workers:',
    workersData
  );

  setBookings(bookingsData);
  setWorkers(workersData);

  // Keep modal data updated after refresh
  if (selectedBooking?._id) {
    const updatedBooking =
      bookingsData.find(
        (booking) =>
          booking._id ===
          selectedBooking._id
      );

    if (updatedBooking) {
      setSelectedBooking(
        updatedBooking
      );
    }
  }
} catch (err) {
  console.error(
    'Error loading admin dashboard:',
    err.response?.data || err.message
  );

  setError(
    err.response?.data?.message ||
    'Failed to load dashboard data'
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchDashboardData();
}, []);

// ----------------------------------------------------
// Worker verification / unverification
// ----------------------------------------------------

const handleVerifyWorker = async (workerId) => {
try {
setVerifying(workerId);
setMessage('');
setError('');

  const response = await verifyWorker(workerId);

  setMessage(
    response.data.message ||
    'Worker verified successfully'
  );

  await fetchDashboardData();
} catch (err) {
  console.error(
    'Verify worker error:',
    err.response?.data || err.message
  );

  setError(
    err.response?.data?.message ||
    'Failed to verify worker'
  );
} finally {
  setVerifying(null);
}

};

const handleUnverifyWorker = async (workerId) => {
try {
setVerifying(workerId);
setMessage('');
setError('');

  const response = await unverifyWorker(workerId);

  setMessage(
    response.data.message ||
    'Worker unverified successfully'
  );

  await fetchDashboardData();
} catch (err) {
  console.error(
    'Unverify worker error:',
    err.response?.data || err.message
  );

  setError(
    err.response?.data?.message ||
    'Failed to unverify worker'
  );
} finally {
  setVerifying(null);
}

};

// ----------------------------------------------------
// Worker assignment
// ----------------------------------------------------

const handleWorkerSelection = (
bookingId,
workerId
) => {
setSelectedWorkers((previous) => ({
...previous,
[bookingId]: workerId
}));
};

const handleAssignWorker = async (bookingId) => {
const workerId =
selectedWorkers[bookingId];

if (!workerId) {
  setError(
    'Please select a worker first.'
  );
  setMessage('');
  return;
}

try {
  setAssigning(bookingId);
  setMessage('');
  setError('');

  const response = await assignWorker(
    bookingId,
    workerId
  );

  setMessage(
    response.data.message ||
    'Worker assigned successfully'
  );

  setSelectedWorkers((previous) => ({
    ...previous,
    [bookingId]: ''
  }));

  await fetchDashboardData();
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
  setAssigning(null);
}

};

// ----------------------------------------------------
// Booking status
// ----------------------------------------------------

const handleStatusChange = async (
bookingId,
status
) => {
try {
setMessage('');
setError('');

  const response =
    await updateAdminBookingStatus(
      bookingId,
      status
    );

  setMessage(
    response.data.message ||
    'Booking status updated successfully'
  );

  await fetchDashboardData();
} catch (err) {
  console.error(
    'Update status error:',
    err.response?.data || err.message
  );

  setError(
    err.response?.data?.message ||
    'Failed to update booking status'
  );
}

};

// ----------------------------------------------------
// Matching workers for booking
// ----------------------------------------------------

const getMatchingWorkers = (serviceType) => {
if (!serviceType) {
return [];
}

return workers.filter((worker) => {
  const isVerified =
    worker.isVerified === true;

  const isAvailable =
    worker.availability === 'available';

  const hasRequiredSkill =
    Array.isArray(worker.skills) &&
    worker.skills.some(
      (skill) =>
        skill.toLowerCase() ===
        serviceType.toLowerCase()
    );

  return (
    isVerified &&
    isAvailable &&
    hasRequiredSkill
  );
});

};

// ----------------------------------------------------
// Booking statistics
// ----------------------------------------------------

const statistics = useMemo(() => {
return {
total: bookings.length,

  pending: bookings.filter(
    (booking) =>
      booking.status === 'pending'
  ).length,

  confirmed: bookings.filter(
    (booking) =>
      booking.status === 'confirmed'
  ).length,

  inProgress: bookings.filter(
    (booking) =>
      booking.status === 'in_progress'
  ).length,

  completed: bookings.filter(
    (booking) =>
      booking.status === 'completed'
  ).length,

  cancelled: bookings.filter(
    (booking) =>
      booking.status === 'cancelled'
  ).length,

  paid: bookings.filter(
    (booking) =>
      booking.payment?.status === 'paid'
  ).length
};

}, [bookings]);

// ----------------------------------------------------
// Worker statistics
// ----------------------------------------------------

const workerStatistics = useMemo(() => {
return {
total: workers.length,

  verified: workers.filter(
    (worker) =>
      worker.isVerified === true
  ).length,

  unverified: workers.filter(
    (worker) =>
      worker.isVerified !== true
  ).length,

  available: workers.filter(
    (worker) =>
      worker.availability === 'available'
  ).length,

  unavailable: workers.filter(
    (worker) =>
      worker.availability !== 'available'
  ).length
};

}, [workers]);

// ----------------------------------------------------
// Available worker filter options
// ----------------------------------------------------

const availableWorkerSkills = useMemo(() => {
const skills = workers.flatMap(
(worker) =>
Array.isArray(worker.skills)
? worker.skills
: []
);

return [...new Set(skills)].sort();

}, [workers]);

const availableWorkerAvailability =
useMemo(() => {
return [
...new Set(
workers
.map(
(worker) =>
worker.availability
)
.filter(Boolean)
)
].sort();
}, [workers]);

// ----------------------------------------------------
// Available booking filter options
// ----------------------------------------------------

const availableServices = useMemo(() => {
return [
...new Set(
bookings
.map(
(booking) =>
booking.serviceType
)
.filter(Boolean)
)
].sort();
}, [bookings]);

// ----------------------------------------------------
// Filter workers
// ----------------------------------------------------

const filteredWorkers = useMemo(() => {
const search =
workerSearch.trim().toLowerCase();

return workers.filter((worker) => {
  const workerName =
    worker.user?.name || '';

  const workerEmail =
    worker.user?.email || '';

  const workerPhone =
    worker.user?.phone || '';

  const workerSkills =
    Array.isArray(worker.skills)
      ? worker.skills.join(' ')
      : '';

  const matchesSearch =
    !search ||
    workerName
      .toLowerCase()
      .includes(search) ||
    workerEmail
      .toLowerCase()
      .includes(search) ||
    workerPhone
      .toLowerCase()
      .includes(search) ||
    workerSkills
      .toLowerCase()
      .includes(search);

  const matchesSkill =
    workerSkillFilter === 'all' ||
    worker.skills?.some(
      (skill) =>
        skill.toLowerCase() ===
        workerSkillFilter.toLowerCase()
    );

  const matchesAvailability =
    workerAvailabilityFilter === 'all' ||
    worker.availability ===
      workerAvailabilityFilter;

  const matchesVerification =
    workerVerificationFilter === 'all' ||
    (workerVerificationFilter ===
      'verified' &&
      worker.isVerified === true) ||
    (workerVerificationFilter ===
      'unverified' &&
      worker.isVerified !== true);

  return (
    matchesSearch &&
    matchesSkill &&
    matchesAvailability &&
    matchesVerification
  );
});

}, [
workers,
workerSearch,
workerSkillFilter,
workerAvailabilityFilter,
workerVerificationFilter
]);

// ----------------------------------------------------
// Filter bookings
// ----------------------------------------------------

const filteredBookings = useMemo(() => {
const search =
searchTerm.trim().toLowerCase();

return bookings.filter((booking) => {
  const customerName =
    booking.customer?.name || '';

  const customerEmail =
    booking.customer?.email || '';

  const workerName =
    booking.worker?.user?.name || '';

  const service =
    booking.serviceType || '';

  const address =
    booking.location?.address || '';

  const matchesSearch =
    !search ||
    customerName
      .toLowerCase()
      .includes(search) ||
    customerEmail
      .toLowerCase()
      .includes(search) ||
    workerName
      .toLowerCase()
      .includes(search) ||
    service
      .toLowerCase()
      .includes(search) ||
    address
      .toLowerCase()
      .includes(search);

  const matchesStatus =
    statusFilter === 'all' ||
    booking.status === statusFilter;

  const matchesService =
    serviceFilter === 'all' ||
    booking.serviceType === serviceFilter;

  const matchesPayment =
    paymentFilter === 'all' ||
    booking.payment?.status ===
      paymentFilter;

  return (
    matchesSearch &&
    matchesStatus &&
    matchesService &&
    matchesPayment
  );
});

}, [
bookings,
searchTerm,
statusFilter,
serviceFilter,
paymentFilter
]);

// ----------------------------------------------------
// Clear filters
// ----------------------------------------------------

const clearWorkerFilters = () => {
setWorkerSearch('');
setWorkerSkillFilter('all');
setWorkerAvailabilityFilter('all');
setWorkerVerificationFilter('all');
};

const clearBookingFilters = () => {
setSearchTerm('');
setStatusFilter('all');
setServiceFilter('all');
setPaymentFilter('all');
};

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

const formatDate = (date) => {
if (!date) {
return 'N/A';
}

const parsedDate = new Date(date);

if (
  Number.isNaN(
    parsedDate.getTime()
  )
) {
  return 'N/A';
}

return parsedDate.toLocaleString(
  'en-IN',
  {
    dateStyle: 'medium',
    timeStyle: 'short'
  }
);

};

const getRating = (worker) => {
const rating =
worker.rating?.average ??
worker.rating ??
0;

const numericRating =
  Number(rating);

if (
  Number.isNaN(numericRating) ||
  numericRating <= 0
) {
  return 'No rating';
}

return `${numericRating.toFixed(1)} ⭐`;

};

const getStatusLabel = (status) => {
const labels = {
pending: 'Pending',
confirmed: 'Confirmed',
in_progress: 'In Progress',
completed: 'Completed',
cancelled: 'Cancelled'
};

return labels[status] || 'Unknown';

};

const getPaymentLabel = (status) => {
const labels = {
unpaid: 'Unpaid',
paid: 'Paid',
refunded: 'Refunded'
};

return labels[status] || 'Unknown';

};

const statusStyle = (status) => {
const baseStyle = {
display: 'inline-block',
padding: '5px 9px',
borderRadius: '20px',
fontSize: '12px',
fontWeight: '600'
};

if (status === 'completed') {
  return {
    ...baseStyle,
    background: '#dcfce7',
    color: '#166534'
  };
}

if (status === 'cancelled') {
  return {
    ...baseStyle,
    background: '#fee2e2',
    color: '#991b1b'
  };
}

if (status === 'in_progress') {
  return {
    ...baseStyle,
    background: '#dbeafe',
    color: '#1e40af'
  };
}

if (status === 'confirmed') {
  return {
    ...baseStyle,
    background: '#e0f2fe',
    color: '#0369a1'
  };
}

return {
  ...baseStyle,
  background: '#fef3c7',
  color: '#92400e'
};

};

const paymentStyle = (status) => {
const baseStyle = {
display: 'inline-block',
padding: '5px 9px',
borderRadius: '20px',
fontSize: '12px',
fontWeight: '600'
};

if (status === 'paid') {
  return {
    ...baseStyle,
    background: '#dcfce7',
    color: '#166534'
  };
}

if (status === 'refunded') {
  return {
    ...baseStyle,
    background: '#ede9fe',
    color: '#6b21a8'
  };
}

return {
  ...baseStyle,
  background: '#f3f4f6',
  color: '#374151'
};

};

const verificationStyle = (verified) => ({
display: 'inline-block',
padding: '5px 9px',
borderRadius: '20px',
fontSize: '12px',
fontWeight: '600',
background: verified
? '#dcfce7'
: '#fee2e2',
color: verified
? '#166534'
: '#991b1b'
});

// ----------------------------------------------------
// Booking details modal
// ----------------------------------------------------

const openBookingDetails = (booking) => {
setSelectedBooking(booking);
};

const closeBookingDetails = () => {
setSelectedBooking(null);
};

const renderCancellationInfo = (
booking
) => {
if (!booking.cancellation) {
return (
<p
style={{
color: '#666',
margin: 0
}}
>
No cancellation recorded.
</p>
);
}

return (
  <div>
    <DetailRow
      label="Reason"
      value={
        booking.cancellation.reason ||
        'No reason provided'
      }
    />

    <DetailRow
      label="Cancelled At"
      value={formatDate(
        booking.cancellation.cancelledAt
      )}
    />

    <DetailRow
      label="Cancelled By"
      value={
        booking.cancellation
          .cancelledBy?.name ||
        booking.cancellation
          .cancelledBy?.email ||
        'User'
      }
    />
  </div>
);

};

const renderRescheduleHistory = (
booking
) => {
if (
!Array.isArray(
booking.rescheduleHistory
) ||
booking.rescheduleHistory.length === 0
) {
return (
<p
style={{
color: '#666',
margin: 0
}}
>
No rescheduling history.
</p>
);
}

return (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}
  >
    {booking.rescheduleHistory.map(
      (item, index) => (
        <div
          key={index}
          style={{
            padding: '12px',
            background: '#f8fafc',
            border:
              '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        >
          <DetailRow
            label="Previous Time"
            value={formatDate(
              item.previousScheduledAt
            )}
          />

          <DetailRow
            label="New Time"
            value={formatDate(
              item.newScheduledAt
            )}
          />

          <DetailRow
            label="Reason"
            value={
              item.reason ||
              'No reason provided'
            }
          />

          <DetailRow
            label="Changed At"
            value={formatDate(
              item.changedAt
            )}
          />

          <DetailRow
            label="Changed By"
            value={
              item.changedBy?.name ||
              item.changedBy?.email ||
              'User'
            }
          />
        </div>
      )
    )}
  </div>
);

};

// ----------------------------------------------------
// Render
// ----------------------------------------------------

return (
<div
style={{
maxWidth: '1400px',
margin: '2rem auto',
padding: '0 1rem',
fontFamily:
'Arial, sans-serif'
}}
>
{/* HEADER */}

  <div
    style={{
      display: 'flex',
      justifyContent:
        'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '1.5rem'
    }}
  >
    <div>
      <h1
        style={{
          marginBottom: '0.4rem'
        }}
      >
        Admin Dashboard
      </h1>

      <p
        style={{
          margin: 0,
          color: '#666'
        }}
      >
        Manage workers, bookings
        and platform activity.
      </p>
    </div>

    <button
      onClick={
        fetchDashboardData
      }
      disabled={loading}
      style={{
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: loading
          ? 'not-allowed'
          : 'pointer',
        background: '#111827',
        color: 'white',
        fontWeight: '600'
      }}
    >
      {loading
        ? 'Refreshing...'
        : '🔄 Refresh'}
    </button>
  </div>

  {loading && (
    <p>
      Loading dashboard...
    </p>
  )}

  {error && (
    <div
      style={{
        padding: '12px',
        marginBottom: '1rem',
        borderRadius: '8px',
        background: '#fee2e2',
        color: '#991b1b'
      }}
    >
      {error}
    </div>
  )}

  {message && (
    <div
      style={{
        padding: '12px',
        marginBottom: '1rem',
        borderRadius: '8px',
        background: '#dcfce7',
        color: '#166534'
      }}
    >
      {message}
    </div>
  )}

  {!loading && (
    <>
      {/* ========================================== */}
      {/* BOOKING STATISTICS */}
      {/* ========================================== */}

      <h2>
        Booking Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        <StatCard
          icon="📊"
          title="Total Bookings"
          value={statistics.total}
        />

        <StatCard
          icon="⏳"
          title="Pending"
          value={statistics.pending}
        />

        <StatCard
          icon="✅"
          title="Confirmed"
          value={statistics.confirmed}
        />

        <StatCard
          icon="🔧"
          title="In Progress"
          value={
            statistics.inProgress
          }
        />

        <StatCard
          icon="🏆"
          title="Completed"
          value={
            statistics.completed
          }
        />

        <StatCard
          icon="❌"
          title="Cancelled"
          value={
            statistics.cancelled
          }
        />

        <StatCard
          icon="💰"
          title="Paid"
          value={statistics.paid}
        />
      </div>

      {/* ========================================== */}
      {/* WORKER MANAGEMENT */}
      {/* ========================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}
      >
        <div>
          <h2
            style={{
              marginBottom: '0.3rem'
            }}
          >
            Worker Management
          </h2>

          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '14px'
            }}
          >
            Manage worker profiles
            and verification.
          </p>
        </div>
      </div>

      {/* Worker summary */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <MiniStat
          title="Total Workers"
          value={
            workerStatistics.total
          }
        />

        <MiniStat
          title="Verified"
          value={
            workerStatistics.verified
          }
        />

        <MiniStat
          title="Unverified"
          value={
            workerStatistics.unverified
          }
        />

        <MiniStat
          title="Available"
          value={
            workerStatistics.available
          }
        />

        <MiniStat
          title="Unavailable"
          value={
            workerStatistics.unavailable
          }
        />
      </div>

      {/* Worker filters */}

      <div
        style={{
          background: '#f8fafc',
          border:
            '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(3, minmax(150px, 1fr)) auto',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            placeholder="🔎 Search worker, email, phone or skill..."
            value={workerSearch}
            onChange={(e) =>
              setWorkerSearch(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <select
            value={
              workerSkillFilter
            }
            onChange={(e) =>
              setWorkerSkillFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Skills
            </option>

            {availableWorkerSkills.map(
              (skill) => (
                <option
                  key={skill}
                  value={skill}
                >
                  {skill}
                </option>
              )
            )}
          </select>

          <select
            value={
              workerAvailabilityFilter
            }
            onChange={(e) =>
              setWorkerAvailabilityFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Availability
            </option>

            {availableWorkerAvailability.map(
              (availability) => (
                <option
                  key={availability}
                  value={
                    availability
                  }
                >
                  {availability}
                </option>
              )
            )}
          </select>

          <select
            value={
              workerVerificationFilter
            }
            onChange={(e) =>
              setWorkerVerificationFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Verification
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="unverified">
              Unverified
            </option>
          </select>

          <button
            onClick={
              clearWorkerFilters
            }
            style={{
              padding:
                '10px 14px',
              border:
                '1px solid #d1d5db',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <p
        style={{
          color: '#666',
          fontSize: '14px'
        }}
      >
        Showing{' '}
        {filteredWorkers.length}{' '}
        of {workers.length}{' '}
        workers
      </p>

      {/* Worker table */}

      <div
        style={{
          overflowX: 'auto',
          marginBottom: '3rem',
          border:
            '1px solid #e5e7eb',
          borderRadius: '10px'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse',
            minWidth: '1050px'
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  '#f3f4f6',
                textAlign: 'left'
              }}
            >
              <th
                style={tableHeaderStyle}
              >
                Worker
              </th>

              <th
                style={tableHeaderStyle}
              >
                Contact
              </th>

              <th
                style={tableHeaderStyle}
              >
                Skills
              </th>

              <th
                style={tableHeaderStyle}
              >
                Experience
              </th>

              <th
                style={tableHeaderStyle}
              >
                Availability
              </th>

              <th
                style={tableHeaderStyle}
              >
                Rating
              </th>

              <th
                style={tableHeaderStyle}
              >
                Verification
              </th>

              <th
                style={tableHeaderStyle}
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkers.length ===
            0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding:
                      '2rem',
                    textAlign:
                      'center',
                    color: '#666'
                  }}
                >
                  No workers match
                  your search or
                  filters.
                </td>
              </tr>
            ) : (
              filteredWorkers.map(
                (worker) => (
                  <tr
                    key={
                      worker._id
                    }
                    style={{
                      borderTop:
                        '1px solid #e5e7eb'
                    }}
                  >
                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      <strong>
                        {worker.user
                          ?.name ||
                          'Unknown'}
                      </strong>
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      <div>
                        {worker.user
                          ?.email ||
                          'No email'}
                      </div>

                      <div
                        style={{
                          fontSize:
                            '12px',
                          color:
                            '#666',
                          marginTop:
                            '3px'
                        }}
                      >
                        {worker.user
                          ?.phone ||
                          'No phone'}
                      </div>
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {worker.skills
                        ?.length >
                      0
                        ? worker.skills.join(
                            ', '
                          )
                        : 'No services'}
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {worker.experienceYears ||
                        0}{' '}
                      years
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      <span
                        style={{
                          display:
                            'inline-block',
                          padding:
                            '5px 9px',
                          borderRadius:
                            '20px',
                          fontSize:
                            '12px',
                          fontWeight:
                            '600',
                          background:
                            worker.availability ===
                            'available'
                              ? '#dcfce7'
                              : '#f3f4f6',
                          color:
                            worker.availability ===
                            'available'
                              ? '#166534'
                              : '#374151'
                        }}
                      >
                        {worker.availability ||
                          'Unknown'}
                      </span>
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {getRating(
                        worker
                      )}
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      <span
                        style={verificationStyle(
                          worker.isVerified
                        )}
                      >
                        {worker.isVerified
                          ? '✓ Verified'
                          : 'Not Verified'}
                      </span>
                    </td>

                    <td
                      style={
                        tableCellStyle
                      }
                    >
                      {worker.isVerified ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUnverifyWorker(
                              worker._id
                            )
                          }
                          disabled={
                            verifying ===
                            worker._id
                          }
                          style={{
                            padding:
                              '8px 12px',
                            border:
                              '1px solid #dc2626',
                            borderRadius:
                              '7px',
                            background:
                              verifying ===
                              worker._id
                                ? '#9ca3af'
                                : 'white',
                            color:
                              verifying ===
                              worker._id
                                ? 'white'
                                : '#b91c1c',
                            cursor:
                              verifying ===
                              worker._id
                                ? 'not-allowed'
                                : 'pointer',
                            fontWeight:
                              '600'
                          }}
                        >
                          {verifying ===
                          worker._id
                            ? 'Updating...'
                            : 'Unverify Worker'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleVerifyWorker(
                              worker._id
                            )
                          }
                          disabled={
                            verifying ===
                            worker._id
                          }
                          style={{
                            padding:
                              '8px 12px',
                            border:
                              'none',
                            borderRadius:
                              '7px',
                            background:
                              verifying ===
                              worker._id
                                ? '#9ca3af'
                                : '#111827',
                            color:
                              'white',
                            cursor:
                              verifying ===
                              worker._id
                                ? 'not-allowed'
                                : 'pointer',
                            fontWeight:
                              '600'
                          }}
                        >
                          {verifying ===
                          worker._id
                            ? 'Verifying...'
                            : 'Verify Worker'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* BOOKING MANAGEMENT */}
      {/* ========================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}
      >
        <div>
          <h2
            style={{
              marginBottom:
                '0.3rem'
            }}
          >
            Booking Management
          </h2>

          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '14px'
            }}
          >
            Showing{' '}
            {filteredBookings.length}{' '}
            of {bookings.length}{' '}
            bookings
          </p>
        </div>
      </div>

      {/* Booking filters */}

      <div
        style={{
          background: '#f8fafc',
          border:
            '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 2fr) repeat(3, minmax(150px, 1fr)) auto',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            placeholder="🔎 Search customer, worker, service, address..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Statuses
            </option>

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

          <select
            value={serviceFilter}
            onChange={(e) =>
              setServiceFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Services
            </option>

            {availableServices.map(
              (service) => (
                <option
                  key={service}
                  value={service}
                >
                  {service}
                </option>
              )
            )}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="all">
              All Payments
            </option>

            <option value="unpaid">
              Unpaid
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          <button
            onClick={
              clearBookingFilters
            }
            style={{
              padding:
                '10px 14px',
              border:
                '1px solid #d1d5db',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {bookings.length === 0 && (
        <p>
          No bookings found.
        </p>
      )}

      {bookings.length > 0 &&
        filteredBookings.length ===
          0 && (
          <div
            style={{
              textAlign:
                'center',
              padding:
                '3rem 1rem',
              border:
                '1px solid #e5e7eb',
              borderRadius:
                '10px',
              background:
                '#fafafa'
            }}
          >
            <h3>
              No matching
              bookings
            </h3>

            <p
              style={{
                color:
                  '#666'
              }}
            >
              Try changing your
              search or filters.
            </p>

            <button
              onClick={
                clearBookingFilters
              }
              style={{
                padding:
                  '9px 14px',
                border:
                  'none',
                borderRadius:
                  '7px',
                background:
                  '#111827',
                color:
                  'white',
                cursor:
                  'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

      {filteredBookings.length >
        0 && (
        <div
          style={{
            overflowX:
              'auto',
            border:
              '1px solid #e5e7eb',
            borderRadius:
              '10px'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
              minWidth:
                '1250px'
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    '#f3f4f6',
                  textAlign:
                    'left'
                }}
              >
                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Service
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Customer
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Worker
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Scheduled
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Address
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Amount
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Payment
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Status
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Assign Worker
                </th>

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map(
                (booking) => {
                  const matchingWorkers =
                    getMatchingWorkers(
                      booking.serviceType
                    );

                  return (
                    <tr
                      key={
                        booking._id
                      }
                      style={{
                        borderTop:
                          '1px solid #e5e7eb'
                      }}
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <strong>
                          {booking.serviceType ||
                            'N/A'}
                        </strong>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <strong>
                          {booking
                            .customer
                            ?.name ||
                            'Unknown'}
                        </strong>

                        {booking
                          .customer
                          ?.email && (
                          <div
                            style={{
                              fontSize:
                                '12px',
                              color:
                                '#666'
                            }}
                          >
                            {
                              booking
                                .customer
                                .email
                            }
                          </div>
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {booking
                          .worker
                          ?.user
                          ?.name ||
                          'Not Assigned'}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {formatDate(
                          booking.scheduledAt
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {booking
                          .location
                          ?.address ||
                          'N/A'}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        ₹
                        {booking
                          .payment
                          ?.amount ||
                          0}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <span
                          style={paymentStyle(
                            booking
                              .payment
                              ?.status
                          )}
                        >
                          {getPaymentLabel(
                            booking
                              .payment
                              ?.status
                          )}
                        </span>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <select
                          value={
                            booking.status ||
                            'pending'
                          }
                          onChange={(
                            e
                          ) =>
                            handleStatusChange(
                              booking._id,
                              e.target
                                .value
                            )
                          }
                          style={{
                            padding:
                              '7px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
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

                        <div
                          style={{
                            marginTop:
                              '5px'
                          }}
                        >
                          <span
                            style={statusStyle(
                              booking.status
                            )}
                          >
                            {getStatusLabel(
                              booking.status
                            )}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          minWidth:
                            '220px'
                        }}
                      >
                        {booking.worker ? (
                          <strong
                            style={{
                              color:
                                '#166534'
                            }}
                          >
                            ✓ Assigned
                          </strong>
                        ) : (
                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap:
                                '8px'
                            }}
                          >
                            <select
                              value={
                                selectedWorkers[
                                  booking._id
                                ] ||
                                ''
                              }
                              onChange={(
                                e
                              ) =>
                                handleWorkerSelection(
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
                                  '6px'
                              }}
                            >
                              <option value="">
                                Select Worker
                              </option>

                              {matchingWorkers.length >
                              0 ? (
                                matchingWorkers.map(
                                  (
                                    worker
                                  ) => (
                                    <option
                                      key={
                                        worker._id
                                      }
                                      value={
                                        worker._id
                                      }
                                    >
                                      {worker
                                        .user
                                        ?.name ||
                                        'Unnamed Worker'}
                                      {' - '}
                                      {worker.availability ||
                                        'unknown'}
                                      {' - '}
                                      {worker.isVerified
                                        ? 'Verified'
                                        : 'Not Verified'}
                                    </option>
                                  )
                                )
                              ) : (
                                <option
                                  disabled
                                >
                                  No matching
                                  worker
                                </option>
                              )}
                            </select>

                            <button
                              type="button"
                              disabled={
                                !selectedWorkers[
                                  booking._id
                                ] ||
                                assigning ===
                                  booking._id
                              }
                              onClick={() =>
                                handleAssignWorker(
                                  booking._id
                                )
                              }
                              style={{
                                padding:
                                  '8px',
                                border:
                                  'none',
                                borderRadius:
                                  '6px',
                                background:
                                  selectedWorkers[
                                    booking._id
                                  ]
                                    ? '#111827'
                                    : '#9ca3af',
                                color:
                                  'white',
                                cursor:
                                  selectedWorkers[
                                    booking._id
                                  ]
                                    ? 'pointer'
                                    : 'not-allowed',
                                fontWeight:
                                  '600'
                              }}
                            >
                              {assigning ===
                              booking._id
                                ? 'Assigning...'
                                : 'Assign Worker'}
                            </button>

                            {matchingWorkers.length >
                              0 && (
                              <small
                                style={{
                                  color:
                                    '#666'
                                }}
                              >
                                {
                                  matchingWorkers.length
                                }{' '}
                                matching
                                worker
                                {matchingWorkers.length !==
                                1
                                  ? 's'
                                  : ''}{' '}
                                for this
                                service
                              </small>
                            )}
                          </div>
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openBookingDetails(
                              booking
                            )
                          }
                          style={{
                            padding:
                              '8px 12px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '7px',
                            background:
                              'white',
                            cursor:
                              'pointer',
                            fontWeight:
                              '600',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          👁️ View Details
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
    </>
  )}

  {/* ========================================== */}
  {/* BOOKING DETAILS MODAL */}
  {/* ========================================== */}

  {selectedBooking && (
    <div
      onClick={
        closeBookingDetails
      }
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'center',
        padding: '20px',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'white',
          borderRadius: '14px',
          boxShadow:
            '0 20px 50px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Modal header */}

        <div
          style={{
            padding:
              '20px 24px',
            borderBottom:
              '1px solid #e5e7eb',
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '10px'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0
              }}
            >
              Booking Details
            </h2>

            <p
              style={{
                margin:
                  '5px 0 0',
                color:
                  '#6b7280',
                fontSize:
                  '13px'
              }}
            >
              ID:{' '}
              {selectedBooking._id}
            </p>
          </div>

          <button
            type="button"
            onClick={
              closeBookingDetails
            }
            style={{
              border: 'none',
              background:
                '#f3f4f6',
              width: '36px',
              height: '36px',
              borderRadius:
                '50%',
              cursor:
                'pointer',
              fontSize:
                '20px'
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding:
              '20px 24px'
          }}
        >
          {/* Status summary */}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap:
                'wrap',
              marginBottom:
                '20px'
            }}
          >
            <span
              style={statusStyle(
                selectedBooking.status
              )}
            >
              {getStatusLabel(
                selectedBooking.status
              )}
            </span>

            <span
              style={paymentStyle(
                selectedBooking
                  .payment
                  ?.status
              )}
            >
              {getPaymentLabel(
                selectedBooking
                  .payment
                  ?.status
              )}
            </span>

            {selectedBooking
              .isEmergency && (
              <span
                style={{
                  display:
                    'inline-block',
                  padding:
                    '5px 9px',
                  borderRadius:
                    '20px',
                  fontSize:
                    '12px',
                  fontWeight:
                    '600',
                  background:
                    '#fee2e2',
                  color:
                    '#991b1b'
                }}
              >
                🚨 Emergency
              </span>
            )}
          </div>

          {/* Service information */}

          <DetailSection
            title="🛠️ Service Information"
          >
            <DetailRow
              label="Service"
              value={
                selectedBooking
                  .serviceType ||
                'N/A'
              }
            />

            <DetailRow
              label="Scheduled For"
              value={formatDate(
                selectedBooking
                  .scheduledAt
              )}
            />

            <DetailRow
              label="Address"
              value={
                selectedBooking
                  .location
                  ?.address ||
                'N/A'
              }
            />

            {selectedBooking
              .location
              ?.coordinates
              ?.length === 2 && (
              <DetailRow
                label="Coordinates"
                value={`${selectedBooking.location.coordinates[1]}, ${selectedBooking.location.coordinates[0]}`}
              />
            )}
          </DetailSection>

          {/* Customer information */}

          <DetailSection
            title="👤 Customer Information"
          >
            <DetailRow
              label="Name"
              value={
                selectedBooking
                  .customer
                  ?.name ||
                'Unknown'
              }
            />

            <DetailRow
              label="Email"
              value={
                selectedBooking
                  .customer
                  ?.email ||
                'N/A'
              }
            />

            <DetailRow
              label="Phone"
              value={
                selectedBooking
                  .customer
                  ?.phone ||
                'N/A'
              }
            />
          </DetailSection>

          {/* Worker information */}

          <DetailSection
            title="👷 Worker Information"
          >
            {selectedBooking
              .worker ? (
              <>
                <DetailRow
                  label="Name"
                  value={
                    selectedBooking
                      .worker
                      ?.user
                      ?.name ||
                    'Unknown'
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    selectedBooking
                      .worker
                      ?.user
                      ?.email ||
                    'N/A'
                  }
                />

                <DetailRow
                  label="Phone"
                  value={
                    selectedBooking
                      .worker
                      ?.user
                      ?.phone ||
                    'N/A'
                  }
                />

                <DetailRow
                  label="Skills"
                  value={
                    selectedBooking
                      .worker
                      ?.skills
                      ?.length
                      ? selectedBooking.worker.skills.join(
                          ', '
                        )
                      : 'N/A'
                  }
                />

                <DetailRow
                  label="Experience"
                  value={`${selectedBooking.worker?.experienceYears || 0} years`}
                />

                <DetailRow
                  label="Rating"
                  value={getRating(
                    selectedBooking.worker
                  )}
                />

                <DetailRow
                  label="Verified"
                  value={
                    selectedBooking
                      .worker
                      ?.isVerified
                      ? 'Yes ✓'
                      : 'No'
                  }
                />
              </>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: '#666'
                }}
              >
                No worker assigned.
              </p>
            )}
          </DetailSection>

          {/* Payment */}

          <DetailSection
            title="💳 Payment Information"
          >
            <DetailRow
              label="Amount"
              value={`₹${selectedBooking.payment?.amount || 0}`}
            />

            <DetailRow
              label="Status"
              value={getPaymentLabel(
                selectedBooking
                  .payment
                  ?.status
              )}
            />

            <DetailRow
              label="Transaction ID"
              value={
                selectedBooking
                  .payment
                  ?.transactionId ||
                'Not available'
              }
            />

            <DetailRow
              label="Invoice Number"
              value={
                selectedBooking
                  .payment
                  ?.invoiceNumber ||
                'Not available'
              }
            />
          </DetailSection>

          {/* Cancellation */}

          <DetailSection
            title="❌ Cancellation Information"
          >
            {renderCancellationInfo(
              selectedBooking
            )}
          </DetailSection>

          {/* Reschedule history */}

          <DetailSection
            title="🔄 Reschedule History"
          >
            {renderRescheduleHistory(
              selectedBooking
            )}
          </DetailSection>

          {/* Feedback */}

          <DetailSection
            title="⭐ Customer Feedback"
          >
            {selectedBooking
              .feedback?.rating ? (
              <>
                <DetailRow
                  label="Rating"
                  value={`${selectedBooking.feedback.rating} / 5 ⭐`}
                />

                <DetailRow
                  label="Comment"
                  value={
                    selectedBooking
                      .feedback
                      .comment ||
                    'No comment'
                  }
                />
              </>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: '#666'
                }}
              >
                No feedback submitted
                yet.
              </p>
            )}
          </DetailSection>

          {/* Timestamps */}

          <DetailSection
            title="🕒 Booking Timeline"
          >
            <DetailRow
              label="Created"
              value={formatDate(
                selectedBooking.createdAt
              )}
            />

            <DetailRow
              label="Last Updated"
              value={formatDate(
                selectedBooking.updatedAt
              )}
            />
          </DetailSection>
        </div>

        {/* Modal footer */}

        <div
          style={{
            padding:
              '16px 24px',
            borderTop:
              '1px solid #e5e7eb',
            display: 'flex',
            justifyContent:
              'flex-end'
          }}
        >
          <button
            type="button"
            onClick={
              closeBookingDetails
            }
            style={{
              padding:
                '10px 18px',
              border: 'none',
              borderRadius:
                '8px',
              background:
                '#111827',
              color: 'white',
              cursor:
                'pointer',
              fontWeight:
                '600'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

);
};

// ----------------------------------------------------
// Reusable components
// ----------------------------------------------------

const StatCard = ({
icon,
title,
value
}) => (

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '1rem',
      background: 'white',
      border:
        '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow:
        '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}
  >
    <span
      style={{
        fontSize: '28px'
      }}
    >
      {icon}
    </span>

<div>
  <p
    style={{
      margin: 0,
      color: '#6b7280',
      fontSize: '13px'
    }}
  >
    {title}
  </p>

  <h2
    style={{
      margin:
        '4px 0 0',
      fontSize: '24px'
    }}
  >
    {value}
  </h2>
</div>

  </div>
);

const MiniStat = ({
title,
value
}) => (

  <div
    style={{
      padding: '1rem',
      background: '#f8fafc',
      border:
        '1px solid #e5e7eb',
      borderRadius: '10px'
    }}
  >
    <p
      style={{
        margin: 0,
        color: '#6b7280',
        fontSize: '13px'
      }}
    >
      {title}
    </p>

<h3
  style={{
    margin:
      '5px 0 0',
    fontSize: '22px'
  }}
>
  {value}
</h3>

  </div>
);

const DetailSection = ({
title,
children
}) => (

  <div
    style={{
      marginBottom: '18px',
      padding: '16px',
      background: '#f8fafc',
      border:
        '1px solid #e5e7eb',
      borderRadius: '10px'
    }}
  >
    <h3
      style={{
        margin:
          '0 0 12px',
        fontSize: '16px'
      }}
    >
      {title}
    </h3>

{children}

  </div>
);

const DetailRow = ({
label,
value
}) => (

  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        '150px 1fr',
      gap: '10px',
      padding:
        '7px 0',
      borderBottom:
        '1px solid #e5e7eb'
    }}
  >
    <strong
      style={{
        fontSize: '13px',
        color: '#4b5563'
      }}
    >
      {label}
    </strong>

<span
  style={{
    fontSize: '14px',
    color: '#111827',
    wordBreak:
      'break-word'
  }}
>
  {value}
</span>

  </div>
);

// ----------------------------------------------------
// Styles
// ----------------------------------------------------

const inputStyle = {
width: '100%',
boxSizing: 'border-box',
padding: '10px',
border:
'1px solid #d1d5db',
borderRadius: '8px',
background: 'white'
};

const tableHeaderStyle = {
padding: '12px',
borderBottom:
'1px solid #d1d5db',
fontSize: '13px'
};

const tableCellStyle = {
padding: '12px',
verticalAlign: 'top',
fontSize: '14px'
};

export default Dashboard;