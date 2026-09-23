import React, { useMemo } from 'react';

const AdminStatistics = ({
  bookings = [],
  workers = []
}) => {
  const statistics = useMemo(() => {
    const totalBookings = bookings.length;

    const pending = bookings.filter(
      (booking) =>
        booking.status === 'pending'
    ).length;

    const confirmed = bookings.filter(
      (booking) =>
        booking.status === 'confirmed'
    ).length;

    const inProgress = bookings.filter(
      (booking) =>
        booking.status === 'in_progress'
    ).length;

    const completed = bookings.filter(
      (booking) =>
        booking.status === 'completed'
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        booking.status === 'cancelled'
    ).length;

    const paid = bookings.filter(
      (booking) =>
        booking.payment?.status === 'paid'
    ).length;

    const unpaid = bookings.filter(
      (booking) =>
        !booking.payment ||
        booking.payment.status === 'unpaid'
    ).length;

    const refunded = bookings.filter(
      (booking) =>
        booking.payment?.status === 'refunded'
    ).length;

    const unassigned = bookings.filter(
      (booking) =>
        !booking.worker
    ).length;

    const emergency = bookings.filter(
      (booking) =>
        booking.isEmergency === true
    ).length;

    const totalBookingValue =
      bookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.payment?.amount || 0
          ),
        0
      );

    const paidRevenue =
      bookings
        .filter(
          (booking) =>
            booking.payment?.status ===
            'paid'
        )
        .reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.payment?.amount || 0
            ),
          0
        );

    const averageBookingValue =
      totalBookings > 0
        ? totalBookingValue /
          totalBookings
        : 0;

    const totalWorkers = workers.length;

    const verifiedWorkers =
      workers.filter(
        (worker) =>
          worker.isVerified === true
      ).length;

    const unverifiedWorkers =
      workers.filter(
        (worker) =>
          worker.isVerified !== true
      ).length;

    const availableWorkers =
      workers.filter(
        (worker) =>
          worker.availability ===
          'available'
      ).length;

    const busyWorkers =
      workers.filter(
        (worker) =>
          worker.availability ===
          'busy'
      ).length;

    const offlineWorkers =
      workers.filter(
        (worker) =>
          worker.availability ===
          'offline'
      ).length;

    const workerVerificationRate =
      totalWorkers > 0
        ? (
            (verifiedWorkers /
              totalWorkers) *
            100
          ).toFixed(1)
        : '0.0';

    return {
      totalBookings,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      paid,
      unpaid,
      refunded,
      unassigned,
      emergency,
      totalBookingValue,
      paidRevenue,
      averageBookingValue,
      totalWorkers,
      verifiedWorkers,
      unverifiedWorkers,
      availableWorkers,
      busyWorkers,
      offlineWorkers,
      workerVerificationRate
    };
  }, [bookings, workers]);

  const formatCurrency = (value) => {
    return `₹${Number(value).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2
      }
    )}`;
  };

  return (
    <div
      style={{
        marginBottom: '2.5rem'
      }}
    >
      {/* ====================================== */}
      {/* MAIN BOOKING STATISTICS */}
      {/* ====================================== */}

      <h2
        style={{
          marginBottom: '1rem'
        }}
      >
        Platform Statistics
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          icon="📊"
          title="Total Bookings"
          value={
            statistics.totalBookings
          }
        />

        <StatCard
          icon="⏳"
          title="Pending"
          value={
            statistics.pending
          }
        />

        <StatCard
          icon="✅"
          title="Confirmed"
          value={
            statistics.confirmed
          }
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
      </div>

      {/* ====================================== */}
      {/* PAYMENT STATISTICS */}
      {/* ====================================== */}

      <h3
        style={{
          marginBottom: '1rem'
        }}
      >
        Payment Statistics
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          icon="💰"
          title="Paid Bookings"
          value={statistics.paid}
        />

        <StatCard
          icon="💳"
          title="Unpaid Bookings"
          value={statistics.unpaid}
        />

        <StatCard
          icon="↩️"
          title="Refunded"
          value={statistics.refunded}
        />

        <StatCard
          icon="💵"
          title="Paid Revenue"
          value={formatCurrency(
            statistics.paidRevenue
          )}
        />

        <StatCard
          icon="📈"
          title="Total Booking Value"
          value={formatCurrency(
            statistics.totalBookingValue
          )}
        />

        <StatCard
          icon="🧮"
          title="Average Booking Value"
          value={formatCurrency(
            statistics.averageBookingValue
          )}
        />
      </div>

      {/* ====================================== */}
      {/* OPERATIONS */}
      {/* ====================================== */}

      <h3
        style={{
          marginBottom: '1rem'
        }}
      >
        Operations
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          icon="⚠️"
          title="Unassigned Bookings"
          value={
            statistics.unassigned
          }
        />

        <StatCard
          icon="🚨"
          title="Emergency Bookings"
          value={
            statistics.emergency
          }
        />
      </div>

      {/* ====================================== */}
      {/* WORKER STATISTICS */}
      {/* ====================================== */}

      <h3
        style={{
          marginBottom: '1rem'
        }}
      >
        Worker Statistics
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          icon="👷"
          title="Total Workers"
          value={
            statistics.totalWorkers
          }
        />

        <StatCard
          icon="✔️"
          title="Verified Workers"
          value={
            statistics.verifiedWorkers
          }
        />

        <StatCard
          icon="⏳"
          title="Unverified Workers"
          value={
            statistics.unverifiedWorkers
          }
        />

        <StatCard
          icon="🟢"
          title="Available Workers"
          value={
            statistics.availableWorkers
          }
        />

        <StatCard
          icon="🟡"
          title="Busy Workers"
          value={
            statistics.busyWorkers
          }
        />

        <StatCard
          icon="⚫"
          title="Offline Workers"
          value={
            statistics.offlineWorkers
          }
        />

        <StatCard
          icon="📋"
          title="Verification Rate"
          value={`${statistics.workerVerificationRate}%`}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value
}) => {
  return (
    <div
      style={{
        background: 'white',
        border:
          '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow:
          '0 2px 8px rgba(0, 0, 0, 0.05)',
        minHeight: '90px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span
          style={{
            fontSize: '25px'
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

          <h3
            style={{
              margin:
                '5px 0 0',
              fontSize: '21px',
              color: '#111827'
            }}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;