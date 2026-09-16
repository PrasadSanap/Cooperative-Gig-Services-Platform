import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [feedbackForms, setFeedbackForms] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);

  // Cancel / Reschedule states
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);

  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await api.get('/bookings/my-bookings');

      const myBookings = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || [];

      setBookings(myBookings);
    } catch (error) {
      console.error(
        'Error loading my bookings:',
        error.response?.data || error.message
      );

      setBookings([]);

      setMessage(
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

      if (user.role !== 'customer') {
        navigate('/');
        return;
      }

      fetchMyBookings();
    } catch (error) {
      console.error('Invalid user data:', error);

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      navigate('/login');
    }
  }, [navigate]);

  const markAsPaid = async (bookingId) => {
    try {
      setPayingBooking(bookingId);

      const response = await api.patch(
        `/bookings/${bookingId}/payment`
      );

      alert(
        response.data.message ||
          'Payment completed successfully'
      );

      await fetchMyBookings();
    } catch (error) {
      console.error(
        'Payment error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to complete payment'
      );
    } finally {
      setPayingBooking(null);
    }
  };

  // -----------------------------
  // CANCEL BOOKING
  // -----------------------------
  const cancelBooking = async () => {
    if (!cancellingBooking) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(
        `/bookings/${cancellingBooking}/cancel`,
        {
          reason: cancelReason.trim()
        }
      );

      alert(
        response.data.message ||
          'Booking cancelled successfully'
      );

      setCancellingBooking(null);
      setCancelReason('');

      await fetchMyBookings();
    } catch (error) {
      console.error(
        'Cancel booking error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to cancel booking'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------
  // RESCHEDULE BOOKING
  // -----------------------------
  const rescheduleBooking = async () => {
    if (!reschedulingBooking) {
      return;
    }

    if (!rescheduleDate) {
      alert('Please select a new date and time.');
      return;
    }

    const selectedDate = new Date(rescheduleDate);

    if (Number.isNaN(selectedDate.getTime())) {
      alert('Please select a valid date and time.');
      return;
    }

    if (selectedDate <= new Date()) {
      alert('Please select a future date and time.');
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(
        `/bookings/${reschedulingBooking}/reschedule`,
        {
          scheduledAt: selectedDate.toISOString(),
          reason: rescheduleReason.trim()
        }
      );

      alert(
        response.data.message ||
          'Booking rescheduled successfully'
      );

      setReschedulingBooking(null);
      setRescheduleDate('');
      setRescheduleReason('');

      await fetchMyBookings();
    } catch (error) {
      console.error(
        'Reschedule booking error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to reschedule booking'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelDialog = (bookingId) => {
    setCancelReason('');
    setCancellingBooking(bookingId);
  };

  const openRescheduleDialog = (booking) => {
    setRescheduleReason('');

    if (booking.scheduledAt) {
      const date = new Date(booking.scheduledAt);

      if (!Number.isNaN(date.getTime())) {
        const localDate = new Date(
          date.getTime() -
            date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        setRescheduleDate(localDate);
      }
    }

    setReschedulingBooking(booking._id);
  };

  const closeCancelDialog = () => {
    if (actionLoading) {
      return;
    }

    setCancellingBooking(null);
    setCancelReason('');
  };

  const closeRescheduleDialog = () => {
    if (actionLoading) {
      return;
    }

    setReschedulingBooking(null);
    setRescheduleDate('');
    setRescheduleReason('');
  };

  const canModifyBooking = (status) => {
    return (
      status !== 'cancelled' &&
      status !== 'completed' &&
      status !== 'in_progress'
    );
  };

  const handleFeedbackChange = (
    bookingId,
    field,
    value
  ) => {
    setFeedbackForms((previous) => ({
      ...previous,
      [bookingId]: {
        ...previous[bookingId],
        [field]: value
      }
    }));
  };

  const submitFeedback = async (bookingId) => {
    const feedback =
      feedbackForms[bookingId] || {};

    if (
      !feedback.rating ||
      Number(feedback.rating) < 1 ||
      Number(feedback.rating) > 5
    ) {
      alert(
        'Please select a rating between 1 and 5'
      );
      return;
    }

    try {
      setSubmittingFeedback(bookingId);

      const response = await api.post(
        `/bookings/${bookingId}/feedback`,
        {
          rating: Number(feedback.rating),
          comment: feedback.comment || ''
        }
      );

      alert(
        response.data.message ||
          'Feedback submitted successfully'
      );

      setFeedbackForms((previous) => {
        const updated = { ...previous };
        delete updated[bookingId];
        return updated;
      });

      await fetchMyBookings();
    } catch (error) {
      console.error(
        'Feedback error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to submit feedback'
      );
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'booking-status confirmed';

      case 'in_progress':
        return 'booking-status progress';

      case 'completed':
        return 'booking-status completed';

      case 'cancelled':
        return 'booking-status cancelled';

      default:
        return 'booking-status pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';

      case 'in_progress':
        return 'In Progress';

      case 'completed':
        return 'Completed';

      case 'cancelled':
        return 'Cancelled';

      default:
        return 'Pending';
    }
  };

  const getServiceName = (service) => {
    if (!service) {
      return 'Service';
    }

    return (
      service.charAt(0).toUpperCase() +
      service.slice(1)
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="section-eyebrow">
            SEVASETU
          </p>

          <h1 className="page-title">
            My Bookings
          </h1>

          <p className="page-subtitle">
            Track your services, workers, payments
            and completed bookings in one place.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('/booking')}
        >
          + New Booking
        </button>
      </div>

      {loading && (
        <div className="empty-state">
          <div className="loading-spinner"></div>

          <h3>
            Loading your bookings...
          </h3>

          <p>
            Please wait while we fetch your latest
            service requests.
          </p>
        </div>
      )}

      {message && !loading && (
        <div className="alert-error">
          {message}
        </div>
      )}

      {!loading &&
        !message &&
        bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              📋
            </div>

            <h2>
              No bookings yet
            </h2>

            <p>
              You haven't booked any local service
              yet.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate('/booking')}
            >
              Book a Service
            </button>
          </div>
        )}

      {!loading &&
        bookings.length > 0 && (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const feedbackForm =
                feedbackForms[booking._id] || {};

              return (
                <article
                  className="booking-card"
                  key={booking._id}
                >
                  {/* Card Header */}
                  <div className="booking-card-header">
                    <div>
                      <span className="booking-service-label">
                        SERVICE REQUEST
                      </span>

                      <h2 className="booking-service-title">
                        {getServiceName(
                          booking.serviceType
                        )}
                      </h2>
                    </div>

                    <span
                      className={getStatusClass(
                        booking.status
                      )}
                    >
                      {getStatusText(
                        booking.status
                      )}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="booking-details-grid">
                    <div className="booking-detail">
                      <span className="detail-icon">
                        👷
                      </span>

                      <div>
                        <span className="detail-label">
                          Worker
                        </span>

                        <strong>
                          {booking.worker?.user?.name ||
                            'Worker will be assigned'}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-icon">
                        📞
                      </span>

                      <div>
                        <span className="detail-label">
                          Contact
                        </span>

                        <strong>
                          {booking.worker?.user?.phone ||
                            'Not available yet'}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-detail booking-detail-full">
                      <span className="detail-icon">
                        📍
                      </span>

                      <div>
                        <span className="detail-label">
                          Service Location
                        </span>

                        <strong>
                          {booking.location?.address ||
                            'Address not available'}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-icon">
                        📅
                      </span>

                      <div>
                        <span className="detail-label">
                          Scheduled
                        </span>

                        <strong>
                          {booking.scheduledAt
                            ? new Date(
                                booking.scheduledAt
                              ).toLocaleString()
                            : 'Not scheduled'}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-icon">
                        💰
                      </span>

                      <div>
                        <span className="detail-label">
                          Amount
                        </span>

                        <strong className="amount-text">
                          ₹
                          {booking.payment?.amount ||
                            0}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-icon">
                        💳
                      </span>

                      <div>
                        <span className="detail-label">
                          Payment
                        </span>

                        <strong
                          className={
                            booking.payment?.status ===
                            'paid'
                              ? 'paid-text'
                              : 'unpaid-text'
                          }
                        >
                          {booking.payment?.status ===
                          'paid'
                            ? 'Paid ✓'
                            : 'Payment Pending'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Cancel / Reschedule Actions */}
                  {canModifyBooking(
                    booking.status
                  ) && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginTop: '18px',
                        paddingTop: '18px',
                        borderTop:
                          '1px solid #e5e7eb'
                      }}
                    >
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          openRescheduleDialog(
                            booking
                          )
                        }
                      >
                        📅 Reschedule
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          openCancelDialog(
                            booking._id
                          )
                        }
                        style={{
                          borderColor: '#dc2626',
                          color: '#dc2626'
                        }}
                      >
                        ✕ Cancel Booking
                      </button>
                    </div>
                  )}

                  {/* Cancellation Information */}
                  {booking.status ===
                    'cancelled' &&
                    booking.cancellation && (
                      <div
                        style={{
                          marginTop: '18px',
                          padding: '14px',
                          borderRadius: '10px',
                          background: '#fef2f2',
                          border:
                            '1px solid #fecaca'
                        }}
                      >
                        <strong>
                          Booking Cancelled
                        </strong>

                        {booking.cancellation
                          .reason && (
                          <p
                            style={{
                              margin:
                                '6px 0 0'
                            }}
                          >
                            Reason:{' '}
                            {
                              booking.cancellation
                                .reason
                            }
                          </p>
                        )}

                        {booking.cancellation
                          .cancelledAt && (
                          <small>
                            Cancelled on:{' '}
                            {new Date(
                              booking.cancellation.cancelledAt
                            ).toLocaleString()}
                          </small>
                        )}
                      </div>
                    )}

                  {/* Reschedule History */}
                  {booking.rescheduleHistory?.length >
                    0 && (
                    <div
                      style={{
                        marginTop: '18px',
                        padding: '14px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border:
                          '1px solid #e2e8f0'
                      }}
                    >
                      <strong>
                        Reschedule History
                      </strong>

                      {booking.rescheduleHistory.map(
                        (item, index) => (
                          <div
                            key={index}
                            style={{
                              marginTop:
                                '10px',
                              paddingTop:
                                '10px',
                              borderTop:
                                '1px solid #e2e8f0'
                            }}
                          >
                            <div>
                              <strong>
                                {new Date(
                                  item.previousScheduledAt
                                ).toLocaleString()}
                              </strong>

                              {' → '}

                              <strong>
                                {new Date(
                                  item.newScheduledAt
                                ).toLocaleString()}
                              </strong>
                            </div>

                            {item.reason && (
                              <p
                                style={{
                                  margin:
                                    '5px 0 0'
                                }}
                              >
                                Reason:{' '}
                                {
                                  item.reason
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* View Details */}
                  <div className="booking-details-action">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        navigate(
                          `/booking/${booking._id}`
                        )
                      }
                    >
                      View Booking Details →
                    </button>
                  </div>

                  {/* Payment */}
                  {booking.payment?.status !==
                    'paid' &&
                    booking.status !==
                      'cancelled' && (
                      <div className="payment-box">
                        <div>
                          <strong>
                            Payment required
                          </strong>

                          <p>
                            Complete payment for
                            this service.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="payment-button"
                          onClick={() =>
                            markAsPaid(
                              booking._id
                            )
                          }
                          disabled={
                            payingBooking ===
                            booking._id
                          }
                        >
                          {payingBooking ===
                          booking._id
                            ? 'Processing...'
                            : `Pay ₹${
                                booking.payment
                                  ?.amount || 0
                              }`}
                        </button>
                      </div>
                    )}

                  {booking.payment?.status ===
                    'paid' && (
                    <div className="paid-box">
                      <span>✓</span>

                      <div>
                        <strong>
                          Payment Completed
                        </strong>

                        <p>
                          Your payment has been
                          successfully recorded.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="feedback-section">
                    <div className="feedback-header">
                      <div>
                        <span className="booking-service-label">
                          CUSTOMER FEEDBACK
                        </span>

                        <h3>
                          {booking.status ===
                          'completed'
                            ? 'How was your experience?'
                            : 'Feedback'}
                        </h3>
                      </div>

                      {booking.feedback?.rating && (
                        <div className="rating-display">
                          ⭐{' '}
                          {booking.feedback.rating}
                          /5
                        </div>
                      )}
                    </div>

                    {booking.status !==
                      'completed' && (
                      <p className="feedback-muted">
                        Feedback will be available
                        after the service is completed.
                      </p>
                    )}

                    {booking.status ===
                      'completed' &&
                      booking.feedback?.rating && (
                      <div className="submitted-feedback">
                        <div className="stars">
                          {'★'.repeat(
                            Number(
                              booking.feedback
                                .rating
                            )
                          )}

                          {'☆'.repeat(
                            5 -
                              Number(
                                booking.feedback
                                  .rating
                              )
                          )}
                        </div>

                        {booking.feedback
                          .comment && (
                          <p>
                            "
                            {
                              booking.feedback
                                .comment
                            }
                            "
                          </p>
                        )}

                        <span>
                          Feedback submitted ✓
                        </span>
                      </div>
                    )}

                    {booking.status ===
                      'completed' &&
                      !booking.feedback?.rating && (
                      <div className="feedback-form">
                        <select
                          value={
                            feedbackForm.rating ||
                            ''
                          }
                          onChange={(e) =>
                            handleFeedbackChange(
                              booking._id,
                              'rating',
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select Rating
                          </option>

                          <option value="1">
                            1 ⭐
                          </option>

                          <option value="2">
                            2 ⭐⭐
                          </option>

                          <option value="3">
                            3 ⭐⭐⭐
                          </option>

                          <option value="4">
                            4 ⭐⭐⭐⭐
                          </option>

                          <option value="5">
                            5 ⭐⭐⭐⭐⭐
                          </option>
                        </select>

                        <textarea
                          placeholder="Tell us about your experience..."
                          rows="3"
                          value={
                            feedbackForm.comment ||
                            ''
                          }
                          onChange={(e) =>
                            handleFeedbackChange(
                              booking._id,
                              'comment',
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            submitFeedback(
                              booking._id
                            )
                          }
                          disabled={
                            submittingFeedback ===
                            booking._id
                          }
                        >
                          {submittingFeedback ===
                          booking._id
                            ? 'Submitting...'
                            : 'Submit Feedback'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {/* ========================= */}
      {/* CANCEL BOOKING MODAL */}
      {/* ========================= */}
      {cancellingBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '16px',
              padding: '24px',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.2)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Cancel Booking
            </h2>

            <p>
              Are you sure you want to cancel this
              booking?
            </p>

            <label
              style={{
                display: 'block',
                marginTop: '16px',
                marginBottom: '8px',
                fontWeight: '600'
              }}
            >
              Cancellation Reason
              <span
                style={{
                  fontWeight: '400',
                  color: '#64748b'
                }}
              >
                {' '}
                (optional)
              </span>
            </label>

            <textarea
              value={cancelReason}
              onChange={(e) =>
                setCancelReason(e.target.value)
              }
              placeholder="Why are you cancelling this booking?"
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                borderRadius: '8px',
                border:
                  '1px solid #cbd5e1',
                resize: 'vertical'
              }}
            />

            <small
              style={{
                color: '#64748b'
              }}
            >
              {cancelReason.length}/500
            </small>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px'
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={closeCancelDialog}
                disabled={actionLoading}
              >
                Keep Booking
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={cancelBooking}
                disabled={actionLoading}
                style={{
                  background: '#dc2626'
                }}
              >
                {actionLoading
                  ? 'Cancelling...'
                  : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* RESCHEDULE BOOKING MODAL */}
      {/* ========================= */}
      {reschedulingBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '16px',
              padding: '24px',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.2)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Reschedule Booking
            </h2>

            <p>
              Select a new date and time for your
              service.
            </p>

            <label
              style={{
                display: 'block',
                marginTop: '16px',
                marginBottom: '8px',
                fontWeight: '600'
              }}
            >
              New Date & Time
            </label>

            <input
              type="datetime-local"
              value={rescheduleDate}
              min={(() => {
                const now = new Date();

                return new Date(
                  now.getTime() -
                    now.getTimezoneOffset() *
                      60000
                )
                  .toISOString()
                  .slice(0, 16);
              })()}
              onChange={(e) =>
                setRescheduleDate(e.target.value)
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                borderRadius: '8px',
                border:
                  '1px solid #cbd5e1'
              }}
            />

            <label
              style={{
                display: 'block',
                marginTop: '16px',
                marginBottom: '8px',
                fontWeight: '600'
              }}
            >
              Reschedule Reason
              <span
                style={{
                  fontWeight: '400',
                  color: '#64748b'
                }}
              >
                {' '}
                (optional)
              </span>
            </label>

            <textarea
              value={rescheduleReason}
              onChange={(e) =>
                setRescheduleReason(
                  e.target.value
                )
              }
              placeholder="Why do you need to reschedule?"
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                borderRadius: '8px',
                border:
                  '1px solid #cbd5e1',
                resize: 'vertical'
              }}
            />

            <small
              style={{
                color: '#64748b'
              }}
            >
              {rescheduleReason.length}/500
            </small>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px'
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={closeRescheduleDialog}
                disabled={actionLoading}
              >
                Keep Current Time
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={rescheduleBooking}
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Rescheduling...'
                  : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;