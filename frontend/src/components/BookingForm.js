import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../services/api';

const SERVICE_TYPES = [
  'electrician',
  'plumber',
  'carpenter',
  'painter',
  'helper',
  'caregiver',
  'driver',
  'gardener',
  'cleaner',
  'technician',
];

const SERVICE_ICONS = {
  electrician: '⚡',
  plumber: '🔧',
  carpenter: '🪚',
  painter: '🎨',
  helper: '🤝',
  caregiver: '❤️',
  driver: '🚗',
  gardener: '🌱',
  cleaner: '🧹',
  technician: '🛠️',
};

const BookingForm = () => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    serviceType: 'electrician',
    address: '',
    scheduledAt: '',
    isEmergency: false,
    lat: '18.5204',
    lng: '73.8567',
    amount: 500,
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || user.role !== 'customer') {
      setMessage('Please login as a customer to book a service.');
      return;
    }

    if (!form.scheduledAt) {
      setMessage('Please select a date and time.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        serviceType: form.serviceType,
        isEmergency: form.isEmergency,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        coordinates: [
          parseFloat(form.lng),
          parseFloat(form.lat),
        ],
        address: form.address,
        amount: Number(form.amount),
      };

      const res = await createBooking(payload);

      setMessage(res.data.message || t('booking.success'));

      console.log('Booking response:', res.data);
    } catch (err) {
      setMessage(
        'Error creating booking: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const isError =
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('please');

  return (
    <div className="booking-page">
      <div className="booking-header">
        <div>
          <div className="booking-eyebrow">
            SEVASETU SERVICES
          </div>

          <h1>{t('booking.heading')}</h1>

          <p>
            Find trusted local professionals and book the service
            you need in just a few steps.
          </p>
        </div>

        <div className="booking-header-icon">
          🛠️
        </div>
      </div>

      <div className="booking-layout">
        <div className="booking-card">
          <div className="booking-card-header">
            <div>
              <h2>Book a Service</h2>
              <p>
                Tell us what you need and when you need it.
              </p>
            </div>

            <span className="booking-step">01</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="booking-form"
          >
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">1</span>

                <div>
                  <h3>Choose a service</h3>

                  <p>
                    Select the type of professional you need.
                  </p>
                </div>
              </div>

              <div className="service-grid">
                {SERVICE_TYPES.map((service) => {
                  const selected =
                    form.serviceType === service;

                  return (
                    <label
                      key={service}
                      className={
                        selected
                          ? 'service-option selected'
                          : 'service-option'
                      }
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value={service}
                        checked={selected}
                        onChange={handleChange}
                      />

                      {selected && (
                        <span className="selected-check">
                          ✓
                        </span>
                      )}

                      <span className="service-icon">
                        {SERVICE_ICONS[service]}
                      </span>

                      <span className="service-name">
                        {service.charAt(0).toUpperCase() +
                          service.slice(1)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-divider" />

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">2</span>

                <div>
                  <h3>Service location</h3>

                  <p>
                    Where should our professional come?
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  {t('booking.address')}
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your complete service address"
                  required
                />
              </div>

              <div className="location-grid">
                <div className="form-group">
                  <label htmlFor="lat">
                    Latitude
                  </label>

                  <input
                    id="lat"
                    type="text"
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    placeholder="18.5204"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lng">
                    Longitude
                  </label>

                  <input
                    id="lng"
                    type="text"
                    name="lng"
                    value={form.lng}
                    onChange={handleChange}
                    placeholder="73.8567"
                  />
                </div>
              </div>
            </div>

            <div className="form-divider" />

            <div className="form-section">
              <div className="section-title">
                <span className="section-number">3</span>

                <div>
                  <h3>Schedule your service</h3>

                  <p>
                    Choose a convenient date and time.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="scheduledAt">
                  {t('booking.scheduleDate')}
                </label>

                <input
                  id="scheduledAt"
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div
              className={
                form.isEmergency
                  ? 'emergency-box emergency-active'
                  : 'emergency-box'
              }
            >
              <div className="emergency-content">
                <span className="emergency-icon">
                  🚨
                </span>

                <div>
                  <strong>
                    {t('booking.emergency')}
                  </strong>

                  <p>
                    Need help urgently? Enable emergency
                    booking for priority service.
                  </p>
                </div>
              </div>

              <label className="emergency-toggle">
                <input
                  type="checkbox"
                  name="isEmergency"
                  checked={form.isEmergency}
                  onChange={handleChange}
                />

                <span className="toggle-track">
                  <span className="toggle-text">
                    {form.isEmergency ? 'ON' : 'OFF'}
                  </span>

                  <span className="toggle-circle" />
                </span>
              </label>
            </div>

            <div className="booking-summary">
              <div>
                <span>Estimated service amount</span>

                <strong>
                  ₹
                  {Number(form.amount).toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>

              <span className="summary-note">
                Final amount may vary
                <br />
                by service
              </span>
            </div>

            <button
              type="submit"
              className="primary-button booking-submit"
              disabled={loading}
            >
              {loading
                ? 'Creating Booking...'
                : 'Confirm & Book Service →'}
            </button>
          </form>

          {message && (
            <div
              className={
                isError
                  ? 'booking-message booking-message-error'
                  : 'booking-message booking-message-success'
              }
            >
              {message}
            </div>
          )}
        </div>

        <aside className="booking-sidebar">
          <div className="info-card">
            <div className="info-icon">
              🤝
            </div>

            <h3>
              Trusted Local Professionals
            </h3>

            <p>
              SevaSetu connects you with verified
              workers from your local community.
            </p>

            <div className="info-points">
              <div>
                <span>✓</span>
                <p>Verified professionals</p>
              </div>

              <div>
                <span>✓</span>
                <p>Smart nearby worker matching</p>
              </div>

              <div>
                <span>✓</span>
                <p>Transparent booking status</p>
              </div>

              <div>
                <span>✓</span>
                <p>Easy digital payments</p>
              </div>
            </div>
          </div>

          <div className="help-card">
            <span>💡</span>

            <div>
              <strong>Need help?</strong>

              <p>
                Choose emergency booking if your
                service cannot wait.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .booking-page {
          max-width: 1150px;
          margin: 0 auto;
          padding: 38px 20px 60px;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .booking-eyebrow {
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 7px;
        }

        .booking-header h1 {
          margin: 0 0 8px;
          font-size: 36px;
        }

        .booking-header p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .booking-header-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .booking-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 25px;
          align-items: start;
        }

        .booking-card,
        .info-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: var(--shadow);
        }

        .booking-card {
          padding: 28px;
        }

        .booking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .booking-card-header h2 {
          margin: 0 0 5px;
          font-size: 22px;
        }

        .booking-card-header p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .booking-step {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 800;
          font-size: 13px;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .section-number {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .section-title h3 {
          margin: 0 0 3px;
          font-size: 16px;
        }

        .section-title p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .service-option {
          position: relative;
          min-height: 92px;
          padding: 10px 5px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .service-option:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
        }

        .service-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .service-option.selected {
          border: 2px solid var(--primary);
          background: #ecfdf5;
          box-shadow: 0 0 0 2px rgba(0, 128, 96, 0.08);
        }

        .selected-check {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .service-icon {
          font-size: 27px;
          line-height: 1;
        }

        .service-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
        }

        .form-divider {
          height: 1px;
          background: var(--border);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 700;
        }

        .form-group input {
          width: 100%;
          box-sizing: border-box;
        }

        .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .emergency-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 14px;
          border: 1.5px solid #f3d49b;
          border-radius: 12px;
          background: #fffaf0;
          transition: 0.2s;
        }

        .emergency-active {
          border-color: #f0bd61;
          background: #fff7e6;
        }

        .emergency-content {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .emergency-icon {
          font-size: 25px;
        }

        .emergency-content strong {
          display: block;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .emergency-content p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.4;
        }

        .emergency-toggle {
          position: relative;
          width: 68px;
          height: 30px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .emergency-toggle input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 30px;
          background: #cbd5e1;
          transition: 0.2s;
        }

        .toggle-text {
          position: absolute;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 9px;
          box-sizing: border-box;
          color: white;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .toggle-circle {
          position: absolute;
          width: 24px;
          height: 24px;
          top: 3px;
          left: 3px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          transition: 0.2s;
        }

        .emergency-toggle input:checked
          + .toggle-track {
          background: var(--primary);
        }

        .emergency-toggle input:checked
          + .toggle-track
          .toggle-text {
          justify-content: flex-start;
          padding-left: 9px;
          padding-right: 0;
        }

        .emergency-toggle input:checked
          + .toggle-track
          .toggle-circle {
          transform: translateX(38px);
        }

        .booking-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-radius: 11px;
          background: #f0faf5;
        }

        .booking-summary > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .booking-summary span {
          color: var(--muted);
          font-size: 11px;
        }

        .booking-summary strong {
          font-size: 22px;
          color: var(--text);
        }

        .summary-note {
          text-align: right;
          line-height: 1.4;
        }

        .booking-submit {
          width: 100%;
          min-height: 48px;
          font-size: 14px;
        }

        .booking-message {
          margin-top: 18px;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
        }

        .booking-message-success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .booking-message-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .booking-sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-card {
          padding: 22px;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 14px;
        }

        .info-card h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .info-card > p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .info-points {
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid var(--border);
        }

        .info-points div {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
        }

        .info-points span {
          color: var(--primary);
          font-weight: 900;
        }

        .info-points p {
          margin: 0;
          font-size: 11px;
        }

        .help-card {
          display: flex;
          gap: 10px;
          padding: 15px;
          border: 1px solid #f1dfb3;
          border-radius: 12px;
          background: #fffaf0;
        }

        .help-card > span {
          font-size: 22px;
        }

        .help-card strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .help-card p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .booking-page {
            padding: 25px 15px 40px;
          }

          .booking-header-icon {
            display: none;
          }

          .booking-header h1 {
            font-size: 28px;
          }

          .booking-card {
            padding: 18px;
          }

          .service-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .location-grid {
            grid-template-columns: 1fr;
          }

          .booking-sidebar {
            grid-template-columns: 1fr;
          }

          .emergency-box {
            align-items: flex-start;
          }

          .booking-summary {
            align-items: flex-start;
            flex-direction: column;
          }

          .summary-note {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingForm;