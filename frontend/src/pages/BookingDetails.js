import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel states
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Reschedule states
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Success message
  const [actionMessage, setActionMessage] = useState('');

  // ============================================================
  // FETCH BOOKING
  // ============================================================

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/bookings/${id}`);

      setBooking(response.data.booking);
    } catch (err) {
      console.error(
        'Error fetching booking details:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load booking details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  // ============================================================
  // DATE / TIME HELPERS
  // ============================================================

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'Not scheduled';

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatServiceName = (service) => {
    if (!service) return 'Service';

    return service
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ============================================================
  // STATUS HELPERS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'confirmed';

      case 'in_progress':
        return 'in-progress';

      case 'completed':
        return 'completed';

      case 'cancelled':
        return 'cancelled';

      case 'pending':
      default:
        return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';

      case 'confirmed':
        return 'Confirmed';

      case 'completed':
        return 'Completed';

      case 'cancelled':
        return 'Cancelled';

      case 'pending':
      default:
        return 'Pending';
    }
  };

  // ============================================================
  // MINIMUM DATE/TIME FOR RESCHEDULE
  // ============================================================

  const getMinDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ============================================================
  // CANCEL BOOKING
  // PATCH /api/bookings/:id/cancel
  // ============================================================

  const handleCancelBooking = async (event) => {
    event.preventDefault();

    setCancelError('');
    setActionMessage('');

    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);

      const response = await api.patch(
        `/bookings/${id}/cancel`,
        {
          reason: cancelReason.trim()
        }
      );

      setBooking(response.data.booking);

      setShowCancelForm(false);
      setCancelReason('');

      setActionMessage(
        'Booking cancelled successfully.'
      );
    } catch (err) {
      console.error(
        'Error cancelling booking:',
        err
      );

      setCancelError(
        err.response?.data?.message ||
          'Unable to cancel booking.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // ============================================================
  // RESCHEDULE BOOKING
  // PATCH /api/bookings/:id/reschedule
  // ============================================================

  const handleRescheduleBooking = async (event) => {
    event.preventDefault();

    setRescheduleError('');
    setActionMessage('');

    if (!newScheduledAt) {
      setRescheduleError(
        'Please select a new date and time.'
      );
      return;
    }

    const selectedDate = new Date(newScheduledAt);

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      setRescheduleError(
        'Please select a valid date and time.'
      );
      return;
    }

    if (
      selectedDate.getTime() <= Date.now()
    ) {
      setRescheduleError(
        'Please select a future date and time.'
      );
      return;
    }

    try {
      setRescheduling(true);

      const response = await api.patch(
        `/bookings/${id}/reschedule`,
        {
          scheduledAt: selectedDate.toISOString(),
          reason: rescheduleReason.trim()
        }
      );

      setBooking(response.data.booking);

      setShowRescheduleForm(false);
      setNewScheduledAt('');
      setRescheduleReason('');

      setActionMessage(
        'Booking rescheduled successfully.'
      );
    } catch (err) {
      console.error(
        'Error rescheduling booking:',
        err
      );

      setRescheduleError(
        err.response?.data?.message ||
          'Unable to reschedule booking.'
      );
    } finally {
      setRescheduling(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-loading">
          <div className="loading-spinner"></div>

          <h2>
            Loading booking details...
          </h2>

          <p>
            Please wait while we fetch your booking.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-error">
          <div className="error-icon">
            !
          </div>

          <h2>
            Booking Not Found
          </h2>

          <p>
            {error ||
              'We could not find this booking.'}
          </p>

          <div className="error-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate('/my-bookings')
              }
            >
              Back to My Bookings
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const worker = booking.worker;
  const workerUser = worker?.user;
  const customer = booking.customer;

  // Customer can cancel/reschedule only while booking
  // has not started or completed.
  const canModifyBooking =
    booking.status === 'pending' ||
    booking.status === 'confirmed';

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="booking-details-header">
          <div>
            <p className="section-eyebrow">
              BOOKING DETAILS
            </p>

            <h1 className="page-title">
              {formatServiceName(
                booking.serviceType
              )}
            </h1>

            <p className="page-subtitle">
              View complete information about your booking.
            </p>
          </div>

          <div
            className={`booking-status-large ${getStatusClass(
              booking.status
            )}`}
          >
            {getStatusText(
              booking.status
            )}
          </div>
        </div>

        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {actionMessage && (
          <div className="action-success-message">
            <span>✓</span>
            {actionMessage}
          </div>
        )}

        {/* ====================================================
            BOOKING ID
        ==================================================== */}

        <div className="booking-reference-card">
          <div>
            <span className="detail-label">
              Booking ID
            </span>

            <strong>
              #{booking._id}
            </strong>
          </div>

          <div>
            <span className="detail-label">
              Created On
            </span>

            <strong>
              {formatDate(
                booking.createdAt
              )}
            </strong>
          </div>
        </div>

        {/* ====================================================
            MAIN INFORMATION
        ==================================================== */}

        <div className="booking-details-grid">

          {/* ==================================================
              SERVICE INFORMATION
          ================================================== */}

          <section className="details-card">
            <div className="details-card-header">
              <div className="details-icon">
                🔧
              </div>

              <div>
                <h2>
                  Service Information
                </h2>

                <p>
                  Your requested service
                </p>
              </div>
            </div>

            <div className="details-list">

              <div className="detail-row">
                <span>
                  Service
                </span>

                <strong>
                  {formatServiceName(
                    booking.serviceType
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Emergency Service
                </span>

                <strong>
                  {booking.isEmergency
                    ? 'Yes'
                    : 'No'}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Scheduled Date
                </span>

                <strong>
                  {formatDate(
                    booking.scheduledAt
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Scheduled Time
                </span>

                <strong>
                  {formatTime(
                    booking.scheduledAt
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* ==================================================
              LOCATION INFORMATION
          ================================================== */}

          <section className="details-card">
            <div className="details-card-header">
              <div className="details-icon">
                📍
              </div>

              <div>
                <h2>
                  Service Location
                </h2>

                <p>
                  Where the service will be provided
                </p>
              </div>
            </div>

            <div className="location-details">
              <span className="detail-label">
                Address
              </span>

              <p>
                {booking.location?.address ||
                  'Address not provided'}
              </p>

              {booking.location?.coordinates?.length ===
                2 && (
                <div className="coordinates-box">
                  <span>
                    Latitude:{' '}
                    {booking.location.coordinates[1]}
                  </span>

                  <span>
                    Longitude:{' '}
                    {booking.location.coordinates[0]}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              WORKER INFORMATION
          ================================================== */}

          <section className="details-card">
            <div className="details-card-header">
              <div className="details-icon">
                👷
              </div>

              <div>
                <h2>
                  Assigned Worker
                </h2>

                <p>
                  Your service professional
                </p>
              </div>
            </div>

            {worker && workerUser ? (
              <div className="worker-details">
                <div className="worker-avatar">
                  {workerUser.name
                    ?.charAt(0)
                    ?.toUpperCase() || 'W'}
                </div>

                <div className="worker-info">
                  <h3>
                    {workerUser.name ||
                      'Worker'}
                  </h3>

                  <p>
                    {worker.experienceYears
                      ? `${worker.experienceYears} years experience`
                      : 'Experienced professional'}
                  </p>

                  {worker.rating && (
                    <div className="worker-rating">
                      ⭐{' '}
                      {Number(
                        worker.rating.average ||
                          0
                      ).toFixed(1)}

                      <span>
                        (
                        {worker.rating.count ||
                          0}{' '}
                        reviews)
                      </span>
                    </div>
                  )}
                </div>

                <div className="worker-contact">
                  {workerUser.phone && (
                    <a
                      href={`tel:${workerUser.phone}`}
                      className="contact-button"
                    >
                      📞 Call
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-worker">
                <div className="no-worker-icon">
                  👷
                </div>

                <h3>
                  Worker Not Assigned Yet
                </h3>

                <p>
                  We are currently looking for an
                  available professional for your
                  service.
                </p>
              </div>
            )}
          </section>

          {/* ==================================================
              PAYMENT INFORMATION
          ================================================== */}

          <section className="details-card">
            <div className="details-card-header">
              <div className="details-icon">
                💳
              </div>

              <div>
                <h2>
                  Payment Information
                </h2>

                <p>
                  Booking payment details
                </p>
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-amount">
                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    booking.payment?.amount ||
                      0
                  ).toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Payment Status
                </span>

                <span
                  className={`payment-status ${
                    booking.payment?.status ===
                    'paid'
                      ? 'paid'
                      : 'unpaid'
                  }`}
                >
                  {booking.payment?.status ===
                  'paid'
                    ? 'Paid'
                    : 'Unpaid'}
                </span>
              </div>

              {booking.payment
                ?.invoiceNumber && (
                <div className="detail-row">
                  <span>
                    Invoice Number
                  </span>

                  <strong>
                    {
                      booking.payment
                        .invoiceNumber
                    }
                  </strong>
                </div>
              )}

              {booking.payment
                ?.transactionId && (
                <div className="detail-row">
                  <span>
                    Transaction ID
                  </span>

                  <strong className="transaction-id">
                    {
                      booking.payment
                        .transactionId
                    }
                  </strong>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ====================================================
            CANCELLATION INFORMATION
        ==================================================== */}

        {booking.status === 'cancelled' &&
          booking.cancellation && (
          <section className="details-card cancellation-display-card">
            <div className="details-card-header">
              <div className="details-icon">
                ❌
              </div>

              <div>
                <h2>
                  Cancellation Information
                </h2>

                <p>
                  Details about this cancelled booking
                </p>
              </div>
            </div>

            <div className="details-list">
              <div className="detail-row">
                <span>
                  Cancelled On
                </span>

                <strong>
                  {formatDate(
                    booking.cancellation
                      .cancelledAt
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>
                  Reason
                </span>

                <strong>
                  {booking.cancellation.reason ||
                    'No reason provided'}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================
            RESCHEDULE HISTORY
        ==================================================== */}

        {booking.rescheduleHistory &&
          booking.rescheduleHistory.length > 0 && (
          <section className="details-card history-card">
            <div className="details-card-header">
              <div className="details-icon">
                🕒
              </div>

              <div>
                <h2>
                  Reschedule History
                </h2>

                <p>
                  Previous changes to your booking schedule
                </p>
              </div>
            </div>

            <div className="reschedule-history">
              {booking.rescheduleHistory
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    className="history-item"
                    key={
                      item._id ||
                      index
                    }
                  >
                    <div className="history-number">
                      {booking.rescheduleHistory.length -
                        index}
                    </div>

                    <div className="history-content">
                      <div className="history-dates">
                        <div>
                          <span>
                            Previous
                          </span>

                          <strong>
                            {formatDate(
                              item.previousScheduledAt
                            )}
                            {' '}
                            {formatTime(
                              item.previousScheduledAt
                            )}
                          </strong>
                        </div>

                        <span className="history-arrow">
                          →
                        </span>

                        <div>
                          <span>
                            New Schedule
                          </span>

                          <strong>
                            {formatDate(
                              item.newScheduledAt
                            )}
                            {' '}
                            {formatTime(
                              item.newScheduledAt
                            )}
                          </strong>
                        </div>
                      </div>

                      {item.reason && (
                        <p className="history-reason">
                          <strong>
                            Reason:
                          </strong>{' '}
                          {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ====================================================
            FEEDBACK
        ==================================================== */}

        {booking.feedback?.rating && (
          <section className="details-card feedback-display-card">
            <div className="details-card-header">
              <div className="details-icon">
                ⭐
              </div>

              <div>
                <h2>
                  Your Feedback
                </h2>

                <p>
                  Your rating for this service
                </p>
              </div>
            </div>

            <div className="feedback-display">
              <div className="feedback-rating">
                {'★'.repeat(
                  Number(
                    booking.feedback.rating
                  )
                )}

                {'☆'.repeat(
                  5 -
                    Number(
                      booking.feedback.rating
                    )
                )}
              </div>

              {booking.feedback.comment && (
                <p className="feedback-comment">
                  "
                  {
                    booking.feedback
                      .comment
                  }
                  "
                </p>
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            RESCHEDULE FORM
        ==================================================== */}

        {showRescheduleForm && (
          <section className="action-form-card">
            <div className="action-form-header">
              <div>
                <h2>
                  📅 Reschedule Booking
                </h2>

                <p>
                  Choose a new date and time for your service.
                </p>
              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={() => {
                  setShowRescheduleForm(false);
                  setRescheduleError('');
                }}
              >
                ×
              </button>
            </div>

            {rescheduleError && (
              <div className="action-error-message">
                {rescheduleError}
              </div>
            )}

            <form
              onSubmit={
                handleRescheduleBooking
              }
            >
              <div className="form-field">
                <label htmlFor="newScheduledAt">
                  New Date & Time
                </label>

                <input
                  id="newScheduledAt"
                  type="datetime-local"
                  value={
                    newScheduledAt
                  }
                  min={getMinDateTime()}
                  onChange={(event) =>
                    setNewScheduledAt(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="rescheduleReason">
                  Reason
                  <span>
                    {' '}
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="rescheduleReason"
                  value={
                    rescheduleReason
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Why do you want to reschedule?"
                  onChange={(event) =>
                    setRescheduleReason(
                      event.target.value
                    )
                  }
                />

                <small>
                  {rescheduleReason.length}/500
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowRescheduleForm(
                      false
                    );
                    setRescheduleError('');
                  }}
                  disabled={rescheduling}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={rescheduling}
                >
                  {rescheduling
                    ? 'Rescheduling...'
                    : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ====================================================
            CANCEL FORM
        ==================================================== */}

        {showCancelForm && (
          <section className="action-form-card cancel-form-card">
            <div className="action-form-header">
              <div>
                <h2>
                  ❌ Cancel Booking
                </h2>

                <p>
                  Please provide a reason for cancelling.
                </p>
              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelError('');
                }}
              >
                ×
              </button>
            </div>

            {cancelError && (
              <div className="action-error-message">
                {cancelError}
              </div>
            )}

            <form
              onSubmit={
                handleCancelBooking
              }
            >
              <div className="form-field">
                <label htmlFor="cancelReason">
                  Cancellation Reason
                  <span>
                    {' '}
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="cancelReason"
                  value={
                    cancelReason
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Why do you want to cancel this booking?"
                  onChange={(event) =>
                    setCancelReason(
                      event.target.value
                    )
                  }
                />

                <small>
                  {cancelReason.length}/500
                </small>
              </div>

              <div className="cancel-warning">
                <span>⚠️</span>

                <p>
                  This action will cancel your booking.
                  A cancelled booking cannot be rescheduled.
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowCancelForm(
                      false
                    );
                    setCancelError('');
                  }}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>

                <button
                  type="submit"
                  className="danger-button"
                  disabled={cancelling}
                >
                  {cancelling
                    ? 'Cancelling...'
                    : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="booking-details-actions">
          <Link
            to="/my-bookings"
            className="secondary-button"
          >
            ← Back to My Bookings
          </Link>

          {canModifyBooking && (
            <div className="booking-modification-actions">

              <button
                type="button"
                className="reschedule-button"
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelError('');
                  setShowRescheduleForm(
                    !showRescheduleForm
                  );
                  setRescheduleError('');
                }}
              >
                📅 Reschedule
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowRescheduleForm(false);
                  setRescheduleError('');
                  setShowCancelForm(
                    !showCancelForm
                  );
                  setCancelError('');
                }}
              >
                ❌ Cancel Booking
              </button>
            </div>
          )}

          {booking.status ===
            'completed' && (
            <Link
              to="/my-bookings"
              className="primary-button"
            >
              View Feedback
            </Link>
          )}
        </div>
      </div>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`
        .booking-details-page {
          min-height: calc(100vh - 70px);
          padding: 40px 20px 60px;
          background: #f7f8fa;
        }

        .booking-details-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .booking-details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .booking-status-large {
          padding: 12px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .booking-status-large.confirmed {
          background: #e8f7ee;
          color: #178342;
        }

        .booking-status-large.in-progress {
          background: #fff4df;
          color: #a66300;
        }

        .booking-status-large.completed {
          background: #e7f0ff;
          color: #1764c0;
        }

        .booking-status-large.cancelled {
          background: #ffe8e8;
          color: #c62828;
        }

        .booking-status-large.pending {
          background: #fff4df;
          color: #996000;
        }

        .action-success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #e8f7ee;
          border: 1px solid #b7e5c8;
          color: #176b37;
          font-size: 14px;
          font-weight: 600;
        }

        .action-success-message span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #178342;
          color: white;
          font-size: 13px;
        }

        .booking-reference-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
          margin-bottom: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .booking-reference-card > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .booking-reference-card strong {
          color: #111827;
          font-size: 14px;
          word-break: break-all;
        }

        .booking-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .details-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .details-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .details-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #f1f5f9;
          font-size: 21px;
          flex-shrink: 0;
        }

        .details-card-header h2 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #111827;
        }

        .details-card-header p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f1f3;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row > span:first-child {
          color: #6b7280;
          font-size: 14px;
        }

        .detail-row strong {
          color: #111827;
          font-size: 14px;
          text-align: right;
        }

        .location-details > p {
          margin: 0 0 18px;
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        }

        .coordinates-box {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 12px 14px;
          background: #f8fafc;
          border-radius: 10px;
          color: #64748b;
          font-size: 12px;
        }

        .worker-details {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .worker-avatar {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #e8eef7;
          color: #1f4f82;
          font-size: 21px;
          font-weight: 700;
        }

        .worker-info {
          min-width: 0;
          flex: 1;
        }

        .worker-info h3 {
          margin: 0 0 5px;
          color: #111827;
          font-size: 16px;
        }

        .worker-info p {
          margin: 0 0 6px;
          color: #6b7280;
          font-size: 13px;
        }

        .worker-rating {
          color: #d97706;
          font-size: 13px;
          font-weight: 600;
        }

        .worker-rating span {
          color: #6b7280;
          font-weight: 400;
          margin-left: 4px;
        }

        .contact-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 8px;
          background: #eef6ff;
          color: #1764c0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .no-worker {
          text-align: center;
          padding: 12px 10px;
        }

        .no-worker-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .no-worker h3 {
          margin: 0 0 6px;
          color: #374151;
          font-size: 16px;
        }

        .no-worker p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
        }

        .payment-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0 18px;
          margin-bottom: 4px;
        }

        .payment-amount span {
          color: #6b7280;
          font-size: 14px;
        }

        .payment-amount strong {
          color: #111827;
          font-size: 24px;
        }

        .payment-status {
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .payment-status.paid {
          background: #e8f7ee;
          color: #178342;
        }

        .payment-status.unpaid {
          background: #fff4df;
          color: #996000;
        }

        .transaction-id {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==================================================
           ACTION FORMS
        ================================================== */

        .action-form-card {
          margin-top: 24px;
          padding: 24px;
          background: white;
          border: 1px solid #dbe2ea;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .cancel-form-card {
          border-color: #fecaca;
        }

        .action-form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .action-form-header h2 {
          margin: 0 0 5px;
          color: #111827;
          font-size: 19px;
        }

        .action-form-header p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        .close-form-button {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 18px;
        }

        .form-field label {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        .form-field label span {
          color: #9ca3af;
          font-weight: 400;
        }

        .form-field input,
        .form-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: white;
          color: #111827;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #6b7280;
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
        }

        .form-field textarea {
          resize: vertical;
          min-height: 90px;
        }

        .form-field small {
          align-self: flex-end;
          color: #9ca3af;
          font-size: 11px;
        }

        .action-error-message {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 500;
        }

        .cancel-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
        }

        .cancel-warning span {
          font-size: 17px;
        }

        .cancel-warning p {
          margin: 0;
          color: #9a3412;
          font-size: 13px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .danger-button,
        .cancel-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          background: #dc2626;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .danger-button:hover,
        .cancel-button:hover {
          background: #b91c1c;
        }

        .reschedule-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          background: #1764c0;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .reschedule-button:hover {
          background: #14549f;
        }

        .danger-button:disabled,
        .reschedule-button:disabled,
        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ==================================================
           CANCELLATION DISPLAY
        ================================================== */

        .cancellation-display-card {
          margin-top: 24px;
          border-color: #fecaca;
        }

        /* ==================================================
           RESCHEDULE HISTORY
        ================================================== */

        .history-card {
          margin-top: 24px;
        }

        .reschedule-history {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .history-item {
          display: flex;
          gap: 14px;
          padding: 16px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }

        .history-number {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #e2e8f0;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .history-content {
          flex: 1;
          min-width: 0;
        }

        .history-dates {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .history-dates > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .history-dates span {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .history-dates strong {
          color: #111827;
          font-size: 13px;
        }

        .history-arrow {
          color: #94a3b8;
          font-size: 20px;
        }

        .history-reason {
          margin: 12px 0 0;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
        }

        .history-reason strong {
          color: #475569;
        }

        /* ==================================================
           FEEDBACK
        ================================================== */

        .feedback-display-card {
          margin-top: 24px;
        }

        .feedback-display {
          padding: 16px;
          border-radius: 12px;
          background: #fafafa;
        }

        .feedback-rating {
          margin-bottom: 10px;
          color: #f59e0b;
          font-size: 24px;
          letter-spacing: 2px;
        }

        .feedback-comment {
          margin: 0;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ==================================================
           ACTION BUTTONS
        ================================================== */

        .booking-details-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 28px;
        }

        .booking-modification-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex: 1;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 10px 18px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          box-sizing: border-box;
        }

        .primary-button {
          background: #111827;
          color: white;
        }

        .secondary-button {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .booking-details-actions > .primary-button {
          background: #111827;
          color: white;
        }

        /* ==================================================
           LOADING / ERROR
        ================================================== */

        .booking-details-loading,
        .booking-details-error {
          max-width: 600px;
          margin: 80px auto;
          padding: 40px 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .loading-spinner {
          width: 38px;
          height: 38px;
          margin: 0 auto 18px;
          border: 4px solid #e5e7eb;
          border-top-color: #374151;
          border-radius: 50%;
          animation: bookingDetailsSpin 0.8s linear infinite;
        }

        @keyframes bookingDetailsSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .booking-details-loading h2,
        .booking-details-error h2 {
          margin: 0 0 8px;
          color: #111827;
        }

        .booking-details-loading p,
        .booking-details-error p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .error-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #fee2e2;
          color: #b91c1c;
          font-size: 24px;
          font-weight: 700;
        }

        .error-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 768px) {
          .booking-details-page {
            padding: 25px 14px 45px;
          }

          .booking-details-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .booking-reference-card {
            grid-template-columns: 1fr;
          }

          .booking-details-grid {
            grid-template-columns: 1fr;
          }

          .worker-details {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .worker-contact {
            width: 100%;
            margin-top: 4px;
          }

          .contact-button {
            width: 100%;
          }

          .booking-details-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .booking-modification-actions {
            flex-direction: column;
            width: 100%;
          }

          .primary-button,
          .secondary-button,
          .reschedule-button,
          .cancel-button {
            width: 100%;
          }

          .error-actions {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions button {
            width: 100%;
          }

          .history-dates {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .history-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingDetails;