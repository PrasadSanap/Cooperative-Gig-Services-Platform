// Sample frontend component that consumes the booking API
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../services/api';

const SERVICE_TYPES = [
  'electrician', 'plumber', 'carpenter', 'painter', 'helper',
  'caregiver', 'driver', 'gardener', 'cleaner', 'technician',
];

const BookingForm = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    customerId: '64f000000000000000000001', // placeholder — replace with logged-in user id
    serviceType: 'electrician',
    address: '',
    scheduledAt: '',
    isEmergency: false,
    lat: '18.5204', // default: Pune coordinates
    lng: '73.8567',
    amount: 500,
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerId: form.customerId,
        serviceType: form.serviceType,
        isEmergency: form.isEmergency,
        scheduledAt: form.scheduledAt,
        coordinates: [parseFloat(form.lng), parseFloat(form.lat)], // GeoJSON expects [lng, lat]
        address: form.address,
        amount: Number(form.amount),
      };
      const res = await createBooking(payload);
      setMessage(t('booking.success'));
      console.log('Booking response:', res.data);
    } catch (err) {
      setMessage('Error creating booking: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <h2>{t('booking.heading')}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          {t('booking.serviceType')}
          <select name="serviceType" value={form.serviceType} onChange={handleChange}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          {t('booking.address')}
          <input type="text" name="address" value={form.address} onChange={handleChange} required />
        </label>

        <label>
          {t('booking.scheduleDate')}
          <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required />
        </label>

        <label>
          <input type="checkbox" name="isEmergency" checked={form.isEmergency} onChange={handleChange} />
          {' '}{t('booking.emergency')}
        </label>

        <button type="submit">{t('booking.submit')}</button>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default BookingForm;